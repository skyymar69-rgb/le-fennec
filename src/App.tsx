import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { ThemeProvider }    from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { AppProvider }      from './contexts/AppContext';

import Header                from './components/layout/Header';
import { Footer, BottomNav } from './components/layout/FooterNav';
import HomePage              from './pages/HomePage';
import SearchPage            from './pages/SearchPage';
import ListingDetailPage     from './pages/ListingDetailPage';
import PostAdPage            from './pages/PostAdPage';
import LegalPage             from './pages/LegalPage';

const AuthPage      = React.lazy(() => import('./pages/AuthPage').then(m => ({ default: m.AuthPage      ?? m.default })));
const DashboardPage = React.lazy(() => import('./pages/DASHBOARDPage').then(m => ({ default: m.DashboardPage ?? m.default })));
const MessagesPage  = React.lazy(() => import('./pages/MESSAGESPage').then(m => ({ default: m.MessagesPage  ?? m.default })));
const FavoritesPage = React.lazy(() => import('./pages/FAVORITESPage').then(m => ({ default: m.FavoritesPage ?? m.default })));

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 60_000, retry: 1 } },
});

const Spinner = () => (
  <div className="flex items-center justify-center h-64 bg-background">
    <div className="w-8 h-8 border-2 border-dz-green border-t-transparent rounded-full animate-spin" />
  </div>
);

const NotFound = () => (
  <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 text-center p-8">
    <div className="text-7xl mb-2">🦊</div>
    <h1 className="text-3xl font-black text-foreground">404</h1>
    <p className="text-muted-foreground mb-4 max-w-xs">Cette page n'existe pas… encore !</p>
    <a href="/" className="px-6 py-3 bg-dz-green text-white font-bold rounded-2xl shadow-brand-sm">
      Retour à l'accueil
    </a>
  </div>
);

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <LanguageProvider>
        <AppProvider>
          <BrowserRouter>
            <div className="min-h-screen flex flex-col bg-background text-foreground">
              <Header />
              <main className="flex-1">
                <React.Suspense fallback={<Spinner />}>
                  <Routes>
                    <Route path="/"             element={<HomePage />}         />
                    <Route path="/search"       element={<SearchPage />}       />
                    <Route path="/listing/:id"  element={<ListingDetailPage />}/>
                    <Route path="/post"         element={<PostAdPage />}       />
                    <Route path="/auth"         element={<AuthPage />}         />
                    <Route path="/dashboard"    element={<DashboardPage />}    />
                    <Route path="/messages"     element={<MessagesPage />}     />
                    <Route path="/favorites"    element={<FavoritesPage />}    />
                    <Route path="/legal/:slug"  element={<LegalPage />}        />
                    <Route path="*"             element={<NotFound />}         />
                  </Routes>
                </React.Suspense>
              </main>
              <Footer />
              <BottomNav />
            </div>
          </BrowserRouter>
        </AppProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
