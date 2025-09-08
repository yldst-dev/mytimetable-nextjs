# Supabase 설정 가이드

이 문서는 PWA 알림 시스템을 위한 Supabase 데이터베이스 설정 방법을 설명합니다.

## 1. Supabase 프로젝트 생성

1. [Supabase](https://supabase.com)에서 계정 생성 후 로그인
2. "New Project" 클릭하여 새 프로젝트 생성
3. 프로젝트 이름, 데이터베이스 비밀번호 설정
4. 생성 완료 후 프로젝트 URL과 API 키 확인

## 2. 데이터베이스 스키마 생성

1. Supabase 대시보드에서 "SQL Editor" 탭으로 이동
2. `scripts/setup-supabase.sql` 파일의 내용을 복사하여 실행
3. 다음 테이블들이 생성됩니다:
   - `push_subscriptions`: 푸시 알림 구독 정보
   - `notification_logs`: 알림 발송 로그
   - `scheduled_notifications`: 예약된 알림

## 3. 환경 변수 설정

### 개발 환경 (.env.local)

```bash
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# VAPID Keys (아래 스크립트로 생성)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
VAPID_SUBJECT=mailto:your-email@domain.com

# PWA 설정
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_PWA_ENABLED=true
```

### VAPID 키 생성

```bash
node scripts/generate-vapid-keys.js
```

이 스크립트는 웹 푸시 알림에 필요한 VAPID 키 쌍을 생성합니다.

## 4. Vercel 배포 설정

Vercel 프로젝트 설정의 Environment Variables에 다음을 추가:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-production-service-role-key
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-production-vapid-public-key
VAPID_PRIVATE_KEY=your-production-vapid-private-key
VAPID_SUBJECT=mailto:your-production-email@domain.com
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_PWA_ENABLED=true
```

## 5. 알림 시스템 작동 방식

### 클라이언트 사이드
1. 사용자가 알림 권한 허용
2. Push subscription 생성 후 서버에 저장
3. Service Worker가 푸시 메시지 수신

### 서버 사이드
1. `/api/schedule-notifications` - 데이터베이스에 알림 스케줄 저장
2. `/api/send-notifications` - 실제 푸시 알림 발송
3. 크론 잡이나 스케줄러가 주기적으로 발송 API 호출

### 데이터베이스 테이블 구조

#### push_subscriptions
- 사용자별 푸시 구독 정보 저장
- endpoint, p256dh, auth 키 포함
- is_active로 활성 구독 관리

#### scheduled_notifications
- 수업별 사전 알림 및 출석 체크 알림
- 시간표 데이터 기반으로 자동 생성
- sent 플래그로 발송 여부 추적

#### notification_logs
- 모든 알림 발송 시도 기록
- 성공/실패 상태 및 오류 메시지 저장

## 6. 프로덕션 운영

### 자동 알림 발송
프로덕션 환경에서는 다음 방법 중 하나로 자동 알림을 설정:

1. **Vercel Cron Jobs** (권장)
   ```typescript
   // vercel.json
   {
     "crons": [{
       "path": "/api/send-notifications",
       "schedule": "*/10 * * * *"
     }]
   }
   ```

2. **외부 크론 서비스**
   - GitHub Actions
   - Uptime Robot
   - 기타 크론 서비스

### 모니터링
- Supabase 대시보드에서 테이블 데이터 확인
- Vercel Functions 로그 모니터링
- 알림 성공/실패 율 추적

## 7. 문제 해결

### 일반적인 문제
1. **VAPID 키 오류**: 키가 올바르게 설정되었는지 확인
2. **데이터베이스 연결 실패**: Supabase URL과 키 확인
3. **알림이 오지 않음**: HTTPS 환경인지, 권한이 허용되어 있는지 확인
4. **구독 실패**: Service Worker가 정상 등록되었는지 확인

### 로그 확인
- 브라우저 개발자 도구 콘솔
- Vercel Functions 로그
- Supabase 로그

이제 완전한 서버 기반 푸시 알림 시스템이 설정되었습니다!