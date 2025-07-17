"use client";

import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { PhoneOff } from 'lucide-react';
import { Translations } from '@/lib/translations';

export default function CallPage() {
  const t = useTranslation();
  const router = useRouter();

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-900 text-white p-4">
      <PhoneOff className="h-16 w-16 text-destructive mb-4" />
      <h1 className="text-2xl font-bold text-destructive mb-2">
        {t.errorOccurred || "Feature Unavailable"}
      </h1>
      <p className="text-center mb-6">
        {"The voice/video call feature is currently under development."}
      </p>
      <Button onClick={() => router.back()} className="mt-6">
        {t.backToDashboard || "Go Back"}
      </Button>
    </div>
  );
}
