import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, Upload, Check, Camera, X,
  Sparkles, Loader2, Wand2, CheckCircle2, MapPin, Eye,
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useApp } from '../contexts/AppContext';
import { CATEGORIES } from '../data/categories';
import { WILAYAS } from '../data/wilayas';
import { improveAd, estimatePrice, AdImprovement, MarketPrice } from '../services/AIService';
import { computeQualityScore } from '../services/RankingService';
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
  images:      string[];
  attributes:  Record<string, string>;
}

const INIT_FORM: FormData = {
  categoryId:'', category:'', title:'', description:'',
  price:'', negotiable:false, condition:'good',
  location:'', wilayaId:'', commune:'', phone:'', whatsapp:true,
  images:[], attributes:{},
};

const PostAdPage: React.FC = () => {
  const { t, language }       = useLanguage();
  const { user, addListing }  = useApp();
  const navigate              = useNavigate();

  const [step,     setStep]    = useState<Step>('category');
  const [form,     setForm]    = useState<FormData>(INIT_FORM);
  const [done,     setDone]    = useState(false);
  const [aiImprove, setAiImprove] = useState<AdImprovement | null>(null);
  const [aiPrice,   setAiPrice]   = useState<MarketPrice   | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [loadingP,  setLoadingP]  = useState(false);

  const stepIdx    = STEPS.indexOf(step);
  const progress   = ((stepIdx + 1) / STEPS.length) * 100;
  const qualityScore = computeQualityScore({
    title: form.title, description: form.description,
    price: form.price, location: form.location, images: form.images,
    attributes: form.attributes,
  });

  const activeCategory = CATEGORIES.find(c => c.id === form.categoryId);
  const catName = (cat: (typeof CATEGORIES)[0]) =>
    language === 'ar' ? cat.nameAr : language === 'en' ? cat.nameEn : cat.nameFr;

  const qColor = qualityScore < 40 ? 'bg-dz-red' : qualityScore < 70 ? 'bg-amber-500' : 'bg-dz-green';
  const qLabel = qualityScore < 40 ? t.poor : qualityScore < 70 ? 'Moyenne' : qualityScore < 90 ? t.good : t.excellent;

  const next = () => setStep(STEPS[stepIdx + 1]);
  const back = () => setStep(STEPS[stepIdx - 1]);
  const set  = (updates: Partial<FormData>) => setForm(p => ({ ...p, ...updates }));

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
    const result = await estimatePrice(form.category, form.title, form.location, form.attributes);
    setAiPrice(result);
    setLoadingP(false);
  };

  const handlePublish = () => {
    const newListing: Listing = {
      id:          Date.now().toString(),
      title:       form.title,
      slug:        form.title.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
      price:       parseInt(form.price) || 0,
      currency:    'DZD',
      negotiable:  form.negotiable,
      location:    form.location || form.wilayaId,
      wilayaId:    form.wilayaId,
      wilayaName:  WILAYAS.find(w => w.code === form.wilayaId)?.nameFr,
      commune:     form.commune,
      imageUrl:    form.images[0] || `https://picsum.photos/800/600?random=${Date.now()}`,
      images:      form.images.length ? form.images : [`https://picsum.photos/800/600?random=${Date.now()}`],
      category:    form.category,
      categoryId:  form.categoryId,
      condition:   form.condition as any,
      date:        "Aujourd'hui",
      timestamp:   Date.now(),
      views:       0,
      description: form.description,
      attributes:  form.attributes,
      ranking: {
        trustScore:   user?.trustScore || 50,
        qualityScore: qualityScore,
        clickRate:    0,
        boostLevel:   0,
      },
      status:   'active',
      userId:   user?.id || 'anonymous',
      phone:    form.phone,
      whatsapp: form.whatsapp,
    };
    addListing(newListing);
    setDone(true);
  };

  /* ── Success screen ─────────────────────────── */
  if (done) return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="bg-card border border-border rounded-3xl p-10 max-w-md w-full text-center shadow-2xl animate-fade-up">
        <div className="w-20 h-20 bg-dz-green/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={40} className="text-dz-green" />
        </div>
        <h2 className="text-2xl font-black text-foreground mb-3">🎉 {t.published}</h2>
        <p className="text-muted-foreground mb-8">{t.publishedMsg}</p>
        <div className="space-y-3">
          <Link to="/dashboard"
            className="flex items-center justify-center w-full py-3.5 bg-dz-green text-white font-bold rounded-2xl shadow-brand-md">
            {t.myAds}
          </Link>
          <button onClick={() => { setDone(false); setStep('category'); setForm(INIT_FORM); setAiImprove(null); setAiPrice(null); }}
            className="w-full py-3.5 border border-border text-foreground font-bold rounded-2xl hover:bg-muted">
            {language === 'ar' ? 'إضافة إعلان آخر' : language === 'en' ? 'Post another ad' : 'Déposer une autre annonce'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 pb-28 md:pb-10">

      {/* Progress header */}
      <div className="sticky top-14 bg-background z-20 py-3 mb-6 -mx-4 px-4 border-b border-border/50">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-lg font-black text-foreground">{t.postAd}</h1>
          <span className="text-sm font-bold text-dz-green">{t.step} {stepIdx + 1}/{STEPS.length}</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-dz-green rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
        {stepIdx > 0 && (
          <div className="flex items-center gap-2 mt-2 bg-card border border-border rounded-xl p-2.5">
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <div className={`h-full ${qColor} rounded-full transition-all`} style={{ width: `${qualityScore}%` }} />
            </div>
            <span className={`text-xs font-bold whitespace-nowrap ${qualityScore < 40 ? 'text-dz-red' : qualityScore < 70 ? 'text-amber-500' : 'text-dz-green'}`}>
              {t.adQuality}: {qLabel} ({qualityScore}%)
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

          {/* AI improvement banner */}
          {aiImprove && (
            <div className="bg-dz-green/5 border border-dz-green/20 rounded-2xl p-4 animate-fade-up">
              <div className="flex items-center gap-2 mb-3">
                <Wand2 size={15} className="text-dz-green" />
                <span className="font-bold text-dz-green text-sm">Suggestion IA</span>
                <span className="ml-auto text-xs text-muted-foreground">{aiImprove.tip}</span>
              </div>
              <div className="space-y-2">
                <div className="bg-card rounded-xl p-3">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Titre suggéré</p>
                  <p className="text-sm font-semibold text-foreground">{aiImprove.title}</p>
                </div>
                <div className="bg-card rounded-xl p-3">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Description suggérée</p>
                  <p className="text-xs text-muted-foreground whitespace-pre-line line-clamp-3">{aiImprove.description}</p>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={() => { set({ title: aiImprove.title, description: aiImprove.description }); setAiImprove(null); }}
                  className="flex-1 py-2 bg-dz-green text-white font-bold text-sm rounded-xl">✓ Appliquer</button>
                <button onClick={() => setAiImprove(null)}
                  className="px-4 py-2 border border-border text-muted-foreground font-bold text-sm rounded-xl">Ignorer</button>
              </div>
            </div>
          )}

          <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
            {/* Title */}
            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase">{t.title} *</label>
                <span className="text-xs text-muted-foreground">{form.title.length}/80</span>
              </div>
              <input type="text" value={form.title} maxLength={80}
                onChange={e => set({ title: e.target.value })}
                placeholder={t.titlePlaceholder}
                className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-dz-green focus:bg-background transition-all" />
            </div>

            {/* Price + AI price */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between mb-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase">{t.adPrice} *</label>
                  <button onClick={handleAIPrice} disabled={loadingP || !form.title}
                    className="text-xs font-bold text-dz-green flex items-center gap-1 disabled:opacity-40">
                    {loadingP ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}
                    {t.aiPrice}
                  </button>
                </div>
                <input type="number" value={form.price}
                  onChange={e => set({ price: e.target.value })}
                  placeholder="0"
                  className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-dz-green focus:bg-background transition-all" />
                {aiPrice && (
                  <div className="mt-2 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40 rounded-xl p-2.5 text-xs">
                    <p className="font-bold text-blue-700 dark:text-blue-300 mb-1">
                      Suggéré : {aiPrice.suggested?.toLocaleString()} DA ({aiPrice.min?.toLocaleString()} – {aiPrice.max?.toLocaleString()})
                    </p>
                    <p className="text-blue-600 dark:text-blue-400 mb-1">{aiPrice.reasoning}</p>
                    <button onClick={() => set({ price: String(aiPrice.suggested) })}
                      className="text-blue-700 dark:text-blue-300 font-bold underline">Appliquer</button>
                  </div>
                )}
                <label className="flex items-center gap-2 mt-2 cursor-pointer">
                  <input type="checkbox" checked={form.negotiable} onChange={e => set({ negotiable: e.target.checked })} className="rounded accent-dz-green" />
                  <span className="text-xs text-muted-foreground">{t.isNegotiable}</span>
                </label>
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase block mb-1.5">{t.condition}</label>
                <select value={form.condition} onChange={e => set({ condition: e.target.value })}
                  className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-dz-green cursor-pointer">
                  {[
                    { v:'new',      l: t.new_condition },
                    { v:'like_new', l: t.like_new      },
                    { v:'good',     l: t.good          },
                    { v:'fair',     l: t.fair          },
                    { v:'used',     l: t.used          },
                  ].map(c => <option key={c.v} value={c.v}>{c.l}</option>)}
                </select>
              </div>
            </div>

            {/* Dynamic attributes */}
            {activeCategory?.filters?.length ? (
              <div className="pt-2 border-t border-border">
                <p className="text-xs font-bold text-foreground mb-3">🔖 Détails {catName(activeCategory)}</p>
                <div className="grid grid-cols-2 gap-3">
                  {activeCategory.filters.map(f => (
                    <div key={f.id}>
                      <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">
                        {language === 'ar' ? f.labelAr : language === 'en' ? f.labelEn : f.labelFr}
                      </label>
                      {f.type === 'select' ? (
                        <select value={form.attributes[f.id] || ''}
                          onChange={e => set({ attributes: { ...form.attributes, [f.id]: e.target.value } })}
                          className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-sm outline-none cursor-pointer">
                          <option value="">—</option>
                          {f.options?.map(opt => (
                            <option key={String(opt.value)} value={String(opt.value)}>
                              {language === 'ar' ? opt.labelAr : language === 'en' ? opt.labelEn : opt.labelFr}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input type="number" placeholder={f.placeholder}
                          value={form.attributes[f.id] || ''}
                          onChange={e => set({ attributes: { ...form.attributes, [f.id]: e.target.value } })}
                          className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-sm outline-none" />
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
                  {loadingAI ? <Loader2 size={10} className="animate-spin" /> : <Wand2 size={10} />}
                  {loadingAI ? t.aiLoading : t.aiImprove}
                </button>
              </div>
              <textarea rows={5} value={form.description}
                onChange={e => set({ description: e.target.value })}
                placeholder={t.descPlaceholder}
                className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-dz-green focus:bg-background resize-none transition-all" />
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={back} className="flex-1 py-3 border border-border text-foreground font-bold rounded-xl flex items-center justify-center gap-2">
              <ChevronLeft size={16} /> {t.back}
            </button>
            <button onClick={next} disabled={!form.title || !form.price || !form.description}
              className="flex-[2] py-3 bg-dz-dark text-white font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-40 shadow-sm">
              {t.next} <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 3: Photos ── */}
      {step === 'photos' && (
        <div className="animate-fade-up space-y-5">
          <div className="flex items-center gap-3">
            <button onClick={back} className="p-2 hover:bg-muted rounded-xl"><ChevronLeft size={20} /></button>
            <h2 className="text-xl font-black text-foreground">{t.photos}</h2>
          </div>
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40 rounded-xl p-3 flex items-center gap-3 text-sm">
            <Camera size={16} className="text-blue-600 dark:text-blue-400 shrink-0" />
            <span className="text-blue-700 dark:text-blue-300">{t.photoTip}</span>
          </div>
          <div className="bg-card border border-border rounded-2xl p-5">
            <div className="grid grid-cols-3 gap-3">
              {form.images.map((img, i) => (
                <div key={i} className="aspect-square rounded-xl overflow-hidden relative group border border-border">
                  <img src={img} className="w-full h-full object-cover" />
                  {i === 0 && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[9px] text-center py-1 font-bold uppercase">
                      {language === 'ar' ? 'الصورة الرئيسية' : 'Principale'}
                    </div>
                  )}
                  <button onClick={() => set({ images: form.images.filter((_, j) => j !== i) })}
                    className="absolute top-1.5 right-1.5 bg-black/50 hover:bg-dz-red text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-all">
                    <X size={12} />
                  </button>
                </div>
              ))}
              {form.images.length < 10 && (
                <label className="aspect-square rounded-xl border-2 border-dashed border-border hover:border-dz-green hover:bg-dz-green/5 flex flex-col items-center justify-center cursor-pointer gap-2 transition-all">
                  <Upload size={22} className="text-muted-foreground" />
                  <span className="text-xs font-semibold text-muted-foreground">{form.images.length}/10</span>
                  <input type="file" accept="image/*" className="hidden" onChange={e => {
                    if (e.target.files?.[0]) {
                      const url = URL.createObjectURL(e.target.files[0]);
                      set({ images: [...form.images, url] });
                    }
                  }} />
                </label>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={back} className="flex-1 py-3 border border-border text-foreground font-bold rounded-xl flex items-center justify-center gap-2">
              <ChevronLeft size={16} /> {t.back}
            </button>
            <button onClick={next} className="flex-[2] py-3 bg-dz-dark text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm">
              {t.next} <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 4: Location ── */}
      {step === 'location' && (
        <div className="animate-fade-up space-y-5">
          <div className="flex items-center gap-3">
            <button onClick={back} className="p-2 hover:bg-muted rounded-xl"><ChevronLeft size={20} /></button>
            <h2 className="text-xl font-black text-foreground">{t.locationStep}</h2>
          </div>
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase block mb-1.5">{t.selectWilaya} *</label>
              <select value={form.wilayaId}
                onChange={e => {
                  const w = WILAYAS.find(x => x.code === e.target.value);
                  set({ wilayaId: e.target.value, location: language === 'ar' ? (w?.nameAr || '') : language === 'en' ? (w?.nameEn || '') : (w?.nameFr || '') });
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
              <input type="text" value={form.commune}
                onChange={e => set({ commune: e.target.value })}
                placeholder="Ex: Hydra, Ben Aknoun..."
                className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-dz-green transition-all" />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={back} className="flex-1 py-3 border border-border text-foreground font-bold rounded-xl flex items-center justify-center gap-2">
              <ChevronLeft size={16} /> {t.back}
            </button>
            <button onClick={next} disabled={!form.wilayaId}
              className="flex-[2] py-3 bg-dz-dark text-white font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-40 shadow-sm">
              {t.next} <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 5: Contact ── */}
      {step === 'contact' && (
        <div className="animate-fade-up space-y-5">
          <div className="flex items-center gap-3">
            <button onClick={back} className="p-2 hover:bg-muted rounded-xl"><ChevronLeft size={20} /></button>
            <h2 className="text-xl font-black text-foreground">{t.contactStep}</h2>
          </div>
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase block mb-1.5">{t.phone}</label>
              <input type="tel" value={form.phone}
                onChange={e => set({ phone: e.target.value })}
                placeholder="0550 12 34 56"
                className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-dz-green transition-all" />
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.whatsapp} onChange={e => set({ whatsapp: e.target.checked })} className="rounded accent-dz-green w-4 h-4" />
              <div>
                <p className="text-sm font-semibold text-foreground">{t.enableWhatsApp}</p>
                <p className="text-xs text-muted-foreground">Les acheteurs pourront vous contacter directement</p>
              </div>
            </label>
          </div>
          <div className="flex gap-3">
            <button onClick={back} className="flex-1 py-3 border border-border text-foreground font-bold rounded-xl flex items-center justify-center gap-2">
              <ChevronLeft size={16} /> {t.back}
            </button>
            <button onClick={next}
              className="flex-[2] py-3 bg-dz-dark text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm">
              {t.next} <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 6: Review ── */}
      {step === 'review' && (
        <div className="animate-fade-up space-y-5">
          <div className="flex items-center gap-3">
            <button onClick={back} className="p-2 hover:bg-muted rounded-xl"><ChevronLeft size={20} /></button>
            <h2 className="text-xl font-black text-foreground">{t.review}</h2>
          </div>

          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            {form.images[0] && (
              <img src={form.images[0]} alt="Preview" className="w-full h-40 object-cover" />
            )}
            <div className="p-5 space-y-3">
              <div className="flex justify-between">
                <h3 className="font-black text-foreground text-base">{form.title}</h3>
                <span className="text-lg font-black text-dz-green">{parseInt(form.price || '0').toLocaleString()} DA</span>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">{form.description}</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { icon: '📁', v: form.category },
                  { icon: '📍', v: form.location },
                  { icon: '📷', v: `${form.images.length} photos` },
                ].map(item => item.v && (
                  <span key={item.icon} className="text-xs text-muted-foreground flex items-center gap-1">
                    {item.icon} {item.v}
                  </span>
                ))}
              </div>
              {/* Quality bar */}
              <div className="flex items-center gap-2 pt-2 border-t border-border">
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full ${qColor} rounded-full`} style={{ width: `${qualityScore}%` }} />
                </div>
                <span className={`text-xs font-bold ${qualityScore < 40 ? 'text-dz-red' : qualityScore < 70 ? 'text-amber-500' : 'text-dz-green'}`}>
                  {qLabel} ({qualityScore}%)
                </span>
              </div>
            </div>
          </div>

          <button onClick={handlePublish}
            className="w-full py-4 bg-dz-green hover:bg-dz-green2 text-white font-black text-base rounded-2xl shadow-brand-lg transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2">
            🚀 {t.publish}
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
