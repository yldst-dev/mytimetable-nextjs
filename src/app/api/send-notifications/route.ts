import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import webpush from 'web-push';

// VAPID 키 설정
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || 'mailto:test@test.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { title, body, data, targetSubscriptions } = await request.json();

    if (!title || !body) {
      return NextResponse.json(
        { error: 'Missing title or body' },
        { status: 400 }
      );
    }

    // 활성화된 구독 가져오기
    let query = supabaseServer
      .from('push_subscriptions')
      .select('*')
      .eq('is_active', true);

    // 특정 구독만 타겟팅하는 경우
    if (targetSubscriptions && targetSubscriptions.length > 0) {
      query = query.in('id', targetSubscriptions);
    }

    const { data: subscriptions, error: fetchError } = await query;

    if (fetchError) {
      console.error('Failed to fetch subscriptions:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch subscriptions' },
        { status: 500 }
      );
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json(
        { message: 'No active subscriptions found' },
        { status: 200 }
      );
    }

    const results = [];
    
    // 각 구독에 푸시 알림 전송
    for (const subscription of subscriptions) {
      try {
        const pushSubscription = {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh,
            auth: subscription.auth
          }
        };

        const payload = JSON.stringify({
          title,
          body,
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-72x72.png',
          data: data || {}
        });

        await webpush.sendNotification(pushSubscription, payload);

        // 성공한 알림 로그 저장
        await supabaseServer
          .from('notification_logs')
          .insert({
            subscription_id: subscription.id,
            title,
            body,
            data,
            success: true
          });

        results.push({
          subscriptionId: subscription.id,
          success: true
        });

      } catch (pushError: unknown) {
        console.error(`Push failed for subscription ${subscription.id}:`, pushError);

        const error = pushError as Error & { statusCode?: number };
        
        // 실패한 알림 로그 저장
        await supabaseServer
          .from('notification_logs')
          .insert({
            subscription_id: subscription.id,
            title,
            body,
            data,
            success: false,
            error_message: error.message || 'Unknown error'
          });

        // 410 에러 (Gone) 또는 유효하지 않은 구독은 비활성화
        if (error.statusCode === 410 || error.statusCode === 404) {
          await supabaseServer
            .from('push_subscriptions')
            .update({ is_active: false })
            .eq('id', subscription.id);
        }

        results.push({
          subscriptionId: subscription.id,
          success: false,
          error: error.message || 'Unknown error'
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    return NextResponse.json({
      success: true,
      message: `Sent ${successCount} notifications, ${failureCount} failed`,
      results: {
        total: results.length,
        success: successCount,
        failed: failureCount
      }
    });

  } catch (error) {
    console.error('Send notifications error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// 스케줄된 알림 처리 (cron job 등에서 호출)
export async function GET() {
  try {
    // 현재 시간에 발송되어야 할 스케줄된 알림 가져오기
    const now = new Date();
    const { data: scheduledNotifications, error } = await supabaseServer
      .from('scheduled_notifications')
      .select('*')
      .eq('sent', false)
      .lte('scheduled_for', now.toISOString());

    if (error) {
      console.error('Failed to fetch scheduled notifications:', error);
      return NextResponse.json(
        { error: 'Failed to fetch scheduled notifications' },
        { status: 500 }
      );
    }

    if (!scheduledNotifications || scheduledNotifications.length === 0) {
      return NextResponse.json({
        message: 'No scheduled notifications to send'
      });
    }

    // 각 스케줄된 알림 처리
    for (const notification of scheduledNotifications) {
      try {
        // 모든 활성 구독에 전송
        const response = await fetch(`/api/send-notifications`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: notification.title,
            body: notification.body,
            data: notification.data
          })
        });

        if (response.ok) {
          // 알림 발송 완료로 표시
          await supabaseServer
            .from('scheduled_notifications')
            .update({
              sent: true,
              sent_at: new Date().toISOString()
            })
            .eq('id', notification.id);
        }
      } catch (notificationError) {
        console.error(`Failed to send scheduled notification ${notification.id}:`, notificationError);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${scheduledNotifications.length} scheduled notifications`
    });

  } catch (error) {
    console.error('Process scheduled notifications error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}