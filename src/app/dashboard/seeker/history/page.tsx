
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
    // Load search history from localStorage (mock)
    const storedHistory = localStorage.getItem('searchHistory'); // Assuming it's stored as an array of strings
    const fullHistory = localStorage.getItem('fullSearchHistory'); // For items with dates
    
    if (fullHistory) {
      setHistory(JSON.parse(fullHistory));
    } else if (storedHistory) { // Fallback for simpler history
        const simpleHistory: string[] = JSON.parse(storedHistory);
        setHistory(simpleHistory.map(query => ({query, date: new Date().toISOString()})));
    }
    setIsLoading(false);
  }, []);

  const clearHistory = () => {
    localStorage.removeItem('searchHistory');
    localStorage.removeItem('fullSearchHistory');
    setHistory([]);
    toast({title: "Search History Cleared", description: "Your search history has been successfully cleared."});
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-full"><p>{t.loading}</p></div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <History className="h-10 w-10 text-primary" />
          <div>
            <h1 className="text-3xl font-bold font-headline">{t.searchHistory}</h1>
            <p className="text-muted-foreground">Review your past service searches.</p>
          </div>
        </div>
        {history.length > 0 && (
           <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="ltr:mr-1 rtl:ml-1 h-4 w-4" /> {t.clearHistory}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure you want to clear your search history?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete all your search history entries.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={clearHistory} className="bg-destructive hover:bg-destructive/90">
                  Clear History
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {history.length === 0 ? (
        <Card className="text-center py-12">
           <CardHeader>
            <History className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <CardTitle>{t.noHistoryYet}</CardTitle>
            <CardDescription>
              Your search history is empty. Start searching for services to see them here.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <Button asChild size="lg">
              <Link href="/services/search">
                <Search className="ltr:mr-2 rtl:ml-2 h-5 w-5" /> {t.search} {t.services}
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              {history.map((item, index) => (
                <li key={index} className="p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex justify-between items-center">
                    <div>
                      <Link href={`/services/search?q=${encodeURIComponent(item.query)}`} className="font-medium text-primary hover:underline">
                        {item.query}
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        Searched on: {new Date(item.date).toLocaleDateString()} {new Date(item.date).toLocaleTimeString()}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                       <Link href={`/services/search?q=${encodeURIComponent(item.query)}`}>
                         <Search className="ltr:mr-1 rtl:ml-1 h-4 w-4" /> Repeat Search
                       </Link>
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
