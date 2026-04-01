/**
 * ═══════════════════════════════════════════════════════════════════════════
 * LE FENNEC — SYSTÈME DE MODÉRATION IA
 * Adapté à l'Algérie : droit algérien + valeurs islamiques + multilangue
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * MODULES :
 *   1. Filtrage texte (patterns + Claude API)
 *   2. Filtrage images (Claude Vision)
 *   3. Scoring & décision (publish / manual_review / reject)
 *   4. File de modération humaine (backoffice)
 *   5. Apprentissage continu (feedback loop + métriques)
 *
 * POST /api/moderate/text   → analyse titre + description
 * POST /api/moderate/image  → analyse image uploadée
 * POST /api/moderate/full   → analyse complète avant publication
 *
 * Note : en production, déplacer les appels Claude vers Vercel Edge Functions
 * pour ne pas exposer la clé API côté navigateur.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const CLAUDE_ENDPOINT = 'https://api.anthropic.com/v1/messages';
const CLAUDE_MODEL    = 'claude-sonnet-4-20250514';
const API_KEY         = import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined;

// ─── Types publics ───────────────────────────────────────────────────────────

export type ModerationAction = 'publish' | 'manual_review' | 'reject';

export type ModerationFlag =
  // Haram / Illégal Algérie
  | 'alcohol'        | 'pork'           | 'drugs'
  | 'gambling'       | 'riba_usury'     | 'blasphemy'
  | 'haram_product'
  // Fraude / Arnaque
  | 'scam'           | 'mlm_pyramid'    | 'fast_money'
  | 'fake_job'       | 'advance_fee'    | 'fake_identity'
  // Rencontres / Contenu adulte
  | 'dating'         | 'adult_content'  | 'escort'
  | 'suggestive'
  // Hors plateforme
  | 'politics'       | 'piracy'         | 'propaganda'
  | 'protected_animal'
  // Images
  | 'img_adult'      | 'img_violence'   | 'img_weapon'
  | 'img_offensif'   | 'img_irrelevant' | 'img_competitor'
  // Qualité / spam
  | 'spam'           | 'incomplete'     | 'wrong_category'
  | 'suspicious';

export interface ModerationResult {
  approved:    boolean;
  confidence:  number;          // 0.0 → 1.0
  flags:       ModerationFlag[];
  action:      ModerationAction;
  message_ar:  string;          // Message pour l'utilisateur en arabe
  message_fr:  string;          // Message pour l'utilisateur en français
  suggestion_fr?: string;       // Comment corriger (pédagogique)
  suggestion_ar?: string;
  reviewId?:   string;          // ID pour la file de modération
}

export interface ImageModerationResult extends ModerationResult {
  relevanceToCategory: boolean;
  detectedContent:     string;
}

export interface FullModerationResult extends ModerationResult {
  textResult?:          ModerationResult;
  imageResults?:        ImageModerationResult[];
  qualityScore:         number;           // 0-100
  qualityFeedback:      QualityFeedback;
}

// ─── Module 4 — File de modération humaine ──────────────────────────────────

export interface ModerationQueueItem {
  id:          string;
  type:        'listing' | 'image';
  listingId?:  string;
  title?:      string;
  description?: string;
  category?:   string;
  imageUrl?:   string;
  aiResult:    ModerationResult | ImageModerationResult;
  status:      'pending' | 'approved' | 'rejected' | 'correction_requested';
  reviewedBy?: string;
  reviewedAt?: number;
  moderatorNote?: string;
  createdAt:   number;
}

// ─── Module 5 — Métriques et feedback loop ──────────────────────────────────

export interface ModerationMetrics {
  totalAnalyzed:     number;
  published:         number;
  manualReview:      number;
  rejected:          number;
  humanOverrides:    number;    // Cas où le modérateur a contredit l'IA
  falsePositives:    number;    // IA a rejeté → humain a approuvé
  falseNegatives:    number;    // IA a approuvé → humain a rejeté
  flagCounts:        Record<ModerationFlag, number>;
  accuracyByCategory: Record<string, number>;
}

interface FeedbackEntry {
  id:           string;
  aiDecision:   ModerationAction;
  humanDecision: ModerationAction;
  flags:        ModerationFlag[];
  category:     string;
  timestamp:    number;
  // Pour futur fine-tuning
  titleSnippet: string;
}

// ─── Stockage en mémoire (→ remplacer par Supabase / PlanetScale en prod) ───

const moderationQueue: ModerationQueueItem[] = [];
const feedbackLog: FeedbackEntry[] = [];

let metrics: ModerationMetrics = {
  totalAnalyzed: 0, published: 0, manualReview: 0, rejected: 0,
  humanOverrides: 0, falsePositives: 0, falseNegatives: 0,
  flagCounts: {} as Record<ModerationFlag, number>,
  accuracyByCategory: {},
};

// ═══════════════════════════════════════════════════════════════════════════
// MODULE 1A — PATTERNS LOCAUX (client-side, instantané, sans appel API)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Patterns adaptés à :
 * - Arabe classique et dialectal algérien (دارجة)
 * - Français algérien (verlan, mélange)
 * - Tamazight (mots courants)
 */

const PATTERNS: {
  flag:       ModerationFlag;
  regex:      RegExp;
  critical:   boolean;          // true → rejet direct sans appel API
  confidence: number;
}[] = [

  // ── HARAM / ILLÉGAL ALGÉRIE ────────────────────────────────────────────

  // Alcool
  {
    flag: 'alcohol', critical: true, confidence: 0.97,
    regex: /\b(alcool|bière|vin|whisky|rhum|vodka|champagne|pastis|liqueur|khamr|خمر|بيرة|نبيذ|شراب|كحول|boisson[s]?\s*alcoolisée[s]?|vente\s*d['']alcool)\b/i,
  },
  // Porc
  {
    flag: 'pork', critical: true, confidence: 0.97,
    regex: /\b(porc|cochon|jambon|lard|bacon|saucisson|pâté\s*de\s*porc|charcuterie|khanzir|خنزير|لحم\s*خنزير)\b/i,
  },
  // Drogues et stupéfiants (loi algérienne n° 04-18)
  {
    flag: 'drugs', critical: true, confidence: 0.99,
    regex: /\b(cocaïne|héroïne|cannabis|haschisch|kchoura|kchira|kif|kiff|qif|قيف|حشيش|مخدر|drogue|shit|zamal|haschich|ecstasy|mdma|lsd|speed|crack|méth|meth|zamal|hashish|weed|kush|gelida|takrouri)\b/i,
  },
  // Jeux d'argent (haram + loi algérienne)
  {
    flag: 'gambling', critical: true, confidence: 0.95,
    regex: /\b(casino|poker|pari[s]?|bet|betting|roulette|loto|loterie|jackpot|machine[s]?\s*à\s*sous|jeu[x]?\s*d['']argent|qimar|قمار|رهان|مراهنة)\b/i,
  },
  // Usure / riba (haram explicite)
  {
    flag: 'riba_usury', critical: true, confidence: 0.93,
    regex: /\b(prêt\s*avec\s*intérêt|taux\s*d['']intérêt\s*\d|usure|riba|ربا|فائدة\s*بنكية|قرض\s*بفائدة)\b/i,
  },
  // Blasphème (loi algérienne art. 144 CP)
  {
    flag: 'blasphemy', critical: true, confidence: 0.98,
    regex: /\b(insulte[r]?\s*(dieu|allah|islam|prophète|coran|mosquée)|مسبة\s*دين|إهانة\s*(الإسلام|الله|النبي)|kofr|kufr|كفر\s*صريح)\b/i,
  },

  // ── FRAUDES & ARNAQUES ─────────────────────────────────────────────────

  // MLM / Pyramide
  {
    flag: 'mlm_pyramid', critical: true, confidence: 0.95,
    regex: /\b(mlm|multi[-\s]?level|marketing\s*de\s*réseau|vente\s*pyramidale|parrainage\s*rémunéré|recrutement\s*réseau|herbalife|forever\s*living|monavie|amway|نظام\s*هرمي|تسويق\s*شبكي)\b/i,
  },
  // Argent facile / gains garantis
  {
    flag: 'fast_money', critical: false, confidence: 0.92,
    regex: /\b(argent\s*facile|gagner\s*\d{3,}[\s€$]\s*par\s*(jour|heure|semaine)|revenu\s*passif\s*garanti|investissement\s*garanti|doublez?\s*votre\s*capital|profit\s*garanti|rendement\s*\d+%\s*garanti|ربح\s*سريع|فلوس\s*سهلة|ربح\s*مضمون)\b/i,
  },
  // Faux emplois à l'étranger (traite de personnes)
  {
    flag: 'fake_job', critical: true, confidence: 0.88,
    regex: /\b(visa\s*offert|billet\s*(d['']avion|avion)\s*offert|travail\s*en\s*(europe|canada|golfe|dubai)\s*sans\s*expérience|recrutement\s*urgent\s*à\s*l['']étranger|dame\s*de\s*compagnie\s*à\s*l['']étranger|hôtesse.*étranger)\b/i,
  },
  // Avance financière (arnaque classique)
  {
    flag: 'advance_fee', critical: true, confidence: 0.90,
    regex: /\b(avance\s*de\s*\d+|virement\s*d['']abord|payer\s*d['']abord|avancer\s*(les\s*)?frais|caution\s*demandée|inscription\s*payante\s*pour\s*emploi|تسبيق\s*مطلوب|دفع\s*مسبق)\b/i,
  },

  // ── RENCONTRES & CONTENU ADULTE ────────────────────────────────────────

  {
    flag: 'dating', critical: true, confidence: 0.96,
    regex: /\b(rencontre[s]?|escort|call[\s-]?girl|massages?\s*érotiques?|accompagnatr|femme[s]?\s*de\s*compagnie|plan\s*(cul|q|sexe)|nuit\s*intime|sexe|sex|خادمة\s*خاصة|صحبة\s*بنت|نساء\s*للزواج\s*عاجل|رفيقة)\b/i,
  },
  {
    flag: 'adult_content', critical: true, confidence: 0.97,
    regex: /\b(pornographie|porno|xxx|18\+\s*seulement|adulte\s*uniquement|contenu\s*explicite|erotique|érotique|lingerie\s*sexy|nue|nudes?|onlyfans)\b/i,
  },
  {
    flag: 'suggestive', critical: false, confidence: 0.75,
    regex: /\b(massage[s]?\s*(relaxant[s]?\s*(pour|à\s*domicile|chez\s*vous)|sensuel|corps\s*à\s*corps)|détente\s*totale\s*garantie|femme\s*discrète\s*cherche)\b/i,
  },

  // ── HORS PLATEFORME ────────────────────────────────────────────────────

  {
    flag: 'politics', critical: false, confidence: 0.88,
    regex: /\b(parti\s*politique|vote\s*pour|élection|campagne\s*électorale|candidature\s*au|soutien\s*au\s*parti|manifeste\s*politique|حزب\s*سياسي|التصويت\s*ل|انتخابات)\b/i,
  },
  {
    flag: 'piracy', critical: false, confidence: 0.90,
    regex: /\b(cracké?|cracked|keygen|licence\s*crackée|serial\s*key\s*gratuit|torrent\s*de|windows\s*activé|office\s*cracké|logiciel\s*piraté|مكرك|كراك|سيريال\s*كي|نسخة\s*مفعلة)\b/i,
  },
  {
    flag: 'protected_animal', critical: true, confidence: 0.93,
    regex: /\b(faucon\s*pèlerin|aigle\s*royal|gazelle\s*(dorcas|de\s*cuvier)|fennec\s*sauvage\s*capturé|tortue\s*sauvage|varan|addax|mouflon\s*à\s*manchettes|شاهين|نسر\s*ملكي|غزال\s*دوركاس)\b/i,
  },
];

/**
 * Analyse rapide par patterns (sans appel API).
 * Retourne les flags trouvés + flag critique éventuel.
 */
function patternScan(text: string): {
  flags: ModerationFlag[];
  hasCritical: boolean;
  maxConfidence: number;
} {
  const flags: ModerationFlag[] = [];
  let hasCritical = false;
  let maxConfidence = 0;

  const normalised = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')  // diacritics
    .replace(/[_\-\.]/g, ' ');

  for (const p of PATTERNS) {
    if (p.regex.test(normalised) || p.regex.test(text)) {
      if (!flags.includes(p.flag)) flags.push(p.flag);
      if (p.critical) hasCritical = true;
      maxConfidence = Math.max(maxConfidence, p.confidence);
    }
  }

  return { flags, hasCritical, maxConfidence };
}

// ═══════════════════════════════════════════════════════════════════════════
// MESSAGES UTILISATEUR — Multilingue, pédagogiques, non-stigmatisants
// ═══════════════════════════════════════════════════════════════════════════

const FLAG_MESSAGES: Record<ModerationFlag, {
  fr: string; ar: string;
  suggestion_fr: string; suggestion_ar: string;
}> = {
  alcohol: {
    fr: 'La vente d\'alcool n\'est pas autorisée sur Le Fennec (conforme à la réglementation algérienne).',
    ar: 'بيع الكحول غير مسموح به على الفنك (طبقًا للتشريع الجزائري).',
    suggestion_fr: 'Veuillez proposer un autre type de produit conforme aux lois en vigueur.',
    suggestion_ar: 'يرجى اقتراح منتج آخر متوافق مع القوانين السارية.',
  },
  pork: {
    fr: 'La vente de produits à base de porc n\'est pas acceptée sur cette plateforme.',
    ar: 'بيع منتجات لحم الخنزير غير مقبول على هذه المنصة.',
    suggestion_fr: 'Proposez des produits alimentaires halal ou d\'autres catégories.',
    suggestion_ar: 'اقترح منتجات غذائية حلال أو فئات أخرى.',
  },
  drugs: {
    fr: 'La vente ou promotion de substances illicites est strictement interdite (loi algérienne n° 04-18).',
    ar: 'بيع أو الترويج للمواد المخدرة محظور بموجب القانون الجزائري رقم 04-18.',
    suggestion_fr: 'Si votre annonce concerne des produits médicaux légaux, précisez leur nature et joignez une preuve.',
    suggestion_ar: 'إذا كان إعلانك يتعلق بمنتجات طبية قانونية، يرجى توضيح طبيعتها وإرفاق دليل.',
  },
  gambling: {
    fr: 'Les jeux d\'argent et paris sont interdits en Algérie.',
    ar: 'القمار والمراهنات محرمة ومحظورة في الجزائر.',
    suggestion_fr: 'Si vous souhaitez vendre un jeu vidéo ou de société, reformulez sans référence aux enjeux d\'argent.',
    suggestion_ar: 'إذا كنت تريد بيع لعبة فيديو أو لعبة طاولة، أعد الصياغة دون الإشارة للمراهنات.',
  },
  riba_usury: {
    fr: 'Les transactions avec intérêt (riba) ne sont pas acceptées sur Le Fennec.',
    ar: 'المعاملات الربوية غير مقبولة على الفنك.',
    suggestion_fr: 'Proposez des solutions de financement conformes à la finance islamique.',
    suggestion_ar: 'اقترح حلول تمويل متوافقة مع التمويل الإسلامي.',
  },
  blasphemy: {
    fr: 'Le contenu irrespectueux envers les religions est interdit (article 144 du Code pénal algérien).',
    ar: 'المحتوى المسيء للأديان محظور بموجب المادة 144 من قانون العقوبات الجزائري.',
    suggestion_fr: 'Veuillez reformuler votre annonce de manière respectueuse.',
    suggestion_ar: 'يرجى إعادة صياغة إعلانك بطريقة محترمة.',
  },
  haram_product: {
    fr: 'Ce produit n\'est pas conforme aux valeurs de la plateforme.',
    ar: 'هذا المنتج لا يتوافق مع قيم المنصة.',
    suggestion_fr: 'Consultez la liste des catégories autorisées dans nos CGU.',
    suggestion_ar: 'راجع قائمة الفئات المسموح بها في شروط الاستخدام.',
  },
  scam: {
    fr: 'Votre annonce présente des caractéristiques d\'une offre frauduleuse.',
    ar: 'يبدو أن إعلانك يحمل مؤشرات العروض الاحتيالية.',
    suggestion_fr: 'Assurez-vous que votre annonce est claire, honnête, et que vous pouvez prouver l\'existence du bien ou service.',
    suggestion_ar: 'تأكد من أن إعلانك واضح وصادق، وأنك قادر على إثبات وجود السلعة أو الخدمة.',
  },
  mlm_pyramid: {
    fr: 'Les réseaux de marketing pyramidal (MLM) sont interdits sur Le Fennec.',
    ar: 'التسويق الشبكي الهرمي محظور على الفنك.',
    suggestion_fr: 'Si vous proposez un emploi légitime, décrivez précisément les missions, le contrat et la rémunération fixe.',
    suggestion_ar: 'إذا كنت تقدم وظيفة حقيقية، صف المهام والعقد والراتب الثابت بدقة.',
  },
  fast_money: {
    fr: 'Les promesses de gains rapides ou garantis ne sont pas acceptées sur cette plateforme.',
    ar: 'وعود الربح السريع أو المضمون غير مقبولة على هذه المنصة.',
    suggestion_fr: 'Décrivez votre offre de manière factuelle, sans promesses de revenus exagérés.',
    suggestion_ar: 'صف عرضك بطريقة واقعية دون وعود بأرباح مبالغ فيها.',
  },
  fake_job: {
    fr: 'Certains éléments de votre annonce ressemblent à des offres d\'emploi fictives potentiellement dangereuses.',
    ar: 'بعض عناصر إعلانك تشبه عروض عمل وهمية قد تكون خطيرة.',
    suggestion_fr: 'Mentionnez le nom de l\'entreprise, l\'adresse, le type de contrat, et évitez les formules "visa offert" ou "billet offert".',
    suggestion_ar: 'اذكر اسم الشركة والعنوان ونوع العقد، وتجنب عبارات "تأشيرة مجانية" أو "تذكرة مجانية".',
  },
  advance_fee: {
    fr: 'Demander un paiement anticipé dans une annonce d\'emploi ou de service est une pratique suspecte.',
    ar: 'طلب الدفع المسبق في إعلان عمل أو خدمة أمر مريب.',
    suggestion_fr: 'Un employeur légitime ne demande jamais de frais d\'inscription à ses candidats.',
    suggestion_ar: 'صاحب العمل الشرعي لا يطلب أبدًا رسوم تسجيل من المتقدمين.',
  },
  fake_identity: {
    fr: 'L\'usurpation de titre professionnel (médecin, avocat, etc.) est un délit en Algérie.',
    ar: 'انتحال الصفة المهنية (طبيب، محامٍ...) جريمة يعاقب عليها القانون الجزائري.',
    suggestion_fr: 'Si vous êtes un professionnel agréé, mentionnez votre numéro d\'ordre professionnel.',
    suggestion_ar: 'إذا كنت محترفًا معتمدًا، اذكر رقم انتسابك المهني.',
  },
  dating: {
    fr: 'Les annonces de rencontre ou à caractère sentimental ne sont pas acceptées sur Le Fennec.',
    ar: 'إعلانات التعارف أو ذات الطابع العاطفي غير مقبولة على الفنك.',
    suggestion_fr: 'Le Fennec est dédié aux biens et services. Pour d\'autres besoins, consultez les plateformes appropriées.',
    suggestion_ar: 'الفنك مخصص للبضائع والخدمات. لاحتياجات أخرى، راجع المنصات المناسبة.',
  },
  adult_content: {
    fr: 'Le contenu pour adultes est strictement interdit sur Le Fennec.',
    ar: 'المحتوى للبالغين محظور تمامًا على الفنك.',
    suggestion_fr: 'Votre annonce a été refusée. Toute récidive entraînera la suspension de votre compte.',
    suggestion_ar: 'تم رفض إعلانك. أي تكرار سيؤدي إلى تعليق حسابك.',
  },
  escort: {
    fr: 'Les services d\'accompagnement de nature sexuelle sont illégaux et interdits sur cette plateforme.',
    ar: 'خدمات المرافقة ذات الطابع الجنسي غير قانونية ومحظورة على هذه المنصة.',
    suggestion_fr: 'Votre compte a été signalé. Veuillez consulter nos CGU.',
    suggestion_ar: 'تم الإبلاغ عن حسابك. يرجى مراجعة شروط الاستخدام.',
  },
  suggestive: {
    fr: 'Votre annonce contient des formulations susceptibles d\'être mal interprétées.',
    ar: 'إعلانك يحتوي على صياغات قد يُساء تفسيرها.',
    suggestion_fr: 'Reformulez en décrivant précisément le service proposé (type de massage, lieu, tarif fixe).',
    suggestion_ar: 'أعد الصياغة بوصف دقيق للخدمة المقدمة (نوع التدليك، المكان، السعر الثابت).',
  },
  politics: {
    fr: 'Le Fennec n\'est pas une plateforme politique. Les annonces à caractère partisan ne sont pas acceptées.',
    ar: 'الفنك ليس منصة سياسية. الإعلانات ذات الطابع الحزبي غير مقبولة.',
    suggestion_fr: 'Si vous proposez un service lié à un événement officiel, reformulez en mentionnant uniquement le service.',
    suggestion_ar: 'إذا كنت تقدم خدمة مرتبطة بحدث رسمي، أعد الصياغة بذكر الخدمة فقط.',
  },
  piracy: {
    fr: 'La vente de logiciels piratés ou de licences non officielles est illégale (loi algérienne sur la propriété intellectuelle).',
    ar: 'بيع البرامج المقرصنة أو التراخيص غير الرسمية غير قانوني (قانون حقوق الملكية الفكرية الجزائري).',
    suggestion_fr: 'Proposez uniquement des logiciels sous licence officielle ou open source.',
    suggestion_ar: 'قدم فقط برامج برخصة رسمية أو مفتوحة المصدر.',
  },
  propaganda: {
    fr: 'Le contenu de propagande ou de recrutement idéologique n\'est pas accepté.',
    ar: 'محتوى الدعاية أو التجنيد الأيديولوجي غير مقبول.',
    suggestion_fr: 'Contactez-nous si vous pensez que votre annonce a été refusée par erreur.',
    suggestion_ar: 'تواصل معنا إذا كنت تعتقد أن إعلانك رُفض بالخطأ.',
  },
  protected_animal: {
    fr: 'La vente d\'espèces animales protégées est un délit grave en Algérie (loi n° 11-02).',
    ar: 'بيع الأنواع الحيوانية المحمية جريمة خطيرة في الجزائر (قانون 11-02).',
    suggestion_fr: 'Seuls les animaux domestiques d\'élevage légal peuvent être annoncés sur Le Fennec.',
    suggestion_ar: 'يُسمح فقط بإعلان الحيوانات الأليفة المربّاة قانونيًا على الفنك.',
  },
  spam: {
    fr: 'Votre annonce semble être du spam ou un doublon.',
    ar: 'يبدو أن إعلانك مكرر أو غير ذي قيمة.',
    suggestion_fr: 'Chaque annonce doit être unique et décrire un bien ou service réel.',
    suggestion_ar: 'يجب أن يكون كل إعلان فريدًا ويصف سلعة أو خدمة حقيقية.',
  },
  incomplete: {
    fr: 'Votre annonce manque d\'informations essentielles.',
    ar: 'إعلانك يفتقر إلى معلومات أساسية.',
    suggestion_fr: 'Ajoutez un titre descriptif, un prix, une localisation et une description détaillée.',
    suggestion_ar: 'أضف عنوانًا وصفيًا وسعرًا وموقعًا ووصفًا مفصلًا.',
  },
  wrong_category: {
    fr: 'Votre annonce ne correspond pas à la catégorie sélectionnée.',
    ar: 'إعلانك لا يتطابق مع الفئة المختارة.',
    suggestion_fr: 'Veuillez sélectionner la catégorie correspondant à votre bien ou service.',
    suggestion_ar: 'يرجى اختيار الفئة المناسبة لسلعتك أو خدمتك.',
  },
  suspicious: {
    fr: 'Votre annonce présente des éléments inhabituels nécessitant une vérification.',
    ar: 'إعلانك يحتوي على عناصر غير عادية تستوجب التحقق.',
    suggestion_fr: 'Un modérateur va vérifier votre annonce dans les 24h. Vous serez notifié par email.',
    suggestion_ar: 'سيتحقق مشرف من إعلانك خلال 24 ساعة. ستُخطَر عبر البريد الإلكتروني.',
  },
  img_adult: {
    fr: 'L\'image contient du contenu indécent ou pour adultes.',
    ar: 'الصورة تحتوي على محتوى غير لائق أو للبالغين.',
    suggestion_fr: 'Uploadez uniquement des photos du produit ou service proposé.',
    suggestion_ar: 'قم بتحميل صور المنتج أو الخدمة المعروضة فقط.',
  },
  img_violence: {
    fr: 'L\'image contient du contenu violent.',
    ar: 'الصورة تحتوي على محتوى عنيف.',
    suggestion_fr: 'Choisissez une image claire et neutre de l\'article à vendre.',
    suggestion_ar: 'اختر صورة واضحة ومحايدة للمنتج المُعلَن عنه.',
  },
  img_weapon: {
    fr: 'L\'image présente une arme de manière inappropriée.',
    ar: 'الصورة تُظهر سلاحًا بطريقة غير ملائمة.',
    suggestion_fr: 'Si vous vendez une arme légale (arme de chasse agréée), fournissez une photo de l\'arme dans un contexte de vente neutre.',
    suggestion_ar: 'إذا كنت تبيع سلاحًا قانونيًا (سلاح صيد مرخص)، قدم صورة السلاح في سياق بيع محايد.',
  },
  img_offensif: {
    fr: 'L\'image contient des symboles offensants ou irrespectueux.',
    ar: 'الصورة تحتوي على رموز مسيئة أو غير محترمة.',
    suggestion_fr: 'Remplacez l\'image par une photo appropriée de votre article.',
    suggestion_ar: 'استبدل الصورة بصورة مناسبة لمنتجك.',
  },
  img_irrelevant: {
    fr: 'L\'image ne correspond pas à l\'annonce (selfie, mème, capture d\'écran, etc.).',
    ar: 'الصورة لا تتوافق مع الإعلان (سيلفي، صورة مضحكة، لقطة شاشة...).',
    suggestion_fr: 'Prenez une photo réelle du produit ou service que vous proposez.',
    suggestion_ar: 'التقط صورة حقيقية للمنتج أو الخدمة التي تعرضها.',
  },
  img_competitor: {
    fr: 'L\'image contient un logo ou filigrane d\'un site concurrent.',
    ar: 'الصورة تحتوي على شعار أو علامة مائية لموقع منافس.',
    suggestion_fr: 'Utilisez vos propres photos sans marques ou filigranes tiers.',
    suggestion_ar: 'استخدم صورك الخاصة بدون علامات أو فيليجرانات لطرف ثالث.',
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// MODULE 1B — ANALYSE IA CLAUDE (texte approfondi)
// ═══════════════════════════════════════════════════════════════════════════

const MODERATION_SYSTEM_PROMPT = `Tu es le système de modération du site "Le Fennec", plateforme algérienne d'annonces classées.
Tu analyses les annonces pour garantir leur conformité avec :
- La législation algérienne (Code pénal, loi sur la protection du consommateur n° 09-03, loi sur le commerce électronique n° 18-05)
- Les valeurs islamiques et culturelles algériennes
- Les règles de la plateforme

Tu DOIS répondre UNIQUEMENT en JSON valide, sans aucun texte avant ou après.
Sois juste et évite les faux positifs. Un vendeur de parfums n'est pas suspect. Un mécanicien qui cite "huile moteur" n'est pas lié aux drogues.
Analyse le contexte global, pas les mots isolément.

Format de réponse obligatoire :
{
  "approved": boolean,
  "confidence": 0.0 to 1.0,
  "flags": ["flag1", "flag2"],
  "action": "publish" | "manual_review" | "reject",
  "reasoning": "Explication interne courte (pour logs)",
  "message_fr": "Message pédagogique pour l'utilisateur en français (max 150 mots)",
  "message_ar": "رسالة تعليمية للمستخدم بالعربية (150 كلمة كحد أقصى)",
  "suggestion_fr": "Comment corriger si rejet ou révision",
  "suggestion_ar": "كيفية التصحيح إذا رُفض أو يحتاج مراجعة"
}

Flags disponibles : alcohol, pork, drugs, gambling, riba_usury, blasphemy, haram_product, scam, mlm_pyramid, fast_money, fake_job, advance_fee, fake_identity, dating, adult_content, escort, suggestive, politics, piracy, propaganda, protected_animal, spam, incomplete, wrong_category, suspicious`;

async function callClaudeModeration(userPrompt: string, maxTokens = 500): Promise<string> {
  if (!API_KEY) throw new Error('NO_API_KEY');
  const res = await fetch(CLAUDE_ENDPOINT, {
    method:  'POST',
    headers: {
      'Content-Type':      'application/json',
      'x-api-key':         API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model:      CLAUDE_MODEL,
      max_tokens: maxTokens,
      system:     MODERATION_SYSTEM_PROMPT,
      messages:   [{ role: 'user', content: userPrompt }],
    }),
  });
  if (!res.ok) throw new Error(`Claude ${res.status}`);
  const data = await res.json();
  return data.content?.[0]?.text ?? '';
}

function safeParseJSON<T>(text: string, fallback: T): T {
  try {
    return JSON.parse(text.replace(/```json|```/g, '').trim()) as T;
  } catch {
    return fallback;
  }
}

function buildDecision(flags: ModerationFlag[], confidence: number, aiOverride?: Partial<ModerationResult>): ModerationResult {
  // Determine action from confidence + flags
  let action: ModerationAction;
  const hasCriticalFlag = flags.some(f => [
    'alcohol','pork','drugs','gambling','riba_usury','blasphemy',
    'dating','adult_content','escort','fake_job','protected_animal',
    'mlm_pyramid','advance_fee','fake_identity',
  ].includes(f));

  if (hasCriticalFlag || confidence < 0.50) {
    action = 'reject';
  } else if (confidence < 0.85) {
    action = 'manual_review';
  } else {
    action = 'publish';
  }

  const approved = action === 'publish';

  // Build user messages from first flag
  const primaryFlag = flags[0];
  const msg = primaryFlag ? FLAG_MESSAGES[primaryFlag] : null;

  const result: ModerationResult = {
    approved,
    confidence,
    flags,
    action,
    message_fr: msg?.fr   ?? (approved ? 'Votre annonce a été approuvée. Elle sera publiée sous peu.' : 'Votre annonce n\'a pas pu être approuvée.'),
    message_ar: msg?.ar   ?? (approved ? 'تمت الموافقة على إعلانك. سيُنشر قريبًا.' : 'لم يتم قبول إعلانك.'),
    suggestion_fr: msg?.suggestion_fr,
    suggestion_ar: msg?.suggestion_ar,
    ...aiOverride,
  };

  // Add to queue if manual review
  if (action === 'manual_review') {
    result.reviewId = `rev_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
  }

  return result;
}

// ═══════════════════════════════════════════════════════════════════════════
// ENDPOINT 1 : POST /api/moderate/text
// ═══════════════════════════════════════════════════════════════════════════

export async function moderateText(
  title:       string,
  description: string,
  category:    string,
  wilaya?:     string,
): Promise<ModerationResult> {

  const fullText = `${title} ${description}`;

  // Pass 1 : Scan rapide par patterns (gratuit, ~1ms)
  const scan = patternScan(fullText);

  if (scan.hasCritical) {
    // Rejet immédiat sans appel API
    const result = buildDecision(scan.flags, scan.maxConfidence);
    updateMetrics(result);
    return result;
  }

  // Pass 2 : Analyse Claude si pas de flag critique
  if (!API_KEY) {
    // Sans clé API : appliquer la décision des patterns uniquement
    const confidence = scan.flags.length === 0 ? 0.80 : 0.60;
    const result = buildDecision(scan.flags, confidence);
    updateMetrics(result);
    return result;
  }

  const fallback: ModerationResult = buildDecision(scan.flags, scan.flags.length ? 0.60 : 0.80);

  try {
    const aiText = await callClaudeModeration(
      `Analyse cette annonce soumise sur Le Fennec (Algérie).

Catégorie déclarée: ${category}
Wilaya: ${wilaya || 'Non précisée'}
Titre: "${title}"
Description: "${description}"

Flags déjà détectés par le filtre rapide (peuvent être des faux positifs): ${scan.flags.join(', ') || 'aucun'}

Analyse approfondie et retourne le JSON de modération.`,
      600,
    );

    const ai = safeParseJSON<Partial<ModerationResult>>(aiText, {});
    const flags = Array.from(new Set([...scan.flags, ...(ai.flags || [])])) as ModerationFlag[];
    const confidence = typeof ai.confidence === 'number' ? ai.confidence : fallback.confidence;

    const result = buildDecision(flags, confidence, {
      message_fr:    ai.message_fr    || fallback.message_fr,
      message_ar:    ai.message_ar    || fallback.message_ar,
      suggestion_fr: ai.suggestion_fr || fallback.suggestion_fr,
      suggestion_ar: ai.suggestion_ar || fallback.suggestion_ar,
    });

    updateMetrics(result);

    // Enqueue si manual_review
    if (result.action === 'manual_review' && result.reviewId) {
      moderationQueue.push({
        id:          result.reviewId,
        type:        'listing',
        title, description, category,
        aiResult:    result,
        status:      'pending',
        createdAt:   Date.now(),
      });
    }

    return result;
  } catch {
    updateMetrics(fallback);
    return fallback;
  }
}

// ─── Alias public ─────────────────────────────────────────────────────────
export const moderateListing = moderateText;

// ═══════════════════════════════════════════════════════════════════════════
// ENDPOINT 2 : POST /api/moderate/image
// ═══════════════════════════════════════════════════════════════════════════

export async function moderateImage(
  imageBase64: string,
  mediaType:   string,
  category:    string,
): Promise<ImageModerationResult> {

  const fallback: ImageModerationResult = {
    approved: true, confidence: 0.65, flags: [],
    action: 'publish',
    message_fr: 'Image acceptée sous réserve de conformité.',
    message_ar: 'تم قبول الصورة مع التحفظ على الامتثال.',
    relevanceToCategory: true,
    detectedContent: 'inconnu',
  };

  if (imageBase64.length > 5_200_000) {
    return {
      approved: false, confidence: 0.99,
      flags: ['img_irrelevant'],
      action: 'reject',
      message_fr: 'Image trop volumineuse (max 3.5 Mo). Veuillez compresser l\'image.',
      message_ar: 'الصورة كبيرة جدًا (الحد الأقصى 3.5 ميجابايت). يرجى ضغط الصورة.',
      suggestion_fr: 'Utilisez un outil de compression comme TinyPNG ou réduisez la résolution.',
      suggestion_ar: 'استخدم أداة ضغط مثل TinyPNG أو قلل الدقة.',
      relevanceToCategory: false,
      detectedContent: 'image trop grande',
    };
  }

  if (!API_KEY) return fallback;

  try {
    const text = await callClaudeModeration(
      `Analyse cette image soumise pour une annonce de la catégorie "${category}" sur Le Fennec (Algérie).

Vérifie :
1. Contenu adulte, nudité ou tenue indécente (haram)
2. Violence, sang, armes de manière menaçante
3. Symboles offensants, blasphème, extrémisme
4. Pertinence : est-ce une photo du produit/service, ou un selfie/mème/screenshot ?
5. Filigrane d'un site concurrent visible

Retourne le JSON de modération avec en plus :
- "relevanceToCategory": true/false
- "detectedContent": description brève de l'image`,
    );

    const ai = safeParseJSON<Partial<ImageModerationResult>>(text, {});
    const flags = (ai.flags || []) as ModerationFlag[];
    const confidence = typeof ai.confidence === 'number' ? ai.confidence : 0.75;

    // Force reject if adult or violent content
    const hasCriticalImgFlag = flags.some(f => ['img_adult','img_violence','img_offensif','escort','adult_content'].includes(f));

    const result: ImageModerationResult = {
      approved:            hasCriticalImgFlag ? false : (ai.approved ?? true),
      confidence,
      flags,
      action:              hasCriticalImgFlag ? 'reject' : (ai.action || 'publish'),
      message_fr:          ai.message_fr || (hasCriticalImgFlag ? FLAG_MESSAGES.img_adult.fr : 'Image approuvée.'),
      message_ar:          ai.message_ar || (hasCriticalImgFlag ? FLAG_MESSAGES.img_adult.ar : 'تمت الموافقة على الصورة.'),
      suggestion_fr:       ai.suggestion_fr,
      suggestion_ar:       ai.suggestion_ar,
      relevanceToCategory: ai.relevanceToCategory ?? true,
      detectedContent:     ai.detectedContent || '',
    };

    // Reject non-relevant images with high confidence
    if (!result.relevanceToCategory && result.confidence > 0.80) {
      result.approved = false;
      result.action   = 'reject';
      result.flags    = [...result.flags, 'img_irrelevant'];
      result.message_fr = FLAG_MESSAGES.img_irrelevant.fr;
      result.message_ar = FLAG_MESSAGES.img_irrelevant.ar;
      result.suggestion_fr = FLAG_MESSAGES.img_irrelevant.suggestion_fr;
      result.suggestion_ar = FLAG_MESSAGES.img_irrelevant.suggestion_ar;
    }

    return result;
  } catch {
    return fallback;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// ENDPOINT 3 : POST /api/moderate/full
// Analyse complète avant publication finale
// ═══════════════════════════════════════════════════════════════════════════

export async function moderateFull(opts: {
  title:       string;
  description: string;
  category:    string;
  wilaya?:     string;
  images?:     Array<{ base64: string; mediaType: string }>;
}): Promise<FullModerationResult> {

  const [textResult, ...imageResultsRaw] = await Promise.all([
    moderateText(opts.title, opts.description, opts.category, opts.wilaya),
    ...(opts.images || []).map(img => moderateImage(img.base64, img.mediaType, opts.category)),
  ]);

  const imageResults = imageResultsRaw as ImageModerationResult[];

  // Merge all flags
  const allFlags = Array.from(new Set([
    ...textResult.flags,
    ...imageResults.flatMap(r => r.flags),
  ])) as ModerationFlag[];

  // Worst-case action
  const actions: ModerationAction[] = [textResult.action, ...imageResults.map(r => r.action)];
  const finalAction: ModerationAction =
    actions.includes('reject')        ? 'reject' :
    actions.includes('manual_review') ? 'manual_review' : 'publish';

  const minConfidence = Math.min(
    textResult.confidence,
    ...imageResults.map(r => r.confidence),
  );

  const quality = computeQualityFeedback({
    title:       opts.title,
    description: opts.description,
    price:       '',
    location:    opts.wilaya || '',
    images:      (opts.images || []).map(() => 'placeholder'),
  });

  return {
    approved:        finalAction === 'publish',
    confidence:      minConfidence,
    flags:           allFlags,
    action:          finalAction,
    message_fr:      textResult.message_fr,
    message_ar:      textResult.message_ar,
    suggestion_fr:   textResult.suggestion_fr,
    suggestion_ar:   textResult.suggestion_ar,
    reviewId:        textResult.reviewId,
    textResult,
    imageResults,
    qualityScore:    quality.score,
    qualityFeedback: quality,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// MODULE 3 — QUALITÉ DE L'ANNONCE
// ═══════════════════════════════════════════════════════════════════════════

export interface QualityFeedback {
  score:       number;
  level:       'excellent' | 'good' | 'average' | 'poor';
  suggestions: string[];
  seoKeywords: string[];
}

export function computeQualityFeedback(opts: {
  title:       string;
  description: string;
  price:       string;
  location:    string;
  images:      string[];
  attributes?: Record<string, unknown>;
}): QualityFeedback {
  let score = 0;
  const suggestions: string[] = [];

  if (opts.title.length > 10)   score += 12; else suggestions.push('Titre trop court — ajoutez des détails clés');
  if (opts.title.length > 30)   score += 8;
  if (opts.title.length > 60)   suggestions.push('Titre trop long, raccourcissez à 60 caractères max');
  if (opts.price && parseInt(opts.price) > 0) score += 10;
  else suggestions.push('Indiquez un prix pour plus de visibilité');
  if (opts.location)             score += 10;
  else suggestions.push('Précisez la wilaya — les annonces localisées ont 4× plus de vues');
  if (opts.description.length > 50)  score += 12;
  else suggestions.push('Description trop courte — décrivez l\'état, les caractéristiques, les raisons de la vente');
  if (opts.description.length > 150) score += 8;
  if (opts.description.length > 300) score += 5;
  if (opts.images.length >= 1)  score += 10;
  else suggestions.push('⭐ Ajoutez au moins 1 photo — les annonces avec photo reçoivent 3× plus de contacts');
  if (opts.images.length >= 3)  score += 10;
  else if (opts.images.length > 0) suggestions.push('Ajoutez 3+ photos (devant, côtés, détails)');
  if (opts.images.length >= 5)  score += 5;
  if (opts.attributes) {
    const filled = Object.values(opts.attributes).filter(v => v !== '' && v != null).length;
    if (filled >= 2) score += 5;
    if (filled >= 5) score += 5;
    else if (filled < 2) suggestions.push('Remplissez les caractéristiques spécifiques à la catégorie');
  }
  score = Math.min(score, 100);

  const level: QualityFeedback['level'] =
    score >= 85 ? 'excellent' : score >= 65 ? 'good' : score >= 40 ? 'average' : 'poor';

  const seoKeywords = opts.title.toLowerCase().split(/\s+/).filter(w => w.length > 3).slice(0, 5);

  return { score, level, suggestions, seoKeywords };
}

// ═══════════════════════════════════════════════════════════════════════════
// MODULE 4 — BACKOFFICE MODÉRATION HUMAINE
// ═══════════════════════════════════════════════════════════════════════════

/** Obtenir la file des annonces en attente */
export function getModerationQueue(status?: ModerationQueueItem['status']): ModerationQueueItem[] {
  if (status) return moderationQueue.filter(i => i.status === status);
  return [...moderationQueue];
}

/** Le modérateur prend une décision */
export function resolveModeration(
  reviewId:      string,
  decision:      'approved' | 'rejected' | 'correction_requested',
  moderatorNote: string,
  moderatorId:   string,
): void {
  const item = moderationQueue.find(i => i.id === reviewId);
  if (!item) return;

  const previousAction = item.aiResult.action;
  item.status       = decision;
  item.reviewedBy   = moderatorId;
  item.reviewedAt   = Date.now();
  item.moderatorNote = moderatorNote;

  // Module 5 : Enregistrer le feedback pour apprentissage
  const humanAction: ModerationAction =
    decision === 'approved' ? 'publish' :
    decision === 'rejected' ? 'reject'  : 'manual_review';

  if (humanAction !== previousAction) {
    logFeedback({
      id:            reviewId,
      aiDecision:    previousAction,
      humanDecision: humanAction,
      flags:         item.aiResult.flags,
      category:      item.category || 'unknown',
      timestamp:     Date.now(),
      titleSnippet:  (item.title || '').slice(0, 50),
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// MODULE 5 — APPRENTISSAGE CONTINU & MÉTRIQUES
// ═══════════════════════════════════════════════════════════════════════════

function logFeedback(entry: FeedbackEntry): void {
  feedbackLog.push(entry);

  // Mettre à jour métriques
  metrics.humanOverrides++;
  if (entry.aiDecision === 'reject' && entry.humanDecision === 'publish') {
    metrics.falsePositives++;
  }
  if (entry.aiDecision === 'publish' && entry.humanDecision === 'reject') {
    metrics.falseNegatives++;
  }
}

function updateMetrics(result: ModerationResult): void {
  metrics.totalAnalyzed++;
  if (result.action === 'publish')        metrics.published++;
  else if (result.action === 'manual_review') metrics.manualReview++;
  else metrics.rejected++;

  for (const flag of result.flags) {
    metrics.flagCounts[flag] = (metrics.flagCounts[flag] || 0) + 1;
  }
}

/** Obtenir les métriques actuelles */
export function getModerationMetrics(): ModerationMetrics {
  const total = metrics.totalAnalyzed || 1;
  return {
    ...metrics,
    // Calculer précision globale
    accuracyByCategory: {
      overall: parseFloat(((1 - metrics.falsePositives / total - metrics.falseNegatives / total) * 100).toFixed(1)),
    },
  };
}

/** Exporter le dataset de corrections pour futur fine-tuning */
export function exportFeedbackDataset(): FeedbackEntry[] {
  return feedbackLog.filter(e => e.aiDecision !== e.humanDecision);
}

/** Réinitialiser les métriques (admin) */
export function resetMetrics(): void {
  metrics = {
    totalAnalyzed: 0, published: 0, manualReview: 0, rejected: 0,
    humanOverrides: 0, falsePositives: 0, falseNegatives: 0,
    flagCounts: {} as Record<ModerationFlag, number>,
    accuracyByCategory: {},
  };
}

