
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import RegisterClient from './RegisterClient';

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center py-12 min-h-[calc(100vh-15rem)]">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <RegisterClient />
    </Suspense>
  );
}
