import React, { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, Upload, Camera, X,
  Sparkles, Loader2, Wand2, CheckCircle2, AlertTriangle,
  ShieldCheck, Clock, Ban, Info,
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useApp } from '../contexts/AppContext';
import { CATEGORIES } from '../data/categories';
import { WILAYAS } from '../data/wilayas';
import { improveAd, estimatePrice, AdImprovement, MarketPrice } from '../services/AIService';
import {
  moderateListing, moderateImage,
  computeQualityFeedback, ModerationResult, ImageModerationResult,
} from '../services/ModerationService';
import type { Listing } from '../types';

const STEPS = ['category', 'details', 'photos', 'location', 'contact', 'review'] as const;
type Step = typeof STEPS[number];

interface FormData {
  categoryId:  string;
  category:    string;
  title:       string;
  description: string;
  price:       string;
  negotiable:  boolean;
  condition:   string;
  location:    string;
  wilayaId:    string;
  commune:     string;
  phone:       string;
  whatsapp:    boolean;
  images:      string[];     // base64 or object URLs
  attributes:  Record<string, string>;
}

const INIT: FormData = {
  categoryId:'', category:'', title:'', description:'',
  price:'', negotiable:false, condition:'good',
  location:'', wilayaId:'', commune:'', phone:'', whatsapp:true,
  images:[], attributes:{},
};

// ── Moderation status badge ──────────────────────────────────
const ModerationBadge: React.FC<{
  result: ModerationResult | null;
  loading: boolean;
}> = ({ result, loading }) => {
  if (loading) return (
    <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40 rounded-xl px-3 py-2 text-xs text-blue-700 dark:text-blue-300">
      <Loader2 size={12} className="animate-spin shrink-0"/>
      Analyse IA en cours…
    </div>
  );
  if (!result) return null;

  if (result.approved && result.action !== 'manual_review') return (
    <div className="flex items-center gap-2 bg-dz-green/5 border border-dz-green/20 rounded-xl px-3 py-2 text-xs text-dz-green">
      <ShieldCheck size={12} className="shrink-0"/>
      <span><strong>Contenu approuvé</strong> par l'IA ({Math.round(result.confidence * 100)}% de confiance)</span>
    </div>
  );

  if (result.action === 'manual_review') return (
    <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-xl px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
      <Clock size={12} className="shrink-0"/>
      <span><strong>Révision manuelle</strong> — {result.reason}</span>
    </div>
  );

  return (
    <div className="flex items-start gap-2 bg-dz-red/5 border border-dz-red/20 rounded-xl px-3 py-2 text-xs text-dz-red">
      <Ban size={12} className="shrink-0 mt-0.5"/>
      <span><strong>Contenu refusé</strong> — {result.reason}</span>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
const PostAdPage: React.FC = () => {
  const { t, language }       = useLanguage();
  const { user, addListing }  = useApp();
  const navigate              = useNavigate();

  const [step,     setStep]    = useState<Step>('category');
  const [form,     setForm]    = useState<FormData>(INIT);
  const [done,     setDone]    = useState(false);

  // AI states
  const [aiImprove,   setAiImprove]   = useState<AdImprovement | null>(null);
  const [aiPrice,     setAiPrice]     = useState<MarketPrice | null>(null);
  const [loadingAI,   setLoadingAI]   = useState(false);
  const [loadingP,    setLoadingP]    = useState(false);

  // Moderation states
  const [modListing,  setModListing]  = useState<ModerationResult | null>(null);
  const [modLoading,  setModLoading]  = useState(false);
  const [imgMods,     setImgMods]     = useState<Record<number, ImageModerationResult>>({});
  const [imgLoading,  setImgLoading]  = useState<Record<number, boolean>>({});

  const stepIdx   = STEPS.indexOf(step);
  const progress  = ((stepIdx + 1) / STEPS.length) * 100;

  const quality   = computeQualityFeedback({
    title: form.title, description: form.description,
    price: form.price, location: form.location,
    images: form.images, attributes: form.attributes,
  });

  const qColor = quality.score < 40 ? 'bg-dz-red' : quality.score < 70 ? 'bg-amber-500' : 'bg-dz-green';
  const qLabel = quality.score < 40 ? t.poor
    : quality.score < 70 ? 'Moyenne'
    : quality.score < 90 ? t.good : t.excellent;

  const activeCategory = CATEGORIES.find(c => c.id === form.categoryId);
  const catName = (cat: typeof CATEGORIES[0]) =>
    language === 'ar' ? cat.nameAr : language === 'en' ? cat.nameEn : cat.nameFr;

  const next = () => setStep(STEPS[stepIdx + 1]);
  const back = () => setStep(STEPS[stepIdx - 1]);
  const set  = (updates: Partial<FormData>) => setForm(p => ({ ...p, ...updates }));

  // ── AI improve ──────────────────────────────────────────────
  const handleAIImprove = async () => {
    if (!form.title) return;
    setLoadingAI(true);
    const result = await improveAd(form.category, form.title, form.description, form.price, form.location, language);
    setAiImprove(result);
    setLoadingAI(false);
  };

  const handleAIPrice = async () => {
    if (!form.title) return;
    setLoadingP(true);
    const result = await estimatePrice(form.category, form.title, form.location, form.attributes as any);
    setAiPrice(result);
    setLoadingP(false);
  };

  // ── Moderation ──────────────────────────────────────────────
  const handleModerateText = useCallback(async () => {
    if (!form.title || !form.description) return;
    setModLoading(true);
    setModListing(null);
    const result = await moderateListing(form.title, form.description, form.category, form.location);
    setModListing(result);
    setModLoading(false);
  }, [form.title, form.description, form.category, form.location]);

  const handleImageUpload = useCallback(async (file: File, index: number) => {
    const objectUrl = URL.createObjectURL(file);
    const newImages = [...form.images, objectUrl];
    set({ images: newImages });

    // Moderate the image
    setImgLoading(prev => ({ ...prev, [index]: true }));
    try {
      const b64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]); // strip data URL prefix
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const mediaType = file.type as 'image/jpeg' | 'image/png' | 'image/webp';
      const result = await moderateImage(b64, mediaType, form.category);
      setImgMods(prev => ({ ...prev, [index]: result }));

      if (!result.approved) {
        // Remove the image
        set({ images: form.images });
      }
    } catch {
      setImgMods(prev => ({ ...prev, [index]: {
        approved: true, confidence: 0.5, reason: 'Vérification IA non disponible',
        relevanceToCategory: true, detectedContent: '', action: 'approve',
      }}));
    }
    setImgLoading(prev => ({ ...prev, [index]: false }));
  }, [form.images, form.category]);

  // ── Publish ─────────────────────────────────────────────────
  const handlePublish = async () => {
    // Final moderation check
    setModLoading(true);
    const modResult = await moderateListing(form.title, form.description, form.category, form.location);
    setModLoading(false);

    if (!modResult.approved) {
      setModListing(modResult);
      return;
    }

    const w = WILAYAS.find(x => x.code === form.wilayaId);
    const newListing: Listing = {
      id:          Date.now().toString(),
      title:       form.title,
      slug:        form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now(),
      price:       parseInt(form.price) || 0,
      currency:    'DZD',
      negotiable:  form.negotiable,
      location:    w ? (language === 'ar' ? w.nameAr : w.nameFr) : form.location,
      wilayaId:    form.wilayaId,
      wilayaName:  w?.nameFr,
      commune:     form.commune,
      imageUrl:    form.images[0] || `https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&q=80`,
      images:      form.images.length ? form.images : [`https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&q=80`],
      category:    form.category,
      categoryId:  form.categoryId,
      condition:   form.condition as any,
      date:        "Aujourd'hui",
      timestamp:   Date.now(),
      views:       0,
      description: form.description,
      attributes:  form.attributes,
      ranking: {
        trustScore:   user?.trustScore || 30,
        qualityScore: quality.score,
        clickRate:    0,
        boostLevel:   0,
      },
      status:   modResult.action === 'manual_review' ? 'pending' : 'active',
      userId:   user?.id || 'anonymous',
      phone:    form.phone,
      whatsapp: form.whatsapp,
    };

    addListing(newListing);
    setDone(true);
  };

  // ─────────────────────────────────────────────────────────────

  // ── Success ────────────────────────────────────────────────
  if (done) return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="bg-card border border-border rounded-3xl p-10 max-w-md w-full text-center shadow-2xl animate-fade-up">
        <div className="w-20 h-20 bg-dz-green/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={40} className="text-dz-green" />
        </div>
        <h2 className="text-2xl font-black text-foreground mb-3">🎉 {t.published}</h2>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          {t.publishedMsg}{' '}
          {!user && (
            <span className="text-amber-600 dark:text-amber-400 block mt-2 text-sm">
              Créez un compte pour gérer vos annonces.
            </span>
          )}
        </p>
        <div className="space-y-3">
          {user ? (
            <Link to="/dashboard" className="flex items-center justify-center w-full py-3.5 bg-dz-green text-white font-bold rounded-2xl shadow-brand-md">
              {t.myAds}
            </Link>
          ) : (
            <Link to="/auth" className="flex items-center justify-center w-full py-3.5 bg-dz-green text-white font-bold rounded-2xl shadow-brand-md">
              Créer un compte pour gérer mes annonces
            </Link>
          )}
          <button
            onClick={() => { setDone(false); setStep('category'); setForm(INIT); setAiImprove(null); setAiPrice(null); setModListing(null); }}
            className="w-full py-3.5 border border-border text-foreground font-bold rounded-2xl hover:bg-muted">
            Déposer une autre annonce
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 pb-28 md:pb-10">

      {/* Progress */}
      <div className="sticky top-14 bg-background z-20 py-3 mb-6 -mx-4 px-4 border-b border-border/50">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-lg font-black text-foreground">{t.postAd}</h1>
          <span className="text-sm font-bold text-dz-green">{t.step} {stepIdx + 1}/{STEPS.length}</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-2">
          <div className="h-full bg-dz-green rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
        {stepIdx > 0 && (
          <div className="flex items-center gap-2 bg-card border border-border rounded-xl p-2.5">
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <div className={`h-full ${qColor} rounded-full transition-all`} style={{ width: `${quality.score}%` }} />
            </div>
            <span className={`text-xs font-bold whitespace-nowrap ${quality.score < 40 ? 'text-dz-red' : quality.score < 70 ? 'text-amber-500' : 'text-dz-green'}`}>
              {t.adQuality}: {qLabel} ({quality.score}%)
            </span>
          </div>
        )}
      </div>

      {/* ── STEP 1: Category ── */}
      {step === 'category' && (
        <div className="animate-fade-up">
          <h2 className="text-xl font-black text-foreground text-center mb-6">{t.chooseCategory}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {CATEGORIES.map(cat => (
              <button key={cat.id}
                onClick={() => { set({ category: catName(cat), categoryId: cat.id }); next(); }}
                className={`flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all hover:shadow-card-hover
                  ${form.categoryId === cat.id ? 'border-dz-green bg-dz-green/5' : 'border-border bg-card hover:border-dz-green/40'}`}
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: cat.color + '20' }}>
                  {cat.icon}
                </div>
                <span className="font-bold text-sm text-foreground text-center">{catName(cat)}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── STEP 2: Details ── */}
      {step === 'details' && (
        <div className="animate-fade-up space-y-5">
          <div className="flex items-center gap-3">
            <button onClick={back} className="p-2 hover:bg-muted rounded-xl"><ChevronLeft size={20} /></button>
            <h2 className="text-xl font-black text-foreground">{t.adDetails}</h2>
          </div>

          {/* AI improvement suggestion */}
          {aiImprove && (
            <div className="bg-dz-green/5 border border-dz-green/20 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Wand2 size={14} className="text-dz-green"/>
                <span className="font-bold text-dz-green text-sm">Suggestion IA</span>
              </div>
              <div className="space-y-2 mb-3">
                <div className="bg-card rounded-xl p-3">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Titre suggéré</p>
                  <p className="text-sm font-semibold">{aiImprove.title}</p>
                </div>
                <div className="bg-card rounded-xl p-3 max-h-32 overflow-y-auto">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Description suggérée</p>
                  <p className="text-xs text-muted-foreground whitespace-pre-line">{aiImprove.description}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { set({ title: aiImprove.title, description: aiImprove.description }); setAiImprove(null); setModListing(null); }}
                  className="flex-1 py-2 bg-dz-green text-white font-bold text-sm rounded-xl">✓ Appliquer</button>
                <button onClick={() => setAiImprove(null)}
                  className="px-4 py-2 border border-border text-muted-foreground font-bold text-sm rounded-xl">Ignorer</button>
              </div>
            </div>
          )}

          {/* Moderation badge */}
          {(modLoading || modListing) && (
            <ModerationBadge result={modListing} loading={modLoading} />
          )}

          <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
            {/* Title */}
            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase">{t.title} *</label>
                <span className="text-xs text-muted-foreground">{form.title.length}/80</span>
              </div>
              <input type="text" value={form.title} maxLength={80}
                onChange={e => { set({ title: e.target.value }); setModListing(null); }}
                onBlur={() => form.title.length > 5 && handleModerateText()}
                placeholder={activeCategory?.placeholders?.title?.[language as 'fr'|'ar'|'en'] || t.titlePlaceholder}
                className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-dz-green transition-all" />
            </div>

            {/* Price + AI price */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between mb-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase">{t.adPrice}</label>
                  <button onClick={handleAIPrice} disabled={loadingP || !form.title}
                    className="text-xs font-bold text-dz-green flex items-center gap-1 disabled:opacity-40">
                    {loadingP ? <Loader2 size={10} className="animate-spin"/> : <Sparkles size={10}/>}
                    {t.aiPrice}
                  </button>
                </div>
                <input type="number" value={form.price} onChange={e => set({ price: e.target.value })}
                  placeholder="0 = Don gratuit"
                  className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-dz-green transition-all"/>
                {form.price && parseInt(form.price) === 1 && (
                  <p className="text-xs text-amber-600 mt-1">
                    ⚠️ Prix de 1 DA suspect. Mettez le vrai prix ou 0 pour un don gratuit.
                  </p>
                )}
                {aiPrice && (
                  <div className="mt-2 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40 rounded-xl p-2.5 text-xs">
                    <p className="font-bold text-blue-700 dark:text-blue-300 mb-1">
                      Suggéré: {aiPrice.suggested?.toLocaleString()} DA ({aiPrice.min?.toLocaleString()}–{aiPrice.max?.toLocaleString()})
                    </p>
                    <p className="text-blue-600 dark:text-blue-400 mb-2 line-clamp-2">{aiPrice.reasoning}</p>
                    <button onClick={() => { set({ price: String(aiPrice.suggested) }); setAiPrice(null); }}
                      className="text-blue-700 dark:text-blue-300 font-bold underline">Appliquer</button>
                  </div>
                )}
                <label className="flex items-center gap-2 mt-2 cursor-pointer">
                  <input type="checkbox" checked={form.negotiable} onChange={e => set({ negotiable: e.target.checked })} className="rounded accent-dz-green"/>
                  <span className="text-xs text-muted-foreground">
                    {form.price === '0' ? '🎁 Don gratuit' : t.isNegotiable}
                  </span>
                </label>
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase block mb-1.5">{t.condition}</label>
                <select value={form.condition} onChange={e => set({ condition: e.target.value })}
                  className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-dz-green cursor-pointer">
                  {[['new','Neuf'],['like_new','Comme neuf'],['good','Bon état'],['fair','Correct'],['used','Occasion']].map(([v,l]) =>
                    <option key={v} value={v}>{l}</option>
                  )}
                </select>
              </div>
            </div>

            {/* Dynamic attributes — type-aware (showFor logic) */}
            {activeCategory?.filters?.length ? (
              <div className="pt-2 border-t border-border">
                <p className="text-xs font-bold text-foreground mb-3">
                  🔖 {language === 'ar' ? 'تفاصيل' : 'Détails'} {catName(activeCategory)}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {activeCategory.filters
                    .filter(f => {
                      // If filter has showFor, only show when current property_type matches
                      if (!f.showFor || f.showFor.length === 0) return true;
                      const currentType = form.attributes['property_type'] || '';
                      return f.showFor.includes(currentType);
                    })
                    .map(f => (
                    <div key={f.id} className={f.type === 'multi' ? 'col-span-2' : ''}>
                      <label className={`text-xs font-bold uppercase block mb-1 ${f.required ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {language === 'ar' ? f.labelAr : language === 'en' ? f.labelEn : f.labelFr}
                        {f.required && <span className="text-dz-red ml-0.5">*</span>}
                      </label>
                      {f.type === 'select' ? (
                        <select value={form.attributes[f.id] || ''}
                          onChange={e => set({ attributes: { ...form.attributes, [f.id]: e.target.value } })}
                          className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-dz-green cursor-pointer">
                          <option value="">—</option>
                          {f.options?.map(opt => (
                            <option key={String(opt.value)} value={String(opt.value)}>
                              {language === 'ar' ? opt.labelAr : language === 'en' ? opt.labelEn : opt.labelFr}
                            </option>
                          ))}
                        </select>
                      ) : f.type === 'multi' ? (
                        <div className="flex flex-wrap gap-2">
                          {f.options?.map(opt => {
                            const vals = (form.attributes[f.id] || '').split(',').filter(Boolean);
                            const checked = vals.includes(String(opt.value));
                            return (
                              <button key={String(opt.value)} type="button"
                                onClick={() => {
                                  const cur = (form.attributes[f.id] || '').split(',').filter(Boolean);
                                  const next = checked ? cur.filter(v => v !== String(opt.value)) : [...cur, String(opt.value)];
                                  set({ attributes: { ...form.attributes, [f.id]: next.join(',') }});
                                }}
                                className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                                  checked ? 'bg-dz-green text-white border-dz-green' : 'bg-muted border-border text-muted-foreground hover:border-dz-green/40'
                                }`}>
                                {language === 'ar' ? opt.labelAr : language === 'en' ? opt.labelEn : opt.labelFr}
                              </button>
                            );
                          })}
                        </div>
                      ) : f.type === 'text' ? (
                        <input type="text" placeholder={f.placeholder || ''}
                          value={form.attributes[f.id] || ''}
                          onChange={e => set({ attributes: { ...form.attributes, [f.id]: e.target.value } })}
                          className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-dz-green"/>
                      ) : (
                        <input type="number" placeholder={f.placeholder || ''}
                          min={f.min} max={f.max} step={f.step}
                          value={form.attributes[f.id] || ''}
                          onChange={e => set({ attributes: { ...form.attributes, [f.id]: e.target.value } })}
                          className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-dz-green"/>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Description */}
            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase">{t.adDescription} *</label>
                <button onClick={handleAIImprove} disabled={loadingAI || !form.title}
                  className="flex items-center gap-1.5 text-xs font-bold text-white bg-dz-green px-3 py-1 rounded-full disabled:opacity-40 transition-all">
                  {loadingAI ? <Loader2 size={10} className="animate-spin"/> : <Wand2 size={10}/>}
                  {loadingAI ? t.aiLoading : t.aiImprove}
                </button>
              </div>
              <textarea rows={5} value={form.description}
                onChange={e => { set({ description: e.target.value }); setModListing(null); }}
                onBlur={() => form.title && form.description.length > 20 && handleModerateText()}
                placeholder={activeCategory?.placeholders?.description?.[language as 'fr'|'ar'|'en'] || t.descPlaceholder}
                className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-dz-green resize-none transition-all"/>
            </div>

            {/* Quality tips */}
            {quality.suggestions.length > 0 && (
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40 rounded-xl p-3">
                <p className="text-xs font-bold text-blue-700 dark:text-blue-300 mb-2 flex items-center gap-1">
                  <Info size={11}/> Conseils pour améliorer votre annonce
                </p>
                <ul className="space-y-1">
                  {quality.suggestions.map((s, i) => (
                    <li key={i} className="text-xs text-blue-600 dark:text-blue-400">• {s}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button onClick={back} className="flex-1 py-3 border border-border text-foreground font-bold rounded-xl flex items-center justify-center gap-2">
              <ChevronLeft size={16}/> {t.back}
            </button>
            <button
              onClick={next}
              disabled={!form.title || !form.description || (modListing !== null && !modListing.approved && modListing.action === 'reject')}
              className="flex-[2] py-3 bg-foreground text-background font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-40 shadow-sm">
              {t.next} <ChevronRight size={16}/>
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 3: Photos ── */}
      {step === 'photos' && (
        <div className="animate-fade-up space-y-5">
          <div className="flex items-center gap-3">
            <button onClick={back} className="p-2 hover:bg-muted rounded-xl"><ChevronLeft size={20}/></button>
            <h2 className="text-xl font-black text-foreground">{t.photos}</h2>
          </div>
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40 rounded-xl p-3 flex items-center gap-3 text-sm">
            <Camera size={16} className="text-blue-600 dark:text-blue-400 shrink-0"/>
            <div>
              <p className="font-semibold text-blue-700 dark:text-blue-300">{t.photoTip}</p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
                Les images sont analysées automatiquement par l'IA pour garantir leur pertinence.
              </p>
            </div>
          </div>
          <div className="bg-card border border-border rounded-2xl p-5">
            <div className="grid grid-cols-3 gap-3">
              {form.images.map((img, i) => (
                <div key={i} className="aspect-square rounded-xl overflow-hidden relative border-2 border-border group">
                  <img src={img} alt="" className="w-full h-full object-cover"/>
                  {i === 0 && (
                    <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[8px] text-center py-1 font-bold uppercase">
                      Principale
                    </div>
                  )}
                  {imgLoading[i] && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Loader2 size={20} className="text-white animate-spin"/>
                    </div>
                  )}
                  {imgMods[i] && (
                    <div className={`absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center ${imgMods[i].approved ? 'bg-dz-green' : 'bg-dz-red'}`}>
                      {imgMods[i].approved
                        ? <CheckCircle2 size={12} className="text-white"/>
                        : <Ban size={12} className="text-white"/>
                      }
                    </div>
                  )}
                  <button
                    onClick={() => { set({ images: form.images.filter((_, j) => j !== i) }); setImgMods(prev => { const n={...prev}; delete n[i]; return n; }); }}
                    className="absolute top-1.5 left-1.5 bg-black/50 hover:bg-dz-red text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-all">
                    <X size={12}/>
                  </button>
                </div>
              ))}
              {form.images.length < 10 && (
                <label className="aspect-square rounded-xl border-2 border-dashed border-border hover:border-dz-green hover:bg-dz-green/5 flex flex-col items-center justify-center cursor-pointer gap-2 transition-all">
                  <Upload size={22} className="text-muted-foreground"/>
                  <span className="text-xs font-semibold text-muted-foreground">{form.images.length}/10</span>
                  <span className="text-[9px] text-muted-foreground">Vérification IA</span>
                  <input type="file" accept="image/*" className="hidden" onChange={e => {
                    if (e.target.files?.[0]) handleImageUpload(e.target.files[0], form.images.length);
                  }}/>
                </label>
              )}
            </div>

            {/* Show rejected images */}
            {Object.entries(imgMods).some(([, m]) => !m.approved) && (
              <div className="mt-3 space-y-1">
                {Object.entries(imgMods).filter(([, m]) => !m.approved).map(([i, m]) => (
                  <div key={i} className="flex items-start gap-2 bg-dz-red/5 border border-dz-red/20 rounded-lg p-2 text-xs text-dz-red">
                    <AlertTriangle size={11} className="shrink-0 mt-0.5"/>
                    Image {parseInt(i)+1} refusée: {m.reason}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button onClick={back} className="flex-1 py-3 border border-border text-foreground font-bold rounded-xl flex items-center justify-center gap-2">
              <ChevronLeft size={16}/> {t.back}
            </button>
            <button onClick={next} className="flex-[2] py-3 bg-foreground text-background font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm">
              {t.next} <ChevronRight size={16}/>
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 4: Location ── */}
      {step === 'location' && (
        <div className="animate-fade-up space-y-5">
          <div className="flex items-center gap-3">
            <button onClick={back} className="p-2 hover:bg-muted rounded-xl"><ChevronLeft size={20}/></button>
            <h2 className="text-xl font-black text-foreground">{t.locationStep}</h2>
          </div>
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase block mb-1.5">{t.selectWilaya} *</label>
              <select value={form.wilayaId}
                onChange={e => {
                  const w = WILAYAS.find(x => x.code === e.target.value);
                  set({ wilayaId: e.target.value, location: language === 'ar' ? (w?.nameAr||'') : language === 'en' ? (w?.nameEn||'') : (w?.nameFr||'') });
                }}
                className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-dz-green cursor-pointer">
                <option value="">{t.selectWilaya}</option>
                {WILAYAS.map(w => (
                  <option key={w.code} value={w.code}>
                    {w.code} — {language === 'ar' ? w.nameAr : language === 'en' ? w.nameEn : w.nameFr}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase block mb-1.5">{t.selectCommune}</label>
              <input type="text" value={form.commune} onChange={e => set({ commune: e.target.value })}
                placeholder="Ex: Hydra, Ben Aknoun..."
                className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-dz-green transition-all"/>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={back} className="flex-1 py-3 border border-border text-foreground font-bold rounded-xl flex items-center justify-center gap-2">
              <ChevronLeft size={16}/> {t.back}
            </button>
            <button onClick={next} disabled={!form.wilayaId}
              className="flex-[2] py-3 bg-foreground text-background font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-40 shadow-sm">
              {t.next} <ChevronRight size={16}/>
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 5: Contact ── */}
      {step === 'contact' && (
        <div className="animate-fade-up space-y-5">
          <div className="flex items-center gap-3">
            <button onClick={back} className="p-2 hover:bg-muted rounded-xl"><ChevronLeft size={20}/></button>
            <h2 className="text-xl font-black text-foreground">{t.contactStep}</h2>
          </div>
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase block mb-1.5">{t.phone}</label>
              <input type="tel" value={form.phone} onChange={e => set({ phone: e.target.value })}
                placeholder="0550 12 34 56"
                className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-dz-green transition-all"/>
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.whatsapp} onChange={e => set({ whatsapp: e.target.checked })} className="rounded accent-dz-green w-4 h-4"/>
              <div>
                <p className="text-sm font-semibold text-foreground">{t.enableWhatsApp}</p>
                <p className="text-xs text-muted-foreground">Les acheteurs pourront vous contacter directement</p>
              </div>
            </label>
          </div>
          <div className="flex gap-3">
            <button onClick={back} className="flex-1 py-3 border border-border text-foreground font-bold rounded-xl flex items-center justify-center gap-2">
              <ChevronLeft size={16}/> {t.back}
            </button>
            <button onClick={next} className="flex-[2] py-3 bg-foreground text-background font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm">
              {t.next} <ChevronRight size={16}/>
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 6: Review ── */}
      {step === 'review' && (
        <div className="animate-fade-up space-y-5">
          <div className="flex items-center gap-3">
            <button onClick={back} className="p-2 hover:bg-muted rounded-xl"><ChevronLeft size={20}/></button>
            <h2 className="text-xl font-black text-foreground">{t.review}</h2>
          </div>

          {/* Moderation badge */}
          {(modLoading || modListing) && (
            <ModerationBadge result={modListing} loading={modLoading}/>
          )}

          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            {form.images[0] && (
              <img src={form.images[0]} alt="Preview" className="w-full h-48 object-cover"/>
            )}
            <div className="p-5 space-y-3">
              <div className="flex justify-between">
                <h3 className="font-black text-foreground text-base flex-1 mr-3 line-clamp-2">{form.title}</h3>
                <span className="text-lg font-black text-dz-green shrink-0">{parseInt(form.price||'0').toLocaleString()} DA</span>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">{form.description}</p>
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                {form.category && <span>📁 {form.category}</span>}
                {form.location && <span>📍 {form.location}</span>}
                {form.images.length > 0 && <span>📷 {form.images.length} photo(s)</span>}
              </div>
              {/* Quality bar */}
              <div className="flex items-center gap-2 pt-2 border-t border-border">
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full ${qColor} rounded-full`} style={{ width: `${quality.score}%` }}/>
                </div>
                <span className={`text-xs font-bold ${quality.score < 40 ? 'text-dz-red' : quality.score < 70 ? 'text-amber-500' : 'text-dz-green'}`}>
                  {qLabel} ({quality.score}%)
                </span>
              </div>
              {/* IA moderation info */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg p-2.5">
                <ShieldCheck size={12} className="text-dz-green shrink-0"/>
                Votre annonce sera analysée par l'IA avant publication pour garantir la qualité du site.
              </div>
            </div>
          </div>

          {modListing && !modListing.approved && modListing.action === 'reject' && (
            <div className="flex items-start gap-3 bg-dz-red/5 border border-dz-red/20 rounded-2xl p-4">
              <Ban size={18} className="text-dz-red shrink-0 mt-0.5"/>
              <div>
                <p className="font-bold text-dz-red text-sm mb-1">Publication impossible</p>
                <p className="text-xs text-muted-foreground">{modListing.reason}</p>
                <button onClick={() => setStep('details')} className="text-xs font-bold text-dz-green underline mt-2">
                  Modifier l'annonce
                </button>
              </div>
            </div>
          )}

          <button onClick={handlePublish}
            disabled={modLoading || (modListing !== null && !modListing.approved && modListing.action === 'reject')}
            className="w-full py-4 bg-dz-green hover:bg-dz-green2 text-white font-black text-base rounded-2xl shadow-brand-lg transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-60">
            {modLoading
              ? <><Loader2 size={18} className="animate-spin"/> Analyse en cours…</>
              : <>🚀 {t.publish}</>
            }
          </button>
          <button onClick={back} className="w-full py-3 border border-border text-muted-foreground font-semibold rounded-xl text-sm">
            {t.back}
          </button>
        </div>
      )}
    </div>
  );
};

export default PostAdPage;
