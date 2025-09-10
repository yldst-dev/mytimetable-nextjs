// 새 로고를 사용한 PWA 아이콘 생성 스크립트
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const iconSizes = [32, 72, 96, 128, 144, 152, 180, 192, 384, 512];
const iconsDir = path.join(__dirname, '..', 'public', 'icons');

// icons 디렉토리 확인
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// 새 로고 기반 아이콘 SVG 생성 (크기에 맞게 최적화)
const generateLogoIconSVG = (size) => {
  const strokeWidth = Math.max(2, size * 0.08); // 크기에 비례한 선 두께
  const radius = size * 0.35; // 시계 크기
  const centerX = size / 2;
  const centerY = size / 2;
  const handLength = radius * 0.4; // 시침 길이
  const minuteHandLength = radius * 0.6; // 분침 길이
  
  return `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="darkGrad${size}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#333333;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1a1a1a;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- 배경 -->
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#darkGrad${size})"/>
  
  <!-- 시계 원형 -->
  <circle cx="${centerX}" cy="${centerY}" r="${radius}" 
          stroke="white" stroke-width="${strokeWidth}" 
          fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  
  <!-- 시계 바늘들 -->
  <!-- 12시, 3시, 6시, 9시 마크 -->
  <circle cx="${centerX}" cy="${centerY - radius * 0.8}" r="${strokeWidth * 0.8}" fill="white" opacity="0.7"/>
  <circle cx="${centerX + radius * 0.8}" cy="${centerY}" r="${strokeWidth * 0.6}" fill="white" opacity="0.5"/>
  <circle cx="${centerX}" cy="${centerY + radius * 0.8}" r="${strokeWidth * 0.6}" fill="white" opacity="0.5"/>
  <circle cx="${centerX - radius * 0.8}" cy="${centerY}" r="${strokeWidth * 0.6}" fill="white" opacity="0.5"/>
  
  <!-- 시침 (11시 방향) -->
  <line x1="${centerX}" y1="${centerY}" 
        x2="${centerX - handLength * 0.5}" y2="${centerY - handLength * 0.866}" 
        stroke="white" stroke-width="${strokeWidth}" stroke-linecap="round"/>
  
  <!-- 분침 (1시 방향) -->
  <line x1="${centerX}" y1="${centerY}" 
        x2="${centerX + minuteHandLength * 0.5}" y2="${centerY - minuteHandLength * 0.866}" 
        stroke="white" stroke-width="${strokeWidth * 0.8}" stroke-linecap="round"/>
  
  <!-- 중심점 -->
  <circle cx="${centerX}" cy="${centerY}" r="${strokeWidth * 0.7}" fill="white"/>
</svg>`;
};

async function generateLogoIcons() {
  console.log('🕐 새 로고로 PWA 아이콘을 생성중...');
  
  for (const size of iconSizes) {
    try {
      const svgBuffer = Buffer.from(generateLogoIconSVG(size));
      const outputPath = path.join(iconsDir, `icon-${size}x${size}.png`);
      
      await sharp(svgBuffer)
        .png({
          quality: 95,
          compressionLevel: 9,
          adaptiveFiltering: true,
          palette: false // 풀 컬러 PNG
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
    <title>시계 로고 PWA 아이콘</title>
    <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, Arial, sans-serif; 
          margin: 40px; 
          background: #f8f9fa; 
          line-height: 1.6;
        }
        .icon { 
          margin: 20px; 
          display: inline-block; 
          text-align: center; 
          transition: transform 0.2s ease;
        }
        .icon:hover { transform: scale(1.05); }
        .icon img { 
          border: 3px solid #e9ecef; 
          border-radius: 20px; 
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .icon-grid { 
          display: grid; 
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); 
          gap: 30px; 
          margin-top: 30px;
        }
        h1 { 
          color: #2d3436; 
          text-align: center;
          margin-bottom: 10px;
        }
        .subtitle {
          text-align: center;
          color: #636e72;
          margin-bottom: 40px;
        }
        .size-label { 
          margin-top: 15px; 
          font-weight: 600; 
          color: #2d3436;
          font-size: 14px;
        }
        .ios-badge {
          background: #007AFF;
          color: white;
          font-size: 10px;
          padding: 2px 6px;
          border-radius: 4px;
          margin-top: 5px;
          display: inline-block;
        }
    </style>
</head>
<body>
    <h1>🕐 시계 로고 PWA 아이콘</h1>
    <p class="subtitle">어두운 배경의 세련된 시계 디자인</p>
    
    <div class="icon-grid">
    ${iconSizes.map(size => `
        <div class="icon">
            <img src="icon-${size}x${size}.png" alt="${size}x${size}" width="100" height="100">
            <div class="size-label">${size}×${size}</div>
            ${size === 180 ? '<div class="ios-badge">iOS 메인</div>' : ''}
            ${size === 512 ? '<div class="ios-badge">고해상도</div>' : ''}
        </div>
    `).join('')}
    </div>
    
    <div style="margin-top: 50px; text-align: center; color: #636e72; font-size: 14px;">
        <p>iOS PWA에 최적화된 시계 로고입니다.</p>
        <p>어두운 배경과 흰색 시계 디자인으로 모든 환경에서 선명하게 표시됩니다.</p>
    </div>
</body>
</html>
  `;
  
  fs.writeFileSync(path.join(iconsDir, 'preview-logo.html'), previewHTML);
  console.log('📱 미리보기: public/icons/preview-logo.html');
  console.log('🎉 시계 로고 아이콘 생성 완료!');
}

generateLogoIcons().catch(console.error);