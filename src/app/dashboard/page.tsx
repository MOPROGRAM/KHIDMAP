
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTranslation, Translations } from '@/hooks/useTranslation';
import Link from 'next/link';
import { Briefcase, User, Search, PlusCircle, History, UserCog } from 'lucide-react';
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
    return (
      <div className="flex h-screen items-center justify-center">
        <p>{t.loading}</p>
      </div>
    );
  }

  const providerActions = [
    { titleKey: 'myAds', description: 'View and manage your service advertisements.', href: '/dashboard/provider/ads', icon: <Briefcase className="h-8 w-8 text-primary group-hover:animate-subtle-bounce" /> },
    { titleKey: 'newAd', description: 'Create a new advertisement to offer your services.', href: '/dashboard/provider/ads/new', icon: <PlusCircle className="h-8 w-8 text-primary group-hover:animate-subtle-bounce" /> },
    { titleKey: 'profile', description: 'Update your personal and service information.', href: '/dashboard/provider/profile', icon: <UserCog className="h-8 w-8 text-primary group-hover:animate-subtle-bounce" /> },
  ];

  const seekerActions = [
    { titleKey: 'search', description: 'Find skilled artisans for your needs.', href: '/services/search', icon: <Search className="h-8 w-8 text-primary group-hover:animate-subtle-bounce" /> },
    { titleKey: 'searchHistory', description: 'Review your past service searches.', href: '/dashboard/seeker/history', icon: <History className="h-8 w-8 text-primary group-hover:animate-subtle-bounce" /> },
  ];
  
  const actions = userRole === 'provider' ? providerActions : seekerActions;

  return (
    <div className="space-y-10 animate-fadeIn">
      <Card className="shadow-xl border">
        <CardHeader>
          <CardTitle className="text-3xl md:text-4xl font-headline text-foreground">
            {t.welcomeTo} {t.dashboard}, {userName || (userRole === 'provider' ? t.provider : t.seeker)}!
          </CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            {userRole === 'provider' ? "Manage your services and reach more customers." : "Find the best services for your needs easily."}
          </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="relative aspect-[16/6] rounded-lg overflow-hidden shadow-lg group">
                <Image 
                    src="https://placehold.co/1200x400.png" 
                    alt="Dashboard banner" 
                    layout="fill" 
                    objectFit="cover" 
                    className="group-hover:scale-105 transition-transform duration-500 ease-in-out" 
                    data-ai-hint="workspace tools" 
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
            </div>
        </CardContent>
      </Card>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {actions.map((action, index) => (
          <Card 
            key={action.href} 
            className="shadow-lg hover:shadow-2xl border transition-all duration-300 ease-in-out transform hover:-translate-y-1.5 group"
            style={{ animationDelay: `${index * 150}ms`, animationName: 'fadeIn', animationFillMode: 'backwards' }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-xl font-semibold font-headline text-foreground">{t[action.titleKey as keyof Translations]}</CardTitle>
              {action.icon}
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-6">{action.description}</p>
              <Button asChild className="w-full shadow-md hover:shadow-lg hover:scale-105 transform transition-all duration-300">
                <Link href={action.href}>{t[action.titleKey as keyof Translations]}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
       <style jsx global>{`
        [style*="animation-delay"] {
          animation-duration: 0.5s;
        }
      `}</style>
    </div>
  );
}
