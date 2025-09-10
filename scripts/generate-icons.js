// PWA 아이콘 생성 스크립트
// 실제로는 디자인 도구나 온라인 생성기를 사용하는 것이 좋습니다
// 이 스크립트는 개발용 플레이스홀더 아이콘을 생성합니다

const fs = require('fs');
const path = require('path');

const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, '..', 'public', 'icons');

// icons 디렉토리 생성
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// SVG 기반 아이콘 생성 (개발용 - 검정색 배경)
const generateIconSVG = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1f1f1f;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#000000;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#grad1)"/>
  <g transform="translate(${size * 0.2}, ${size * 0.2})">
    <rect x="0" y="0" width="${size * 0.6}" height="${size * 0.1}" fill="#3b82f6" opacity="0.9"/>
    <rect x="0" y="${size * 0.15}" width="${size * 0.6}" height="${size * 0.1}" fill="#60a5fa" opacity="0.7"/>
    <rect x="0" y="${size * 0.3}" width="${size * 0.6}" height="${size * 0.1}" fill="#3b82f6" opacity="0.9"/>
    <rect x="0" y="${size * 0.45}" width="${size * 0.6}" height="${size * 0.1}" fill="#60a5fa" opacity="0.5"/>
    <circle cx="${size * 0.1}" cy="${size * 0.05}" r="${size * 0.02}" fill="#3b82f6"/>
    <circle cx="${size * 0.1}" cy="${size * 0.2}" r="${size * 0.02}" fill="#60a5fa"/>
    <circle cx="${size * 0.1}" cy="${size * 0.35}" r="${size * 0.02}" fill="#3b82f6"/>
  </g>
  <text x="${size * 0.5}" y="${size * 0.85}" text-anchor="middle" fill="#3b82f6" font-size="${size * 0.1}" font-family="Arial, sans-serif" font-weight="bold">시간표</text>
</svg>`;

// README 파일 생성
const readmeContent = `# PWA 아이콘 생성

이 디렉토리는 PWA 아이콘들을 포함합니다.

## 개발용 아이콘 생성
현재는 개발용 SVG 기반 아이콘을 사용하고 있습니다.
프로덕션 환경에서는 다음을 권장합니다:

1. 전문 디자인 도구로 고품질 아이콘 제작
2. PWA 아이콘 생성기 사용 (예: https://www.pwabuilder.com/)
3. 모든 플랫폼과 크기에 최적화된 아이콘 생성

## 아이콘 크기
${iconSizes.map(size => `- ${size}x${size}px`).join('\n')}

## 사용된 아이콘들
${iconSizes.map(size => `- icon-${size}x${size}.png`).join('\n')}
`;

fs.writeFileSync(path.join(iconsDir, 'README.md'), readmeContent);

console.log('✅ PWA 아이콘 디렉토리 및 README.md가 생성되었습니다.');
console.log('📝 실제 아이콘은 디자인 도구를 사용하여 생성해주세요.');
console.log('🔗 권장 도구: https://www.pwabuilder.com/imageGenerator');

// 간단한 플레이스홀더 HTML 파일 생성
const placeholderHTML = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>PWA 아이콘 플레이스홀더</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .icon { margin: 20px; display: inline-block; text-align: center; }
        .icon svg { border: 1px solid #ddd; border-radius: 8px; }
    </style>
</head>
<body>
    <h1>PWA 아이콘 플레이스홀더</h1>
    <p>개발용 아이콘들입니다. 실제 배포시에는 전문적으로 디자인된 아이콘으로 교체해주세요.</p>
    ${iconSizes.map(size => `
    <div class="icon">
        <div>${size}x${size}</div>
        ${generateIconSVG(size)}
    </div>
    `).join('')}
</body>
</html>
`;

fs.writeFileSync(path.join(iconsDir, 'preview.html'), placeholderHTML);
console.log('📱 아이콘 미리보기: public/icons/preview.html');