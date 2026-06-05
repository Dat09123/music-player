"use client"

import { useRef, useState, useEffect } from "react"

interface LazyImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src" | "loading"> {
  src: string
  alt: string
  rootMargin?: string
  threshold?: number
  className?: string
  placeholderClassName?: string
  lowResSrc?: string
}

export default function LazyImage({
  src,
  alt,
  rootMargin = "200px",
  threshold = 0.01,
  className = "",
  placeholderClassName,
  lowResSrc,
  ...props
}: LazyImageProps) {
  const imgRef = useRef<HTMLDivElement>(null)
  const [loaded, setLoaded] = useState(false)
  const [inView, setInView] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    const el = imgRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect() } },
      { rootMargin, threshold }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [rootMargin, threshold])

  if (!inView) {
    return (
      <div ref={imgRef} className={`bg-[var(--bg-hover)] ${placeholderClassName || className}`} {...(props as any)} />
    )
  }

  return (
    <div ref={imgRef} className={`relative overflow-hidden ${className}`} {...(props as any)}>
      {/* Blur placeholder — shows skeleton shimmer while loading */}
      {!loaded && !error && (
        <div className="absolute inset-0 blur-placeholder" />
      )}

      {/* Low-res blur preview (if provided) */}
      {!loaded && !error && lowResSrc && (
        <img
          src={lowResSrc}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-40 blur-xl scale-110"
          aria-hidden="true"
        />
      )}

      {/* Full-res image */}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-all duration-700 ${
          loaded ? "opacity-100 animate-blur-in" : "opacity-0"
        }`}
        onLoad={() => setLoaded(true)}
        onError={() => { setError(true); setLoaded(true) }}
        loading="lazy"
        {...props}
      />
    </div>
  )
}
