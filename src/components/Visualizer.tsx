"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import { usePlayer } from "./Player"

export type VisualizerMode = "bars" | "waveform" | "circular" | "particles"

interface VisualizerProps {
  barCount?: number
  className?: string
  variant?: "compact" | "full" | "mini"
  color?: string
  mode?: VisualizerMode
}

/** Parse a hex color to rgba string. Input: #6366f1, alpha: 0.5 → rgba(99, 102, 241, 0.5) */
function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace("#", "")
  const r = parseInt(clean.substring(0, 2), 16)
  const g = parseInt(clean.substring(2, 4), 16)
  const b = parseInt(clean.substring(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

/** Generate wave heights (0–1) for a given time and index */
function getWaveHeight(t: number, i: number, count: number): number {
  const phase = (i / count) * Math.PI * 2
  const wave1 = Math.sin(t * 1.2 + phase) * 0.5 + 0.5
  const wave2 = Math.sin(t * 2.0 + phase * 1.5 + 1.3) * 0.25 + 0.25
  const wave3 = Math.sin(t * 0.7 + phase * 0.8 + 2.7) * 0.25 + 0.25
  const wave4 = Math.sin(t * 3.1 + phase * 2.2) * 0.15 + 0.15
  const randomness = Math.sin(t * 1.8 + i * 3.7) * 0.1 + 0.1
  return Math.min(1, Math.max(0.04, wave1 + wave2 + wave3 + wave4 + randomness))
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
    const observer = new MutationObserver(readAccent)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style"],
    })
    return () => observer.disconnect()
  }, [colorProp])
  return accent
}

// ─── Draw: Bars ──────────────────────────────────────────

function drawBars(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  heights: number[],
  isHex: boolean,
  accent: string,
) {
  const count = heights.length
  const gaps = count + 1
  const barWidth = Math.max(2, (width - gaps * 2) / count)
  const gap = Math.max(1, (width - count * barWidth) / gaps)

  for (let i = 0; i < count; i++) {
    const rawHeight = heights[i]
    const mappedHeight = Math.pow(rawHeight, 0.7)
    const barHeight = Math.max(2, mappedHeight * height * 0.85)
    const x = gap + i * (barWidth + gap)
    const y = height - barHeight
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

    const alpha = 0.3 + mappedHeight * 0.5
    const gradient = ctx.createLinearGradient(x, y, x, height)
    gradient.addColorStop(0, isHex ? hexToRgba(accent, alpha) : accent)
    gradient.addColorStop(1, isHex ? hexToRgba(accent, alpha * 0.2) : accent)
    ctx.fillStyle = gradient
    ctx.fill()

    // Glow cap
    if (mappedHeight > 0.3) {
      ctx.beginPath()
      ctx.arc(x + barWidth / 2, y, radius + 1, 0, Math.PI * 2)
      ctx.fillStyle = isHex ? hexToRgba(accent, mappedHeight * 0.25) : accent
      ctx.fill()
    }
  }
}

// ─── Draw: Waveform ──────────────────────────────────────

function drawWaveform(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  heights: number[],
  isHex: boolean,
  accent: string,
) {
  const count = heights.length
  const centerY = height / 2
  const maxAmplitude = height * 0.4
  const rgba = (a: number) => isHex ? hexToRgba(accent, a) : accent

  // Build path for filled waveform
  ctx.beginPath()
  ctx.moveTo(0, centerY)

  for (let i = 0; i < count; i++) {
    const x = (i / (count - 1)) * width
    const amplitude = Math.pow(heights[i], 0.8) * maxAmplitude
    ctx.lineTo(x, centerY - amplitude)
  }

  ctx.lineTo(width, centerY)
  ctx.lineTo(0, centerY)
  ctx.closePath()

  // Gradient fill
  const gradient = ctx.createLinearGradient(0, centerY - maxAmplitude, 0, centerY + maxAmplitude)
  gradient.addColorStop(0, rgba(0.4))
  gradient.addColorStop(0.5, rgba(0.05))
  gradient.addColorStop(1, rgba(0.4))
  ctx.fillStyle = gradient
  ctx.fill()

  // Mirror fill (top + bottom waveform shape)
  ctx.beginPath()
  for (let i = 0; i < count; i++) {
    const x = (i / (count - 1)) * width
    const amp = Math.pow(heights[i], 0.8) * maxAmplitude
    if (i === 0) ctx.moveTo(x, centerY - amp)
    else ctx.lineTo(x, centerY - amp)
  }
  for (let i = count - 1; i >= 0; i--) {
    const x = (i / (count - 1)) * width
    const amp = Math.pow(heights[i], 0.8) * maxAmplitude
    ctx.lineTo(x, centerY + amp)
  }
  ctx.closePath()
  ctx.fillStyle = rgba(0.08)
  ctx.fill()

  // Glowing line gradient
  const lineGradient = ctx.createLinearGradient(0, 0, width, 0)
  lineGradient.addColorStop(0, "transparent")
  lineGradient.addColorStop(0.1, rgba(0.3))
  lineGradient.addColorStop(0.5, accent)
  lineGradient.addColorStop(0.9, rgba(0.3))
  lineGradient.addColorStop(1, "transparent")

  // Top waveform line
  ctx.beginPath()
  for (let i = 0; i < count; i++) {
    const x = (i / (count - 1)) * width
    const amp = Math.pow(heights[i], 0.8) * maxAmplitude
    if (i === 0) ctx.moveTo(x, centerY - amp)
    else ctx.lineTo(x, centerY - amp)
  }
  ctx.strokeStyle = lineGradient
  ctx.lineWidth = 2.5
  ctx.stroke()

  // Bottom waveform line
  ctx.beginPath()
  for (let i = 0; i < count; i++) {
    const x = (i / (count - 1)) * width
    const amp = Math.pow(heights[i], 0.8) * maxAmplitude
    if (i === 0) ctx.moveTo(x, centerY + amp)
    else ctx.lineTo(x, centerY + amp)
  }
  ctx.strokeStyle = lineGradient
  ctx.lineWidth = 2.5
  ctx.stroke()
}

// ─── Draw: Circular ──────────────────────────────────────

function drawCircular(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  heights: number[],
  isHex: boolean,
  accent: string,
) {
  const count = heights.length
  const centerX = width / 2
  const centerY = height / 2
  const radius = Math.min(width, height) * 0.25
  const maxExtension = Math.min(width, height) * 0.35

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 - Math.PI / 2
    const rawHeight = heights[i]
    const mappedHeight = Math.pow(rawHeight, 0.7)
    const extension = mappedHeight * maxExtension
    const innerR = Math.max(radius, radius + extension * 0.2)
    const outerR = radius + extension

    const x1 = centerX + Math.cos(angle) * innerR
    const y1 = centerY + Math.sin(angle) * innerR
    const x2 = centerX + Math.cos(angle) * outerR
    const y2 = centerY + Math.sin(angle) * outerR

    const barWidth = (2 * Math.PI * radius) / count * 0.6
    const perpAngle = angle + Math.PI / 2
    const halfWidth = Math.max(1.5, barWidth / 2)

    const x1a = x1 + Math.cos(perpAngle) * halfWidth
    const y1a = y1 + Math.sin(perpAngle) * halfWidth
    const x1b = x1 - Math.cos(perpAngle) * halfWidth
    const y1b = y1 - Math.sin(perpAngle) * halfWidth
    const x2a = x2 + Math.cos(perpAngle) * halfWidth
    const y2a = y2 + Math.sin(perpAngle) * halfWidth
    const x2b = x2 - Math.cos(perpAngle) * halfWidth
    const y2b = y2 - Math.sin(perpAngle) * halfWidth

    ctx.beginPath()
    ctx.moveTo(x1a, y1a)
    ctx.lineTo(x2a, y2a)
    ctx.lineTo(x2b, y2b)
    ctx.lineTo(x1b, y1b)
    ctx.closePath()

    const alpha = 0.4 + mappedHeight * 0.4
    const gradient = ctx.createRadialGradient(centerX, centerY, radius, centerX, centerY, radius + maxExtension)
    gradient.addColorStop(0, isHex ? hexToRgba(accent, alpha * 0.3) : accent)
    gradient.addColorStop(1, isHex ? hexToRgba(accent, alpha) : accent)
    ctx.fillStyle = gradient
    ctx.fill()

    // Glow tip
    if (mappedHeight > 0.4) {
      ctx.beginPath()
      ctx.arc(x2, y2, Math.max(2, halfWidth * 0.6), 0, Math.PI * 2)
      ctx.fillStyle = isHex ? hexToRgba(accent, mappedHeight * 0.3) : accent
      ctx.fill()
    }
  }

  // Center glow
  const centerGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 0.5)
  centerGrad.addColorStop(0, hexToRgba(accent, 0.15))
  centerGrad.addColorStop(1, "transparent")
  ctx.beginPath()
  ctx.arc(centerX, centerY, radius * 0.5, 0, Math.PI * 2)
  ctx.fillStyle = centerGrad
  ctx.fill()
}

// ─── Draw: Particles ─────────────────────────────────────

function drawParticles(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  heights: number[],
  isHex: boolean,
  accent: string,
  t: number,
) {
  const count = heights.length
  const particleCount = count

  for (let i = 0; i < particleCount; i++) {
    const rawHeight = heights[i]
    const mappedHeight = Math.pow(rawHeight, 0.8)

    // Each particle has a unique position based on index
    const angle = (i / particleCount) * Math.PI * 2 + t * 0.05
    const baseDist = Math.min(width, height) * (0.2 + (i % 5) * 0.04)
    const amplitude = mappedHeight * Math.min(width, height) * 0.15

    const driftX = Math.sin(t * 0.3 + i * 1.7) * 20
    const driftY = Math.cos(t * 0.4 + i * 2.3) * 15

    const x = width / 2 + Math.cos(angle) * (baseDist + amplitude) + driftX
    const y = height / 2 + Math.sin(angle) * (baseDist + amplitude) + driftY

    const size = Math.max(1.5, mappedHeight * 4)
    const alpha = Math.max(0.1, mappedHeight * 0.7)

    // Main particle
    ctx.beginPath()
    ctx.arc(x, y, size, 0, Math.PI * 2)
    ctx.fillStyle = isHex ? hexToRgba(accent, alpha) : accent
    ctx.fill()

    // Glow ring
    ctx.beginPath()
    ctx.arc(x, y, size * 2.5, 0, Math.PI * 2)
    ctx.fillStyle = isHex ? hexToRgba(accent, alpha * 0.15) : accent
    ctx.fill()

    // Soft glow
    ctx.beginPath()
    ctx.arc(x, y, size * 5, 0, Math.PI * 2)
    ctx.fillStyle = isHex ? hexToRgba(accent, alpha * 0.05) : accent
    ctx.fill()

    // Connection lines between nearby particles
    for (let j = i + 1; j < Math.min(i + 4, particleCount); j++) {
      const jAngle = (j / particleCount) * Math.PI * 2 + t * 0.05
      const jBaseDist = Math.min(width, height) * (0.2 + (j % 5) * 0.04)
      const jAmplitude = Math.pow(heights[j], 0.8) * Math.min(width, height) * 0.15
      const jDriftX = Math.sin(t * 0.3 + j * 1.7) * 20
      const jDriftY = Math.cos(t * 0.4 + j * 2.3) * 15
      const jx = width / 2 + Math.cos(jAngle) * (jBaseDist + jAmplitude) + jDriftX
      const jy = height / 2 + Math.sin(jAngle) * (jBaseDist + jAmplitude) + jDriftY

      const dx = x - jx
      const dy = y - jy
      const dist = Math.sqrt(dx * dx + dy * dy)
      const maxDist = Math.min(width, height) * 0.3

      if (dist < maxDist) {
        const lineAlpha = (1 - dist / maxDist) * 0.3 * mappedHeight
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(jx, jy)
        ctx.strokeStyle = isHex ? hexToRgba(accent, lineAlpha) : accent
        ctx.lineWidth = 0.5
        ctx.stroke()
      }
    }
  }
}

// ─── Main Component ──────────────────────────────────────

/**
 * Animated audio visualizer that renders on a canvas.
 * Uses procedural animation (not Web Audio API) so it works reliably without CORS issues.
 * Supports multiple visual modes: bars, waveform, circular, particles.
 */
export default function Visualizer({
  barCount = 24,
  className = "",
  variant = "compact",
  color,
  mode = "bars",
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

      // Update time — move faster when playing
      timeRef.current += isPlaying ? 0.04 : 0.008
      const t = timeRef.current

      // Generate heights once for all modes
      const heights = Array.from({ length: barCount }, (_, i) => getWaveHeight(t, i, barCount))
      const isHex = accent.startsWith("#")

      switch (mode) {
        case "waveform":
          drawWaveform(ctx, width, height, heights, isHex, accent)
          break
        case "circular":
          drawCircular(ctx, width, height, heights, isHex, accent)
          break
        case "particles":
          drawParticles(ctx, width, height, heights, isHex, accent, t)
          break
        default:
          drawBars(ctx, width, height, heights, isHex, accent)
      }

      animRef.current = requestAnimationFrame(draw)
    }

    animRef.current = requestAnimationFrame(draw)

    return () => {
      ro.disconnect()
      cancelAnimationFrame(animRef.current)
    }
  }, [barCount, isPlaying, accent, mode])

  const heightClass = variant === "mini" ? "h-6" : variant === "full" ? "h-full" : "h-8"

  return (
    <canvas
      ref={canvasRef}
      className={`w-full ${heightClass} ${className}`}
      aria-hidden="true"
    />
  )
}
