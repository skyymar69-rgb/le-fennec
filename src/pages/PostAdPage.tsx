import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, Upload, X, Camera,
  Loader2, Wand2, CheckCircle2, Sparkles, AlertTriangle,
  MapPin, Tag, Info, Zap, TrendingUp,
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useApp }      from '../contexts/AppContext';
import { CATEGORIES }  from '../data/categories';
import { WILAYAS }     from '../data/wilayas';
import AutocompleteInput from '../components/ui/AutocompleteInput';
import CategoryFormRouter from '../components/forms/CategoryFormRouter';
import { QUARTIERS }   from '../lib/formData';
import { moderateListing } from '../services/ModerationService';
import { useAISuggestions } from '../lib/useAISuggestions';
import type { Listing } from '../types';

const STEPS = ['category','details','location','contact','review'] as const;
type Step = typeof STEPS[number];

interface FormData {
  categoryId:  string;
  category:    string;
  categoryName:string;
  title:       string;
  description: string;
  price:       string;
  priceType:   'fixed'|'negotiable'|'free'|'contact';
  condition:   string;
  wilayaId:    string;
  wilayaName:  string;
  commune:     string;
  phone:       string;
  whatsapp:    boolean;
  images:      string[];
  attributes:  Record<string,string>;
}

const INIT: FormData = {
  categoryId:'', category:'', categoryName:'',
  title:'', description:'', price:'', priceType:'fixed',
  condition:'good', wilayaId:'', wilayaName:'', commune:'',
  phone:'', whatsapp:true, images:[], attributes:{},
};

// ── Quality meter ──────────────────────────────────────────────────────────
function qualityScore(f: FormData): number {
  let s = 0;
  if (f.categoryId) s += 10;
  if (f.title.length > 15) s += 15;
  if (f.title.length > 40) s += 5;
  if (f.description.length > 80) s += 15;
  if (f.description.length > 200) s += 10;
  if (f.price || f.priceType !== 'fixed') s += 10;
  if (f.wilayaId) s += 10;
  if (f.commune) s += 5;
  if (f.images.length >= 1) s += 10;
  if (f.images.length >= 3) s += 5;
  if (f.phone) s += 5;
  const filled = Object.values(f.attributes).filter(v=>v).length;
  if (filled >= 2) s += 10;
  if (filled >= 5) s += 5;
  return Math.min(s, 100);
}

// ── Main component ─────────────────────────────────────────────────────────
const PostAdPage: React.FC = () => {
  const { t, language }      = useLanguage();
  const { user, addListing } = useApp();
  const navigate             = useNavigate();

  const [step,     setStep]    = useState<Step>('category');
  const [form,     setForm]    = useState<FormData>(INIT);
  const [done,     setDone]    = useState(false);
  const [modWarn,  setModWarn] = useState<string|null>(null);
  const [modLoading, setModLoading] = useState(false);
  const [formReady, setFormReady]   = useState(false);

  const { loading: aiLoading, suggestion: aiSug, suggest, clear: clearAI } = useAISuggestions();

  const stepIdx  = STEPS.indexOf(step);
  const progress = ((stepIdx + 1) / STEPS.length) * 100;
  const quality  = qualityScore(form);
  const cat      = CATEGORIES.find(c => c.id === form.categoryId);
  const catName  = (c: typeof CATEGORIES[0]) =>
    language === 'ar' ? c.nameAr : language === 'en' ? c.nameEn : c.nameFr;

  const quartiers = form.wilayaId ? (QUARTIERS[form.wilayaId] || []) : [];
  const communes  = quartiers.length
    ? quartiers
    : ['Centre-ville','Commune nord','Commune sud','Zone industrielle'];

  const set = (u: Partial<FormData>) => setForm(p => ({ ...p, ...u }));
  const setAttr = (k: string, v: string) => set({ attributes: { ...form.attributes, [k]: v } });

  // AI trigger when attributes change
  useEffect(() => {
    if (!form.categoryId || !cat) return;
    const hasEnough = Object.values(form.attributes).filter(Boolean).length >= 2;
    if (hasEnough) suggest(catName(cat), form.attributes, { title: form.title, description: form.description });
  }, [form.attributes, form.categoryId]);

  const applyAI = () => {
    if (!aiSug) return;
    set({
      title:       aiSug.title,
      description: aiSug.description,
      price:       aiSug.price ? String(aiSug.price) : form.price,
    });
    clearAI();
  };

  const handlePublish = async () => {
    setModLoading(true);
    const result = await moderateListing(form.title, form.description, form.category, form.wilayaName);
    setModLoading(false);

    if (result.action === 'reject') {
      setModWarn(result.message_fr);
      return;
    }

    const wil = WILAYAS.find(w => w.code === form.wilayaId);
    const listing: Listing = {
      id:          Date.now().toString(),
      title:       form.title,
      slug:        form.title.toLowerCase().replace(/[^a-z0-9]+/g,'-')+'-'+Date.now(),
      price:       form.priceType === 'free' ? 0 : parseInt(form.price) || 0,
      currency:    'DZD',
      negotiable:  form.priceType === 'negotiable',
      location:    wil ? (language==='ar'?wil.nameAr:wil.nameFr) : form.wilayaName,
      wilayaId:    form.wilayaId,
      wilayaName:  wil?.nameFr || form.wilayaName,
      commune:     form.commune,
      imageUrl:    form.images[0] || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&q=80',
      images:      form.images.length ? form.images : ['https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&q=80'],
      category:    form.category,
      categoryId:  form.categoryId,
      condition:   form.condition as any,
      date:        "Aujourd'hui",
      timestamp:   Date.now(),
      views:       0,
      description: form.description,
      attributes:  form.attributes,
      status:      result.action === 'manual_review' ? 'pending' : 'active',
      userId:      user?.id || 'demo',
      phone:       form.phone,
      whatsapp:    form.whatsapp,
      ranking: {
        trustScore:   user?.trustScore || 30,
        qualityScore: quality,
        clickRate:    0,
        boostLevel:   0,
      },
    };

    await addListing(listing);
    setDone(true);
  };

  // ── Success ───────────────────────────────────────────────────────────
  if (done) return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="bg-card border border-border rounded-3xl p-10 max-w-md w-full text-center shadow-2xl animate-fade-up space-y-5">
        <div className="w-20 h-20 bg-dz-green/10 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 size={44} className="text-dz-green"/>
        </div>
        <div>
          <h2 className="text-2xl font-black text-foreground mb-2">🎉 Annonce publiée !</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Votre annonce est en ligne. Elle recevra des contacts dans les prochaines heures.
          </p>
        </div>
        {quality < 70 && (
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-xl p-3 text-xs text-amber-700 dark:text-amber-400 text-left">
            💡 <strong>Conseil :</strong> Ajoutez plus de photos et de détails pour multiplier vos contacts par 5.
          </div>
        )}
        <div className="space-y-2.5">
          {user ? (
            <Link to="/dashboard" className="flex items-center justify-center w-full py-3.5 bg-dz-green text-white font-black rounded-2xl shadow-brand-md hover:bg-dz-green2 transition-colors">
              📊 Voir mes annonces
            </Link>
          ) : (
            <Link to="/auth" className="flex items-center justify-center w-full py-3.5 bg-dz-green text-white font-black rounded-2xl shadow-brand-md hover:bg-dz-green2 transition-colors">
              Créer un compte pour gérer mes annonces
            </Link>
          )}
          <Link to="/boost" className="flex items-center justify-center gap-2 w-full py-3 border border-dz-green text-dz-green font-bold rounded-2xl hover:bg-dz-green/5 transition-colors">
            <Zap size={16}/> Booster cette annonce
          </Link>
          <button onClick={() => { setDone(false); setStep('category'); setForm(INIT); clearAI(); setModWarn(null); }}
            className="w-full py-3 border border-border text-muted-foreground font-semibold rounded-2xl hover:bg-muted transition-colors">
            Déposer une autre annonce
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/30 pb-20">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">

        {/* ── Header + progress ── */}
        <div className="bg-card border border-border rounded-2xl p-4 sticky top-14 z-20 shadow-card">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-base font-black text-foreground">Déposer une annonce</h1>
            <span className="text-sm font-bold text-dz-green">
              {stepIdx+1} / {STEPS.length}
            </span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-2">
            <div className="h-full bg-dz-green rounded-full transition-all duration-500" style={{width:`${progress}%`}}/>
          </div>

          {/* Quality bar */}
          {stepIdx > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-300 ${
                  quality >= 80 ? 'bg-dz-green' : quality >= 50 ? 'bg-amber-500' : 'bg-dz-red'
                }`} style={{width:`${quality}%`}}/>
              </div>
              <span className={`text-[10px] font-bold whitespace-nowrap ${
                quality >= 80 ? 'text-dz-green' : quality >= 50 ? 'text-amber-500' : 'text-dz-red'
              }`}>
                {quality < 50 ? '⚠️ Faible' : quality < 80 ? '👍 Moyen' : '⭐ Excellent'} ({quality}%)
              </span>
            </div>
          )}
        </div>

        {/* ══ STEP 1 — CATEGORY ═══════════════════════════════════════════ */}
        {step === 'category' && (
          <div className="space-y-4 animate-fade-up">
            <div className="bg-card border border-border rounded-2xl p-2 shadow-card">
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                {CATEGORIES.map(cat => (
                  <button key={cat.id}
                    onClick={() => { set({ category: catName(cat), categoryId: cat.id, categoryName: catName(cat), attributes: {} }); setStep('details'); }}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all hover:shadow-sm ${
                      form.categoryId === cat.id
                        ? 'border-dz-green bg-dz-green/5'
                        : 'border-transparent hover:border-dz-green/30 hover:bg-muted/50'
                    }`}>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                      style={{ background: cat.color + '18' }}>
                      {cat.icon}
                    </div>
                    <span className="text-[10px] font-bold text-foreground text-center leading-tight">
                      {catName(cat)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══ STEP 2 — DETAILS ════════════════════════════════════════════ */}
        {step === 'details' && (
          <div className="space-y-4 animate-fade-up">
            <div className="flex items-center gap-2">
              <button onClick={() => setStep('category')} className="p-2 hover:bg-muted rounded-xl">
                <ChevronLeft size={18}/>
              </button>
              <div className="flex items-center gap-2">
                <span className="text-xl">{cat?.icon}</span>
                <h2 className="font-black text-foreground">{form.categoryName}</h2>
              </div>
            </div>

            {/* ── AI Suggestion banner ── */}
            {(aiLoading || aiSug) && (
              <div className={`rounded-2xl border p-4 ${aiSug ? 'bg-dz-green/5 border-dz-green/20' : 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/40'}`}>
                {aiLoading ? (
                  <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                    <Loader2 size={14} className="animate-spin shrink-0"/>
                    L'IA analyse vos caractéristiques et prépare une suggestion…
                  </div>
                ) : aiSug && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Sparkles size={14} className="text-dz-green"/>
                      <span className="font-bold text-sm text-dz-green">Suggestion IA générée</span>
                      {aiSug.priceMin && (
                        <span className="text-xs text-muted-foreground ml-auto bg-muted px-2 py-0.5 rounded-full">
                          Prix marché : {aiSug.priceMin.toLocaleString()}–{aiSug.priceMax?.toLocaleString()} DA
                        </span>
                      )}
                    </div>
                    <div className="bg-card rounded-xl p-3 text-sm">
                      <p className="font-bold text-foreground mb-1">{aiSug.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-3">{aiSug.description}</p>
                    </div>
                    {aiSug.tips && (
                      <div className="flex flex-wrap gap-1.5">
                        {aiSug.tips.map((tip,i) => (
                          <span key={i} className="text-[10px] text-dz-green bg-dz-green/10 px-2 py-0.5 rounded-full font-medium">
                            💡 {tip}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <button onClick={applyAI}
                        className="flex-1 py-2 bg-dz-green text-white font-bold text-sm rounded-xl hover:bg-dz-green2 transition-colors">
                        ✓ Appliquer la suggestion
                      </button>
                      <button onClick={clearAI}
                        className="px-4 py-2 border border-border text-muted-foreground font-bold text-sm rounded-xl hover:bg-muted transition-colors">
                        Ignorer
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Category-specific form ── */}
            <div className="bg-card border border-border rounded-2xl p-5 shadow-card">
              <h3 className="text-sm font-black text-foreground mb-4 flex items-center gap-2">
                <Tag size={14} className="text-dz-green"/>
                Caractéristiques {form.categoryName}
              </h3>
              <CategoryFormRouter
                categoryId={form.categoryId}
                attrs={form.attributes}
                onChange={setAttr}
                wilayaId={form.wilayaId}
                language={language}
                onReady={setFormReady}
              />
            </div>

            {/* ── Title ── */}
            <div className="bg-card border border-border rounded-2xl p-5 shadow-card">
              <h3 className="text-sm font-black text-foreground mb-4">Titre & Prix</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                      Titre de l'annonce <span className="text-dz-red">*</span>
                    </label>
                    <span className="text-[10px] text-muted-foreground">{form.title.length}/80</span>
                  </div>
                  <input type="text" value={form.title} maxLength={80}
                    onChange={e => set({title:e.target.value})}
                    placeholder={cat?.placeholders?.title?.[language as 'fr'|'ar'|'en'] || 'Titre accrocheur…'}
                    className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-dz-green transition-all"/>
                  {form.title.length > 0 && form.title.length < 20 && (
                    <p className="text-[10px] text-amber-600 mt-1">💡 Un titre plus long reçoit 3× plus de clics</p>
                  )}
                </div>

                {/* Price */}
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">Prix</label>
                  <div className="grid grid-cols-4 gap-1.5 mb-2">
                    {[
                      {id:'fixed',      label:'Prix fixe'},
                      {id:'negotiable', label:'Négociable'},
                      {id:'free',       label:'Gratuit 🎁'},
                      {id:'contact',    label:'Sur contact'},
                    ].map(opt => (
                      <button key={opt.id} type="button"
                        onClick={() => set({priceType: opt.id as any})}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                          form.priceType===opt.id ? 'bg-dz-green text-white border-dz-green' : 'bg-muted border-border text-muted-foreground hover:border-dz-green/40'
                        }`}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  {(form.priceType==='fixed'||form.priceType==='negotiable') && (
                    <div className="relative">
                      <input type="number" min="0" step="1000"
                        value={form.price}
                        onChange={e => set({price:e.target.value})}
                        placeholder="Ex: 45 000 000"
                        className="w-full bg-muted border border-border rounded-xl px-4 py-3 pr-14 text-sm outline-none focus:border-dz-green"/>
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">DA</span>
                    </div>
                  )}
                  {form.price === '1' && (
                    <p className="text-xs text-amber-600 mt-1">⚠️ Prix de 1 DA peu crédible. Mettez le vrai prix ou choisissez "Gratuit".</p>
                  )}
                  {aiSug?.priceMin && form.priceType !== 'free' && (
                    <button onClick={() => set({price:String(aiSug.price)})}
                      className="mt-1.5 text-xs text-dz-green hover:underline font-medium flex items-center gap-1">
                      <TrendingUp size={11}/>
                      Prix marché suggéré : {aiSug.price?.toLocaleString()} DA
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* ── Description ── */}
            <div className="bg-card border border-border rounded-2xl p-5 shadow-card">
              <div className="flex justify-between items-center mb-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                  Description <span className="text-dz-red">*</span>
                </label>
                {!aiLoading && (
                  <button type="button"
                    onClick={() => suggest(catName(cat!), form.attributes, {title:form.title})}
                    disabled={!form.categoryId}
                    className="flex items-center gap-1.5 text-xs font-bold text-white bg-dz-green px-3 py-1 rounded-full disabled:opacity-40 hover:bg-dz-green2 transition-colors">
                    <Wand2 size={11}/> Générer avec l'IA
                  </button>
                )}
              </div>
              <textarea rows={6} value={form.description}
                onChange={e => set({description:e.target.value})}
                placeholder={cat?.placeholders?.description?.[language as 'fr'|'ar'|'en'] || 'Décrivez votre annonce en détail…\n• État, caractéristiques principales\n• Points forts\n• Raison de la vente'}
                className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-dz-green resize-none transition-all leading-relaxed"/>
              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-muted-foreground">{form.description.length} caractères</span>
                {form.description.length > 0 && form.description.length < 100 && (
                  <span className="text-[10px] text-amber-600">Visez au moins 150 caractères</span>
                )}
              </div>
            </div>

            {/* ── Photos ── */}
            <div className="bg-card border border-border rounded-2xl p-5 shadow-card">
              <div className="flex items-center gap-2 mb-3">
                <Camera size={14} className="text-dz-green"/>
                <h3 className="text-sm font-black text-foreground">Photos</h3>
                <span className="text-xs text-muted-foreground ml-auto">{form.images.length}/10</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {form.images.map((img,i) => (
                  <div key={i} className="aspect-square rounded-xl overflow-hidden relative group">
                    <img src={img} alt="" className="w-full h-full object-cover"/>
                    {i===0 && <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[8px] text-center py-0.5 font-bold">PRINCIPALE</div>}
                    <button onClick={() => set({images:form.images.filter((_,j)=>j!==i)})}
                      className="absolute top-1 right-1 w-5 h-5 bg-black/60 hover:bg-dz-red text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                      <X size={10}/>
                    </button>
                  </div>
                ))}
                {form.images.length < 10 && (
                  <label className="aspect-square rounded-xl border-2 border-dashed border-border hover:border-dz-green hover:bg-dz-green/5 flex flex-col items-center justify-center cursor-pointer gap-1 transition-all">
                    <Upload size={18} className="text-muted-foreground"/>
                    <span className="text-[9px] text-muted-foreground font-medium">Ajouter</span>
                    <input type="file" accept="image/*" multiple className="hidden"
                      onChange={e => {
                        const files = Array.from(e.target.files || []);
                        const urls  = files.map(f => URL.createObjectURL(f));
                        set({images:[...form.images,...urls].slice(0,10)});
                      }}/>
                  </label>
                )}
              </div>
              {form.images.length === 0 && (
                <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                  <Info size={11}/> Les annonces avec photos reçoivent 5× plus de contacts
                </p>
              )}
            </div>

            {/* ── Moderation warning ── */}
            {modWarn && (
              <div className="bg-dz-red/5 border border-dz-red/20 rounded-2xl p-4 flex items-start gap-3">
                <AlertTriangle size={18} className="text-dz-red shrink-0 mt-0.5"/>
                <div>
                  <p className="font-bold text-dz-red text-sm mb-1">Annonce refusée par la modération IA</p>
                  <p className="text-xs text-muted-foreground">{modWarn}</p>
                </div>
              </div>
            )}

            <button
              onClick={() => setStep('location')}
              disabled={!form.title || !form.description || form.description.length < 30}
              className="w-full py-4 bg-foreground text-background font-black rounded-2xl transition-all hover:-translate-y-0.5 disabled:opacity-40 disabled:translate-y-0 flex items-center justify-center gap-2 shadow-sm">
              Continuer <ChevronRight size={18}/>
            </button>
          </div>
        )}

        {/* ══ STEP 3 — LOCATION ═══════════════════════════════════════════ */}
        {step === 'location' && (
          <div className="space-y-4 animate-fade-up">
            <div className="flex items-center gap-2">
              <button onClick={() => setStep('details')} className="p-2 hover:bg-muted rounded-xl"><ChevronLeft size={18}/></button>
              <h2 className="font-black text-foreground flex items-center gap-2"><MapPin size={16} className="text-dz-green"/> Localisation</h2>
            </div>

            <div className="bg-card border border-border rounded-2xl p-5 shadow-card space-y-4">
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">
                  Wilaya <span className="text-dz-red">*</span>
                </label>
                <select value={form.wilayaId}
                  onChange={e => {
                    const w = WILAYAS.find(x=>x.code===e.target.value);
                    set({ wilayaId:e.target.value, wilayaName:language==='ar'?w?.nameAr||'':language==='en'?w?.nameEn||'':w?.nameFr||'', commune:'' });
                  }}
                  className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-dz-green cursor-pointer">
                  <option value="">Sélectionnez la wilaya…</option>
                  {WILAYAS.map(w => (
                    <option key={w.code} value={w.code}>
                      {w.code} — {language==='ar'?w.nameAr:language==='en'?w.nameEn:w.nameFr}
                    </option>
                  ))}
                </select>
              </div>

              <AutocompleteInput
                label="Quartier / Commune"
                value={form.commune}
                onChange={v => set({commune:v})}
                suggestions={communes}
                placeholder="Ex: Hydra, Bab Ezzouar…"
                icon={<MapPin size={13}/>}
              />

              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">Adresse précise (optionnel)</label>
                <input type="text" value={form.attributes.address||''} onChange={e=>setAttr('address',e.target.value)}
                  placeholder="Ex: Rue des Frères Chibane, en face de la mosquée"
                  className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-dz-green"/>
              </div>
            </div>

            <button onClick={() => setStep('contact')} disabled={!form.wilayaId}
              className="w-full py-4 bg-foreground text-background font-black rounded-2xl disabled:opacity-40 flex items-center justify-center gap-2 shadow-sm hover:-translate-y-0.5 transition-all">
              Continuer <ChevronRight size={18}/>
            </button>
          </div>
        )}

        {/* ══ STEP 4 — CONTACT ════════════════════════════════════════════ */}
        {step === 'contact' && (
          <div className="space-y-4 animate-fade-up">
            <div className="flex items-center gap-2">
              <button onClick={() => setStep('location')} className="p-2 hover:bg-muted rounded-xl"><ChevronLeft size={18}/></button>
              <h2 className="font-black text-foreground">Contact</h2>
            </div>

            <div className="bg-card border border-border rounded-2xl p-5 shadow-card space-y-4">
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">
                  Téléphone <span className="text-dz-red">*</span>
                </label>
                <input type="tel" value={form.phone} onChange={e=>set({phone:e.target.value})}
                  placeholder="Ex: 0550 12 34 56"
                  defaultValue={user?.phone || ''}
                  className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-dz-green"/>
              </div>

              <div className="flex flex-col gap-3">
                {[
                  {key:'whatsapp', label:'Activer WhatsApp', sub:'Les acheteurs peuvent vous contacter directement via WhatsApp'},
                ].map(o => (
                  <label key={o.key} className="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-muted transition-colors">
                    <div className={`w-10 h-6 rounded-full transition-all relative ${form[o.key as keyof FormData] ? 'bg-dz-green' : 'bg-muted-foreground/30'}`}
                      onClick={() => set({[o.key]:!form[o.key as keyof FormData]} as any)}>
                      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${form[o.key as keyof FormData] ? 'left-4' : 'left-0.5'}`}/>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{o.label}</p>
                      <p className="text-xs text-muted-foreground">{o.sub}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <button onClick={() => setStep('review')} disabled={!form.phone}
              className="w-full py-4 bg-foreground text-background font-black rounded-2xl disabled:opacity-40 flex items-center justify-center gap-2 shadow-sm hover:-translate-y-0.5 transition-all">
              Aperçu avant publication <ChevronRight size={18}/>
            </button>
          </div>
        )}

        {/* ══ STEP 5 — REVIEW ═════════════════════════════════════════════ */}
        {step === 'review' && (
          <div className="space-y-4 animate-fade-up">
            <div className="flex items-center gap-2">
              <button onClick={() => setStep('contact')} className="p-2 hover:bg-muted rounded-xl"><ChevronLeft size={18}/></button>
              <h2 className="font-black text-foreground">Aperçu de l'annonce</h2>
            </div>

            {/* Preview card */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-card">
              {form.images[0] && (
                <div className="relative h-52">
                  <img src={form.images[0]} alt="" className="w-full h-full object-cover"/>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"/>
                  {form.images.length > 1 && (
                    <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                      📷 {form.images.length} photos
                    </div>
                  )}
                </div>
              )}
              <div className="p-5 space-y-3">
                <div className="flex justify-between items-start gap-3">
                  <h3 className="font-black text-foreground text-base leading-snug flex-1">{form.title || 'Titre de l\'annonce'}</h3>
                  <p className="text-xl font-black text-dz-green shrink-0">
                    {form.priceType==='free' ? '🎁 Gratuit' : form.priceType==='contact' ? 'Sur contact' : `${parseInt(form.price||'0').toLocaleString()} DA`}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">{form.description}</p>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground pt-1 border-t border-border">
                  <span>📁 {form.categoryName}</span>
                  {form.wilayaName && <span>📍 {form.wilayaName}{form.commune && ` · ${form.commune}`}</span>}
                  {form.phone && <span>📞 {form.phone}</span>}
                </div>

                {/* Quality score */}
                <div className="flex items-center gap-2 pt-1">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${quality>=80?'bg-dz-green':quality>=50?'bg-amber-500':'bg-dz-red'}`}
                      style={{width:`${quality}%`}}/>
                  </div>
                  <span className={`text-xs font-bold ${quality>=80?'text-dz-green':quality>=50?'text-amber-500':'text-dz-red'}`}>
                    {quality >= 80 ? '⭐ Excellente annonce' : quality >= 50 ? '👍 Bonne annonce' : '⚠️ À améliorer'} ({quality}%)
                  </span>
                </div>
              </div>
            </div>

            {/* Tips to improve */}
            {quality < 80 && (
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40 rounded-2xl p-4">
                <p className="text-xs font-bold text-blue-700 dark:text-blue-300 mb-2 flex items-center gap-1.5">
                  <Info size={12}/> Améliorez votre annonce pour plus de contacts :
                </p>
                <ul className="space-y-1 text-xs text-blue-600 dark:text-blue-400">
                  {form.title.length < 30 && <li>• Allongez le titre (actuellement {form.title.length} chars, visez 50+)</li>}
                  {form.description.length < 150 && <li>• Description trop courte ({form.description.length} chars, visez 200+)</li>}
                  {form.images.length === 0 && <li>• ⭐ Ajoutez au moins 3 photos (×5 de contacts)</li>}
                  {form.images.length < 3 && form.images.length > 0 && <li>• Ajoutez {3-form.images.length} photo(s) de plus</li>}
                  {!form.commune && <li>• Précisez le quartier/commune</li>}
                </ul>
              </div>
            )}

            {modWarn && (
              <div className="bg-dz-red/5 border border-dz-red/20 rounded-2xl p-4 flex items-start gap-3">
                <AlertTriangle size={16} className="text-dz-red shrink-0"/>
                <div>
                  <p className="font-bold text-dz-red text-sm">Annonce refusée</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{modWarn}</p>
                  <button onClick={() => setStep('details')} className="text-xs text-dz-green underline mt-1">Modifier l'annonce</button>
                </div>
              </div>
            )}

            <button onClick={handlePublish}
              disabled={modLoading || !!modWarn}
              className="w-full py-4 bg-dz-green hover:bg-dz-green2 text-white font-black text-base rounded-2xl shadow-brand-lg transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2">
              {modLoading
                ? <><Loader2 size={18} className="animate-spin"/> Analyse IA en cours…</>
                : <>🚀 Publier l'annonce</>
              }
            </button>
            <button onClick={() => setStep('contact')} className="w-full py-3 text-sm text-muted-foreground hover:text-foreground transition-colors">
              ← Modifier l'annonce
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostAdPage;
