import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { headers } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { endpoint, keys } = await request.json();

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json(
        { error: 'Missing required subscription data' },
        { status: 400 }
      );
    }

    // 고유한 user_id 생성 (실제로는 인증 시스템의 user ID 사용)
    const headersList = await headers();
    const userAgentHeader = headersList.get('user-agent') || '';
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // 기존 구독이 있는지 확인
    const { data: existing } = await supabaseServer
      .from('push_subscriptions')
      .select('id')
      .eq('endpoint', endpoint)
      .eq('is_active', true)
      .single();

    if (existing) {
      return NextResponse.json({ 
        success: true, 
        message: 'Subscription already exists',
        subscriptionId: existing.id 
      });
    }

    // 새 구독 저장
    const { data, error } = await supabaseServer
      .from('push_subscriptions')
      .insert({
        user_id: userId,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        user_agent: userAgentHeader,
        is_active: true
      })
      .select('id')
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to save subscription' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      subscriptionId: data.id,
      message: 'Subscription saved successfully'
    });

  } catch (error) {
    console.error('Push subscription error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { endpoint } = await request.json();

    if (!endpoint) {
      return NextResponse.json(
        { error: 'Missing endpoint' },
        { status: 400 }
      );
    }

    const { error } = await supabaseServer
      .from('push_subscriptions')
      .update({ is_active: false })
      .eq('endpoint', endpoint);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to unsubscribe' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: 'Unsubscribed successfully'
    });

  } catch (error) {
    console.error('Unsubscribe error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}