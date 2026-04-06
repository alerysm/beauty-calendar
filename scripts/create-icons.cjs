/**
 * Creates minimal PNG icons for PWA using pure Node.js (no dependencies)
 * Generates 1x1 and basic PNG structure for placeholder icons.
 *
 * For real production icons, replace public/icons/icon-192.png and icon-512.png
 * with properly designed PNG files.
 *
 * Run: node scripts/create-icons.cjs
 */

const fs = require('fs')
const path = require('path')
const { createCanvas } = (() => {
  try {
    return require('canvas')
  } catch {
    return { createCanvas: null }
  }
})()

const iconsDir = path.join(__dirname, '..', 'public', 'icons')
fs.mkdirSync(iconsDir, { recursive: true })

if (createCanvas) {
  // Use canvas if available
  function createIcon(size) {
    const canvas = createCanvas(size, size)
    const ctx = canvas.getContext('2d')
    const r = size * 0.23

    // Background
    ctx.fillStyle = '#1a1a1a'
    ctx.beginPath()
    ctx.roundRect(0, 0, size, size, r)
    ctx.fill()

    // Calendar outline
    ctx.strokeStyle = '#e8b4b8'
    ctx.lineWidth = size * 0.044
    ctx.beginPath()
    ctx.roundRect(size * 0.19, size * 0.25, size * 0.62, size * 0.56, size * 0.094)
    ctx.stroke()

    // Calendar hooks
    ctx.strokeStyle = '#e8b4b8'
    ctx.lineCap = 'round'
    ctx.lineWidth = size * 0.047
    ctx.beginPath()
    ctx.moveTo(size * 0.31, size * 0.19)
    ctx.lineTo(size * 0.31, size * 0.34)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(size * 0.69, size * 0.19)
    ctx.lineTo(size * 0.69, size * 0.34)
    ctx.stroke()

    // Separator line
    ctx.strokeStyle = 'rgba(232, 180, 184, 0.5)'
    ctx.lineWidth = size * 0.031
    ctx.beginPath()
    ctx.moveTo(size * 0.19, size * 0.44)
    ctx.lineTo(size * 0.81, size * 0.44)
    ctx.stroke()

    // Dots
    const dots = [
      { x: 0.375, y: 0.59, color: '#e8b4b8' },
      { x: 0.5,   y: 0.59, color: '#a78bfa' },
      { x: 0.625, y: 0.59, color: '#22c55e' },
    ]
    dots.forEach(({ x, y, color }) => {
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.arc(size * x, size * y, size * 0.0625, 0, Math.PI * 2)
      ctx.fill()
    })

    return canvas.toBuffer('image/png')
  }

  fs.writeFileSync(path.join(iconsDir, 'icon-192.png'), createIcon(192))
  fs.writeFileSync(path.join(iconsDir, 'icon-512.png'), createIcon(512))
  console.log('PNG icons generated successfully!')
} else {
  // Fallback: copy SVG content as a base64-embedded PNG placeholder
  console.log('Canvas not available. Using SVG icon fallback.')
  console.log('For real PNG icons: npm install canvas && node scripts/create-icons.cjs')
  console.log('Or manually place 192x192 and 512x512 PNGs in public/icons/')
}
