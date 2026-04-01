import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, ArrowRight, Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useApp, INITIAL_USER } from '../contexts/AppContext';
import Logo from '../components/ui/Logo';
import ThemeSwitcher from '../components/ui/ThemeSwitcher';
import LanguageSwitcher from '../components/ui/LanguageSwitcher';

export const AuthPage: React.FC = () => {
  const { t, language }  = useLanguage();
  const { login }        = useApp();
  const navigate         = useNavigate();
  const [mode,      setMode]      = useState<'login' | 'register'>('login');
  const [showEmail, setShowEmail] = useState(false);
  const [showPwd,   setShowPwd]   = useState(false);
  const [loading,   setLoading]   = useState<string | null>(null);
  const [form,      setForm]      = useState({ name: '', email: '', password: '' });

  const doLogin = (name: string) => {
    login({ ...INITIAL_USER, name });
    navigate('/dashboard');
  };

  const social = async (provider: string) => {
    setLoading(provider);
    await new Promise(r => setTimeout(r, 1100));
    const names: Record<string, string> = {
      google: 'Karim via Google', facebook: 'Karim via Facebook', whatsapp: 'Karim via WhatsApp',
    };
    doLogin(names[provider] || 'Karim H.');
    setLoading(null);
  };

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading('email');
    await new Promise(r => setTimeout(r, 900));
    doLogin(form.name || 'Karim H.');
    setLoading(null);
  };

  const SOCIAL_BUTTONS = [
    {
      id: 'google', label: t.continueWithGoogle,
      icon: <span className="font-black text-lg text-blue-500 w-6 text-center leading-none">G</span>,
      hover: 'hover:bg-muted',
    },
    {
      id: 'facebook', label: t.continueWithFacebook,
      icon: <span className="font-black text-lg text-blue-600 w-6 text-center leading-none">f</span>,
      hover: 'hover:bg-blue-50 dark:hover:bg-blue-950/30',
    },
    {
      id: 'whatsapp', label: t.continueWithWhatsApp,
      icon: <span className="font-black text-lg text-green-500 w-6 text-center leading-none">W</span>,
      hover: 'hover:bg-green-50 dark:hover:bg-green-950/30',
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center relative p-6 overflow-hidden">
      {/* Hero bg overlay */}
      <div className="absolute top-0 left-0 right-0 h-72 hero-bg opacity-[0.07] pointer-events-none rounded-b-3xl" />

      {/* Top bar */}
      <div className="w-full max-w-md flex justify-between items-center mb-8 relative z-10">
        <Link to="/" className="flex items-center gap-2 group">
          <img src="/assets/logo.png" alt="Le Fennec" className="w-7 h-7 object-contain group-hover:scale-105 transition-transform" />
          <Logo size="sm" />
        </Link>
        <div className="flex items-center gap-2">
          <LanguageSwitcher size="sm" />
          <ThemeSwitcher size="sm" />
          <Link to="/" className="p-1.5 bg-muted hover:bg-muted-foreground/20 rounded-full transition-colors">
            <X size={16} className="text-muted-foreground" />
          </Link>
        </div>
      </div>

      {/* Card */}
      <div className="w-full max-w-md flex-1 flex flex-col relative z-10">
        {/* Logo & title */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center mx-auto mb-4 overflow-hidden shadow-card">
            <img src="/assets/logo.png" alt="Le Fennec" className="w-12 h-12 object-contain" />
          </div>
          <h1 className="text-2xl font-black text-foreground mb-1.5">
            {mode === 'login' ? t.loginTitle : t.registerTitle}
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {language === 'ar' ? 'احفظ إعلاناتك وتواصل مع البائعين بنقرة واحدة.'
              : language === 'en' ? 'Save your listings and contact sellers in one click.'
              : 'Sauvegardez vos annonces et contactez les vendeurs en un clic.'}
          </p>
        </div>

        {!showEmail ? (
          <>
            {/* Social buttons */}
            <div className="space-y-3 mb-6">
              {SOCIAL_BUTTONS.map(p => (
                <button key={p.id} onClick={() => social(p.id)} disabled={loading !== null}
                  className={`w-full flex items-center justify-between px-5 py-4 bg-card border border-border rounded-2xl transition-all disabled:opacity-50 ${p.hover}`}>
                  <div className="flex items-center gap-4">
                    <div className="w-6 h-6 flex items-center justify-center shrink-0">{p.icon}</div>
                    <span className="font-semibold text-sm text-foreground">{p.label}</span>
                  </div>
                  {loading === p.id
                    ? <Loader2 size={16} className="animate-spin text-muted-foreground" />
                    : <ArrowRight size={16} className="text-muted-foreground" />
                  }
                </button>
              ))}
            </div>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-background text-muted-foreground text-sm">{t.or}</span>
              </div>
            </div>

            {/* Email option */}
            <button onClick={() => setShowEmail(true)}
              className="w-full py-4 border border-border rounded-2xl font-semibold text-sm text-foreground hover:bg-muted transition-colors">
              {language === 'ar' ? 'متابعة بالبريد / الهاتف' : language === 'en' ? 'Continue with Email / Phone' : 'Continuer avec Email / Téléphone'}
            </button>
          </>
        ) : (
          /* Email form */
          <form onSubmit={handleEmail} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">{t.fullName}</label>
                <input required type="text" value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="Karim Hadj"
                  className="w-full bg-muted border border-border rounded-2xl px-5 py-4 outline-none focus:border-dz-green text-sm transition-all" />
              </div>
            )}
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">{t.emailOrPhone}</label>
              <input required type="email" value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="karim@email.com"
                className="w-full bg-muted border border-border rounded-2xl px-5 py-4 outline-none focus:border-dz-green text-sm transition-all" />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">{t.password}</label>
              <div className="relative">
                <input required type={showPwd ? 'text' : 'password'} value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="••••••••" minLength={6}
                  className="w-full bg-muted border border-border rounded-2xl px-5 py-4 pr-12 outline-none focus:border-dz-green text-sm transition-all" />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            {mode === 'login' && (
              <div className="text-right">
                <button type="button" className="text-xs text-dz-green hover:underline font-medium">{t.forgotPassword}</button>
              </div>
            )}
            <button type="submit" disabled={loading !== null}
              className="w-full py-4 bg-dz-green hover:bg-dz-green2 text-white font-black rounded-2xl shadow-brand-md transition-all disabled:opacity-60 flex items-center justify-center gap-2">
              {loading === 'email'
                ? <Loader2 size={18} className="animate-spin" />
                : mode === 'login' ? t.continueBtn : t.register
              }
            </button>
            <button type="button" onClick={() => setShowEmail(false)}
              className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors">
              ← {t.back}
            </button>
          </form>
        )}

        {/* Toggle mode */}
        <div className="mt-6 text-center">
          <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            className="text-sm text-muted-foreground hover:text-dz-green transition-colors font-medium">
            {mode === 'login'
              ? `${t.noAccount} `
              : `${t.alreadyAccount} `}
            <span className="text-dz-green font-bold">
              {mode === 'login' ? t.register : t.login}
            </span>
          </button>
        </div>

        {/* Security note */}
        <div className="mt-auto pt-8 text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck size={12} className="text-dz-green" />
            {language === 'ar' ? 'تسجيل دخول آمن 100%' : language === 'en' ? '100% secure sign in' : 'Connexion 100% sécurisée'}
          </div>
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            {language === 'ar' ? 'بالمتابعة توافق على' : language === 'en' ? 'By continuing you agree to our' : 'En continuant, vous acceptez nos'}{' '}
            <Link to="/legal/terms" className="underline hover:text-dz-green">CGU</Link>
            {' '}&{' '}
            <Link to="/legal/privacy" className="underline hover:text-dz-green">
              {language === 'ar' ? 'الخصوصية' : language === 'en' ? 'Privacy' : 'Confidentialité'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
