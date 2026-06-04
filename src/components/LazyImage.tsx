"use client"

import { useRef, useState, useEffect } from "react"

interface LazyImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src" | "loading"> {
  src: string
  alt: string
  rootMargin?: string
  threshold?: number
  placeholderClassName?: string
}

export default function LazyImage({
  src,
  alt,
  rootMargin = "200px",
  threshold = 0.01,
  className = "",
  placeholderClassName,
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
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { rootMargin, threshold }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [rootMargin, threshold])

  // If the image is already in the initial viewport or has been observed
  if (!inView) {
    return (
      <div
        ref={imgRef}
        className={`bg-[var(--bg-hover)] ${placeholderClassName || className}`}
        {...(props as any)}
      />
    )
  }

  return (
    <div ref={imgRef} className={`relative overflow-hidden ${className}`} {...(props as any)}>
      {!loaded && !error && (
        <div className="absolute inset-0 skeleton" />
      )}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"} ${className.replace(/[^\s\w-]/g, "").trim()}`}
        onLoad={() => setLoaded(true)}
        onError={() => { setError(true); setLoaded(true) }}
        loading="lazy"
        {...props}
      />
    </div>
  )
}
