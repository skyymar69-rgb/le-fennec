import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, MessageSquare, Eye, Settings, Edit2, Trash2,
  PauseCircle, PlayCircle, LogOut, Upload, AlertTriangle,
  Check, CheckCircle2, XCircle, Rocket, ShieldCheck, Plus,
} from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useLanguage } from '../contexts/LanguageContext';
import { useApp } from '../contexts/AppContext';

const CHART_DATA = [
  { n: 'L', v: 40 }, { n: 'M', v: 30 }, { n: 'M', v: 20 },
  { n: 'J', v: 27 }, { n: 'V', v: 18 }, { n: 'S', v: 23 }, { n: 'D', v: 34 },
];

export const DashboardPage: React.FC = () => {
  const { t, language }    = useLanguage();
  const navigate           = useNavigate();
  const { user, logout, listings, updateListingStatus, removeListing, threads } = useApp();
  const [tab,      setTab]      = useState<'overview' | 'ads' | 'messages' | 'settings'>('overview');
  const [delModal, setDelModal] = useState<string | null>(null);

  const myAds      = listings.filter(l => l.userId === user?.id && l.status !== 'deleted');
  const trustScore = (user?.isEmailVerified ? 20 : 0) + (user?.isPhoneVerified ? 30 : 0) + (user?.isIdentityVerified ? 50 : 0);
  const unread     = threads.reduce((s, th) => s + th.unread, 0);

  if (!user) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 text-center p-6">
      <img src="/assets/logo.png" alt="" className="w-16 h-16 object-contain opacity-60" />
      <h2 className="text-xl font-black text-foreground">
        {language === 'ar' ? 'سجّل دخولك للوصول إلى مساحتك' : language === 'en' ? 'Sign in to access your space' : 'Connectez-vous pour accéder à votre espace'}
      </h2>
      <Link to="/auth" className="px-8 py-3 bg-dz-green text-white font-bold rounded-2xl shadow-brand-md">{t.login}</Link>
    </div>
  );

  const TABS = [
    { id: 'overview',  Icon: LayoutDashboard, label: t.myStats     },
    { id: 'ads',       Icon: Eye,             label: t.myAds,      badge: myAds.filter(l => l.status === 'active').length },
    { id: 'messages',  Icon: MessageSquare,   label: t.myMessages, badge: unread },
    { id: 'settings',  Icon: Settings,        label: t.settings    },
  ] as const;

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">

        {/* User header card */}
        <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4">
          <div className="relative shrink-0">
            <img src={user.avatar} alt={user.name} className="w-16 h-16 rounded-2xl object-cover" />
            {user.isIdentityVerified && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-dz-green rounded-full flex items-center justify-center border-2 border-card">
                <Check size={10} strokeWidth={3} className="text-white" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-black text-foreground leading-none">{user.name}</h2>
            <p className="text-sm text-muted-foreground mt-0.5">{user.email}</p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {[
                { label: t.emailVerified,    ok: user.isEmailVerified    },
                { label: t.phoneVerified,    ok: user.isPhoneVerified    },
                { label: t.identityVerified, ok: user.isIdentityVerified },
              ].map(v => (
                <span key={v.label}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 w-fit
                    ${v.ok
                      ? 'bg-dz-green/10 border-dz-green/20 text-dz-green'
                      : 'bg-muted border-border text-muted-foreground'}`}
                >
                  {v.ok ? <Check size={9} /> : <XCircle size={9} />}
                  {v.label}
                </span>
              ))}
            </div>
          </div>
          <button
            onClick={() => { logout(); navigate('/'); }}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-dz-red transition-colors shrink-0 p-2"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">{t.logout}</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-card border border-border rounded-2xl p-1.5 overflow-x-auto no-scrollbar">
          {TABS.map(({ id, Icon, label, badge }) => (
            <button key={id} onClick={() => setTab(id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap flex-1 justify-center relative min-w-[80px]
                ${tab === id
                  ? 'bg-foreground text-background shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
            >
              <Icon size={15} />
              <span className="hidden sm:inline">{label}</span>
              {badge && badge > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-dz-red text-white text-[8px] font-bold rounded-full flex items-center justify-center px-0.5">
                  {badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Overview tab ── */}
        {tab === 'overview' && (
          <div className="space-y-4">
            {/* Trust score hero */}
            <div className="bg-foreground text-background rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 opacity-[0.04] p-6">
                <ShieldCheck size={100} />
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
                {/* Circular progress */}
                <div className="relative w-24 h-24 shrink-0">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 96 96">
                    <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="7" fill="none" opacity="0.1" />
                    <circle cx="48" cy="48" r="40"
                      stroke={trustScore < 40 ? '#D21034' : trustScore < 80 ? '#F59E0B' : '#00874A'}
                      strokeWidth="7" fill="none"
                      strokeDasharray="251"
                      strokeDashoffset={251 - (251 * trustScore / 100)}
                      strokeLinecap="round"
                      style={{ transition: 'stroke-dashoffset 1.2s ease' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-black leading-none">{trustScore}%</span>
                    <span className="text-[8px] opacity-40 font-bold uppercase tracking-wider mt-0.5">Score</span>
                  </div>
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-lg font-black mb-1">{t.completeProfile}</h3>
                  <p className="text-sm opacity-60 mb-3 leading-relaxed">
                    {language === 'ar' ? 'ملف موثق يزيد مبيعاتك 3 مرات'
                      : language === 'en' ? 'A verified profile triples your sales'
                      : 'Un profil vérifié multiplie vos ventes par 3'}
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                    {[
                      { l: 'Email',    ok: user.isEmailVerified,    p: 20 },
                      { l: language === 'ar' ? 'هاتف' : 'Téléphone', ok: user.isPhoneVerified,    p: 30 },
                      { l: language === 'ar' ? 'هوية' : 'Identité',  ok: user.isIdentityVerified, p: 50 },
                    ].map(v => (
                      <span key={v.l}
                        className={`text-xs font-bold px-3 py-1 rounded-full border transition-all
                          ${v.ok
                            ? 'border-dz-green/40 text-dz-green bg-dz-green/10'
                            : 'border-white/20 text-white/50 bg-white/5'}`}
                      >
                        {v.ok ? '✓ ' : ''}{v.l}{!v.ok ? ` +${v.p}%` : ''}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* KPI cards */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: t.activeAds,  value: myAds.filter(l => l.status === 'active').length, icon: '📋', bg: 'bg-dz-green/8',  tc: 'text-dz-green'  },
                { label: t.totalViews, value: myAds.reduce((s, l) => s + (l.views || 0), 0).toLocaleString(), icon: '👁', bg: 'bg-blue-500/8',  tc: 'text-blue-600 dark:text-blue-400' },
                { label: t.unreadMsgs, value: unread, icon: '💬', bg: 'bg-amber-500/8', tc: 'text-amber-600 dark:text-amber-400' },
              ].map(k => (
                <div key={k.label} className={`${k.bg} rounded-2xl p-4 border border-border/50`}>
                  <div className="text-2xl mb-2">{k.icon}</div>
                  <div className={`text-2xl font-black leading-none ${k.tc}`}>{k.value}</div>
                  <div className="text-xs text-muted-foreground font-medium mt-1 leading-tight">{k.label}</div>
                </div>
              ))}
            </div>

            {/* Weekly chart */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <h4 className="font-bold text-foreground text-sm mb-4">
                {language === 'ar' ? '📈 المشاهدات هذا الأسبوع'
                  : language === 'en' ? '📈 Views this week'
                  : '📈 Vues cette semaine'}
              </h4>
              <ResponsiveContainer width="100%" height={120}>
                <BarChart data={CHART_DATA} barSize={28}>
                  <XAxis dataKey="n" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', fontSize: 12, background: 'hsl(var(--card))' }}
                    cursor={{ fill: 'hsl(var(--muted))' }}
                  />
                  <Bar dataKey="v" fill="var(--dz-green)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Quick post CTA */}
            <Link to="/post"
              className="flex items-center justify-between bg-dz-green/5 border border-dz-green/20 rounded-2xl p-4 hover:bg-dz-green/10 transition-colors group">
              <div>
                <p className="font-bold text-dz-green text-sm">{t.postAdBtn}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {language === 'ar' ? 'مجاني · ذكاء اصطناعي · فوري' : language === 'en' ? 'Free · AI-powered · Instant' : 'Gratuit · IA · Immédiat'}
                </p>
              </div>
              <div className="w-10 h-10 bg-dz-green rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                <Plus size={20} strokeWidth={3} className="text-white" />
              </div>
            </Link>
          </div>
        )}

        {/* ── My ads tab ── */}
        {tab === 'ads' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-black text-foreground">
                {myAds.length} {t.myAds}
              </h3>
              <Link to="/post"
                className="flex items-center gap-1.5 text-sm font-bold text-white bg-dz-green px-4 py-2 rounded-xl shadow-brand-sm hover:bg-dz-green2 transition-colors">
                <Plus size={14} strokeWidth={3} /> {t.post}
              </Link>
            </div>

            {myAds.length === 0 ? (
              <div className="text-center py-16 bg-card border-2 border-dashed border-border rounded-2xl">
                <Upload size={28} className="text-muted-foreground mx-auto mb-3" />
                <h3 className="font-black text-foreground mb-2">
                  {language === 'ar' ? 'لا توجد إعلانات بعد' : language === 'en' ? 'No ads yet' : 'Aucune annonce'}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {language === 'ar' ? 'أضف إعلانك الأول مجانًا' : language === 'en' ? 'Post your first ad for free' : 'Déposez votre première annonce gratuitement'}
                </p>
                <Link to="/post" className="inline-block px-6 py-2.5 bg-dz-green text-white font-bold rounded-xl shadow-brand-sm text-sm">
                  {t.postAdBtn}
                </Link>
              </div>
            ) : (
              myAds.map(ad => (
                <div key={ad.id}
                  className={`bg-card border border-border rounded-2xl p-4 flex gap-4 transition-all ${ad.status === 'paused' ? 'opacity-65' : ''}`}>
                  <img src={ad.imageUrl} alt={ad.title} className="w-24 h-20 rounded-xl object-cover shrink-0 bg-muted" />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between gap-2 mb-1.5">
                      <h4 className="font-bold text-sm text-foreground truncate">{ad.title}</h4>
                      <span className="font-black text-sm text-dz-green shrink-0">{ad.price.toLocaleString()} DA</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs mb-3">
                      <span className={`px-2 py-0.5 rounded-full font-bold
                        ${ad.status === 'active'
                          ? 'bg-dz-green/10 text-dz-green'
                          : ad.status === 'paused'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          : 'bg-muted text-muted-foreground'}`}
                      >
                        {ad.status === 'active' ? '● Active'
                          : ad.status === 'paused' ? '⏸ Pause'
                          : ad.status}
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Eye size={10} /> {(ad.views || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <button className="flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 bg-muted rounded-lg hover:bg-muted-foreground/20 transition-colors">
                        <Edit2 size={10} /> {t.edit}
                      </button>
                      {ad.status === 'active' ? (
                        <button onClick={() => updateListingStatus(ad.id, 'paused')}
                          className="flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-lg transition-colors">
                          <PauseCircle size={10} /> {t.pause}
                        </button>
                      ) : (
                        <button onClick={() => updateListingStatus(ad.id, 'active')}
                          className="flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 bg-dz-green/10 text-dz-green rounded-lg transition-colors">
                          <PlayCircle size={10} /> {t.reactivate}
                        </button>
                      )}
                      <button className="flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg transition-colors ml-auto">
                        <Rocket size={10} /> {t.boost}
                      </button>
                      <button onClick={() => setDelModal(ad.id)}
                        className="flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 bg-dz-red/10 text-dz-red rounded-lg transition-colors">
                        <Trash2 size={10} /> {t.delete}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* Delete confirmation modal */}
            {delModal && (
              <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-card border border-border rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-fade-up">
                  <div className="w-12 h-12 bg-dz-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle size={20} className="text-dz-red" />
                  </div>
                  <h3 className="text-lg font-black text-center text-foreground mb-2">{t.delete} ?</h3>
                  <p className="text-sm text-muted-foreground text-center mb-5 leading-relaxed">{t.deleteConfirm}</p>
                  <div className="flex gap-3">
                    <button onClick={() => setDelModal(null)}
                      className="flex-1 py-3 border border-border text-foreground font-bold rounded-xl hover:bg-muted transition-colors">
                      {t.cancel}
                    </button>
                    <button onClick={() => { removeListing(delModal!); setDelModal(null); }}
                      className="flex-1 py-3 bg-dz-red text-white font-bold rounded-xl shadow-sm hover:bg-dz-red/90 transition-colors">
                      {t.confirm}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Messages quick view ── */}
        {tab === 'messages' && (
          <div className="space-y-3">
            {threads.length === 0 ? (
              <div className="text-center py-12 bg-card border border-dashed border-border rounded-2xl">
                <MessageSquare size={28} className="text-muted-foreground mx-auto mb-3" />
                <p className="font-bold text-foreground mb-1">{t.noMessages}</p>
                <p className="text-sm text-muted-foreground">
                  {language === 'ar' ? 'ستظهر الرسائل هنا' : language === 'en' ? 'Messages will appear here' : 'Les messages apparaîtront ici'}
                </p>
              </div>
            ) : (
              threads.map(th => (
                <Link key={th.id} to="/messages"
                  className="flex items-center gap-3 bg-card border border-border rounded-2xl p-4 hover:shadow-card transition-all hover:border-dz-green/20">
                  <img src={th.userAvatar} alt={th.userName} className="w-12 h-12 rounded-2xl object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="font-bold text-sm text-foreground">{th.userName}</span>
                      {th.unread > 0 && (
                        <span className="bg-dz-green text-white text-[9px] font-bold px-2 py-0.5 rounded-full">{th.unread}</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{th.messages[th.messages.length - 1]?.text}</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-0.5 truncate">📋 {th.listingTitle}</p>
                  </div>
                </Link>
              ))
            )}
            <Link to="/messages"
              className="block text-center py-3 text-sm font-bold text-dz-green hover:underline">
              {language === 'ar' ? 'فتح الرسائل ←' : language === 'en' ? 'Open messages →' : 'Voir tous les messages →'}
            </Link>
          </div>
        )}

        {/* ── Settings tab ── */}
        {tab === 'settings' && (
          <div className="space-y-4">
            {/* Personal info */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <h4 className="font-bold text-foreground mb-4 text-sm flex items-center gap-2">
                <Settings size={15} className="text-muted-foreground" /> {t.personalInfo}
              </h4>
              <div className="space-y-3">
                {[
                  { label: language === 'ar' ? 'الاسم الكامل' : language === 'en' ? 'Full name' : 'Nom complet', value: user.name,  type: 'text'  },
                  { label: t.emailOrPhone,  value: user.email, type: 'email' },
                  { label: t.phone,         value: user.phone || '',  type: 'tel' },
                ].map(f => (
                  <div key={f.label}>
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block mb-1">{f.label}</label>
                    <input
                      defaultValue={f.value}
                      type={f.type}
                      className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-dz-green transition-all"
                    />
                  </div>
                ))}
              </div>
              <button className="mt-4 px-5 py-2.5 bg-dz-green text-white font-bold rounded-xl text-sm shadow-brand-sm hover:bg-dz-green2 transition-colors">
                {t.save}
              </button>
            </div>

            {/* Security & verification */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <h4 className="font-bold text-foreground mb-4 text-sm flex items-center gap-2">
                <ShieldCheck size={15} className="text-dz-green" /> {t.security}
              </h4>
              <div className="space-y-2">
                {[
                  { label: t.emailVerified,    ok: user.isEmailVerified,    plus: 20 },
                  { label: t.phoneVerified,    ok: user.isPhoneVerified,    plus: 30 },
                  { label: t.identityVerified, ok: user.isIdentityVerified, plus: 50 },
                ].map(v => (
                  <div key={v.label}
                    className={`flex items-center justify-between p-3.5 rounded-xl transition-colors
                      ${v.ok ? 'bg-dz-green/5 border border-dz-green/10' : 'bg-muted'}`}
                  >
                    <div className="flex items-center gap-3">
                      {v.ok
                        ? <CheckCircle2 size={18} className="text-dz-green" />
                        : <XCircle size={18} className="text-muted-foreground" />
                      }
                      <div>
                        <p className="text-sm font-semibold text-foreground">{v.label}</p>
                        {!v.ok && (
                          <p className="text-xs text-amber-600 dark:text-amber-400">
                            +{v.plus}% {language === 'ar' ? 'ثقة' : language === 'en' ? 'trust' : 'confiance'}
                          </p>
                        )}
                      </div>
                    </div>
                    {!v.ok && (
                      <button className="text-xs font-bold text-white bg-dz-green px-3 py-1.5 rounded-lg shadow-brand-sm hover:bg-dz-green2 transition-colors">
                        {t.verifyNow}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Danger zone */}
            <div className="bg-dz-red/5 border border-dz-red/20 rounded-2xl p-5">
              <h4 className="font-bold text-dz-red mb-3 text-sm">{t.deleteAccount}</h4>
              <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                {language === 'ar' ? 'سيتم حذف جميع بياناتك بشكل نهائي.'
                  : language === 'en' ? 'All your data will be permanently deleted.'
                  : 'Toutes vos données seront supprimées définitivement.'}
              </p>
              <button className="text-xs font-bold text-dz-red border border-dz-red/30 px-4 py-2 rounded-xl hover:bg-dz-red hover:text-white transition-colors">
                {t.deleteAccount}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
