
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import Link from 'next/link';
import { Briefcase, User, Search, PlusCircle } from 'lucide-react';
import Image from 'next/image';

export default function DashboardPage() {
  const t = useTranslation();
  const router = useRouter();
  const [userRole, setUserRole] = useState<'provider' | 'seeker' | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const role = localStorage.getItem('userRole') as 'provider' | 'seeker' | null;
    const name = localStorage.getItem('userName');
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

    if (!isLoggedIn) {
      router.replace('/auth/login');
    } else {
      setUserRole(role);
      setUserName(name);
    }
  }, [router]);

  if (!isMounted) {
    return <div className="flex h-screen items-center justify-center"><p>{t.loading}</p></div>;
  }

  const providerActions = [
    { titleKey: 'myAds', description: 'View and manage your service advertisements.', href: '/dashboard/provider/ads', icon: <Briefcase className="h-8 w-8 text-primary" /> },
    { titleKey: 'newAd', description: 'Create a new advertisement to offer your services.', href: '/dashboard/provider/ads/new', icon: <PlusCircle className="h-8 w-8 text-primary" /> },
    { titleKey: 'profile', description: 'Update your personal and service information.', href: '/dashboard/provider/profile', icon: <User className="h-8 w-8 text-primary" /> },
  ];

  const seekerActions = [
    { titleKey: 'search', description: 'Find skilled artisans for your needs.', href: '/services/search', icon: <Search className="h-8 w-8 text-primary" /> },
    { titleKey: 'searchHistory', description: 'Review your past service searches.', href: '/dashboard/seeker/history', icon: <History className="h-8 w-8 text-primary" /> },
  ];
  
  const actions = userRole === 'provider' ? providerActions : seekerActions;

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-headline">
            {t.welcomeTo} {t.dashboard}, {userName || (userRole === 'provider' ? t.provider : t.seeker)}!
          </CardTitle>
          <CardDescription>
            {userRole === 'provider' ? "Manage your services and reach more customers." : "Find the best services for your needs easily."}
          </CardDescription>
        </CardHeader>
        <CardContent>
            <Image src="https://placehold.co/1200x300.png" alt="Dashboard banner" width={1200} height={300} className="rounded-md object-cover w-full" data-ai-hint="workspace tools" />
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {actions.map((action) => (
          <Card key={action.href} className="hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-semibold font-headline">{t[action.titleKey as keyof typeof t]}</CardTitle>
              {action.icon}
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{action.description}</p>
              <Button asChild className="w-full">
                <Link href={action.href}>{t[action.titleKey as keyof typeof t]}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
