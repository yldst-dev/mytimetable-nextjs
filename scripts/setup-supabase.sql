-- Supabase 테이블 스키마 생성 스크립트
-- Supabase 대시보드의 SQL Editor에서 실행하세요

-- 1. Push 구독 테이블
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id text NOT NULL,
    endpoint text NOT NULL UNIQUE,
    p256dh text NOT NULL,
    auth text NOT NULL,
    user_agent text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    is_active boolean DEFAULT true NOT NULL
);

-- 2. 알림 로그 테이블
CREATE TABLE IF NOT EXISTS notification_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    subscription_id uuid REFERENCES push_subscriptions(id) ON DELETE CASCADE,
    title text NOT NULL,
    body text NOT NULL,
    data jsonb,
    sent_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    success boolean NOT NULL,
    error_message text
);

-- 3. 스케줄된 알림 테이블
CREATE TABLE IF NOT EXISTS scheduled_notifications (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    body text NOT NULL,
    data jsonb,
    scheduled_for timestamp with time zone NOT NULL,
    class_period text NOT NULL,
    class_name text NOT NULL,
    class_room text NOT NULL,
    professor text NOT NULL,
    notification_type text CHECK (notification_type IN ('class-reminder', 'attendance-check')) NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    sent boolean DEFAULT false NOT NULL,
    sent_at timestamp with time zone
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_active ON push_subscriptions(is_active);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_subscription_id ON notification_logs(subscription_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_sent_at ON notification_logs(sent_at);
CREATE INDEX IF NOT EXISTS idx_scheduled_notifications_scheduled_for ON scheduled_notifications(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_scheduled_notifications_sent ON scheduled_notifications(sent);

-- Row Level Security (RLS) 활성화
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_notifications ENABLE ROW LEVEL SECURITY;

-- 정책 생성 (모든 사용자가 읽기/쓰기 가능 - 실제 환경에서는 더 엄격한 정책 필요)
CREATE POLICY "Enable all operations for push_subscriptions" ON push_subscriptions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for notification_logs" ON notification_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for scheduled_notifications" ON scheduled_notifications FOR ALL USING (true) WITH CHECK (true);

-- updated_at 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- updated_at 트리거 생성
DROP TRIGGER IF EXISTS update_push_subscriptions_updated_at ON push_subscriptions;
CREATE TRIGGER update_push_subscriptions_updated_at
    BEFORE UPDATE ON push_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();