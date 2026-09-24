/**
 * Image upload pipeline.
 *
 * Browsers hand us whatever the file picker returns, so every file is checked
 * three ways before it is allowed near the store: declared MIME type, byte
 * size, and — the one that actually matters — whether the browser can decode
 * it as an image at all. A .exe renamed to .jpg fails the decode step.
 *
 * Accepted files are then re-encoded through a canvas at a sane resolution.
 * That strips any embedded metadata, normalises the format, and keeps a photo
 * around 100–200 KB instead of the 3–5 MB a phone camera produces, which is
 * what makes a localStorage-backed gallery practical at all.
 */

export const ACCEPTED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
] as const

export const ACCEPT_ATTRIBUTE =
  '.jpg,.jpeg,.png,.webp,.heic,.heif,image/jpeg,image/png,image/webp,image/heic,image/heif'

/** Largest file we will even try to read. */
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024 // 8 MB

/** Longest edge kept after re-encoding. */
export const MAX_EDGE = 1400
export const THUMB_EDGE = 640

export class ImageError extends Error {}

export interface ProcessedImage {
  dataUrl: string
  width: number
  height: number
  bytes: number
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export function isHeic(file: File | Blob): boolean {
  const type = file.type ? file.type.toLowerCase() : ''
  if (type.includes('heic') || type.includes('heif')) {
    return true
  }
  if ('name' in file && typeof file.name === 'string') {
    return /\.(heic|heif)$/i.test(file.name)
  }
  return false
}

function isAccepted(file: File): boolean {
  if (ACCEPTED_TYPES.includes(file.type as (typeof ACCEPTED_TYPES)[number])) {
    return true
  }
  if (/\.(jpe?g|png|webp|heic|heif)$/i.test(file.name)) {
    return true
  }
  return false
}

function validate(file: File) {
  if (!isAccepted(file)) {
    throw new ImageError(
      `ไฟล์ "${file.name}" ไม่รองรับ — อนุญาตเฉพาะ JPG, JPEG, PNG, WEBP และ HEIC เท่านั้น`,
    )
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new ImageError(
      `ไฟล์ "${file.name}" มีขนาด ${formatBytes(file.size)} ใหญ่เกิน ${formatBytes(MAX_UPLOAD_BYTES)}`,
    )
  }
}

async function decodeHeicWithLibheif(file: File | Blob): Promise<HTMLCanvasElement> {
  const mod = await import('libheif-js/wasm-bundle')
  const libheif = ((mod as { default?: unknown }).default || mod) as any
  const buffer = await file.arrayBuffer()
  const bytes = new Uint8Array(buffer)
  const decoder = new libheif.HeifDecoder()
  const data = decoder.decode(bytes)
  if (!data || !data.length) {
    throw new Error('ไม่พบข้อมูลภาพในไฟล์ HEIC')
  }
  const image = data[0]
  const width = image.get_width()
  const height = image.get_height()

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('ไม่สามารถสร้าง canvas context สำหรับถอดรหัสภาพได้')

  const imageData = ctx.createImageData(width, height)
  await new Promise<void>((resolve, reject) => {
    image.display(imageData, (displayData: unknown) => {
      if (!displayData) {
        return reject(new Error('ไม่สามารถถอดรหัสข้อมูลภาพ HEIF ได้'))
      }
      resolve()
    })
  })

  ctx.putImageData(imageData, 0, 0)

  // Cleanup WebAssembly decoder memory
  try {
    for (const img of data) {
      if (typeof img.free === 'function') img.free()
    }
    if (decoder.decoder && typeof decoder.decoder.delete === 'function') {
      decoder.decoder.delete()
    }
  } catch {
    // ignore cleanup
  }

  return canvas
}

async function tryNativeDecode(file: File | Blob): Promise<ImageBitmap | HTMLImageElement | null> {
  if ('createImageBitmap' in window) {
    try {
      const bmp = await createImageBitmap(file)
      if (bmp.width > 0 && bmp.height > 0) return bmp
    } catch {
      // Not supported natively
    }
  }
  return null
}

async function decodeStandard(file: File | Blob, fileName: string): Promise<ImageBitmap | HTMLImageElement> {
  if ('createImageBitmap' in window) {
    try {
      return await createImageBitmap(file)
    } catch {
      // Fallback to Image element below
    }
  }
  const url = URL.createObjectURL(file)
  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => reject(new ImageError(`ไฟล์ "${fileName}" ไม่ใช่ไฟล์รูปภาพที่อ่านได้`))
      img.src = url
    })
  } finally {
    URL.revokeObjectURL(url)
  }
}

async function decodeHeic(file: File): Promise<ImageBitmap | HTMLImageElement | HTMLCanvasElement> {
  // 1. Try native decoding first (Safari iOS/macOS can decode HEIC natively)
  const native = await tryNativeDecode(file)
  if (native) return native

  // 2. Try modern heic-to (hoppergee/heic-to with bundled modern libde265 HEVC decoder in web worker)
  try {
    const { heicTo } = await import('heic-to')
    try {
      if ('createImageBitmap' in window) {
        return await heicTo({ blob: file, type: 'bitmap' })
      }
    } catch (bitmapErr) {
      console.warn('heic-to bitmap decoding failed, trying jpeg blob mode:', bitmapErr)
    }
    const jpegBlob = await heicTo({ blob: file, type: 'image/jpeg', quality: 0.9 })
    return await decodeStandard(jpegBlob, file.name)
  } catch (err0) {
    console.warn('heic-to failed, trying libheif-js:', err0)
  }

  // 3. Try libheif-js (v1.23.2)
  try {
    return await decodeHeicWithLibheif(file)
  } catch (err1) {
    console.warn('libheif-js decoding failed, trying fallback converters:', err1)
  }

  // 4. Fallback to @keeratita/heic-converter
  try {
    const { convertHeic } = await import('@keeratita/heic-converter')
    const blob = await convertHeic(file, { to: 'jpeg', quality: 0.9 })
    return await decodeStandard(blob, file.name)
  } catch (err2) {
    console.warn('@keeratita/heic-converter fallback failed:', err2)
  }

  // 5. Fallback to heic2any
  try {
    const mod = await import('heic2any')
    const fn = (mod as { default?: unknown }).default || mod
    const heic2any = fn as (options: {
      blob: Blob
      toType?: string
      quality?: number
    }) => Promise<Blob | Blob[]>
    const result = await heic2any({
      blob: file,
      toType: 'image/jpeg',
      quality: 0.9,
    })
    const jpegBlob = Array.isArray(result) ? result[0] : result
    return await decodeStandard(jpegBlob, file.name)
  } catch (err3) {
    console.error('All HEIC decoders failed:', err3)
    const msg =
      err3 instanceof Error
        ? err3.message
        : typeof err3 === 'object' && err3 && 'message' in err3
          ? String((err3 as { message: unknown }).message)
          : 'รูปแบบไม่ถูกต้องหรือไฟล์เสียหาย'
    throw new ImageError(`ไม่สามารถแปลงไฟล์ HEIC "${file.name}": ${msg}`)
  }
}

async function decode(file: File): Promise<ImageBitmap | HTMLImageElement | HTMLCanvasElement> {
  if (isHeic(file)) {
    return await decodeHeic(file)
  }

  return await decodeStandard(file, file.name)
}

let webpSupport: boolean | null = null
function supportsWebp(): boolean {
  if (webpSupport === null) {
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 1
    webpSupport = canvas.toDataURL('image/webp').startsWith('data:image/webp')
  }
  return webpSupport
}

/** Validate, decode, downscale and re-encode a picked file into a data URL. */
export async function processImage(file: File, maxEdge = MAX_EDGE): Promise<ProcessedImage> {
  validate(file)
  const source = await decode(file)

  const sw = source.width
  const sh = source.height
  const scale = Math.min(1, maxEdge / Math.max(sw, sh))
  const width = Math.max(1, Math.round(sw * scale))
  const height = Math.max(1, Math.round(sh * scale))

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new ImageError('เบราว์เซอร์ไม่รองรับการประมวลผลรูปภาพ')
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(source as CanvasImageSource, 0, 0, width, height)
  if ('close' in source && typeof (source as ImageBitmap).close === 'function') {
    ;(source as ImageBitmap).close()
  }

  const mime = supportsWebp() ? 'image/webp' : 'image/jpeg'
  const dataUrl = canvas.toDataURL(mime, 0.82)

  return {
    dataUrl,
    width,
    height,
    // A base64 payload is 4 bytes per 3 bytes of data.
    bytes: Math.round((dataUrl.length - dataUrl.indexOf(',') - 1) * 0.75),
  }
}

export async function processImages(
  files: File[],
  maxEdge = MAX_EDGE,
): Promise<{ images: ProcessedImage[]; errors: string[] }> {
  const images: ProcessedImage[] = []
  const errors: string[] = []
  for (const file of files) {
    try {
      images.push(await processImage(file, maxEdge))
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error))
    }
  }
  return { images, errors }
}

/** A calm gradient placeholder, used whenever an image is missing or 404s. */
export function placeholderImage(label = 'SUAN DUSIT FOOD'): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 420">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#d5f0fa"/><stop offset="100%" stop-color="#eef6f9"/>
  </linearGradient></defs>
  <rect width="640" height="420" fill="url(#g)"/>
  <g fill="none" stroke="#0a7599" stroke-opacity="0.35" stroke-width="7" stroke-linecap="round">
    <path d="M262 168v104M262 168c-11 0-20 9-20 20v26c0 11 9 20 20 20"/>
    <path d="M298 168v104M298 194h-36"/>
    <path d="M370 272v-56c0-27 10-48 22-48s22 21 22 48v56"/>
  </g>
  <text x="320" y="340" text-anchor="middle" fill="#0c5f7c" fill-opacity="0.6"
        font-family="Karla, system-ui, sans-serif" font-size="20" letter-spacing="2">${label}</text>
</svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}
