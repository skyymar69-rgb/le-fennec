import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, MessageSquare, Heart, Settings,
  TrendingUp, Eye, Bell, LogOut, Plus, Edit2, Trash2,
  PauseCircle, PlayCircle, Rocket, Shield, CheckCircle2,
  XCircle, AlertTriangle, ChevronRight, BarChart2, Users,
  Clock, Star, ArrowUpRight, ArrowDownRight,
} from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { useLanguage } from '../contexts/LanguageContext';
import { useApp } from '../contexts/AppContext';
import logoUrl from '../assets/logo.png';

// Week data: zeros for new users — populated from real analytics in production
const WEEK = [
  { j:'Lun', vues:0, contacts:0 },
  { j:'Mar', vues:0, contacts:0 },
  { j:'Mer', vues:0, contacts:0 },
  { j:'Jeu', vues:0, contacts:0 },
  { j:'Ven', vues:0, contacts:0 },
  { j:'Sam', vues:0, contacts:0 },
  { j:'Dim', vues:0, contacts:0 },
];

export const DashboardPage: React.FC = () => {
  const { t, language }    = useLanguage();
  const navigate           = useNavigate();
  const { user, logout, listings, updateListingStatus, removeListing, threads, favorites } = useApp();
  const [tab,      setTab]      = useState<'overview'|'ads'|'stats'|'settings'>('overview');
  const [delModal, setDelModal] = useState<string|null>(null);

  const myAds   = listings.filter(l => l.userId === user?.id && l.status !== 'deleted');
  const active  = myAds.filter(l => l.status === 'active');
  const paused  = myAds.filter(l => l.status === 'paused');
  const unread  = threads.reduce((s, t) => s + t.unread, 0);
  const trust   = (user?.isEmailVerified ? 20 : 0) + (user?.isPhoneVerified ? 30 : 0) + (user?.isIdentityVerified ? 50 : 0);
  const totalViews = myAds.reduce((s, l) => s + (l.views || 0), 0);

  if (!user) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-5 p-6">
      <img src={logoUrl} alt="Le Fennec" className="w-20 h-20 object-contain opacity-40" />
      <div className="text-center">
        <h2 className="text-xl font-black text-foreground mb-2">Espace personnel</h2>
        <p className="text-muted-foreground text-sm">Connectez-vous pour gérer vos annonces</p>
      </div>
      <Link to="/auth" className="px-8 py-3 bg-dz-green text-white font-bold rounded-2xl shadow-brand-md">
        Se connecter
      </Link>
    </div>
  );

  const TABS = [
    { id:'overview', Icon:LayoutDashboard, label:'Tableau de bord' },
    { id:'ads',      Icon:Package,         label:'Mes annonces',  badge: active.length },
    { id:'stats',    Icon:BarChart2,        label:'Statistiques'  },
    { id:'settings', Icon:Settings,        label:'Paramètres'    },
  ] as const;

  return (
    <div className="min-h-screen bg-muted/30 pb-24 md:pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-5">

        {/* ── Profile completion banner (shown when name is placeholder) ── */}
        {user && (user.name === '' || user.name === 'Utilisateur Google' || user.name === 'Utilisateur Facebook' || user.name === 'Nouvel utilisateur') && (
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-2xl px-4 py-3 flex items-center gap-3">
            <span className="text-lg">✏️</span>
            <div className="flex-1">
              <p className="text-sm font-bold text-amber-800 dark:text-amber-300">Complétez votre profil</p>
              <p className="text-xs text-amber-700 dark:text-amber-400">Allez dans Paramètres pour ajouter votre vrai nom et augmenter votre score de confiance.</p>
            </div>
            <button onClick={() => setTab('settings')} className="text-xs font-bold text-white bg-amber-500 px-3 py-1.5 rounded-lg hover:bg-amber-600 transition-colors shrink-0">
              Compléter →
            </button>
          </div>
        )}

        {/* ── Top profile bar ── */}
        <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4 shadow-card">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-dz-green/10 flex items-center justify-center text-2xl font-black text-dz-green border-2 border-dz-green/20 shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-card ${trust >= 50 ? 'bg-dz-green' : 'bg-amber-400'}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-black text-foreground text-base">{user.name}</h2>
              {user.isIdentityVerified && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-dz-green bg-dz-green/10 px-2 py-0.5 rounded-full">
                  <CheckCircle2 size={9} /> Vérifié
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">{user.email}</p>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="h-1.5 w-20 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-dz-green rounded-full transition-all" style={{ width: `${trust}%` }} />
                </div>
                <span className="font-semibold text-foreground">{trust}%</span>
                <span>confiance</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link to="/post"
              className="hidden sm:flex items-center gap-1.5 bg-dz-green text-white text-sm font-bold px-4 py-2 rounded-xl shadow-brand-sm hover:bg-dz-green2 transition-colors">
              <Plus size={15} strokeWidth={3} /> Nouvelle annonce
            </Link>
            <button onClick={() => { logout(); navigate('/'); }}
              className="p-2.5 border border-border rounded-xl text-muted-foreground hover:text-dz-red hover:border-dz-red/30 transition-colors">
              <LogOut size={16} />
            </button>
          </div>
        </div>

        {/* ── Tab navigation ── */}
        <div className="bg-card border border-border rounded-2xl p-1.5 flex gap-1 shadow-card overflow-x-auto no-scrollbar">
          {TABS.map(({ id, Icon, label, badge }) => (
            <button key={id} onClick={() => setTab(id as any)}
              className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all relative whitespace-nowrap
                ${tab === id
                  ? 'bg-dz-green text-white shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
              <Icon size={15} />
              <span>{label}</span>
              {badge != null && badge > 0 && tab !== id && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-dz-red text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1">
                  {badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ══ OVERVIEW ══════════════════════════════ */}
        {tab === 'overview' && (
          <div className="space-y-5">

            {/* KPI cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: Package,    val: active.length,           label: 'Annonces actives',  trend: '+2 ce mois',  up: true,  color: 'text-dz-green',  bg: 'bg-dz-green/8'   },
                { icon: Eye,        val: totalViews.toLocaleString(), label: 'Vues totales',   trend: '+18% vs mois dernier', up: true,  color: 'text-blue-600',  bg: 'bg-blue-500/8'   },
                { icon: MessageSquare, val: unread,               label: 'Msgs non lus',      trend: unread > 0 ? 'À traiter' : 'Tout lu', up: false, color: 'text-amber-600', bg: 'bg-amber-500/8'  },
                { icon: Heart,      val: favorites.length,        label: 'Favoris sauvés',    trend: 'annonces suivies', up: true, color: 'text-dz-red',   bg: 'bg-dz-red/8'    },
              ].map((k, i) => (
                <div key={i} className={`${k.bg} rounded-2xl p-4 border border-border/40 bg-card`}>
                  <div className="flex justify-between items-start mb-3">
                    <k.icon size={18} className={k.color} />
                    <span className={`text-[10px] font-semibold flex items-center gap-0.5 ${k.up ? 'text-dz-green' : 'text-amber-600'}`}>
                      {k.up ? <ArrowUpRight size={10}/> : <ArrowDownRight size={10}/>}
                      {k.trend}
                    </span>
                  </div>
                  <div className={`text-2xl font-black ${k.color} leading-none mb-1`}>{k.val}</div>
                  <div className="text-xs text-muted-foreground font-medium">{k.label}</div>
                </div>
              ))}
            </div>

            {/* Chart + Trust */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Weekly chart */}
              <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-5 shadow-card">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="font-black text-foreground text-sm">Vues & contacts — 7 derniers jours</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Vos statistiques apparaîtront ici après vos premières annonces</p>
                  </div>
                  <TrendingUp size={16} className="text-dz-green" />
                </div>
                <ResponsiveContainer width="100%" height={150}>
                  <BarChart data={WEEK} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="j" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', fontSize: 12, background: 'hsl(var(--card))' }}
                      cursor={{ fill: 'hsl(var(--muted))' }}
                      formatter={(val: number, name: string) => [val, name === 'vues' ? 'Vues' : 'Contacts']}
                    />
                    <Bar dataKey="vues" fill="var(--dz-green)" radius={[5,5,0,0]} fillOpacity={0.7} />
                    <Bar dataKey="contacts" fill="var(--dz-red)" radius={[5,5,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Trust score */}
              <div className="bg-foreground rounded-2xl p-5 relative overflow-hidden shadow-card">
                <div className="absolute inset-0 opacity-[0.03]">
                  <Shield size={200} className="absolute -right-10 -bottom-10" />
                </div>
                <div className="relative z-10">
                  <p className="text-xs font-bold text-white/50 uppercase tracking-wider mb-4">Score de confiance</p>
                  <div className="flex items-center gap-4 mb-5">
                    <svg viewBox="0 0 80 80" className="w-20 h-20 shrink-0 -rotate-90">
                      <circle cx="40" cy="40" r="34" strokeWidth="6" fill="none" stroke="rgba(255,255,255,.1)" />
                      <circle cx="40" cy="40" r="34" strokeWidth="6" fill="none"
                        stroke={trust < 40 ? '#D21034' : trust < 70 ? '#F59E0B' : '#00874A'}
                        strokeDasharray="214" strokeDashoffset={214 - (214 * trust / 100)}
                        strokeLinecap="round" style={{ transition: 'all 1.2s ease' }} />
                    </svg>
                    <div>
                      <div className="text-3xl font-black text-white">{trust}%</div>
                      <div className="text-xs text-white/40 mt-1">
                        {trust < 40 ? 'Profil à compléter' : trust < 70 ? 'Profil partiel' : 'Profil de confiance'}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {[
                      { l: 'Email vérifié',    ok: user.isEmailVerified,    p: '+20%' },
                      { l: 'Téléphone vérifié',ok: user.isPhoneVerified,    p: '+30%' },
                      { l: 'Identité vérifiée',ok: user.isIdentityVerified, p: '+50%' },
                    ].map(v => (
                      <div key={v.l} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {v.ok
                            ? <CheckCircle2 size={13} className="text-dz-green shrink-0" />
                            : <XCircle size={13} className="text-white/30 shrink-0" />}
                          <span className={`text-xs ${v.ok ? 'text-white/70' : 'text-white/30'}`}>{v.l}</span>
                        </div>
                        {!v.ok && <span className="text-[10px] font-bold text-amber-400">{v.p}</span>}
                      </div>
                    ))}
                  </div>
                  {trust < 100 && (
                    <button onClick={() => setTab('settings')}
                      className="w-full mt-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-colors">
                      Améliorer mon score →
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Recent ads preview */}
            {myAds.length > 0 && (
              <div className="bg-card border border-border rounded-2xl p-5 shadow-card">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-black text-foreground text-sm">Mes annonces récentes</h3>
                  <button onClick={() => setTab('ads')} className="text-xs font-bold text-dz-green flex items-center gap-1 hover:underline">
                    Tout voir <ChevronRight size={13} />
                  </button>
                </div>
                <div className="space-y-3">
                  {myAds.slice(0, 3).map(ad => (
                    <div key={ad.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl hover:bg-muted transition-colors">
                      <img src={ad.imageUrl} alt="" className="w-12 h-12 rounded-xl object-cover shrink-0 bg-muted" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{ad.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs font-bold text-dz-green">{ad.price.toLocaleString()} DA</span>
                          <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                          <span className="text-xs text-muted-foreground flex items-center gap-1"><Eye size={10}/>{ad.views?.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className={`text-[10px] font-bold px-2 py-1 rounded-lg ${ad.status === 'active' ? 'bg-dz-green/10 text-dz-green' : 'bg-muted text-muted-foreground'}`}>
                        {ad.status === 'active' ? '● Active' : '⏸ Pause'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick actions */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label:'Déposer annonce', Icon:Plus,           to:'/post',      color:'bg-dz-green text-white shadow-brand-sm' },
                { label:'Voir favoris',    Icon:Heart,          to:'/favorites', color:'bg-card border border-border text-foreground' },
                { label:'Messagerie',      Icon:MessageSquare,  to:'/messages',  color:'bg-card border border-border text-foreground', badge: unread },
                { label:'Mes stats',       Icon:BarChart2,      action:()=>setTab('stats'), color:'bg-card border border-border text-foreground' },
              ].map((item, i) => (
                item.to ? (
                  <Link key={i} to={item.to}
                    className={`relative flex items-center gap-2.5 p-4 rounded-2xl font-semibold text-sm transition-all hover:-translate-y-0.5 ${item.color}`}>
                    <item.Icon size={18} />
                    {item.label}
                    {item.badge != null && item.badge > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-dz-red text-white text-[9px] font-bold rounded-full flex items-center justify-center">{item.badge}</span>
                    )}
                  </Link>
                ) : (
                  <button key={i} onClick={item.action}
                    className={`flex items-center gap-2.5 p-4 rounded-2xl font-semibold text-sm transition-all hover:-translate-y-0.5 text-left ${item.color}`}>
                    <item.Icon size={18} />
                    {item.label}
                  </button>
                )
              ))}
            </div>
          </div>
        )}

        {/* ══ MY ADS ════════════════════════════════ */}
        {tab === 'ads' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-black text-foreground">{myAds.length} annonce{myAds.length !== 1 ? 's' : ''}</h3>
                <p className="text-xs text-muted-foreground">{active.length} active · {paused.length} en pause</p>
              </div>
              <Link to="/post" className="flex items-center gap-1.5 bg-dz-green hover:bg-dz-green2 text-white text-sm font-bold px-4 py-2.5 rounded-xl shadow-brand-sm transition-colors">
                <Plus size={15} strokeWidth={3} /> Déposer
              </Link>
            </div>

            {myAds.length === 0 ? (
              <div className="bg-card border-2 border-dashed border-border rounded-3xl p-12 text-center">
                <Package size={36} className="text-muted-foreground/40 mx-auto mb-4" />
                <h3 className="font-black text-foreground text-lg mb-2">Aucune annonce pour l'instant</h3>
                <p className="text-muted-foreground text-sm mb-6 max-w-xs mx-auto">Déposez votre première annonce gratuitement et touchez des milliers d'acheteurs en Algérie.</p>
                <Link to="/post" className="inline-flex items-center gap-2 bg-dz-green text-white font-bold px-6 py-3 rounded-xl shadow-brand-md">
                  <Plus size={16} strokeWidth={3} /> Déposer gratuitement
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {myAds.map(ad => (
                  <div key={ad.id}
                    className={`bg-card border border-border rounded-2xl overflow-hidden transition-all hover:shadow-card ${ad.status === 'paused' ? 'opacity-60' : ''}`}>
                    <div className="flex gap-4 p-4">
                      <img src={ad.imageUrl} alt="" className="w-20 h-16 sm:w-28 sm:h-20 rounded-xl object-cover shrink-0 bg-muted" />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between gap-2 mb-1">
                          <h4 className="font-bold text-sm text-foreground truncate leading-tight">{ad.title}</h4>
                          <span className="font-black text-sm text-dz-green shrink-0 whitespace-nowrap">
                            {ad.price > 0 ? `${ad.price.toLocaleString()} DA` : 'Sur demande'}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mb-3">
                          <span className={`font-bold px-2 py-0.5 rounded-full ${ad.status === 'active' ? 'bg-dz-green/10 text-dz-green' : 'bg-muted text-muted-foreground'}`}>
                            {ad.status === 'active' ? '● Active' : '⏸ Pause'}
                          </span>
                          <span className="flex items-center gap-1"><Eye size={10}/> {(ad.views||0).toLocaleString()} vues</span>
                          <span className="flex items-center gap-1"><Clock size={10}/> {ad.date}</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          <button className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 bg-muted hover:bg-muted-foreground/20 rounded-lg transition-colors">
                            <Edit2 size={11}/> Modifier
                          </button>
                          {ad.status === 'active'
                            ? <button onClick={() => updateListingStatus(ad.id, 'paused')}
                                className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-lg transition-colors">
                                <PauseCircle size={11}/> Pause
                              </button>
                            : <button onClick={() => updateListingStatus(ad.id, 'active')}
                                className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 bg-dz-green/10 text-dz-green rounded-lg transition-colors">
                                <PlayCircle size={11}/> Réactiver
                              </button>
                          }
                          <button className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 bg-amber-400/10 text-amber-600 dark:text-amber-400 rounded-lg ml-auto transition-colors">
                            <Rocket size={11}/> Booster
                          </button>
                          <button onClick={() => setDelModal(ad.id)}
                            className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 bg-dz-red/10 text-dz-red rounded-lg transition-colors">
                            <Trash2 size={11}/> Supprimer
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {delModal && (
              <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-card border border-border rounded-3xl p-6 max-w-sm w-full shadow-2xl">
                  <div className="w-14 h-14 bg-dz-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle size={24} className="text-dz-red" />
                  </div>
                  <h3 className="text-lg font-black text-center mb-2">Supprimer l'annonce ?</h3>
                  <p className="text-sm text-muted-foreground text-center mb-5 leading-relaxed">Cette action est irréversible. L'annonce sera définitivement supprimée.</p>
                  <div className="flex gap-3">
                    <button onClick={() => setDelModal(null)} className="flex-1 py-3 border border-border rounded-xl font-bold text-sm hover:bg-muted transition-colors">Annuler</button>
                    <button onClick={() => { removeListing(delModal!); setDelModal(null); }} className="flex-1 py-3 bg-dz-red text-white rounded-xl font-bold text-sm hover:bg-dz-red/90 transition-colors">Supprimer</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══ STATS ══════════════════════════════════ */}
        {tab === 'stats' && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Vues totales', val: totalViews.toLocaleString(), sub: 'toutes annonces confondues', Icon: Eye,          color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/30' },
                { label: 'Contacts reçus', val: myAds.reduce((s,l)=>s+(l.contacts||0),0).toString(), sub: 'acheteurs intéressés', Icon: Users, color: 'text-dz-green', bg: 'bg-dz-green/5'  },
                { label: 'Taux de réponse', val: '94%', sub: 'délai moyen: 45 min', Icon: Star, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/30' },
              ].map(k => (
                <div key={k.label} className={`${k.bg} border border-border rounded-2xl p-5`}>
                  <k.Icon size={20} className={k.color + ' mb-3'} />
                  <div className={`text-3xl font-black ${k.color} mb-1`}>{k.val}</div>
                  <div className="text-sm font-bold text-foreground mb-0.5">{k.label}</div>
                  <div className="text-xs text-muted-foreground">{k.sub}</div>
                </div>
              ))}
            </div>

            <div className="bg-card border border-border rounded-2xl p-5 shadow-card">
              <h3 className="font-black text-foreground text-sm mb-4">Évolution des vues — 7 jours</h3>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={WEEK}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="j" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', fontSize: 12, background: 'hsl(var(--card))' }} />
                  <Line type="monotone" dataKey="vues" stroke="var(--dz-green)" strokeWidth={2.5} dot={{ fill: 'var(--dz-green)', r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="contacts" stroke="var(--dz-red)" strokeWidth={2} dot={{ fill: 'var(--dz-red)', r: 3 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
              <div className="flex items-center gap-4 mt-3 justify-center text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-dz-green rounded inline-block"/> Vues</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-dz-red rounded inline-block"/> Contacts</span>
              </div>
            </div>
          </div>
        )}

        {/* ══ SETTINGS ═══════════════════════════════ */}
        {tab === 'settings' && (
          <div className="space-y-4 max-w-lg">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-card space-y-4">
              <h3 className="font-black text-foreground flex items-center gap-2"><Settings size={16}/> Informations personnelles</h3>
              {[
                { label:'Nom complet', value:user.name,        type:'text'  },
                { label:'Email',       value:user.email,       type:'email' },
                { label:'Téléphone',   value:user.phone||'',   type:'tel'   },
              ].map(f => (
                <div key={f.label}>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">{f.label}</label>
                  <input defaultValue={f.value} type={f.type}
                    className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-dz-green transition-all" />
                </div>
              ))}
              <button className="px-6 py-2.5 bg-dz-green text-white font-bold rounded-xl text-sm shadow-brand-sm hover:bg-dz-green2 transition-colors">
                Enregistrer
              </button>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
              <h3 className="font-black text-foreground flex items-center gap-2 mb-4"><Shield size={16} className="text-dz-green"/> Sécurité & Vérification</h3>
              <div className="space-y-3">
                {[
                  { label:'Email vérifié',     ok:user.isEmailVerified,    bonus:'+20%',  desc:'Votre email est confirmé'         },
                  { label:'Téléphone vérifié', ok:user.isPhoneVerified,    bonus:'+30%',  desc:'Vérifiez via SMS pour plus de confiance' },
                  { label:'Identité vérifiée', ok:user.isIdentityVerified, bonus:'+50%',  desc:'Uploadez une pièce d\'identité'   },
                ].map(v => (
                  <div key={v.label}
                    className={`flex items-center gap-3 p-4 rounded-xl ${v.ok ? 'bg-dz-green/5 border border-dz-green/15' : 'bg-muted'}`}>
                    {v.ok
                      ? <CheckCircle2 size={18} className="text-dz-green shrink-0" />
                      : <XCircle size={18} className="text-muted-foreground/50 shrink-0" />}
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">{v.label}</p>
                      <p className="text-xs text-muted-foreground">{v.desc}</p>
                    </div>
                    {!v.ok && (
                      <div className="text-right shrink-0">
                        <div className="text-xs font-bold text-amber-600 mb-1">{v.bonus}</div>
                        <button className="text-xs font-bold text-white bg-dz-green px-3 py-1.5 rounded-lg hover:bg-dz-green2 transition-colors">
                          Vérifier
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
