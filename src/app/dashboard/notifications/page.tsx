
"use client";

import { useEffect, useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bell, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import { Notification } from '@/lib/data'; // Keep Notification type if it's a shared type
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { useSettings } from '@/contexts/SettingsContext';
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth

const NotificationItem = ({ notification, t, language }: { notification: Notification, t: Record<string, string>, language: string }) => {
    const formatRelativeTime = (dateString: string) => {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        return formatDistanceToNow(date, { addSuffix: true, locale: language === 'ar' ? ar : enUS });
    }

    const renderMessage = (notification: Notification) => {
        let message = t[notification.messageKey] || '...';
        if (notification.messageParams) {
            Object.keys(notification.messageParams).forEach(key => {
                const placeholder = `{${key}}`;
                message = message.replace(new RegExp(placeholder.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), notification.messageParams![key]);
            });
        }
        return message;
    }
    
    const title = (notification: Notification) => t[notification.titleKey] || 'Notification';

    return (
        <Link href={notification.link || '#'} className="block">
            <Card className={`p-4 hover:bg-muted/50 transition-colors ${!notification.isRead ? 'border-primary/50 bg-primary/5' : ''}`}>
                <div className="flex flex-col">
                    <p className="font-semibold text-foreground">{title(notification)}</p>
                    <p className="text-sm text-muted-foreground">{renderMessage(notification)}</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">{formatRelativeTime(notification.createdAt)}</p>
                </div>
            </Card>
        </Link>
    );
};


export default function NotificationsPage() {
  const t = useTranslation();
  const { toast } = useToast();
  const { language } = useSettings();
  const { user: authUser, isLoading: isAuthLoading } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthLoading && authUser) {
      const fetchNotifications = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const res = await fetch(`/api/notifications`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || 'Failed to fetch notifications.');
          }
          const userNotifications: Notification[] = await res.json();
          setNotifications(userNotifications);
        } catch (err: any) {
          setError((t.errorOccurred || 'Error') + ": " + err.message);
          toast({
            variant: 'destructive',
            title: t.errorOccurred || 'Error',
            description: err.message,
          });
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchNotifications();
    } else if (!isAuthLoading && !authUser) {
      setIsLoading(false);
      // Optionally redirect to login if not authenticated
      // router.push('/login');
    }
  }, [authUser, t, toast, isAuthLoading]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">{t.loading}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Bell className="h-10 w-10 text-primary" />
            <div>
              <CardTitle className="text-2xl font-headline">{t.allNotifications}</CardTitle>
              <CardDescription>{t.allNotificationsDescription}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="p-4 mb-6 text-sm text-destructive-foreground bg-destructive rounded-md flex items-center gap-2 justify-center">
              <AlertTriangle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          )}
          {notifications.length === 0 && !error ? (
            <div className="text-center py-12">
              <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
              <h3 className="text-xl font-semibold">{t.noNotificationsYet}</h3>
              <p className="text-muted-foreground">{t.checkBackLater}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <NotificationItem key={notification.id} notification={notification} t={t} language={language} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
