import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, MessageSquare, Heart, Settings,
  Eye, LogOut, Plus, Edit2, Trash2, Rocket, Shield,
  CheckCircle2, ChevronRight, BarChart2, Clock, Star,
  Bell, Zap, Phone, Camera, MapPin, TrendingUp, AlertCircle,
  User, Lock, X,
} from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useLanguage } from '../contexts/LanguageContext';
import { useApp }      from '../contexts/AppContext';

type Tab = 'overview' | 'ads' | 'messages' | 'settings';

export const DashboardPage: React.FC = () => {
  const { language }   = useLanguage();
  const navigate       = useNavigate();
  const { user, logout, userListings, listings, threads, favorites, toggleFav, updateListingStatus, removeListing } = useApp();
  const [tab,      setTab]      = useState<Tab>('overview');
  const [delModal, setDelModal] = useState<string | null>(null);
  const [nameEdit, setNameEdit] = useState('');
  const [editingName, setEditingName] = useState(false);

  const myAds      = userListings;
  const totalViews = myAds.reduce((s, l) => s + (l.views || 0), 0);
  const unread     = threads.reduce((s, t) => s + t.unread, 0);
  const favCount   = favorites.length;

  // Build chart from listing timestamps
  const chartData = useMemo(() => {
    const days = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];
    return days.map((j, i) => ({
      j,
      vues: myAds.filter(l => {
        const d = new Date(l.timestamp || 0);
        return d.getDay() === (i + 1) % 7;
      }).reduce((s, l) => s + (l.views || 0), 0),
    }));
  }, [myAds]);

  // ── Not logged in ──────────────────────────────────────────────────────
  if (!user) return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6 text-center p-6">
      <div className="w-20 h-20 bg-dz-green/10 rounded-3xl flex items-center justify-center">
        <Lock size={36} className="text-dz-green"/>
      </div>
      <div>
        <h2 className="text-2xl font-black text-foreground mb-2">Accès réservé</h2>
        <p className="text-muted-foreground max-w-sm leading-relaxed">
          Connectez-vous pour accéder à votre espace personnel.
        </p>
      </div>
      <Link to="/auth" state={{ from: '/dashboard' }}
        className="px-8 py-3.5 bg-dz-green text-white font-black rounded-2xl shadow-brand-md hover:bg-dz-green2 transition-all hover:-translate-y-0.5">
        Se connecter
      </Link>
    </div>
  );

  const TABS = [
    { id:'overview', Icon:LayoutDashboard, label:'Tableau de bord' },
    { id:'ads',      Icon:Package,         label:'Mes annonces', badge: myAds.length },
    { id:'messages', Icon:MessageSquare,   label:'Messages',     badge: unread || undefined },
    { id:'settings', Icon:Settings,        label:'Paramètres' },
  ];

  // Trust score calculation
  const trust = user.trustScore || 0;
  const trustColor = trust >= 70 ? 'text-dz-green' : trust >= 40 ? 'text-amber-500' : 'text-dz-red';

  return (
    <div className="min-h-screen bg-muted/30 pb-24 md:pb-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">

        {/* ── Profile header ── */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-card">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-dz-green/10 flex items-center justify-center">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover"/>
                ) : (
                  <span className="text-2xl font-black text-dz-green">
                    {user.name?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                )}
              </div>
              {user.isVerified && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-dz-green rounded-full flex items-center justify-center border-2 border-card">
                  <CheckCircle2 size={11} className="text-white"/>
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-black text-foreground truncate">{user.name || 'Mon compte'}</h1>
              <p className="text-sm text-muted-foreground truncate">{user.email}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <div className="flex items-center gap-1">
                  <div className="h-1.5 w-20 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-dz-green rounded-full" style={{ width: `${trust}%` }}/>
                  </div>
                  <span className={`text-[11px] font-bold ${trustColor}`}>{trust}%</span>
                </div>
                <span className="text-[10px] text-muted-foreground">confiance</span>
              </div>
            </div>

            <div className="flex gap-2 shrink-0">
              <Link to="/post"
                className="flex items-center gap-1.5 px-4 py-2.5 bg-dz-green text-white font-bold text-sm rounded-xl shadow-brand-sm hover:bg-dz-green2 transition-all">
                <Plus size={15}/> Déposer
              </Link>
              <button onClick={() => { logout(); navigate('/'); }}
                className="p-2.5 border border-border rounded-xl text-muted-foreground hover:text-dz-red hover:border-dz-red/30 transition-all"
                title="Se déconnecter">
                <LogOut size={16}/>
              </button>
            </div>
          </div>
        </div>

        {/* ── Profile completion banner ── */}
        {trust < 40 && (
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-2xl px-4 py-3 flex items-center gap-3">
            <AlertCircle size={18} className="text-amber-600 shrink-0"/>
            <div className="flex-1">
              <p className="text-sm font-bold text-amber-800 dark:text-amber-300">Complétez votre profil</p>
              <p className="text-xs text-amber-700 dark:text-amber-400">Vérifiez votre email et téléphone pour augmenter la confiance et obtenir plus de contacts.</p>
            </div>
            <button onClick={() => setTab('settings')}
              className="text-xs font-bold text-white bg-amber-500 px-3 py-1.5 rounded-lg shrink-0">
              Compléter →
            </button>
          </div>
        )}

        {/* ── Tabs ── */}
        <div className="flex gap-1 bg-card border border-border rounded-2xl p-1.5 overflow-x-auto no-scrollbar">
          {TABS.map(({ id, Icon, label, badge }) => (
            <button key={id} onClick={() => setTab(id as Tab)}
              className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                tab === id ? 'bg-dz-green text-white shadow-sm' : 'text-muted-foreground hover:bg-muted'
              }`}>
              <Icon size={15}/>
              <span className="hidden sm:inline">{label}</span>
              {badge != null && badge > 0 && (
                <span className={`text-[10px] font-black min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1 ${
                  tab === id ? 'bg-white text-dz-green' : 'bg-dz-red text-white'
                }`}>{badge}</span>
              )}
            </button>
          ))}
        </div>

        {/* ══ OVERVIEW ══════════════════════════════════════════════════════ */}
        {tab === 'overview' && (
          <div className="space-y-4">
            {/* Stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label:'Annonces actives', value:myAds.filter(l=>l.status==='active').length, Icon:Package,      color:'text-dz-green', bg:'bg-dz-green/10' },
                { label:'Vues totales',      value:totalViews.toLocaleString(),               Icon:Eye,           color:'text-blue-600',  bg:'bg-blue-50 dark:bg-blue-950/30' },
                { label:'Messages non lus',  value:unread,                                   Icon:MessageSquare, color:'text-amber-600', bg:'bg-amber-50 dark:bg-amber-950/30' },
                { label:'Favoris reçus',     value:favCount,                                  Icon:Heart,         color:'text-dz-red',    bg:'bg-dz-red/10' },
              ].map(k => (
                <div key={k.label} className={`${k.bg} border border-border rounded-2xl p-4`}>
                  <k.Icon size={18} className={k.color + ' mb-2'}/>
                  <p className={`text-2xl font-black ${k.color}`}>{k.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{k.label}</p>
                </div>
              ))}
            </div>

            {/* Chart */}
            <div className="bg-card border border-border rounded-2xl p-5 shadow-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-foreground flex items-center gap-2">
                  <BarChart2 size={16} className="text-dz-green"/> Vues — 7 derniers jours
                </h3>
                {totalViews === 0 && (
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                    Publiez une annonce pour voir les stats
                  </span>
                )}
              </div>
              <ResponsiveContainer width="100%" height={120}>
                <BarChart data={chartData} barSize={20}>
                  <XAxis dataKey="j" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false}/>
                  <Tooltip
                    contentStyle={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:8, fontSize:12 }}
                    formatter={(v: any) => [v, 'Vues']}
                  />
                  <Bar dataKey="vues" fill="var(--dz-green)" radius={[4,4,0,0]} opacity={0.85}/>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label:'Déposer une annonce', Icon:Plus,    to:'/post',     color:'bg-dz-green text-white' },
                { label:'Voir mes messages',   Icon:MessageSquare, to:'/messages', color:'bg-card border border-border text-foreground' },
                { label:'Mes favoris',         Icon:Heart,   to:'/favorites',color:'bg-card border border-border text-foreground' },
                { label:'Booster',             Icon:Rocket,  to:'/boost',    color:'bg-card border border-border text-foreground' },
              ].map(a => (
                <Link key={a.label} to={a.to}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl font-bold text-sm text-center transition-all hover:-translate-y-0.5 hover:shadow-card ${a.color}`}>
                  <a.Icon size={20}/>
                  <span className="text-xs leading-tight">{a.label}</span>
                </Link>
              ))}
            </div>

            {/* Recent ads */}
            {myAds.length > 0 && (
              <div className="bg-card border border-border rounded-2xl p-5 shadow-card">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-black text-foreground">Dernières annonces</h3>
                  <button onClick={() => setTab('ads')} className="text-xs text-dz-green font-bold hover:underline">Tout voir →</button>
                </div>
                <div className="space-y-2">
                  {myAds.slice(0,3).map(l => (
                    <Link key={l.id} to={`/listing/${l.id}`}
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted transition-colors">
                      <img src={l.imageUrl} alt="" className="w-12 h-12 rounded-xl object-cover shrink-0"/>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-foreground truncate">{l.title}</p>
                        <p className="text-xs text-muted-foreground">{l.price.toLocaleString()} DA · {l.views||0} vues</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        l.status==='active' ? 'bg-dz-green/10 text-dz-green' :
                        l.status==='pending' ? 'bg-amber-100 text-amber-600' : 'bg-muted text-muted-foreground'
                      }`}>
                        {l.status==='active'?'Actif':l.status==='pending'?'En attente':'Inactif'}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Trust score card */}
            <div className="bg-card border border-border rounded-2xl p-5 shadow-card">
              <h3 className="font-black text-foreground mb-4 flex items-center gap-2">
                <Shield size={16} className="text-dz-green"/> Score de confiance
              </h3>
              <div className="flex items-center gap-4 mb-4">
                <div className="relative w-20 h-20">
                  <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--muted)" strokeWidth="3"/>
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#006233" strokeWidth="3"
                      strokeDasharray={`${trust} ${100-trust}`} strokeLinecap="round"/>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-lg font-black ${trustColor}`}>{trust}%</span>
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  {[
                    { label:'Email vérifié',    done:user.isEmailVerified,    points:'+20%' },
                    { label:'Téléphone vérifié',done:user.isPhoneVerified,    points:'+30%' },
                    { label:'Identité vérifiée',done:user.isIdentityVerified, points:'+50%' },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {item.done
                          ? <CheckCircle2 size={14} className="text-dz-green"/>
                          : <div className="w-3.5 h-3.5 rounded-full border-2 border-muted-foreground/30"/>
                        }
                        <span className="text-xs text-foreground">{item.label}</span>
                      </div>
                      <span className={`text-[10px] font-bold ${item.done ? 'text-dz-green' : 'text-muted-foreground'}`}>
                        {item.done ? '✓' : item.points}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══ MES ANNONCES ══════════════════════════════════════════════════ */}
        {tab === 'ads' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-black text-foreground">{myAds.length} annonce{myAds.length!==1?'s':''}</h2>
              <Link to="/post" className="flex items-center gap-1.5 px-4 py-2.5 bg-dz-green text-white font-bold text-sm rounded-xl shadow-brand-sm hover:bg-dz-green2 transition-all">
                <Plus size={14}/> Nouvelle
              </Link>
            </div>

            {myAds.length === 0 ? (
              <div className="bg-card border border-dashed border-border rounded-2xl p-12 text-center">
                <Package size={40} className="text-muted-foreground/30 mx-auto mb-4"/>
                <h3 className="font-bold text-foreground mb-2">Aucune annonce</h3>
                <p className="text-sm text-muted-foreground mb-5">Déposez votre première annonce gratuitement.</p>
                <Link to="/post" className="inline-flex items-center gap-2 px-6 py-3 bg-dz-green text-white font-bold rounded-xl shadow-brand-sm hover:bg-dz-green2 transition-colors">
                  <Plus size={16}/> Déposer une annonce
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {myAds.map(ad => (
                  <div key={ad.id} className="bg-card border border-border rounded-2xl p-4 flex gap-4 shadow-card">
                    <Link to={`/listing/${ad.id}`} className="shrink-0">
                      <img src={ad.imageUrl} alt="" className="w-20 h-20 rounded-xl object-cover"/>
                    </Link>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <Link to={`/listing/${ad.id}`} className="font-bold text-sm text-foreground hover:text-dz-green transition-colors line-clamp-1">
                          {ad.title}
                        </Link>
                        <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          ad.status==='active'  ? 'bg-dz-green/10 text-dz-green' :
                          ad.status==='pending' ? 'bg-amber-100 text-amber-600' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {ad.status==='active'?'Actif':ad.status==='pending'?'En attente':'Inactif'}
                        </span>
                      </div>
                      <p className="text-base font-black text-dz-green mt-0.5">{ad.price.toLocaleString()} DA</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1"><Eye size={10}/>{ad.views||0} vues</span>
                        <span className="flex items-center gap-1"><Clock size={10}/>{ad.date}</span>
                        <span className="flex items-center gap-1"><MapPin size={10}/>{ad.wilayaName}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5 shrink-0">
                      <Link to={`/listing/${ad.id}`}
                        className="p-2 hover:bg-muted rounded-xl transition-colors text-muted-foreground hover:text-dz-green" title="Voir">
                        <Eye size={15}/>
                      </Link>
                      <Link to={`/boost?listing=${ad.id}`}
                        className="p-2 hover:bg-amber-50 rounded-xl transition-colors text-muted-foreground hover:text-amber-600" title="Booster">
                        <Rocket size={15}/>
                      </Link>
                      <button onClick={() => setDelModal(ad.id)}
                        className="p-2 hover:bg-dz-red/10 rounded-xl transition-colors text-muted-foreground hover:text-dz-red" title="Supprimer">
                        <Trash2 size={15}/>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══ MESSAGES ══════════════════════════════════════════════════════ */}
        {tab === 'messages' && (
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-card">
            {threads.length === 0 ? (
              <div className="p-12 text-center">
                <MessageSquare size={40} className="text-muted-foreground/20 mx-auto mb-4"/>
                <p className="font-bold text-foreground mb-1">Aucun message</p>
                <p className="text-sm text-muted-foreground">Vos conversations avec les vendeurs apparaîtront ici.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {threads.slice(0,10).map(th => {
                  const last = th.messages[th.messages.length-1];
                  return (
                    <Link key={th.id} to="/messages"
                      className="flex items-center gap-3 px-4 py-3.5 hover:bg-muted/50 transition-colors">
                      {th.listingImage
                        ? <img src={th.listingImage} alt="" className="w-12 h-12 rounded-xl object-cover shrink-0"/>
                        : <div className="w-12 h-12 bg-dz-green/10 rounded-xl flex items-center justify-center shrink-0 text-xl">🦊</div>
                      }
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-foreground truncate">{th.listingTitle}</p>
                        <p className="text-xs text-muted-foreground truncate">{last?.text || 'Nouvelle conversation'}</p>
                      </div>
                      {th.unread > 0 && (
                        <span className="min-w-[18px] h-[18px] bg-dz-green text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 shrink-0">
                          {th.unread}
                        </span>
                      )}
                    </Link>
                  );
                })}
                <div className="p-3 text-center">
                  <Link to="/messages" className="text-sm font-bold text-dz-green hover:underline">
                    Voir tous les messages →
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══ SETTINGS ══════════════════════════════════════════════════════ */}
        {tab === 'settings' && (
          <div className="space-y-4">
            {/* Profile info */}
            <div className="bg-card border border-border rounded-2xl p-5 shadow-card">
              <h3 className="font-black text-foreground mb-4 flex items-center gap-2">
                <User size={16}/> Informations personnelles
              </h3>
              <div className="space-y-3">
                {[
                  { label:'Nom complet', value:user.name, key:'name', type:'text', placeholder:'Votre nom' },
                  { label:'Email',       value:user.email, key:'email', type:'email', placeholder:'votre@email.com' },
                  { label:'Téléphone',   value:user.phone, key:'phone', type:'tel', placeholder:'0550 12 34 56' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block mb-1">{f.label}</label>
                    <input type={f.type} defaultValue={f.value || ''} placeholder={f.placeholder}
                      className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-dz-green transition-all"/>
                  </div>
                ))}
                <button className="w-full py-3 bg-dz-green text-white font-bold rounded-xl hover:bg-dz-green2 transition-colors mt-2">
                  Sauvegarder
                </button>
              </div>
            </div>

            {/* Verification */}
            <div className="bg-card border border-border rounded-2xl p-5 shadow-card">
              <h3 className="font-black text-foreground mb-4 flex items-center gap-2">
                <Shield size={16} className="text-dz-green"/> Vérification du compte
              </h3>
              <div className="space-y-3">
                {[
                  { label:'Email', done:user.isEmailVerified, action:'Vérifier l\'email', points:'+20% confiance', Icon:CheckCircle2 },
                  { label:'Téléphone', done:user.isPhoneVerified, action:'Vérifier le téléphone', points:'+30% confiance', Icon:Phone },
                  { label:'Identité (carte nationale)', done:user.isIdentityVerified, action:'Vérifier l\'identité', points:'+50% confiance', Icon:Shield },
                ].map(v => (
                  <div key={v.label} className={`flex items-center justify-between p-3.5 rounded-xl border ${
                    v.done ? 'border-dz-green/20 bg-dz-green/5' : 'border-border bg-muted/30'
                  }`}>
                    <div className="flex items-center gap-3">
                      <v.Icon size={16} className={v.done ? 'text-dz-green' : 'text-muted-foreground'}/>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{v.label}</p>
                        <p className="text-xs text-muted-foreground">{v.points}</p>
                      </div>
                    </div>
                    {v.done
                      ? <span className="text-xs font-bold text-dz-green bg-dz-green/10 px-2.5 py-1 rounded-full">✓ Vérifié</span>
                      : <button className="text-xs font-bold text-white bg-dz-green px-3 py-1.5 rounded-lg hover:bg-dz-green2 transition-colors">{v.action}</button>
                    }
                  </div>
                ))}
              </div>
            </div>

            {/* Danger zone */}
            <div className="bg-card border border-border rounded-2xl p-5 shadow-card">
              <h3 className="font-black text-foreground mb-3">Compte</h3>
              <button onClick={() => { logout(); navigate('/'); }}
                className="w-full flex items-center justify-center gap-2 py-3 border border-dz-red/30 text-dz-red font-bold rounded-xl hover:bg-dz-red/5 transition-colors">
                <LogOut size={16}/> Se déconnecter
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Delete modal ── */}
      {delModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setDelModal(null)}>
          <div className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-fade-up"
            onClick={e => e.stopPropagation()}>
            <h3 className="font-black text-foreground mb-2">Supprimer l'annonce ?</h3>
            <p className="text-sm text-muted-foreground mb-5">Cette action est irréversible. L'annonce sera définitivement supprimée.</p>
            <div className="flex gap-3">
              <button onClick={() => setDelModal(null)}
                className="flex-1 py-3 border border-border text-foreground font-bold rounded-xl hover:bg-muted transition-colors">
                Annuler
              </button>
              <button onClick={() => { removeListing(delModal); setDelModal(null); }}
                className="flex-1 py-3 bg-dz-red text-white font-bold rounded-xl hover:bg-dz-red/90 transition-colors">
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
