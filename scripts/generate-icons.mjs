/**
 * Simple script to generate PWA icons as SVG files
 * Run: node scripts/generate-icons.mjs
 *
 * For production you'd use sharp or canvas to generate real PNGs.
 * These SVGs will be converted by the browser or can be replaced with real PNGs.
 */

import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const iconsDir  = join(__dirname, '..', 'public', 'icons')

mkdirSync(iconsDir, { recursive: true })

function createSVG(size) {
  const r = size * 0.25
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${r}" fill="#1a1a1a"/>
  <rect x="${size*0.19}" y="${size*0.25}" width="${size*0.625}" height="${size*0.5625}" rx="${size*0.094}" stroke="#e8b4b8" stroke-width="${size*0.047}" fill="none"/>
  <line x1="${size*0.3125}" y1="${size*0.1875}" x2="${size*0.3125}" y2="${size*0.34}" stroke="#e8b4b8" stroke-width="${size*0.047}" stroke-linecap="round"/>
  <line x1="${size*0.6875}" y1="${size*0.1875}" x2="${size*0.6875}" y2="${size*0.34}" stroke="#e8b4b8" stroke-width="${size*0.047}" stroke-linecap="round"/>
  <line x1="${size*0.19}" y1="${size*0.4375}" x2="${size*0.8125}" y2="${size*0.4375}" stroke="#e8b4b8" stroke-width="${size*0.031}" opacity="0.5"/>
  <circle cx="${size*0.375}" cy="${size*0.59}" r="${size*0.0625}" fill="#e8b4b8"/>
  <circle cx="${size*0.5}" cy="${size*0.59}" r="${size*0.0625}" fill="#a78bfa"/>
  <circle cx="${size*0.625}" cy="${size*0.59}" r="${size*0.0625}" fill="#22c55e"/>
</svg>`
}

writeFileSync(join(iconsDir, 'icon-192.svg'), createSVG(192))
writeFileSync(join(iconsDir, 'icon-512.svg'), createSVG(512))

console.log('Icons generated in public/icons/')
console.log('Note: For production PWA, replace SVGs with proper PNGs.')
