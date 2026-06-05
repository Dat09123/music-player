"use client"

import { useRef, useEffect, useState } from "react"
import { usePlayer } from "./Player"

interface VisualizerProps {
  barCount?: number
  className?: string
  variant?: "compact" | "full" | "mini"
  color?: string
}

/** Parse a hex color to rgba string. Input: #6366f1, alpha: 0.5 → rgba(99, 102, 241, 0.5) */
function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace("#", "")
  const r = parseInt(clean.substring(0, 2), 16)
  const g = parseInt(clean.substring(2, 4), 16)
  const b = parseInt(clean.substring(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

/** Read --accent CSS variable once. Only recalculates when theme changes via MutationObserver. */
function useAccentColor(colorProp?: string): string {
  const [accent, setAccent] = useState("#6366f1")

  useEffect(() => {
    if (colorProp) {
      setAccent(colorProp)
      return
    }

    function readAccent() {
      if (typeof document === "undefined") return
      const style = getComputedStyle(document.documentElement)
      const val = style.getPropertyValue("--accent").trim()
      if (val) setAccent(val)
    }

    readAccent()

    // Watch for theme/attribute changes (dark/light toggle sets class on <html>)
    const observer = new MutationObserver(readAccent)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style"],
    })

    return () => observer.disconnect()
  }, [colorProp])

  return accent
}

/**
 * Animated audio visualizer that renders frequency-style bars on a canvas.
 * Uses procedural animation (not Web Audio API) so it works reliably without CORS issues.
 * Bars move like real frequency data — faster when playing, slower when paused.
 */
export default function Visualizer({
  barCount = 24,
  className = "",
  variant = "compact",
  color,
}: VisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const timeRef = useRef(0)
  const { isPlaying } = usePlayer()
  const accent = useAccentColor(color)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")!
    const dpr = window.devicePixelRatio || 1
    let width = 0
    let height = 0

    function resize() {
      if (!canvas || !ctx) return
      const rect = canvas.getBoundingClientRect()
      width = rect.width
      height = rect.height
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.scale(dpr, dpr)
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    function draw() {
      ctx.clearRect(0, 0, width, height)

      if (width === 0 || height === 0) {
        animRef.current = requestAnimationFrame(draw)
        return
      }

      const gaps = barCount + 1
      const barWidth = Math.max(2, (width - gaps * 2) / barCount)
      const gap = Math.max(1, (width - barCount * barWidth) / gaps)

      // Update time — move faster when playing
      timeRef.current += isPlaying ? 0.04 : 0.008

      const t = timeRef.current
      const isHex = accent.startsWith("#")

      // Generate smooth wave heights using multiple overlapping sine waves
      for (let i = 0; i < barCount; i++) {
        const phase = (i / barCount) * Math.PI * 2

        const wave1 = Math.sin(t * 1.2 + phase) * 0.5 + 0.5
        const wave2 = Math.sin(t * 2.0 + phase * 1.5 + 1.3) * 0.25 + 0.25
        const wave3 = Math.sin(t * 0.7 + phase * 0.8 + 2.7) * 0.25 + 0.25
        const wave4 = Math.sin(t * 3.1 + phase * 2.2) * 0.15 + 0.15
        const randomness = Math.sin(t * 1.8 + i * 3.7) * 0.1 + 0.1

        const normalizedHeight = Math.min(1, Math.max(0.04, wave1 + wave2 + wave3 + wave4 + randomness))

        // Non-linear mapping for more dynamic look
        const mappedHeight = Math.pow(normalizedHeight, 0.7)
        const barHeight = Math.max(2, mappedHeight * height * 0.85)

        const x = gap + i * (barWidth + gap)
        const y = height - barHeight

        // Bar rounded rect
        const radius = Math.min(2, barWidth / 3)

        ctx.beginPath()
        ctx.moveTo(x + radius, y)
        ctx.lineTo(x + barWidth - radius, y)
        ctx.arcTo(x + barWidth, y, x + barWidth, y + radius, radius)
        ctx.lineTo(x + barWidth, height)
        ctx.lineTo(x, height)
        ctx.lineTo(x, y + radius)
        ctx.arcTo(x, y, x + radius, y, radius)
        ctx.closePath()

        // Gradient from accent color
        const alpha = 0.3 + mappedHeight * 0.5
        const topColor = isHex ? hexToRgba(accent, alpha) : accent
        const bottomColor = isHex ? hexToRgba(accent, alpha * 0.2) : accent

        const gradient = ctx.createLinearGradient(x, y, x, height)
        gradient.addColorStop(0, topColor)
        gradient.addColorStop(1, bottomColor)
        ctx.fillStyle = gradient
        ctx.fill()

        // Subtle glow cap on top of high bars
        if (mappedHeight > 0.3) {
          ctx.beginPath()
          ctx.arc(x + barWidth / 2, y, radius + 1, 0, Math.PI * 2)
          ctx.fillStyle = isHex ? hexToRgba(accent, mappedHeight * 0.25) : accent
          ctx.fill()
        }
      }

      animRef.current = requestAnimationFrame(draw)
    }

    animRef.current = requestAnimationFrame(draw)

    return () => {
      ro.disconnect()
      cancelAnimationFrame(animRef.current)
    }
  }, [barCount, isPlaying, accent])

  const heightClass = variant === "mini" ? "h-6" : variant === "full" ? "h-full" : "h-8"

  return (
    <canvas
      ref={canvasRef}
      className={`w-full ${heightClass} ${className}`}
      aria-hidden="true"
    />
  )
}
