"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';
import { Skeleton } from '@/components/ui/skeleton'; // For loading state

interface ProtectedRouteProps {
  children: ReactNode;
  roles?: string[]; // Optional roles for role-based access control
}

const ProtectedRoute = ({ children, roles }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Optional: Role-based access control
  useEffect(() => {
    if (!isLoading && isAuthenticated && roles && user && !roles.includes(user.role)) {
      router.push('/dashboard'); // Redirect to a default page if role not authorized
    }
  }, [isAuthenticated, isLoading, router, roles, user]);


  if (isLoading) {
    // Show a loading skeleton or spinner while checking auth state
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-32 w-full" />
        <div className="flex justify-between">
          <Skeleton className="h-10 w-1/4" />
          <Skeleton className="h-10 w-1/4" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Return null or a loading indicator while redirecting
    return null;
  }
  
  if (roles && user && !roles.includes(user.role)) {
    // Return null or a message while redirecting
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;