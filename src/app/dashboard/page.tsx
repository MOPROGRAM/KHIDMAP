
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTranslation, Translations } from '@/hooks/useTranslation';
import Link from 'next/link';
import { Briefcase, User, Search, PlusCircle, History, UserCog, ArrowRight, Building } from 'lucide-react';
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
    { titleKey: 'profile', descriptionKey: 'profileDescriptionProvider', href: '/dashboard/provider/profile', icon: <UserCog className="h-6 w-6 text-primary" /> },
    { titleKey: 'search', descriptionKey: 'searchDescriptionSeeker', href: '/services/search', icon: <Search className="h-6 w-6 text-primary" /> },
  ];

  const seekerActions = [
    { titleKey: 'search', descriptionKey: 'searchDescriptionSeeker', href: '/services/search', icon: <Search className="h-6 w-6 text-primary" /> },
    { titleKey: 'searchHistory', descriptionKey: 'searchHistoryDescriptionSeeker', href: '/dashboard/seeker/history', icon: <History className="h-6 w-6 text-primary" /> },
  ];
  
  const actions = userRole === 'provider' ? providerActions : seekerActions;
  const welcomeMessage = userName ? t.welcomeToDashboardUser.replace('{userName}', userName) : (userRole === 'provider' ? t.welcomeToDashboardProvider : t.welcomeToDashboardSeeker);

  return (
    <div className="space-y-8 animate-fadeIn">
      <Card className="shadow-lg border bg-card overflow-hidden">
        <div className="grid md:grid-cols-2">
            <div className="p-8">
              <CardHeader className="p-0 mb-2">
                <CardTitle className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
                  {welcomeMessage}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                  <p className="text-lg text-muted-foreground">
                    {userRole === 'provider' ? t.dashboardTaglineProvider : t.dashboardTaglineSeeker}
                  </p>
              </CardContent>
            </div>
            <div className="relative h-48 md:h-full hidden md:block">
                <Image 
                    src="https://placehold.co/600x400.png"
                    alt={t.dashboardBannerAlt} 
                    layout="fill" 
                    objectFit="cover" 
                    className=""
                    data-ai-hint="workspace tools"
                />
            </div>
        </div>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        {actions.map((action, index) => (
          <Link href={action.href} key={action.href} className="group">
          <Card 
            className="shadow-sm hover:shadow-xl border transition-all duration-300 ease-in-out transform hover:-translate-y-1.5"
            style={{ animationDelay: `${index * 150}ms`, animationName: 'fadeIn', animationFillMode: 'backwards' }}
          >
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  {action.icon}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">{t[action.titleKey as keyof Translations]}</h3>
                  <p className="text-sm text-muted-foreground">{t[action.descriptionKey as keyof Translations]}</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
            </CardContent>
          </Card>
          </Link>
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
