
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/hooks/useTranslation';
import { History, Trash2, Search } from 'lucide-react';
import Link from 'next/link';
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
} from "@/components/ui/alert-dialog"
import { useToast } from '@/hooks/use-toast';

interface SearchHistoryItem {
  query: string;
  date: string; // ISO string
}

export default function SearchHistoryPage() {
  const t = useTranslation();
  const { toast } = useToast();
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fullHistory = localStorage.getItem('fullSearchHistory');
    
    if (fullHistory) {
      setHistory(JSON.parse(fullHistory));
    }
    setIsLoading(false);
  }, []);

  const clearHistory = () => {
    localStorage.removeItem('searchHistory'); 
    localStorage.removeItem('fullSearchHistory');
    setHistory([]);
    toast({title: t.searchHistoryClearedTitle, description: t.searchHistoryClearedSuccess});
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-full min-h-[calc(100vh-10rem)]"><p>{t.loading}</p></div>;
  }

  return (
    <div className="space-y-8 py-8 animate-fadeIn">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <History className="h-10 w-10 text-primary" />
          <div>
            <h1 className="text-3xl font-bold font-headline">{t.searchHistory}</h1>
            <p className="text-muted-foreground">{t.searchHistoryPageDescription}</p>
          </div>
        </div>
        {history.length > 0 && (
           <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" className="group">
                <Trash2 className="ltr:mr-1 rtl:ml-1 h-4 w-4 group-hover:animate-subtle-bounce" /> {t.clearHistory}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t.confirmClearHistoryTitle}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t.confirmClearHistoryDescription}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
                <AlertDialogAction onClick={clearHistory} className="bg-destructive hover:bg-destructive/90">
                  {t.clearHistory}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {history.length === 0 ? (
        <Card className="text-center py-12 animate-fadeIn">
           <CardHeader>
            <History className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <CardTitle>{t.noHistoryYet}</CardTitle>
            <CardDescription>
              {t.noHistoryYetDescription}
            </CardDescription>
          </CardHeader>
          <CardContent>
             <Button asChild size="lg" className="group">
              <Link href="/services/search">
                <Search className="ltr:mr-2 rtl:ml-2 h-5 w-5 group-hover:animate-pulse-glow" /> {t.search} {t.services}
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="animate-fadeIn animation-delay-200">
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              {history.map((item, index) => (
                <li key={index} className="p-4 hover:bg-muted/50 transition-colors duration-200 ease-in-out" style={{ animationDelay: `${index * 50}ms`, animationName: 'fadeIn', animationFillMode: 'backwards' }}>
                  <div className="flex justify-between items-center">
                    <div>
                      <Link href={`/services/search?q=${encodeURIComponent(item.query)}`} className="font-medium text-primary hover:underline">
                        {item.query}
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        {t.searchedOn} {new Date(item.date).toLocaleDateString()} {new Date(item.date).toLocaleTimeString()}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" asChild className="group">
                       <Link href={`/services/search?q=${encodeURIComponent(item.query)}`}>
                         <Search className="ltr:mr-1 rtl:ml-1 h-4 w-4 group-hover:animate-pulse-glow" /> {t.repeatSearch}
                       </Link>
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
       <style jsx global>{`
        [style*="animation-delay"] {
          animation-duration: 0.4s; 
        }
        .animation-delay-200 { animation-delay: 0.2s; }
      `}</style>
    </div>
  );
}

