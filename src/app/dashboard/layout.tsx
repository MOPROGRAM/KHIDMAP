"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import { Home, User, Search, History, LogOut, Settings, MessageSquare, Loader2, ShieldCheck, AlertTriangle, ServerCrash, Briefcase, DollarSign, Menu, Mail, Megaphone, LifeBuoy, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import Logo from '@/components/shared/Logo';
import { Separator } from '@/components/ui/separator';
import { useToast } from "@/hooks/use-toast";
import { ADMIN_EMAIL } from '@/lib/config';
import CallNotification from '@/components/chat/CallNotification';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import NotificationBell from '@/components/layout/NotificationBell';
import type { Notification } from '@/lib/data';

type UserRole = 'provider' | 'seeker' | 'admin';

interface NavItem {
  href: string;
  labelKey: string;
  icon: React.ReactElement;
  roles: UserRole[];
}

const NavContent = ({
  navItems,
  pathname,
  t,
  isMobile = false,
  closeSheet,
}: {
  navItems: NavItem[],
  pathname: string,
  t: Record<string, string>,
  isMobile?: boolean,
  closeSheet?: () => void,
}) => (
  <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
    {navItems.map((item: NavItem) => (
      <Link
        key={item.href}
        href={item.href}
        onClick={() => isMobile && closeSheet?.()}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
          pathname.startsWith(item.href) && (item.href !== '/dashboard' || pathname === '/dashboard') && "bg-muted text-primary"
        )}
      >
        {React.cloneElement(item.icon, { className: 'h-4 w-4' })}
        {t[item.labelKey]}
      </Link>
    ))}
  </nav>
);


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslation();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { toast } = useToast();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const isMessagesPage = pathname.startsWith('/dashboard/messages');
  const userRole = user?.role as UserRole;

  // Dummy fetch notifications - replace with your actual API call
  useEffect(() => {
    if (user) {
      // Fetch notifications here
      // setNotifications(fetchedNotifications);
      // setUnreadCount(newUnreadCount);
    }
  }, [user]);

  const handleMarkAllAsRead = async () => {
    // Implement your mark all as read logic
  };

  const handleLogout = () => {
    logout();
    toast({ title: "Logged out successfully." });
    // The ProtectedRoute will handle the redirect
  };

  const navItems: NavItem[] = [
    // Define your nav items here based on roles
    { href: '/dashboard', labelKey: 'dashboard', icon: <Home />, roles: ['seeker', 'provider', 'admin'] },
    { href: '/dashboard/provider/ads', labelKey: 'myAds', icon: <Megaphone />, roles: ['provider'] },
    { href: '/dashboard/orders', labelKey: 'orders', icon: <Briefcase />, roles: ['seeker', 'provider'] },
    { href: '/dashboard/messages', labelKey: 'messages', icon: <MessageSquare />, roles: ['seeker', 'provider', 'admin'] },
    { href: '/dashboard/settings', labelKey: 'settings', icon: <Settings />, roles: ['seeker', 'provider', 'admin'] },
    { href: '/admin/dashboard', labelKey: 'adminDashboard', icon: <ShieldCheck />, roles: ['admin'] },
  ];

  const filteredNavItems = userRole ? navItems.filter(item => item.roles.includes(userRole)) : [];
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <ProtectedRoute>
      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <div className="hidden border-r bg-background md:block">
          <div className="flex h-full max-h-screen flex-col gap-2">
            <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
              <Logo />
            </div>
            <div className="flex-1 overflow-auto py-2">
              <NavContent navItems={filteredNavItems} pathname={pathname} t={t} closeSheet={closeMobileMenu} />
            </div>
            <div className="mt-auto p-4">
              <Separator className="my-2" />
              <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
                <LogOut className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
                {t.logout}
              </Button>
            </div>
          </div>
        </div>
        <div className="flex flex-col">
          <header className="flex h-14 items-center gap-4 border-b bg-background/95 px-4 lg:h-[60px] lg:px-6 sticky top-0 z-30">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">{t.dashboard}</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="flex flex-col p-0">
                <SheetHeader className="p-4">
                  <SheetTitle>{t.dashboard}</SheetTitle>
                  <SheetDescription>{t.dashboard}</SheetDescription>
                </SheetHeader>
                <div className="flex h-14 shrink-0 items-center border-b px-4 lg:h-[60px] lg:px-6">
                  <Logo />
                </div>
                <div className="flex-1 overflow-auto py-2">
                  <NavContent navItems={filteredNavItems} pathname={pathname} t={t} isMobile={true} closeSheet={closeMobileMenu} />
                </div>
                <div className="mt-auto p-4 border-t">
                  <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
                    <LogOut className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
                    {t.logout}
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
            <div className="w-full flex-1">
              {/* Optionally, a search bar can go here */}
            </div>
            <div className="flex items-center gap-2">
              {user && <NotificationBell notifications={notifications} unreadCount={unreadCount} handleMarkAllAsRead={handleMarkAllAsRead} />}
            </div>
          </header>
          <main className="flex flex-1 flex-col overflow-hidden">
            {/* Removed email verification prompt for simplicity, can be added back if needed */}
            <div className={cn("flex-1", isMessagesPage ? "flex flex-col overflow-hidden" : "overflow-y-auto p-2 md:p-4")}>
              {children}
            </div>
          </main>
        </div>
        {user && <CallNotification />}
      </div>
    </ProtectedRoute>
  );
}
