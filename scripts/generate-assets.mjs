import sharp from 'sharp'
import { writeFileSync } from 'fs'

// Icon SVG — shopping bag with return arrow, indigo background
const iconSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6366f1"/>
      <stop offset="100%" stop-color="#4338ca"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1024" height="1024" fill="url(#bg)"/>

  <!-- Shopping bag body -->
  <rect x="272" y="380" width="480" height="380" rx="32" fill="white" opacity="0.95"/>

  <!-- Bag top fold shadow -->
  <rect x="272" y="380" width="480" height="48" rx="32" fill="white"/>
  <rect x="272" y="404" width="480" height="24" fill="white" opacity="0.7"/>

  <!-- Bag handle left -->
  <path d="M 370 380 Q 370 260 512 260 Q 654 260 654 380" stroke="white" stroke-width="44" fill="none" stroke-linecap="round"/>

  <!-- Return arrow circle (overlapping bottom right of bag) -->
  <circle cx="650" cy="660" r="120" fill="#4338ca"/>

  <!-- Return arrow icon -->
  <path d="M 610 630 Q 610 600 650 600 Q 700 600 700 650 Q 700 695 660 700 L 680 680"
        stroke="white" stroke-width="28" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <polygon points="660,690 700,670 690,710" fill="white"/>
</svg>
`

// Splash SVG — dark background, centered logo mark only
const splashSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="2732" height="2732" viewBox="0 0 2732 2732">
  <rect width="2732" height="2732" fill="#0f172a"/>

  <!-- Centered icon group -->
  <g transform="translate(1006, 1006)">
    <!-- Rounded card behind icon -->
    <rect width="720" height="720" rx="160" fill="#6366f1"/>

    <!-- Shopping bag body -->
    <rect x="140" y="295" width="440" height="310" rx="28" fill="white" opacity="0.95"/>
    <rect x="140" y="295" width="440" height="40" rx="28" fill="white"/>
    <rect x="140" y="320" width="440" height="20" fill="white" opacity="0.7"/>

    <!-- Bag handle -->
    <path d="M 220 295 Q 220 180 360 180 Q 500 180 500 295" stroke="white" stroke-width="38" fill="none" stroke-linecap="round"/>

    <!-- Return arrow -->
    <circle cx="490" cy="520" r="95" fill="#4338ca"/>
    <path d="M 458 497 Q 458 472 490 472 Q 528 472 528 510 Q 528 544 498 548 L 514 532"
          stroke="white" stroke-width="22" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <polygon points="498,538 528,520 522,552" fill="white"/>
  </g>

  <!-- App name -->
  <text x="1366" y="1820" font-family="system-ui, -apple-system, sans-serif" font-size="96" font-weight="700" fill="white" text-anchor="middle" letter-spacing="-2">ReturnIt</text>
  <text x="1366" y="1900" font-family="system-ui, -apple-system, sans-serif" font-size="48" fill="#64748b" text-anchor="middle">Never miss a return deadline</text>
</svg>
`

async function run() {
  console.log('Generating icon (1024x1024)...')
  await sharp(Buffer.from(iconSvg))
    .resize(1024, 1024)
    .png()
    .toFile('assets/icon.png')

  console.log('Generating splash (2732x2732)...')
  await sharp(Buffer.from(splashSvg))
    .resize(2732, 2732)
    .png()
    .toFile('assets/splash.png')

  console.log('Done! assets/icon.png and assets/splash.png created.')
}

run().catch(console.error)
