// VAPID 키 생성 스크립트
// 사용법: node scripts/generate-vapid-keys.js

const webpush = require('web-push');

console.log('🔑 VAPID 키를 생성합니다...\n');

const vapidKeys = webpush.generateVAPIDKeys();

console.log('=== VAPID Keys ===');
console.log('Public Key:', vapidKeys.publicKey);
console.log('Private Key:', vapidKeys.privateKey);
console.log('\n=== 환경 변수 설정 ===');
console.log('다음 환경 변수를 .env.local 파일에 추가하세요:\n');
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
console.log(`VAPID_SUBJECT=mailto:your-email@domain.com`);
console.log('\n=== Vercel 배포용 ===');
console.log('Vercel 대시보드의 Environment Variables에 다음을 추가하세요:\n');
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY: ${vapidKeys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY: ${vapidKeys.privateKey}`);
console.log(`VAPID_SUBJECT: mailto:your-production-email@domain.com`);
console.log('\n✅ VAPID 키 생성이 완료되었습니다!');