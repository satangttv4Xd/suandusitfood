import { useId, useRef, useState, type ChangeEvent, type DragEvent } from 'react'
import {
  ACCEPT_ATTRIBUTE,
  MAX_UPLOAD_BYTES,
  formatBytes,
  processImages,
  MAX_EDGE,
} from '../lib/image'
import { safeUrl } from '../lib/format'
import { Icon } from './Icon'
import { SmartImage } from './SmartImage'
import { Button, Input } from './ui'

/**
 * Picture picker for the admin forms.
 *
 * Files are validated and re-encoded by `lib/image.ts` before they ever reach
 * state, so what the preview shows is exactly the bytes that will be saved.
 * A URL field sits alongside the picker because the demo content references
 * remote photos and an admin swapping one shouldn't be forced to download it
 * first.
 */

const dropZone =
  'flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors duration-200 cursor-pointer'

interface ImageUploaderProps {
  value: string
  onChange: (value: string) => void
  label?: string
  /** Longest edge to keep, in pixels. */
  maxEdge?: number
  aspect?: string
}

export function ImageUploader({
  value,
  onChange,
  label = 'อัปโหลดรูปภาพ',
  maxEdge = MAX_EDGE,
  aspect = 'aspect-[16/10]',
}: ImageUploaderProps) {
  const inputId = useId()
  const input = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [linkMode, setLinkMode] = useState(false)
  const [link, setLink] = useState('')

  const accept = async (files: FileList | File[] | null) => {
    const list = Array.from(files ?? []).slice(0, 1)
    if (!list.length) return
    setBusy(true)
    setError('')
    const { images, errors } = await processImages(list, maxEdge)
    setBusy(false)
    if (errors.length) setError(errors[0])
    if (images[0]) onChange(images[0].dataUrl)
  }

  const onDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    setDragging(false)
    void accept(event.dataTransfer.files)
  }

  const onPick = (event: ChangeEvent<HTMLInputElement>) => {
    void accept(event.target.files)
    event.target.value = '' // let the same file be picked twice in a row
  }

  return (
    <div>
      {value ? (
        <figure className="overflow-hidden rounded-2xl ring-1 ring-line">
          <div className={`${aspect} bg-brand-50`}>
            <SmartImage src={value} alt="ตัวอย่างรูปที่เลือก" className="h-full w-full object-cover" />
          </div>
          <figcaption className="flex flex-wrap items-center justify-between gap-2 bg-white px-3 py-2.5">
            <span className="text-xs text-muted">
              {value.startsWith('data:')
                ? `ไฟล์อัปโหลด · ${formatBytes(Math.round((value.length - value.indexOf(',')) * 0.75))}`
                : 'ลิงก์รูปภาพภายนอก'}
            </span>
            <span className="flex gap-2">
              <Button size="sm" variant="outline" icon="refresh" onClick={() => input.current?.click()}>
                เปลี่ยนรูป
              </Button>
              <Button size="sm" variant="danger" icon="trash" onClick={() => onChange('')}>
                ลบรูป
              </Button>
            </span>
          </figcaption>
        </figure>
      ) : (
        <label
          htmlFor={inputId}
          onDragOver={(event) => {
            event.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`${dropZone} ${
            dragging
              ? 'border-brand-400 bg-brand-50'
              : 'border-line bg-white hover:border-brand-300 hover:bg-brand-50/50'
          }`}
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
            <Icon name={busy ? 'refresh' : 'upload'} className={`h-5 w-5 ${busy ? 'animate-spin' : ''}`} />
          </span>
          <span className="font-semibold text-ink">{busy ? 'กำลังประมวลผล…' : label}</span>
          <span className="text-sm text-muted">
            ลากไฟล์มาวาง หรือคลิกเพื่อเลือก · JPG, PNG, WEBP, HEIC · ไม่เกิน{' '}
            {formatBytes(MAX_UPLOAD_BYTES)}
          </span>
        </label>
      )}

      <input
        ref={input}
        id={inputId}
        type="file"
        accept={ACCEPT_ATTRIBUTE}
        onChange={onPick}
        className="sr-only"
      />

      {error && (
        <p className="mt-2 flex items-start gap-1.5 text-sm text-brand-700">
          <Icon name="alert" className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </p>
      )}

      <div className="mt-2">
        {linkMode ? (
          <div className="flex flex-wrap gap-2">
            <Input
              value={link}
              onChange={(event) => setLink(event.target.value)}
              placeholder="https://…"
              className="min-w-0 flex-1"
              aria-label="ลิงก์รูปภาพ"
            />
            <Button
              size="sm"
              onClick={() => {
                const url = safeUrl(link)
                if (!url) return setError('ลิงก์ไม่ถูกต้อง ต้องขึ้นต้นด้วย http:// หรือ https://')
                setError('')
                onChange(url)
                setLink('')
                setLinkMode(false)
              }}
            >
              ใช้ลิงก์นี้
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setLinkMode(false)}>
              ยกเลิก
            </Button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setLinkMode(true)}
            className="cursor-pointer text-sm font-semibold text-brand-600 transition-colors duration-200 hover:text-brand-700"
          >
            หรือใส่ลิงก์รูปภาพแทน
          </button>
        )}
      </div>
    </div>
  )
}

interface GalleryUploaderProps {
  value: string[]
  onChange: (value: string[]) => void
  max?: number
}

/** Multi-image picker for a restaurant's gallery, with ordering controls. */
export function GalleryUploader({ value, onChange, max = 8 }: GalleryUploaderProps) {
  const inputId = useId()
  const [dragging, setDragging] = useState(false)
  const [busy, setBusy] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  const accept = async (files: FileList | File[] | null) => {
    const room = max - value.length
    const list = Array.from(files ?? [])
    if (!list.length) return
    if (room <= 0) {
      setErrors([`เพิ่มรูปได้สูงสุด ${max} รูป`])
      return
    }
    setBusy(true)
    const { images, errors: failed } = await processImages(list.slice(0, room))
    setBusy(false)
    setErrors(
      list.length > room ? [...failed, `เพิ่มได้อีก ${room} รูปเท่านั้น`] : failed,
    )
    if (images.length) onChange([...value, ...images.map((image) => image.dataUrl)])
  }

  const move = (index: number, direction: -1 | 1) => {
    const next = [...value]
    const target = index + direction
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(next)
  }

  return (
    <div>
      {value.length > 0 && (
        <ul className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {value.map((url, index) => (
            <li
              key={`${url.slice(0, 40)}-${index}`}
              className="group relative overflow-hidden rounded-xl ring-1 ring-line"
            >
              <div className="aspect-[4/3] bg-brand-50">
                <SmartImage
                  src={url}
                  alt={`รูปที่ ${index + 1}`}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-navy-900/70 p-1.5 opacity-0 backdrop-blur-sm transition-opacity duration-200 group-focus-within:opacity-100 group-hover:opacity-100">
                <span className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                    aria-label={`ย้ายรูปที่ ${index + 1} ไปข้างหน้า`}
                    className="cursor-pointer rounded-lg p-1.5 text-white transition-colors duration-200 hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Icon name="chevronLeft" className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={index === value.length - 1}
                    aria-label={`ย้ายรูปที่ ${index + 1} ไปข้างหลัง`}
                    className="cursor-pointer rounded-lg p-1.5 text-white transition-colors duration-200 hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Icon name="chevronRight" className="h-4 w-4" />
                  </button>
                </span>
                <button
                  type="button"
                  onClick={() => onChange(value.filter((_, i) => i !== index))}
                  aria-label={`ลบรูปที่ ${index + 1}`}
                  className="cursor-pointer rounded-lg p-1.5 text-white transition-colors duration-200 hover:bg-brand-600"
                >
                  <Icon name="trash" className="h-4 w-4" />
                </button>
              </div>
              <span className="absolute top-1.5 left-1.5 rounded-md bg-navy-900/70 px-1.5 text-xs font-semibold text-white">
                {index + 1}
              </span>
            </li>
          ))}
        </ul>
      )}

      <label
        htmlFor={inputId}
        onDragOver={(event) => {
          event.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault()
          setDragging(false)
          void accept(event.dataTransfer.files)
        }}
        className={`${dropZone} ${
          dragging
            ? 'border-brand-400 bg-brand-50'
            : 'border-line bg-white hover:border-brand-300 hover:bg-brand-50/50'
        }`}
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-50 text-brand-600">
          <Icon name={busy ? 'refresh' : 'image'} className={`h-5 w-5 ${busy ? 'animate-spin' : ''}`} />
        </span>
        <span className="font-semibold text-ink">
          {busy ? 'กำลังประมวลผล…' : 'เพิ่มรูปเพิ่มเติม (เลือกได้หลายไฟล์)'}
        </span>
        <span className="text-sm text-muted">
          {value.length}/{max} รูป · JPG, PNG, WEBP, HEIC
        </span>
      </label>

      <input
        id={inputId}
        type="file"
        multiple
        accept={ACCEPT_ATTRIBUTE}
        onChange={(event) => {
          void accept(event.target.files)
          event.target.value = ''
        }}
        className="sr-only"
      />

      {errors.length > 0 && (
        <ul className="mt-2 space-y-1">
          {errors.map((message) => (
            <li key={message} className="flex items-start gap-1.5 text-sm text-brand-700">
              <Icon name="alert" className="mt-0.5 h-4 w-4 shrink-0" />
              {message}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
