import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { X, Eye, EyeOff, Loader2, ShieldCheck, ArrowRight, Check, AlertCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useApp } from '../contexts/AppContext';
import Logo from '../components/ui/Logo';
import ThemeSwitcher from '../components/ui/ThemeSwitcher';
import LanguageSwitcher from '../components/ui/LanguageSwitcher';
import logoUrl from '../assets/logo.png';
import type { UserProfile } from '../types';
import { supabase, isSupabaseEnabled } from '../lib/supabase';

// ─── Password strength checker ─────────────────────────────────────────────
function passwordStrength(p: string): { score: 0|1|2|3; label: string; color: string } {
  let s = 0;
  if (p.length >= 8) s++;
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++;
  if (/[0-9]/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  const score = Math.min(3, s) as 0|1|2|3;
  const labels = ['Trop court', 'Faible', 'Moyen', 'Fort'];
  const colors = ['bg-dz-red', 'bg-orange-500', 'bg-amber-500', 'bg-dz-green'];
  return { score, label: labels[score], color: colors[score] };
}

// ─── Simulated OAuth providers ────────────────────────────────────────────
// In production: replace with real OAuth (Google Identity, Facebook SDK, etc.)
const OAUTH_PROVIDERS = [
  {
    id: 'google',
    label: 'Continuer avec Google',
    labelAr: 'المتابعة بـ Google',
    labelEn: 'Continue with Google',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
    ),
    bg:   'bg-white dark:bg-zinc-800 border border-border hover:bg-gray-50 dark:hover:bg-zinc-700',
    text: 'text-gray-700 dark:text-gray-200',
  },
  {
    id: 'facebook',
    label: 'Continuer avec Facebook',
    labelAr: 'المتابعة بـ Facebook',
    labelEn: 'Continue with Facebook',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5">
        <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
    bg:   'bg-[#1877F2] hover:bg-[#166FE5] border border-[#1877F2]',
    text: 'text-white',
  },
];

export const AuthPage: React.FC = () => {
  const { t, language }  = useLanguage();
  const { login }        = useApp();
  const navigate         = useNavigate();
  const location         = useLocation();
  const returnTo         = (location.state as any)?.from || '/dashboard';

  const [mode,      setMode]      = useState<'login' | 'register'>('login');
  const [step,      setStep]      = useState<'main' | 'email'>('main');
  const [showPwd,   setShowPwd]   = useState(false);
  const [loading,   setLoading]   = useState<string | null>(null);
  const [error,     setError]     = useState<string | null>(null);
  const [success,   setSuccess]   = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', confirm: '',
  });

  const pwStrength = passwordStrength(form.password);
  const setF = (k: keyof typeof form, v: string) => setForm(p => ({ ...p, [k]: v }));

  // ── OAuth (simulated — replace with real SDK in production) ────────────
  const handleOAuth = async (providerId: string) => {
    setError(null);
    setLoading(providerId);

    if (isSupabaseEnabled && supabase) {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: providerId as 'google' | 'facebook',
        options: {
          redirectTo: `${window.location.origin}${returnTo}`,
        },
      });
      if (error) { setError(error.message); setLoading(null); }
      return; // Supabase handles redirect
    }

    // Fallback demo
    await new Promise(r => setTimeout(r, 1200));
    const names: Record<string, string> = { google: 'Utilisateur Google', facebook: 'Utilisateur Facebook' };
    const providerName = names[providerId] || 'Nouvel utilisateur';
    const mockEmail = `user_${Date.now().toString(36)}@${providerId}.oauth`;
    const profile: UserProfile = {
      id: `oauth_${Date.now()}`, name: providerName,
      email: mockEmail, phone: '',
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${mockEmail}&backgroundColor=006233&textColor=ffffff`,
      memberSince: new Date().getFullYear().toString(),
      isEmailVerified: true, isPhoneVerified: false,
      isIdentityVerified: false, trustScore: 20, badges: [],
    };
    login(profile);
    setLoading(null);
    navigate(returnTo, { replace: true });
  };


  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!form.email.includes('@') || !form.email.includes('.')) {
      setError('Adresse email invalide.'); return;
    }
    if (mode === 'register') {
      if (!form.name.trim()) { setError('Veuillez indiquer votre nom.'); return; }
      if (form.password.length < 8) { setError('Le mot de passe doit contenir au moins 8 caractères.'); return; }
      if (form.password !== form.confirm) { setError('Les mots de passe ne correspondent pas.'); return; }
    } else {
      if (!form.password) { setError('Veuillez saisir votre mot de passe.'); return; }
    }

    setLoading('email');

    // Real Supabase auth
    if (isSupabaseEnabled && supabase) {
      if (mode === 'register') {
        const { data, error } = await supabase.auth.signUp({
          email: form.email.trim().toLowerCase(),
          password: form.password,
          options: { data: { full_name: form.name.trim() } },
        });
        if (error) { setError(error.message); setLoading(null); return; }
        setSuccess('Compte créé ! Vérifiez votre email pour confirmer votre adresse.');
        await new Promise(r => setTimeout(r, 2000));
        if (data.user) navigate(returnTo, { replace: true });
        setLoading(null);
        return;
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: form.email.trim().toLowerCase(),
          password: form.password,
        });
        if (error) { setError('Email ou mot de passe incorrect.'); setLoading(null); return; }
        if (data.user) navigate(returnTo, { replace: true });
        setLoading(null);
        return;
      }
    }

    // Fallback simulation
    await new Promise(r => setTimeout(r, 900));

    const profile: UserProfile = {
      id:            `email_${Date.now()}`,
      name:          form.name.trim(),
      email:         form.email.trim().toLowerCase(),
      phone:         form.phone,
      avatar:        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(form.name || form.email)}&backgroundColor=006233&textColor=ffffff`,
      memberSince:   new Date().getFullYear().toString(),
      isEmailVerified:    false,  // Would send confirmation email in production
      isPhoneVerified:    false,
      isIdentityVerified: false,
      trustScore:         10,
      badges:             [],
    };

    if (mode === 'register') {
      setSuccess('Compte créé ! Vérifiez votre email pour confirmer votre adresse.');
      await new Promise(r => setTimeout(r, 1500));
    }

    login(profile);
    setLoading(null);
    navigate(returnTo, { replace: true });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center relative overflow-hidden p-4">
      {/* Hero gradient top */}
      <div className="absolute top-0 inset-x-0 h-72 hero-bg opacity-[0.08] pointer-events-none" aria-hidden="true"/>

      {/* Top bar */}
      <div className="w-full max-w-md flex justify-between items-center pt-4 pb-6 relative z-10">
        <Link to="/" className="flex items-center gap-2 group">
          <img src={logoUrl} alt="Le Fennec DZ Market" className="h-9 w-auto object-contain group-hover:scale-105 transition-transform"/>
        </Link>
        <div className="flex items-center gap-2">
          <LanguageSwitcher size="sm"/>
          <ThemeSwitcher size="sm"/>
          <Link to="/" className="p-1.5 bg-muted hover:bg-muted-foreground/20 rounded-full transition-colors" aria-label="Fermer">
            <X size={16} className="text-muted-foreground"/>
          </Link>
        </div>
      </div>

      {/* Card */}
      <div className="w-full max-w-md relative z-10 space-y-5">

        {/* Title */}
        <div className="text-center">
          <h1 className="text-2xl font-black text-foreground">
            {mode === 'login'
              ? (language === 'ar' ? 'تسجيل الدخول' : 'Se connecter')
              : (language === 'ar' ? 'إنشاء حساب' : 'Créer un compte')}
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            {language === 'ar'
              ? 'للمشاركة في الإعلانات، التواصل مع البائعين وإدارة حسابك'
              : 'Pour déposer des annonces, contacter les vendeurs et gérer votre espace'}
          </p>
        </div>

        {/* Error / Success alerts */}
        {error && (
          <div className="flex items-center gap-2.5 bg-dz-red/10 border border-dz-red/20 rounded-xl px-4 py-3 text-sm text-dz-red">
            <AlertCircle size={15} className="shrink-0"/> {error}
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2.5 bg-dz-green/10 border border-dz-green/20 rounded-xl px-4 py-3 text-sm text-dz-green">
            <Check size={15} className="shrink-0"/> {success}
          </div>
        )}

        {step === 'main' ? (
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-card">
            {/* OAuth buttons */}
            {OAUTH_PROVIDERS.map(provider => (
              <button
                key={provider.id}
                onClick={() => handleOAuth(provider.id)}
                disabled={loading !== null}
                className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 ${provider.bg} ${provider.text}`}
              >
                <div className="w-5 h-5 shrink-0 flex items-center justify-center">{provider.icon}</div>
                <span className="flex-1 text-left">
                  {language === 'ar' ? provider.labelAr : language === 'en' ? provider.labelEn : provider.label}
                </span>
                {loading === provider.id
                  ? <Loader2 size={16} className="animate-spin shrink-0"/>
                  : <ArrowRight size={16} className="shrink-0 opacity-50"/>
                }
              </button>
            ))}

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border"/></div>
              <div className="relative flex justify-center">
                <span className="px-3 bg-card text-muted-foreground text-xs">
                  {language === 'ar' ? 'أو بالبريد الإلكتروني' : 'ou avec votre email'}
                </span>
              </div>
            </div>

            {/* Email option */}
            <button
              onClick={() => { setStep('email'); setError(null); }}
              className="w-full py-3.5 border border-border rounded-xl font-semibold text-sm text-foreground hover:bg-muted transition-colors flex items-center justify-between px-5"
            >
              <span>
                {language === 'ar'
                  ? (mode === 'login' ? 'تسجيل الدخول بالبريد' : 'إنشاء حساب بالبريد')
                  : (mode === 'login' ? 'Se connecter par email' : 'Créer un compte par email')}
              </span>
              <ArrowRight size={16} className="opacity-50"/>
            </button>

            {/* Toggle mode */}
            <p className="text-center text-sm text-muted-foreground pt-1">
              {mode === 'login'
                ? (language === 'ar' ? 'ليس لديك حساب؟' : 'Pas encore de compte ?')
                : (language === 'ar' ? 'لديك حساب؟' : 'Déjà un compte ?')}
              {' '}
              <button
                onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null); }}
                className="font-bold text-dz-green hover:underline"
              >
                {mode === 'login'
                  ? (language === 'ar' ? 'إنشاء حساب' : 'Créer un compte')
                  : (language === 'ar' ? 'تسجيل الدخول' : 'Se connecter')}
              </button>
            </p>
          </div>
        ) : (
          /* Email form */
          <form onSubmit={handleEmailSubmit} className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-card" noValidate>
            <button type="button" onClick={() => { setStep('main'); setError(null); }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
              ← {language === 'ar' ? 'العودة' : 'Retour'}
            </button>

            {mode === 'register' && (
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">
                  {language === 'ar' ? 'الاسم الكامل *' : 'Nom complet *'}
                </label>
                <input
                  type="text" value={form.name} onChange={e => setF('name', e.target.value)}
                  placeholder={language === 'ar' ? 'محمد بن أحمد' : 'Mohammed Ben Ahmed'}
                  autoComplete="name" required
                  className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-dz-green transition-all"
                />
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">
                {language === 'ar' ? 'البريد الإلكتروني *' : 'Adresse email *'}
              </label>
              <input
                type="email" value={form.email} onChange={e => setF('email', e.target.value)}
                placeholder="votre@email.com" autoComplete="email" required
                className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-dz-green transition-all"
              />
            </div>

            {mode === 'register' && (
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">
                  {language === 'ar' ? 'رقم الهاتف (اختياري)' : 'Téléphone (optionnel)'}
                </label>
                <input
                  type="tel" value={form.phone} onChange={e => setF('phone', e.target.value)}
                  placeholder="0550 12 34 56" autoComplete="tel"
                  className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-dz-green transition-all"
                />
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">
                {language === 'ar' ? 'كلمة المرور *' : 'Mot de passe *'}
              </label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'} value={form.password}
                  onChange={e => setF('password', e.target.value)}
                  placeholder="••••••••" autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  required minLength={8}
                  className="w-full bg-muted border border-border rounded-xl px-4 py-3 pr-12 text-sm outline-none focus:border-dz-green transition-all"
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPwd ? <EyeOff size={17}/> : <Eye size={17}/>}
                </button>
              </div>
              {/* Password strength (register only) */}
              {mode === 'register' && form.password.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[0,1,2,3].map(i => (
                      <div key={i} className={`flex-1 h-1 rounded-full transition-all ${i <= pwStrength.score ? pwStrength.color : 'bg-muted'}`}/>
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground">{pwStrength.label}</p>
                </div>
              )}
            </div>

            {mode === 'register' && (
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">
                  {language === 'ar' ? 'تأكيد كلمة المرور *' : 'Confirmer le mot de passe *'}
                </label>
                <input
                  type={showPwd ? 'text' : 'password'} value={form.confirm}
                  onChange={e => setF('confirm', e.target.value)}
                  placeholder="••••••••" autoComplete="new-password" required
                  className={`w-full bg-muted border rounded-xl px-4 py-3 text-sm outline-none transition-all ${
                    form.confirm && form.confirm !== form.password
                      ? 'border-dz-red focus:border-dz-red'
                      : 'border-border focus:border-dz-green'
                  }`}
                />
                {form.confirm && form.confirm !== form.password && (
                  <p className="text-xs text-dz-red mt-1">Les mots de passe ne correspondent pas</p>
                )}
              </div>
            )}

            {mode === 'login' && (
              <div className="text-right">
                <button type="button" className="text-xs text-dz-green hover:underline font-medium">
                  {language === 'ar' ? 'نسيت كلمة المرور؟' : 'Mot de passe oublié ?'}
                </button>
              </div>
            )}

            <button type="submit" disabled={loading !== null}
              className="w-full py-3.5 bg-dz-green hover:bg-dz-green2 text-white font-black rounded-xl shadow-brand-md transition-all disabled:opacity-60 flex items-center justify-center gap-2">
              {loading === 'email'
                ? <><Loader2 size={17} className="animate-spin"/> {language === 'ar' ? 'جارٍ التحميل...' : 'Chargement...'}</>
                : mode === 'login'
                  ? (language === 'ar' ? 'تسجيل الدخول' : 'Se connecter')
                  : (language === 'ar' ? 'Créer mon compte' : 'Créer mon compte')
              }
            </button>

            {mode === 'register' && (
              <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
                En créant un compte, vous acceptez nos{' '}
                <Link to="/legal/cgu" className="text-dz-green hover:underline">CGU</Link>
                {' '}et notre{' '}
                <Link to="/legal/confidentialite" className="text-dz-green hover:underline">politique de confidentialité</Link>.
              </p>
            )}
          </form>
        )}

        {/* Security badge */}
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pb-6">
          <ShieldCheck size={13} className="text-dz-green"/>
          {language === 'ar' ? 'اتصال مشفر 100% — بياناتك في أمان' : 'Connexion chiffrée — Vos données sont sécurisées'}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
