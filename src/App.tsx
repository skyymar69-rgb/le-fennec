import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
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
import ModerationPage        from './pages/ModerationPage';
import logoUrl               from './assets/logo.png';

const AuthPage      = React.lazy(() => import('./pages/AuthPage').then(m => ({ default: m.AuthPage      ?? m.default })));
const DashboardPage = React.lazy(() => import('./pages/DASHBOARDPage').then(m => ({ default: m.DashboardPage ?? m.default })));
const MessagesPage  = React.lazy(() => import('./pages/MESSAGESPage').then(m => ({ default: m.MessagesPage  ?? m.default })));
const FavoritesPage = React.lazy(() => import('./pages/FAVORITESPage').then(m => ({ default: m.FavoritesPage ?? m.default })));
const BoostPage     = React.lazy(() => import('./pages/BoostPage').then(m => ({ default: m.BoostPage ?? m.default })));

const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 60_000, retry: 1 } } });

const Spinner = () => (
  <div className="flex items-center justify-center h-64 bg-background" role="status" aria-label="Chargement">
    <div className="w-8 h-8 border-2 border-dz-green border-t-transparent rounded-full animate-spin" />
  </div>
);

const NotFound = () => (
  <div className="min-h-[60vh] bg-background flex flex-col items-center justify-center gap-5 text-center p-8">
    <img src={logoUrl} alt="Le Fennec DZ Market" className="w-28 h-28 object-contain opacity-50" />
    <div>
      <h1 className="text-5xl font-black text-foreground mb-2">404</h1>
      <h2 className="text-xl font-bold text-foreground mb-2">Page introuvable</h2>
      <p className="text-muted-foreground mb-6 max-w-sm leading-relaxed">
        La page que vous recherchez n'existe pas ou a été déplacée.
      </p>
    </div>
    <div className="flex flex-col sm:flex-row gap-3">
      <Link to="/"       className="px-6 py-3 bg-dz-green text-white font-bold rounded-xl shadow-brand-sm hover:bg-dz-green2 transition-colors">Retour à l'accueil</Link>
      <Link to="/search" className="px-6 py-3 border border-border text-foreground font-bold rounded-xl hover:bg-muted transition-colors">Voir les annonces</Link>
    </div>
  </div>
);

// Composant qui masque Header/Footer sur certaines pages
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen flex flex-col bg-background text-foreground">
    <Header />
    <main id="main-content" className="flex-1">
      {children}
    </main>
    <Footer />
    <BottomNav />
  </div>
);

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <LanguageProvider>
        <AppProvider>
          <BrowserRouter>
            <AppLayout>
              <React.Suspense fallback={<Spinner />}>
                <Routes>
                  {/* Pages publiques */}
                  <Route path="/"                   element={<HomePage />}          />
                  <Route path="/search"             element={<SearchPage />}        />
                  <Route path="/listing/:id"        element={<ListingDetailPage />} />
                  <Route path="/post"               element={<PostAdPage />}        />
                  <Route path="/auth"               element={<AuthPage />}          />

                  {/* Pages utilisateur authentifié */}
                  <Route path="/dashboard"          element={<DashboardPage />}     />
                  <Route path="/messages"           element={<MessagesPage />}      />
                  <Route path="/favorites"          element={<FavoritesPage />}     />

                  {/* Légal */}
                  <Route path="/legal/:slug"        element={<LegalPage />}         />
                  <Route path="/legal"              element={<LegalPage />}         />

                  {/* 🛡️ Backoffice modération (protéger par rôle admin en prod) */}
                  <Route path="/moderation"         element={<ModerationPage />}    />
                  <Route path="/boost"              element={<BoostPage />}         />

                  {/* 404 */}
                  <Route path="*"                   element={<NotFound />}          />
                </Routes>
              </React.Suspense>
            </AppLayout>
          </BrowserRouter>
        </AppProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
