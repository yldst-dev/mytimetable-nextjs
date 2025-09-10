// 검정색 배경 PWA 아이콘 생성 스크립트
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const iconSizes = [32, 72, 96, 128, 144, 152, 180, 192, 384, 512];
const iconsDir = path.join(__dirname, '..', 'public', 'icons');

// icons 디렉토리 확인
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// 검정색 배경의 시간표 아이콘 SVG 생성
const generateIconSVG = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="blackGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1a1a1a;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#000000;stop-opacity:1" />
    </linearGradient>
  </defs>
  <!-- 검정색 배경 -->
  <rect width="${size}" height="${size}" rx="${size * 0.18}" fill="url(#blackGrad)"/>
  
  <!-- 시간표 격자 -->
  <g transform="translate(${size * 0.15}, ${size * 0.15})">
    <!-- 시간표 헤더 -->
    <rect x="0" y="0" width="${size * 0.7}" height="${size * 0.08}" fill="#3b82f6" rx="${size * 0.01}"/>
    
    <!-- 시간표 행들 -->
    <rect x="0" y="${size * 0.12}" width="${size * 0.7}" height="${size * 0.06}" fill="#60a5fa" opacity="0.8" rx="${size * 0.005}"/>
    <rect x="0" y="${size * 0.22}" width="${size * 0.7}" height="${size * 0.06}" fill="#3b82f6" opacity="0.9" rx="${size * 0.005}"/>
    <rect x="0" y="${size * 0.32}" width="${size * 0.7}" height="${size * 0.06}" fill="#60a5fa" opacity="0.7" rx="${size * 0.005}"/>
    <rect x="0" y="${size * 0.42}" width="${size * 0.7}" height="${size * 0.06}" fill="#3b82f6" opacity="0.8" rx="${size * 0.005}"/>
    <rect x="0" y="${size * 0.52}" width="${size * 0.7}" height="${size * 0.06}" fill="#60a5fa" opacity="0.6" rx="${size * 0.005}"/>
    
    <!-- 시간 도트들 -->
    <circle cx="${size * 0.05}" cy="${size * 0.04}" r="${size * 0.015}" fill="white"/>
    <circle cx="${size * 0.05}" cy="${size * 0.15}" r="${size * 0.012}" fill="#93c5fd"/>
    <circle cx="${size * 0.05}" cy="${size * 0.25}" r="${size * 0.012}" fill="#3b82f6"/>
    <circle cx="${size * 0.05}" cy="${size * 0.35}" r="${size * 0.012}" fill="#93c5fd"/>
    <circle cx="${size * 0.05}" cy="${size * 0.45}" r="${size * 0.012}" fill="#3b82f6"/>
  </g>
  
  <!-- 하단 텍스트 -->
  <text x="${size * 0.5}" y="${size * 0.82}" text-anchor="middle" fill="#3b82f6" font-size="${size * 0.08}" font-family="Arial, sans-serif" font-weight="bold">시간표</text>
</svg>`;

async function generateIcons() {
  console.log('🎨 검정색 배경 PWA 아이콘을 생성중...');
  
  for (const size of iconSizes) {
    try {
      const svgBuffer = Buffer.from(generateIconSVG(size));
      const outputPath = path.join(iconsDir, `icon-${size}x${size}.png`);
      
      await sharp(svgBuffer)
        .png({
          quality: 95,
          compressionLevel: 9,
          adaptiveFiltering: true
        })
        .toFile(outputPath);
        
      console.log(`✅ 생성완료: icon-${size}x${size}.png`);
    } catch (error) {
      console.error(`❌ 실패: icon-${size}x${size}.png -`, error.message);
    }
  }
  
  // 미리보기 HTML 업데이트
  const previewHTML = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>검정색 배경 PWA 아이콘</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .icon { margin: 20px; display: inline-block; text-align: center; }
        .icon img { border: 2px solid #ddd; border-radius: 12px; }
        .icon-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 20px; }
        h1 { color: #333; }
        .size-label { margin-top: 10px; font-weight: bold; color: #666; }
    </style>
</head>
<body>
    <h1>🖤 검정색 배경 PWA 아이콘</h1>
    <p>iOS PWA에 최적화된 검정색 배경의 시간표 아이콘들입니다.</p>
    <div class="icon-grid">
    ${iconSizes.map(size => `
        <div class="icon">
            <img src="icon-${size}x${size}.png" alt="${size}x${size}" width="80" height="80">
            <div class="size-label">${size}×${size}</div>
        </div>
    `).join('')}
    </div>
</body>
</html>
  `;
  
  fs.writeFileSync(path.join(iconsDir, 'preview-black.html'), previewHTML);
  console.log('📱 미리보기: public/icons/preview-black.html');
  console.log('🎉 검정색 배경 아이콘 생성 완료!');
}

generateIcons().catch(console.error);