/**
 * Page Backoffice Modération — accessible via /moderation
 * Affiche la file d'attente, les métriques et le feedback loop.
 * En production : protéger par rôle admin.
 */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck, Ban, Clock, BarChart2, RefreshCw,
  CheckCircle2, XCircle, MessageSquare, Filter, Download,
  AlertTriangle, TrendingUp, ChevronLeft,
} from 'lucide-react';
import {
  getModerationQueue, getModerationMetrics, resolveModeration,
  exportFeedbackDataset, ModerationQueueItem, ModerationFlag,
} from '../services/ModerationService';

const FLAG_LABELS: Partial<Record<ModerationFlag, string>> = {
  alcohol:'Alcool', pork:'Porc', drugs:'Drogues', gambling:'Jeux d\'argent',
  riba_usury:'Riba/Usure', blasphemy:'Blasphème', scam:'Arnaque',
  mlm_pyramid:'MLM/Pyramide', fast_money:'Argent facile', fake_job:'Faux emploi',
  advance_fee:'Avance financière', dating:'Rencontre', adult_content:'Contenu adulte',
  escort:'Escort', suggestive:'Suggestif', politics:'Politique',
  piracy:'Piratage', protected_animal:'Animal protégé', spam:'Spam',
  incomplete:'Incomplet', wrong_category:'Mauvaise catégorie', suspicious:'Suspect',
  img_adult:'Image adulte', img_violence:'Image violente', img_irrelevant:'Image hors-sujet',
};

const ACTION_COLORS = {
  publish:       'bg-dz-green/10 text-dz-green border-dz-green/20',
  manual_review: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  reject:        'bg-dz-red/10 text-dz-red border-dz-red/20',
};
const STATUS_COLORS = {
  pending:               'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  approved:              'bg-dz-green/10 text-dz-green',
  rejected:              'bg-dz-red/10 text-dz-red',
  correction_requested:  'bg-blue-500/10 text-blue-600 dark:text-blue-400',
};

const ModerationPage: React.FC = () => {
  const [tab,       setTab]       = useState<'queue' | 'metrics'>('queue');
  const [filter,    setFilter]    = useState<'pending' | 'all'>('pending');
  const [selected,  setSelected]  = useState<ModerationQueueItem | null>(null);
  const [note,      setNote]      = useState('');
  const [queue,     setQueue]     = useState<ModerationQueueItem[]>([]);
  const [metrics,   setMetrics]   = useState(getModerationMetrics());
  const [refreshKey,setRefresh]   = useState(0);

  useEffect(() => {
    setQueue(getModerationQueue(filter === 'pending' ? 'pending' : undefined));
    setMetrics(getModerationMetrics());
  }, [filter, refreshKey]);

  const handle = (decision: 'approved' | 'rejected' | 'correction_requested') => {
    if (!selected) return;
    resolveModeration(selected.id, decision, note, 'admin_user');
    setSelected(null);
    setNote('');
    setRefresh(k => k + 1);
  };

  const exportDataset = () => {
    const data = exportFeedbackDataset();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `moderation_feedback_${Date.now()}.json`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-background pb-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="p-2 hover:bg-muted rounded-xl text-muted-foreground">
              <ChevronLeft size={18} />
            </Link>
            <div>
              <h1 className="text-xl font-black text-foreground flex items-center gap-2">
                <ShieldCheck size={20} className="text-dz-green" /> Backoffice Modération
              </h1>
              <p className="text-xs text-muted-foreground">Le Fennec DZ Market — Système IA</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setRefresh(k => k + 1)}
              className="p-2 hover:bg-muted rounded-xl text-muted-foreground" title="Actualiser">
              <RefreshCw size={16} />
            </button>
            <button onClick={exportDataset}
              className="flex items-center gap-1.5 px-3 py-2 bg-muted hover:bg-muted-foreground/20 rounded-xl text-xs font-semibold text-foreground">
              <Download size={14} /> Export dataset
            </button>
          </div>
        </div>

        {/* Stats rapides */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'En attente',  val: queue.filter(i => i.status === 'pending').length, Icon: Clock,        color: 'text-amber-600' },
            { label: 'Approuvées', val: metrics.published,     Icon: CheckCircle2, color: 'text-dz-green' },
            { label: 'Rejetées',   val: metrics.rejected,      Icon: XCircle,      color: 'text-dz-red'   },
            { label: 'FP (humain override)', val: metrics.falsePositives, Icon: AlertTriangle, color: 'text-blue-600' },
          ].map(k => (
            <div key={k.label} className="bg-card border border-border rounded-2xl p-4">
              <k.Icon size={16} className={k.color + ' mb-2'} />
              <div className={`text-2xl font-black ${k.color}`}>{k.val}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{k.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-card border border-border rounded-2xl p-1.5 w-fit">
          {[
            { id:'queue',   Icon: Filter,   label: `File (${queue.filter(i=>i.status==='pending').length})` },
            { id:'metrics', Icon: BarChart2, label: 'Métriques' },
          ].map(({ id, Icon, label }) => (
            <button key={id} onClick={() => setTab(id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all
                ${tab === id ? 'bg-dz-green text-white shadow-sm' : 'text-muted-foreground hover:bg-muted'}`}>
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>

        {/* ── File de modération ── */}
        {tab === 'queue' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Liste */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <select value={filter} onChange={e => setFilter(e.target.value as any)}
                  className="bg-muted border border-border rounded-xl px-3 py-1.5 text-xs outline-none cursor-pointer">
                  <option value="pending">En attente seulement</option>
                  <option value="all">Toutes</option>
                </select>
                <span className="text-xs text-muted-foreground">{queue.length} annonce(s)</span>
              </div>

              {queue.length === 0 ? (
                <div className="bg-card border border-border rounded-2xl p-10 text-center">
                  <CheckCircle2 size={32} className="text-dz-green mx-auto mb-3 opacity-50" />
                  <p className="text-sm font-semibold text-foreground">File vide !</p>
                  <p className="text-xs text-muted-foreground mt-1">Aucune annonce en attente de révision.</p>
                </div>
              ) : queue.map(item => (
                <button key={item.id} onClick={() => setSelected(item)}
                  className={`w-full bg-card border rounded-2xl p-4 text-left transition-all hover:shadow-card
                    ${selected?.id === item.id ? 'border-dz-green ring-1 ring-dz-green/20' : 'border-border'}`}>
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <p className="font-semibold text-sm text-foreground line-clamp-1">{item.title || 'Sans titre'}</p>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${STATUS_COLORS[item.status]}`}>
                      {item.status === 'pending' ? 'En attente' : item.status === 'approved' ? 'Approuvé' : item.status === 'rejected' ? 'Rejeté' : 'Correction'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {item.aiResult.flags.slice(0, 4).map(f => (
                      <span key={f} className="text-[9px] font-bold px-1.5 py-0.5 bg-dz-red/10 text-dz-red rounded-md">
                        {FLAG_LABELS[f] || f}
                      </span>
                    ))}
                    {item.aiResult.flags.length > 4 && (
                      <span className="text-[9px] text-muted-foreground">+{item.aiResult.flags.length - 4}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>Confiance IA: <strong className={item.aiResult.confidence > 0.7 ? 'text-dz-green' : 'text-amber-600'}>{Math.round(item.aiResult.confidence * 100)}%</strong></span>
                    <span className={`px-2 py-0.5 rounded-full border text-[9px] font-bold ${ACTION_COLORS[item.aiResult.action]}`}>
                      IA: {item.aiResult.action === 'publish' ? 'Publier' : item.aiResult.action === 'manual_review' ? 'Révision' : 'Rejeter'}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* Détail + actions */}
            {selected ? (
              <div className="bg-card border border-border rounded-2xl p-5 sticky top-20 space-y-4 h-fit">
                <div className="flex justify-between items-start">
                  <h3 className="font-black text-foreground">Révision manuelle</h3>
                  <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground text-lg leading-none">✕</button>
                </div>

                <div className="bg-muted rounded-xl p-3 space-y-2">
                  <p className="font-bold text-sm text-foreground">{selected.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-4">{selected.description}</p>
                  <div className="flex gap-2 text-xs text-muted-foreground">
                    <span>📁 {selected.category}</span>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Analyse IA</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Confiance</span>
                      <span className="font-bold">{Math.round(selected.aiResult.confidence * 100)}%</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-dz-green rounded-full" style={{ width: `${selected.aiResult.confidence * 100}%` }} />
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {selected.aiResult.flags.map(f => (
                        <span key={f} className="text-[9px] font-bold px-1.5 py-0.5 bg-dz-red/10 text-dz-red rounded-md">
                          {FLAG_LABELS[f] || f}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-xl p-3 text-xs text-amber-800 dark:text-amber-300">
                  <p className="font-bold mb-1">Message IA (FR)</p>
                  <p>{selected.aiResult.message_fr}</p>
                  {selected.aiResult.suggestion_fr && (
                    <p className="mt-1 text-amber-600 dark:text-amber-400">💡 {selected.aiResult.suggestion_fr}</p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase block mb-1.5">Note du modérateur</label>
                  <textarea value={note} onChange={e => setNote(e.target.value)} rows={2}
                    placeholder="Raison de la décision (pour logs et apprentissage)…"
                    className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-xs outline-none focus:border-dz-green resize-none" />
                </div>

                {selected.status === 'pending' && (
                  <div className="flex gap-2">
                    <button onClick={() => handle('approved')}
                      className="flex-1 py-2.5 bg-dz-green text-white font-bold text-sm rounded-xl flex items-center justify-center gap-1.5 hover:bg-dz-green2 transition-colors">
                      <CheckCircle2 size={14} /> Approuver
                    </button>
                    <button onClick={() => handle('correction_requested')}
                      className="flex-1 py-2.5 bg-amber-500 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-1.5 hover:bg-amber-600 transition-colors">
                      <MessageSquare size={14} /> Correction
                    </button>
                    <button onClick={() => handle('rejected')}
                      className="flex-1 py-2.5 bg-dz-red text-white font-bold text-sm rounded-xl flex items-center justify-center gap-1.5 hover:bg-dz-red/90 transition-colors">
                      <Ban size={14} /> Rejeter
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-card border border-dashed border-border rounded-2xl p-10 text-center text-muted-foreground h-fit">
                <Filter size={24} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">Sélectionnez une annonce pour la réviser</p>
              </div>
            )}
          </div>
        )}

        {/* ── Métriques ── */}
        {tab === 'metrics' && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label:'Total analysé',      val:metrics.totalAnalyzed,     Icon:TrendingUp,   color:'text-blue-600' },
                { label:'Faux positifs (IA)', val:metrics.falsePositives,    Icon:AlertTriangle,color:'text-amber-600' },
                { label:'Faux négatifs (IA)', val:metrics.falseNegatives,    Icon:AlertTriangle,color:'text-dz-red' },
              ].map(k => (
                <div key={k.label} className="bg-card border border-border rounded-2xl p-5">
                  <k.Icon size={18} className={k.color + ' mb-3'} />
                  <div className={`text-3xl font-black ${k.color}`}>{k.val}</div>
                  <div className="text-sm text-foreground font-semibold mt-1">{k.label}</div>
                </div>
              ))}
            </div>

            {/* Top flags */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="font-black text-foreground mb-4 text-sm">Flags les plus fréquents</h3>
              {Object.entries(metrics.flagCounts)
                .sort(([,a],[,b]) => b - a)
                .slice(0, 8)
                .map(([flag, count]) => (
                  <div key={flag} className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-semibold text-foreground w-36 truncate">{FLAG_LABELS[flag as ModerationFlag] || flag}</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-dz-red rounded-full transition-all"
                        style={{ width: `${(count / (metrics.totalAnalyzed || 1)) * 100}%` }} />
                    </div>
                    <span className="text-xs font-bold text-dz-red w-8 text-right">{count}</span>
                  </div>
                ))
              }
              {Object.keys(metrics.flagCounts).length === 0 && (
                <p className="text-sm text-muted-foreground">Aucune donnée disponible. Les métriques s'alimentent lors de la soumission d'annonces.</p>
              )}
            </div>

            <div className="bg-dz-green/5 border border-dz-green/20 rounded-2xl p-4 text-sm text-muted-foreground">
              <p className="font-bold text-foreground mb-2 flex items-center gap-2">
                <Download size={14} className="text-dz-green" /> Dataset d'apprentissage
              </p>
              <p className="text-xs leading-relaxed">
                Chaque fois qu'un modérateur contredit la décision IA, l'entrée est loggée dans un dataset JSON.
                Ce dataset peut servir au fine-tuning d'un modèle de classification futur.
              </p>
              <button onClick={exportDataset}
                className="mt-3 flex items-center gap-2 px-4 py-2 bg-dz-green text-white font-bold text-xs rounded-xl hover:bg-dz-green2 transition-colors">
                <Download size={12} /> Exporter le dataset JSON
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModerationPage;
