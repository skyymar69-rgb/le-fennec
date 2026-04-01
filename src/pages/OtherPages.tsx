// ══════════════════════════════════════
// AUTH PAGE
// ══════════════════════════════════════
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, ArrowRight, Eye, EyeOff, Loader2, ShieldCheck, Facebook, Instagram } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useApp, INITIAL_USER } from '../contexts/AppContext';
import Logo from '../components/ui/Logo';
import ThemeSwitcher from '../components/ui/ThemeSwitcher';
import LanguageSwitcher from '../components/ui/LanguageSwitcher';

export const AuthPage: React.FC = () => {
  const { t, language }  = useLanguage();
  const { login }        = useApp();
  const navigate         = useNavigate();
  const [mode,     setMode]      = useState<'login' | 'register'>('login');
  const [showEmail,setShowEmail] = useState(false);
  const [showPwd,  setShowPwd]   = useState(false);
  const [loading,  setLoading]   = useState<string | null>(null);
  const [form,     setForm]      = useState({ name: '', email: '', password: '' });

  const doLogin = (name: string) => {
    login({ ...INITIAL_USER, name });
    navigate('/dashboard');
  };

  const social = async (provider: string) => {
    setLoading(provider);
    await new Promise(r => setTimeout(r, 1100));
    doLogin(provider === 'google' ? 'Karim via Google' : provider === 'facebook' ? 'Karim via Facebook' : 'Karim via WhatsApp');
    setLoading(null);
  };

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading('email');
    await new Promise(r => setTimeout(r, 900));
    doLogin(form.name || 'Karim H.');
    setLoading(null);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center relative p-6 overflow-hidden">
      {/* Background */}
      <div className="absolute top-0 left-0 right-0 h-72 hero-bg opacity-10 pointer-events-none" />

      {/* Header controls */}
      <div className="w-full max-w-md flex justify-between items-center mb-8 relative z-10">
        <Link to="/" className="flex items-center gap-2">
          <img src="/assets/logo.png" alt="Le Fennec" className="w-7 h-7 object-contain" />
          <Logo size="sm" />
        </Link>
        <div className="flex items-center gap-2">
          <LanguageSwitcher size="sm" />
          <ThemeSwitcher size="sm" />
          <Link to="/" className="p-1.5 bg-muted hover:bg-muted/80 rounded-full transition-colors">
            <X size={16} className="text-muted-foreground" />
          </Link>
        </div>
      </div>

      <div className="w-full max-w-md flex-1 flex flex-col relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-dz-green/10 border border-dz-green/20 flex items-center justify-center mx-auto mb-4 overflow-hidden">
            <img src="/assets/logo.png" alt="Le Fennec" className="w-12 h-12 object-contain" />
          </div>
          <h1 className="text-2xl font-black text-foreground mb-1.5">
            {mode === 'login' ? t.loginTitle : t.registerTitle}
          </h1>
          <p className="text-sm text-muted-foreground">
            {language === 'ar'
              ? 'احفظ إعلاناتك وتواصل مع البائعين بنقرة واحدة.'
              : language === 'en'
              ? 'Save your listings and contact sellers in one click.'
              : 'Sauvegardez vos annonces et contactez les vendeurs en un clic.'}
          </p>
        </div>

        {!showEmail ? (
          <>
            {/* Social buttons */}
            <div className="space-y-3 mb-6">
              {[
                { id: 'google',    label: t.continueWithGoogle,    icon: <span className="text-blue-500 font-black text-lg w-6 text-center">G</span>, hover: 'hover:bg-muted' },
                { id: 'facebook',  label: t.continueWithFacebook,  icon: <Facebook size={20} className="text-blue-600" fill="currentColor" />, hover: 'hover:bg-blue-50 dark:hover:bg-blue-950/30' },
                { id: 'whatsapp',  label: t.continueWithWhatsApp,  icon: <span className="text-green-500 font-bold w-6 text-center text-lg">W</span>, hover: 'hover:bg-green-50 dark:hover:bg-green-950/30' },
              ].map(p => (
                <button key={p.id} onClick={() => social(p.id)} disabled={loading !== null}
                  className={`w-full flex items-center justify-between px-5 py-4 bg-card border border-border rounded-2xl transition-all disabled:opacity-50 ${p.hover}`}>
                  <div className="flex items-center gap-4">
                    <div className="w-6 h-6 flex items-center justify-center">{p.icon}</div>
                    <span className="font-semibold text-sm text-foreground">{p.label}</span>
                  </div>
                  {loading === p.id
                    ? <Loader2 size={16} className="animate-spin text-muted-foreground" />
                    : <ArrowRight size={16} className="text-muted-foreground" />
                  }
                </button>
              ))}
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
              <div className="relative flex justify-center"><span className="px-4 bg-background text-muted-foreground text-sm">{t.or}</span></div>
            </div>

            <button onClick={() => setShowEmail(true)}
              className="w-full py-4 border border-border rounded-2xl font-semibold text-sm text-foreground hover:bg-muted transition-colors">
              {language === 'ar' ? 'متابعة بالبريد / الهاتف' : language === 'en' ? 'Continue with Email / Phone' : 'Continuer avec Email / Téléphone'}
            </button>
          </>
        ) : (
          <form onSubmit={handleEmail} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase block mb-1.5">{t.fullName}</label>
                <input required type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="Karim Hadj"
                  className="w-full bg-muted border border-border rounded-2xl px-5 py-4 outline-none focus:border-dz-green text-sm transition-all" />
              </div>
            )}
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase block mb-1.5">{t.emailOrPhone}</label>
              <input required type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="karim@email.com"
                className="w-full bg-muted border border-border rounded-2xl px-5 py-4 outline-none focus:border-dz-green text-sm transition-all" />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase block mb-1.5">{t.password}</label>
              <div className="relative">
                <input required type={showPwd ? 'text' : 'password'} value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="••••••••" minLength={6}
                  className="w-full bg-muted border border-border rounded-2xl px-5 py-4 pr-12 outline-none focus:border-dz-green text-sm transition-all" />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading !== null}
              className="w-full py-4 bg-dz-green hover:bg-dz-green2 text-white font-black rounded-2xl shadow-brand-md transition-all disabled:opacity-60">
              {loading === 'email' ? <Loader2 size={18} className="animate-spin mx-auto" /> : mode === 'login' ? t.continueBtn : t.register}
            </button>
            <button type="button" onClick={() => setShowEmail(false)}
              className="w-full text-sm text-muted-foreground hover:text-foreground">← {t.back}</button>
          </form>
        )}

        <div className="mt-6 text-center">
          <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            className="text-sm text-muted-foreground hover:text-dz-green transition-colors font-medium">
            {mode === 'login' ? `${t.noAccount} ${t.register}` : `${t.alreadyAccount} ${t.login}`}
          </button>
        </div>

        <div className="mt-auto pt-8 text-center">
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mb-2">
            <ShieldCheck size={12} className="text-dz-green" />
            {language === 'ar' ? 'تسجيل دخول آمن 100%' : language === 'en' ? '100% secure login' : 'Connexion 100% sécurisée'}
          </div>
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            {language === 'ar' ? 'بالمتابعة توافق على' : language === 'en' ? 'By continuing you agree to our' : 'En continuant, vous acceptez nos'}{' '}
            <Link to="/legal/terms" className="underline hover:text-dz-green">CGU</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════
// DASHBOARD PAGE
// ══════════════════════════════════════
import { LayoutDashboard, MessageSquare, Eye, Settings, Edit2, Trash2, PauseCircle, PlayCircle, LogOut, Upload, AlertTriangle, Check, CheckCircle2 as CC2, XCircle, Rocket } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useApp } from '../contexts/AppContext';
import { useLanguage } from '../contexts/LanguageContext';

const CHART_DATA = [
  { name: 'L', v: 40 }, { name: 'M', v: 30 }, { name: 'M', v: 20 },
  { name: 'J', v: 27 }, { name: 'V', v: 18 }, { name: 'S', v: 23 }, { name: 'D', v: 34 },
];

export const DashboardPage: React.FC = () => {
  const { t, language }          = useLanguage();
  const nav                      = useNavigate();
  const { user, logout, listings, updateListingStatus, removeListing, favorites, threads } = useApp();
  const [tab,       setTab]       = useState<'overview' | 'ads' | 'messages' | 'settings'>('overview');
  const [delModal,  setDelModal]  = useState<string | null>(null);

  const myAds    = listings.filter(l => l.userId === user?.id && l.status !== 'deleted');
  const trustScore = (user?.isEmailVerified ? 20 : 0) + (user?.isPhoneVerified ? 30 : 0) + (user?.isIdentityVerified ? 50 : 0);
  const unread   = threads.reduce((s, t) => s + t.unread, 0);

  if (!user) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 text-center p-6">
      <img src="/assets/logo.png" alt="" className="w-16 h-16 object-contain" />
      <h2 className="text-xl font-black text-foreground">
        {language === 'ar' ? 'سجّل دخولك للوصول إلى مساحتك' : language === 'en' ? 'Sign in to access your space' : 'Connectez-vous pour accéder à votre espace'}
      </h2>
      <Link to="/auth" className="px-8 py-3 bg-dz-green text-white font-bold rounded-2xl shadow-brand-md">{t.login}</Link>
    </div>
  );

  const TABS = [
    { id: 'overview',  Icon: LayoutDashboard, label: t.myStats    },
    { id: 'ads',       Icon: Eye,             label: t.myAds      },
    { id: 'messages',  Icon: MessageSquare,   label: t.myMessages, badge: unread },
    { id: 'settings',  Icon: Settings,        label: t.settings   },
  ] as const;

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* User header */}
        <div className="bg-card border border-border rounded-2xl p-5 mb-5 flex items-center gap-4">
          <img src={user.avatar} alt={user.name} className="w-16 h-16 rounded-2xl object-cover shrink-0" />
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-black text-foreground">{user.name}</h2>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {[
                { label: t.emailVerified,    ok: user.isEmailVerified    },
                { label: t.phoneVerified,    ok: user.isPhoneVerified    },
                { label: t.identityVerified, ok: user.isIdentityVerified },
              ].map(v => (
                <span key={v.label}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1
                    ${v.ok ? 'bg-dz-green/10 border-dz-green/20 text-dz-green' : 'bg-muted border-border text-muted-foreground'}`}>
                  {v.ok ? <Check size={9} /> : <XCircle size={9} />} {v.label}
                </span>
              ))}
            </div>
          </div>
          <button onClick={() => { logout(); nav('/'); }}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-dz-red transition-colors shrink-0">
            <LogOut size={16} /> <span className="hidden sm:inline">{t.logout}</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-card border border-border rounded-2xl p-1.5 mb-5 overflow-x-auto no-scrollbar">
          {TABS.map(({ id, Icon, label, badge }) => (
            <button key={id} onClick={() => setTab(id as any)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap flex-1 justify-center relative
                ${tab === id ? 'bg-foreground text-background shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}>
              <Icon size={15} /> <span className="hidden sm:inline">{label}</span>
              {badge && badge > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-dz-red text-white text-[9px] font-bold rounded-full flex items-center justify-center">{badge}</span>
              )}
            </button>
          ))}
        </div>

        {/* ── Overview ── */}
        {tab === 'overview' && (
          <div className="space-y-4">
            {/* Trust score */}
            <div className="bg-foreground text-background rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5"><ShieldCheck size={120} /></div>
              <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
                <div className="relative w-24 h-24 shrink-0">
                  <svg className="w-full h-full -rotate-90">
                    <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="7" fill="none" opacity="0.1" />
                    <circle cx="48" cy="48" r="40"
                      stroke={trustScore < 40 ? '#D21034' : trustScore < 80 ? '#F59E0B' : '#00874A'}
                      strokeWidth="7" fill="none"
                      strokeDasharray="251" strokeDashoffset={251 - (251 * trustScore / 100)}
                      strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease' }} />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-black">{trustScore}%</span>
                    <span className="text-[8px] uppercase opacity-40 font-bold tracking-wider">Score</span>
                  </div>
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-lg font-black mb-1.5">{t.completeProfile}</h3>
                  <p className="text-sm opacity-60 mb-3">
                    {language === 'ar' ? 'ملف موثق يزيد مبيعاتك 3 مرات' : language === 'en' ? 'A verified profile increases your sales 3x' : 'Un profil vérifié multiplie vos ventes par 3'}
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                    {[
                      { l: 'Email',    ok: user.isEmailVerified,    p: 20 },
                      { l: language === 'ar' ? 'هاتف' : 'Téléphone', ok: user.isPhoneVerified,   p: 30 },
                      { l: language === 'ar' ? 'هوية' : 'Identité',  ok: user.isIdentityVerified, p: 50 },
                    ].map(v => (
                      <span key={v.l}
                        className={`text-xs font-bold px-3 py-1 rounded-full border
                          ${v.ok ? 'border-dz-green/50 text-dz-green bg-dz-green/10'
                                 : 'border-white/20 text-white/50 bg-white/5'}`}>
                        {v.ok ? '✓' : '·'} {v.l} {!v.ok && `+${v.p}%`}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* KPI cards */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: t.activeAds,   value: myAds.filter(l => l.status === 'active').length, icon: '📋', bg: 'bg-dz-green/10',  tc: 'text-dz-green' },
                { label: t.totalViews,  value: myAds.reduce((s, l) => s + (l.views || 0), 0).toLocaleString(), icon: '👁', bg: 'bg-blue-500/10', tc: 'text-blue-600 dark:text-blue-400' },
                { label: t.unreadMsgs,  value: unread,                                          icon: '💬', bg: 'bg-amber-500/10', tc: 'text-amber-600 dark:text-amber-400' },
              ].map(k => (
                <div key={k.label} className={`${k.bg} rounded-2xl p-4 border border-border/50`}>
                  <div className="text-2xl mb-2">{k.icon}</div>
                  <div className={`text-2xl font-black ${k.tc}`}>{k.value}</div>
                  <div className="text-xs text-muted-foreground font-medium mt-0.5">{k.label}</div>
                </div>
              ))}
            </div>

            {/* Chart */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <h4 className="font-bold text-foreground mb-4 text-sm">
                {language === 'ar' ? 'المشاهدات هذا الأسبوع 📈' : language === 'en' ? 'Views this week 📈' : 'Vues cette semaine 📈'}
              </h4>
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={CHART_DATA}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: 'none', fontSize: 12 }} />
                  <Bar dataKey="v" fill="var(--dz-green)" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ── My Ads ── */}
        {tab === 'ads' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center mb-1">
              <h3 className="font-black text-foreground">{myAds.length} {t.myAds}</h3>
              <Link to="/post" className="flex items-center gap-1.5 text-sm font-bold text-white bg-dz-green px-4 py-2 rounded-xl shadow-brand-sm">
                + {t.post}
              </Link>
            </div>
            {myAds.length === 0 ? (
              <div className="text-center py-14 bg-card border border-dashed border-border rounded-2xl">
                <Upload size={28} className="text-muted-foreground mx-auto mb-3" />
                <h3 className="font-black text-foreground mb-2">
                  {language === 'ar' ? 'لا توجد إعلانات' : language === 'en' ? 'No ads yet' : 'Aucune annonce'}
                </h3>
                <Link to="/post" className="inline-block px-6 py-2.5 bg-dz-green text-white font-bold rounded-xl shadow-brand-sm text-sm">
                  {t.postAdBtn}
                </Link>
              </div>
            ) : myAds.map(ad => (
              <div key={ad.id}
                className={`bg-card border border-border rounded-2xl p-4 flex gap-4 ${ad.status === 'paused' ? 'opacity-70' : ''}`}>
                <img src={ad.imageUrl} alt={ad.title} className="w-24 h-20 rounded-xl object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between gap-2 mb-1">
                    <h4 className="font-bold text-sm text-foreground truncate">{ad.title}</h4>
                    <span className="font-bold text-sm text-dz-green shrink-0">{ad.price.toLocaleString()} DA</span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mb-2">
                    <span className={`px-2 py-0.5 rounded-full font-bold ${ad.status === 'active' ? 'bg-dz-green/10 text-dz-green' : ad.status === 'paused' ? 'bg-amber-500/10 text-amber-600' : 'bg-muted text-muted-foreground'}`}>
                      {ad.status === 'active' ? '● Active' : ad.status === 'paused' ? '⏸ Pause' : ad.status}
                    </span>
                    <span className="flex items-center gap-1"><Eye size={11} /> {(ad.views || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <button className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 bg-muted rounded-lg hover:bg-muted/80">
                      <Edit2 size={11} /> {t.edit}
                    </button>
                    {ad.status === 'active'
                      ? <button onClick={() => updateListingStatus(ad.id, 'paused')} className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-lg">
                          <PauseCircle size={11} /> {t.pause}
                        </button>
                      : <button onClick={() => updateListingStatus(ad.id, 'active')} className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 bg-dz-green/10 text-dz-green rounded-lg">
                          <PlayCircle size={11} /> {t.reactivate}
                        </button>
                    }
                    <button className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg ml-auto">
                      <Rocket size={11} /> {t.boost}
                    </button>
                    <button onClick={() => setDelModal(ad.id)} className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 bg-dz-red/10 text-dz-red rounded-lg">
                      <Trash2 size={11} /> {t.delete}
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {delModal && (
              <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-card border border-border rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-fade-up">
                  <div className="w-12 h-12 bg-dz-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle size={20} className="text-dz-red" />
                  </div>
                  <h3 className="text-lg font-black text-center mb-2">{t.delete} ?</h3>
                  <p className="text-sm text-muted-foreground text-center mb-5">{t.deleteConfirm}</p>
                  <div className="flex gap-3">
                    <button onClick={() => setDelModal(null)} className="flex-1 py-3 border border-border rounded-xl font-bold">{t.cancel}</button>
                    <button onClick={() => { removeListing(delModal!); setDelModal(null); }}
                      className="flex-1 py-3 bg-dz-red text-white rounded-xl font-bold">{t.confirm}</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Messages quick view ── */}
        {tab === 'messages' && (
          <div className="space-y-3">
            {threads.map(th => (
              <Link key={th.id} to="/messages"
                className="flex items-center gap-3 bg-card border border-border rounded-2xl p-4 hover:shadow-card transition-all">
                <img src={th.userAvatar} className="w-12 h-12 rounded-2xl object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between mb-0.5">
                    <span className="font-bold text-sm text-foreground">{th.userName}</span>
                    {th.unread > 0 && <span className="bg-dz-green text-white text-[9px] font-bold px-2 py-0.5 rounded-full">{th.unread}</span>}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{th.messages[th.messages.length - 1]?.text}</p>
                </div>
              </Link>
            ))}
            <Link to="/messages" className="block text-center py-3 text-sm font-bold text-dz-green hover:underline">
              {t.viewAll} →
            </Link>
          </div>
        )}

        {/* ── Settings ── */}
        {tab === 'settings' && (
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-2xl p-5">
              <h4 className="font-bold text-foreground mb-4 text-sm flex items-center gap-2"><Settings size={15} /> {t.personalInfo}</h4>
              {[{l: t.fullName ?? 'Nom', v: user.name, t:'text'}, {l:t.emailOrPhone, v: user.email, t:'email'}, {l:t.phone, v: user.phone||'', t:'tel'}].map(f => (
                <div key={f.l} className="mb-3">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block mb-1">{f.l}</label>
                  <input defaultValue={f.v} type={f.t}
                    className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-dz-green transition-all" />
                </div>
              ))}
              <button className="px-5 py-2.5 bg-dz-green text-white font-bold rounded-xl text-sm shadow-brand-sm">{t.save}</button>
            </div>

            <div className="bg-card border border-border rounded-2xl p-5">
              <h4 className="font-bold text-foreground mb-4 text-sm flex items-center gap-2"><ShieldCheck size={15} className="text-dz-green" /> {t.security}</h4>
              {[
                { label: t.emailVerified,    ok: user.isEmailVerified,    plus: 20 },
                { label: t.phoneVerified,    ok: user.isPhoneVerified,    plus: 30 },
                { label: t.identityVerified, ok: user.isIdentityVerified, plus: 50 },
              ].map(v => (
                <div key={v.label}
                  className={`flex items-center justify-between p-3.5 rounded-xl mb-2 ${v.ok ? 'bg-dz-green/5' : 'bg-muted'}`}>
                  <div className="flex items-center gap-3">
                    {v.ok ? <CC2 size={18} className="text-dz-green" /> : <XCircle size={18} className="text-muted-foreground" />}
                    <div>
                      <p className="text-sm font-semibold text-foreground">{v.label}</p>
                      {!v.ok && <p className="text-xs text-amber-600 dark:text-amber-400">+{v.plus}% {language === 'ar' ? 'ثقة' : language === 'en' ? 'trust' : 'confiance'}</p>}
                    </div>
                  </div>
                  {!v.ok && (
                    <button className="text-xs font-bold text-white bg-dz-green px-3 py-1.5 rounded-lg shadow-brand-sm">{t.verifyNow}</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ══════════════════════════════════════
// MESSAGES PAGE
// ══════════════════════════════════════
import { Send, ChevronLeft } from 'lucide-react';
import { useRef, useEffect } from 'react';

export const MessagesPage: React.FC = () => {
  const { t, language }               = useLanguage();
  const { user, threads, sendMessage, markRead } = useApp();
  const [activeId, setActiveId]  = useState<string | null>(null);
  const [text,     setText]      = useState('');
  const endRef                   = useRef<HTMLDivElement>(null);

  const active = threads.find(th => th.id === activeId);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [active?.messages.length]);
  useEffect(() => { if (activeId) markRead(activeId); }, [activeId, markRead]);

  const handleSend = () => {
    if (!text.trim() || !activeId) return;
    sendMessage(activeId, text.trim());
    setText('');
  };

  if (!user) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center p-6">
      <MessageSquare size={40} className="text-muted-foreground" />
      <h2 className="text-lg font-black text-foreground">{t.noMessages}</h2>
      <Link to="/auth" className="px-6 py-2.5 bg-dz-green text-white font-bold rounded-xl">{t.login}</Link>
    </div>
  );

  return (
    <div className="h-[calc(100vh-56px)] flex bg-card border-x border-border max-w-5xl mx-auto">
      {/* Thread list */}
      <div className={`flex-col border-r border-border bg-card ${activeId ? 'hidden md:flex' : 'flex'} w-full md:w-72 shrink-0`}>
        <div className="p-4 border-b border-border">
          <h2 className="font-black text-foreground">{t.myMessages}</h2>
          {threads.reduce((s, t) => s + t.unread, 0) > 0 && (
            <p className="text-xs font-bold text-dz-green mt-0.5">
              {threads.reduce((s, t) => s + t.unread, 0)} {t.unreadMsgs}
            </p>
          )}
        </div>
        <div className="flex-1 overflow-y-auto">
          {threads.map(th => (
            <button key={th.id} onClick={() => setActiveId(th.id)}
              className={`w-full flex items-start gap-3 p-4 text-left border-b border-border/50 transition-colors
                ${activeId === th.id ? 'bg-dz-green/5' : 'hover:bg-muted'}`}>
              <img src={th.userAvatar} className="w-11 h-11 rounded-xl object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between mb-0.5">
                  <span className={`text-sm ${th.unread > 0 ? 'font-black text-foreground' : 'font-semibold text-foreground'}`}>{th.userName}</span>
                  {th.unread > 0 && <span className="bg-dz-green text-white text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0">{th.unread}</span>}
                </div>
                <p className="text-xs text-muted-foreground truncate">{th.messages[th.messages.length - 1]?.text}</p>
                <p className="text-[10px] text-muted-foreground/60 truncate mt-0.5">📋 {th.listingTitle}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat */}
      <div className={`flex-1 flex-col ${activeId ? 'flex' : 'hidden md:flex'}`}>
        {active ? (
          <>
            <div className="p-4 border-b border-border flex items-center gap-3">
              <button onClick={() => setActiveId(null)} className="md:hidden p-1.5 hover:bg-muted rounded-lg"><ChevronLeft size={18} /></button>
              <img src={active.userAvatar} className="w-9 h-9 rounded-xl object-cover" />
              <div>
                <p className="font-bold text-sm text-foreground">{active.userName}</p>
                <p className="text-[10px] text-muted-foreground">📋 {active.listingTitle}</p>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/20">
              {active.messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.from === 'u1' ? 'justify-end' : 'justify-start'} items-end gap-2`}>
                  {msg.from !== 'u1' && <img src={active.userAvatar} className="w-7 h-7 rounded-full object-cover shrink-0" />}
                  <div className={`max-w-[72%] px-4 py-2.5 rounded-2xl text-sm shadow-sm
                    ${msg.from === 'u1' ? 'bg-dz-green text-white rounded-br-sm' : 'bg-card text-foreground border border-border rounded-bl-sm'}`}>
                    {msg.text}
                    <p className="text-[9px] mt-1 opacity-50 text-right">
                      {new Date(msg.ts).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={endRef} />
            </div>
            <div className="p-3 border-t border-border flex items-end gap-2 bg-card">
              <div className="flex-1 bg-muted rounded-2xl px-4 py-2.5">
                <textarea value={text} onChange={e => setText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && text.trim()) { e.preventDefault(); handleSend(); }}}
                  placeholder={t.typeMessage} rows={1}
                  className="w-full bg-transparent outline-none text-sm resize-none max-h-20 font-sans" />
              </div>
              <button onClick={handleSend} disabled={!text.trim()}
                className="w-10 h-10 bg-dz-green rounded-2xl flex items-center justify-center text-white disabled:opacity-40 shrink-0 shadow-brand-sm">
                <Send size={15} />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 text-muted-foreground p-6">
            <MessageSquare size={36} className="opacity-40" />
            <p className="font-semibold">{language === 'ar' ? 'اختر محادثة' : language === 'en' ? 'Select a conversation' : 'Sélectionnez une conversation'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ══════════════════════════════════════
// FAVORITES PAGE
// ══════════════════════════════════════
import ListingCard from '../components/listing/ListingCard';

export const FavoritesPage: React.FC = () => {
  const { t, language }            = useLanguage();
  const { listings, favorites }    = useApp();
  const favListings = listings.filter(l => favorites.includes(l.id));

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-2xl font-black text-foreground">{t.myFavorites}</h1>
            <p className="text-sm text-muted-foreground mt-1">{favListings.length} annonce{favListings.length !== 1 ? 's' : ''}</p>
          </div>
          {favListings.length > 0 && (
            <Link to="/search" className="text-sm font-bold text-dz-green hover:underline flex items-center gap-1">
              Explorer <ArrowRight size={14} />
            </Link>
          )}
        </div>

        {favListings.length === 0 ? (
          <div className="text-center py-20 bg-card border border-dashed border-border rounded-3xl">
            <div className="w-16 h-16 bg-dz-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart size={28} className="text-dz-red/50" />
            </div>
            <h3 className="text-lg font-black text-foreground mb-2">
              {language === 'ar' ? 'لا توجد إعلانات مفضلة' : language === 'en' ? 'No favorites yet' : 'Aucun favori pour l\'instant'}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-xs mx-auto text-sm">
              {language === 'ar' ? 'انقر على ♡ في أي إعلان لحفظه هنا.' : language === 'en' ? 'Click ♡ on any listing to save it here.' : 'Cliquez sur ♡ d\'une annonce pour la retrouver ici.'}
            </p>
            <Link to="/search" className="inline-flex items-center gap-2 px-6 py-3 bg-dz-green text-white font-bold rounded-2xl shadow-brand-sm">
              {t.search}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {favListings.map(l => <ListingCard key={l.id} listing={l} />)}
          </div>
        )}
      </div>
    </div>
  );
};
