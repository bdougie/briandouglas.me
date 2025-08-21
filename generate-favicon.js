const sharp = require('sharp');
const fs = require('fs');

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <!-- Black rounded square background with larger radius -->
  <rect width="512" height="512" rx="120" ry="120" fill="#000000"/>
  
  <!-- White B letter path - scaled up by 50% and centered -->
  <g transform="translate(256, 256)">
    <g transform="scale(1.5, 1.5)">
      <g transform="translate(-128, -128)">
        <path d="M 100 100 L 100 256 L 170 256 C 210 256 240 236 240 196 C 240 166 225 151 200 146 C 215 141 230 126 230 96 C 230 56 200 50 160 50 L 100 50 Z M 140 90 L 160 90 C 175 90 185 98 185 113 C 185 128 175 136 160 136 L 140 136 L 140 90 Z M 140 176 L 170 176 C 185 176 195 184 195 199 C 195 214 185 222 170 222 L 140 222 L 140 176 Z" fill="white"/>
      </g>
    </g>
  </g>
</svg>`;

sharp(Buffer.from(svgContent))
  .resize(1024, 1024)
  .png()
  .toFile('public/images/favicon.png')
  .then(() => console.log('Favicon generated successfully!'))
  .catch(err => console.error('Error generating favicon:', err));