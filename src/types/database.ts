export interface PushSubscription {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  user_agent?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface NotificationLog {
  id: string;
  subscription_id: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sent_at: string;
  success: boolean;
  error_message?: string;
}

export interface ScheduledNotification {
  id: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  scheduled_for: string;
  class_period: string;
  class_name: string;
  class_room: string;
  professor: string;
  notification_type: 'class-reminder' | 'attendance-check';
  created_at: string;
  sent: boolean;
  sent_at?: string;
}

export interface Database {
  public: {
    Tables: {
      push_subscriptions: {
        Row: PushSubscription;
        Insert: Omit<PushSubscription, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<PushSubscription, 'id' | 'created_at'>>;
      };
      notification_logs: {
        Row: NotificationLog;
        Insert: Omit<NotificationLog, 'id' | 'sent_at'>;
        Update: Partial<Omit<NotificationLog, 'id'>>;
      };
      scheduled_notifications: {
        Row: ScheduledNotification;
        Insert: Omit<ScheduledNotification, 'id' | 'created_at' | 'sent' | 'sent_at'>;
        Update: Partial<Omit<ScheduledNotification, 'id' | 'created_at'>>;
      };
    };
  };
}