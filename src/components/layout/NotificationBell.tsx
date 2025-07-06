
"use client";

import { useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import type { Notification } from '@/lib/data';
import { useTranslation, Translations } from '@/hooks/useTranslation';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { useSettings } from '@/contexts/SettingsContext';

interface NotificationBellProps {
    notifications: Notification[];
    unreadCount: number;
    handleMarkAllAsRead: () => void;
}

export default function NotificationBell({ notifications, unreadCount, handleMarkAllAsRead }: NotificationBellProps) {
    const t = useTranslation();
    const { language } = useSettings();
    const [isOpen, setIsOpen] = useState(false);

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (open && unreadCount > 0) {
            setTimeout(handleMarkAllAsRead, 1000);
        }
    };
    
    const formatRelativeTime = (timestamp: any) => {
        if (!timestamp?.toDate) return '';
        return formatDistanceToNow(timestamp.toDate(), { addSuffix: true, locale: language === 'ar' ? ar : enUS });
    }

    const renderMessage = (notification: Notification) => {
        let message = t[notification.messageKey as keyof Translations] || '...';
        if (notification.messageParams) {
            Object.keys(notification.messageParams).forEach(key => {
                const placeholder = `{${key}}`;
                message = message.replace(new RegExp(placeholder.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), notification.messageParams![key]);
            });
        }
        return message;
    }
    
    const title = (notification: Notification) => t[notification.titleKey as keyof Translations] || 'Notification';


    return (
        <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative" aria-label={t.notifications}>
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-destructive-foreground text-xs font-bold pointer-events-none">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 md:w-96">
                <DropdownMenuLabel className="flex justify-between items-center p-2">
                    <span className="font-bold">{t.notifications}</span>
                    {unreadCount > 0 && (
                         <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleMarkAllAsRead(); }} className="h-auto px-2 py-1 text-xs">
                           <CheckCheck className="h-3 w-3 ltr:mr-1 rtl:ml-1" />
                           {t.markAllAsRead}
                         </Button>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-80 overflow-y-auto">
                    {notifications.length > 0 ? (
                        notifications.map(notification => (
                            <DropdownMenuItem key={notification.id} asChild className="cursor-pointer focus:bg-accent/50 p-0">
                                <Link href={notification.link || '#'} className={`block p-2 rounded-md ${!notification.isRead ? 'bg-primary/5' : ''}`}>
                                  <div className="flex flex-col items-start gap-1 whitespace-normal">
                                      <p className="font-semibold text-foreground">{title(notification)}</p>
                                      <p className="text-sm text-muted-foreground">{renderMessage(notification)}</p>
                                      <p className="text-xs text-muted-foreground/70 mt-1">{formatRelativeTime(notification.createdAt)}</p>
                                  </div>
                                </Link>
                            </DropdownMenuItem>
                        ))
                    ) : (
                        <DropdownMenuItem disabled className="p-4 text-center text-muted-foreground">{t.noNotifications}</DropdownMenuItem>
                    )}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="p-0 focus:bg-transparent">
                     <Link href="/dashboard/notifications" className="w-full block text-center py-2 text-sm text-primary font-semibold hover:bg-accent/50 rounded-b-md focus:bg-accent/50 focus:text-primary outline-none">
                        {t.viewAll}
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
