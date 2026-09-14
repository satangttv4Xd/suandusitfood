import { useState, type ImgHTMLAttributes } from 'react'
import { placeholderImage } from '../lib/image'

interface SmartImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string
  alt: string
  /** Text drawn into the fallback tile when the picture is missing. */
  fallbackLabel?: string
}

/**
 * An `<img>` that never leaves a broken frame on the page.
 *
 * Seed photos are remote URLs and admin uploads are data URLs; either can go
 * missing, so both fall back to a generated placeholder. The fade-in on decode
 * keeps a grid of cards from flashing as images stream in.
 */
export function SmartImage({
  src,
  alt,
  className = '',
  fallbackLabel,
  loading = 'lazy',
  ...props
}: SmartImageProps) {
  const [failed, setFailed] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [trackedSrc, setTrackedSrc] = useState(src)

  // A new src means a new load. Resetting during render (rather than in an
  // effect) keeps the previous picture's faded-in state from leaking onto it.
  if (trackedSrc !== src) {
    setTrackedSrc(src)
    setFailed(false)
    setLoaded(false)
  }

  const resolved = !src || failed ? placeholderImage(fallbackLabel ?? 'SUAN DUSIT FOOD') : src

  return (
    <img
      {...props}
      src={resolved}
      alt={alt}
      loading={loading}
      decoding="async"
      onError={() => setFailed(true)}
      onLoad={() => setLoaded(true)}
      className={`${className} transition-opacity duration-500 ${loaded || failed ? 'opacity-100' : 'opacity-0'}`}
    />
  )
}
