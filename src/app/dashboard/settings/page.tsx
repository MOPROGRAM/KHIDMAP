
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { AlertTriangle, Loader2, Trash2, KeyRound, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { auth, db } from '@/lib/firebase';
import { deleteUser, sendPasswordResetEmail } from 'firebase/auth';
import { doc, deleteDoc, getDoc, writeBatch } from 'firebase/firestore';

export default function SettingsPage() {
  const t = useTranslation();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);

  const handlePasswordReset = async () => {
    setIsSendingReset(true);
    const user = auth?.currentUser;

    if (!user || !user.email) {
      toast({
        variant: "destructive",
        title: t.errorOccurred,
        description: t.userNotAuthOrServiceUnavailable,
      });
      setIsSendingReset(false);
      return;
    }

    try {
      await sendPasswordResetEmail(auth, user.email);
      toast({
        title: t.resetEmailSent,
        description: t.resetEmailSentDescription?.replace('{email}', user.email),
      });
    } catch (error) {
      console.error("Error sending password reset email from settings:", error);
      toast({
        variant: "destructive",
        title: t.resetPasswordErrorTitle,
        description: t.errorOccurred,
      });
    } finally {
      setIsSendingReset(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsLoading(true);
    const user = auth?.currentUser;

    if (!user || !db) {
      toast({
        variant: "destructive",
        title: t.errorOccurred,
        description: t.userNotAuthOrServiceUnavailable,
      });
      setIsLoading(false);
      return;
    }

    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      const batch = writeBatch(db);

      // Delete the user's document from Firestore.
      batch.delete(userDocRef);

      // If the user has a username, delete the username document.
      if (userDocSnap.exists() && userDocSnap.data().username) {
        const username = userDocSnap.data().username;
        const usernameDocRef = doc(db, "usernames", username);
        batch.delete(usernameDocRef);
      }
      
      // Commit the batched writes to Firestore.
      await batch.commit();

      // Then, delete the user from Firebase Authentication.
      await deleteUser(user);

      toast({
        title: t.accountDeletedTitle,
        description: t.accountDeletedSuccess,
      });
      // The onAuthStateChanged listener in the layout will handle redirection.
      router.push('/'); 

    } catch (error: any) {
      console.error("Error deleting account:", error);
      let description = t.accountDeletionError;
      if (error.code === 'auth/requires-recent-login') {
        description = t.requiresRecentLoginError;
      }
      toast({
        variant: "destructive",
        title: t.accountDeletionFailed,
        description: description,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold font-headline tracking-tight">{t.settings}</h1>
        <p className="text-muted-foreground">{t.manageAccountSettings}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
             <KeyRound className="h-5 w-5 text-primary" />
             {t.changePassword}
          </CardTitle>
          <CardDescription>
             {t.changePasswordDescription}
          </CardDescription>
        </CardHeader>
        <CardContent>
           <Button onClick={handlePasswordReset} disabled={isSendingReset}>
              {isSendingReset ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
              {t.sendResetEmail}
           </Button>
        </CardContent>
      </Card>
      
      <Card className="border-destructive bg-destructive/5 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl text-destructive flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            {t.dangerZone}
          </CardTitle>
          <CardDescription className="text-destructive/80">
            {t.dangerZoneDescription}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
            <div>
                <h3 className="font-semibold">{t.deleteAccount}</h3>
                <p className="text-sm text-muted-foreground">{t.deleteAccountDescription}</p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="mt-2 sm:mt-0" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                  {t.deleteAccount}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t.confirmDeleteAccountTitle}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t.confirmDeleteAccountDescription}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive hover:bg-destructive/90">
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : t.confirmDelete}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
