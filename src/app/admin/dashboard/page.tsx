
"use client";

import { useTranslation } from '@/hooks/useTranslation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldCheck, DollarSign, ArrowRight, Megaphone, LifeBuoy, BadgeCheck, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const t = useTranslation();

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
             <ShieldCheck className="h-10 w-10 text-primary" />
            <div>
                <CardTitle className="text-2xl font-headline">{t.welcomeAdmin}</CardTitle>
                <CardDescription>{t.adminDashboardDescription}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Link href="/admin/payments" className="group">
                    <Card className="shadow-sm hover:shadow-xl border transition-all duration-300 ease-in-out transform hover:-translate-y-1">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="bg-primary/10 p-3 rounded-full">
                                    <DollarSign className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-foreground">{t.paymentApprovals}</h3>
                                    <p className="text-sm text-muted-foreground">{t.paymentApprovalsDescription}</p>
                                </div>
                            </div>
                            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                        </CardContent>
                    </Card>
                </Link>
                <Link href="/admin/ads" className="group">
                    <Card className="shadow-sm hover:shadow-xl border transition-all duration-300 ease-in-out transform hover:-translate-y-1">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="bg-primary/10 p-3 rounded-full">
                                    <Megaphone className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-foreground">{t.adRequests}</h3>
                                    <p className="text-sm text-muted-foreground">{t.adRequestsDescription}</p>
                                </div>
                            </div>
                            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                        </CardContent>
                    </Card>
                </Link>
                 <Link href="/admin/support" className="group">
                    <Card className="shadow-sm hover:shadow-xl border transition-all duration-300 ease-in-out transform hover:-translate-y-1">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="bg-primary/10 p-3 rounded-full">
                                    <LifeBuoy className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-foreground">{t.supportRequests}</h3>
                                    <p className="text-sm text-muted-foreground">{t.reviewSupportTickets}</p>
                                </div>
                            </div>
                            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                        </CardContent>
                    </Card>
                </Link>
                <Link href="/admin/verifications" className="group">
                    <Card className="shadow-sm hover:shadow-xl border transition-all duration-300 ease-in-out transform hover:-translate-y-1">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="bg-primary/10 p-3 rounded-full">
                                    <BadgeCheck className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-foreground">{t.providerVerifications}</h3>
                                    <p className="text-sm text-muted-foreground">{t.reviewProviderVerifications}</p>
                                </div>
                            </div>
                            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                        </CardContent>
                    </Card>
                </Link>
                <Link href="/admin/disputes" className="group">
                    <Card className="shadow-sm hover:shadow-xl border transition-all duration-300 ease-in-out transform hover:-translate-y-1">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="bg-primary/10 p-3 rounded-full">
                                    <ShieldAlert className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-foreground">{t.disputeResolution}</h3>
                                    <p className="text-sm text-muted-foreground">{t.disputeResolutionDescription}</p>
                                </div>
                            </div>
                            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                        </CardContent>
                    </Card>
                </Link>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
