import type { Category } from '../types';

export const CATEGORIES: Category[] = [
  // ─── 1. IMMOBILIER ──────────────────────────────────────────────────────
  {
    id:'1', nameFr:'Immobilier', nameAr:'عقارات', nameEn:'Real Estate',
    icon:'🏠', color:'#3B82F6',
    subCategories:[
      {id:'1a',nameFr:'Appartements',nameAr:'شقق',nameEn:'Apartments'},
      {id:'1b',nameFr:'Villas & Maisons',nameAr:'فيلات ومنازل',nameEn:'Villas & Houses'},
      {id:'1c',nameFr:'Terrains',nameAr:'أراضي',nameEn:'Land'},
      {id:'1d',nameFr:'Locaux commerciaux',nameAr:'محلات تجارية',nameEn:'Commercial'},
      {id:'1e',nameFr:'Bureaux',nameAr:'مكاتب',nameEn:'Offices'},
      {id:'1f',nameFr:'Locations',nameAr:'إيجارات',nameEn:'Rentals'},
    ],
    filters:[
      {
        id:'property_type', type:'select',
        labelFr:'Type de bien', labelAr:'نوع العقار', labelEn:'Property type',
        required: true,
        options:[
          {labelFr:'Appartement F1',     labelAr:'شقة F1',        labelEn:'F1 Apartment',  value:'f1'},
          {labelFr:'Appartement F2',     labelAr:'شقة F2',        labelEn:'F2 Apartment',  value:'f2'},
          {labelFr:'Appartement F3',     labelAr:'شقة F3',        labelEn:'F3 Apartment',  value:'f3'},
          {labelFr:'Appartement F4',     labelAr:'شقة F4',        labelEn:'F4 Apartment',  value:'f4'},
          {labelFr:'Appartement F5+',    labelAr:'شقة F5+',       labelEn:'F5+ Apartment', value:'f5plus'},
          {labelFr:'Studio',             labelAr:'استوديو',       labelEn:'Studio',        value:'studio'},
          {labelFr:'Villa',              labelAr:'فيلا',          labelEn:'Villa',         value:'villa'},
          {labelFr:'Maison individuelle',labelAr:'منزل مستقل',    labelEn:'House',         value:'house'},
          {labelFr:'Duplex',             labelAr:'دوبلكس',        labelEn:'Duplex',        value:'duplex'},
          {labelFr:'Terrain nu',         labelAr:'قطعة أرض',     labelEn:'Land',          value:'land'},
          {labelFr:'Ferme',              labelAr:'مزرعة',         labelEn:'Farm',          value:'farm'},
          {labelFr:'Local commercial',   labelAr:'محل تجاري',    labelEn:'Shop',          value:'commercial'},
          {labelFr:'Bureau',             labelAr:'مكتب',          labelEn:'Office',        value:'office'},
          {labelFr:'Entrepôt',           labelAr:'مستودع',        labelEn:'Warehouse',     value:'warehouse'},
        ],
      },
      {
        id:'transaction', type:'select',
        labelFr:'Transaction', labelAr:'نوع الصفقة', labelEn:'Transaction',
        required: true,
        options:[
          {labelFr:'Vente',             labelAr:'بيع',           labelEn:'For sale',    value:'sale'},
          {labelFr:'Location',          labelAr:'إيجار',         labelEn:'For rent',    value:'rent'},
          {labelFr:'Location-vente',    labelAr:'إيجار-بيع',    labelEn:'Rent-to-own', value:'rent_sale'},
          {labelFr:'Échange',           labelAr:'مبادلة',        labelEn:'Exchange',    value:'exchange'},
        ],
      },
      {
        id:'surface', type:'number',
        labelFr:'Surface habitable (m²)', labelAr:'المساحة المسكونة (م²)', labelEn:'Living area (m²)',
        required: true, min:10, max:100000, step:5, placeholder:'Ex: 95',
      },
      {
        id:'rooms', type:'select',
        labelFr:'Nombre de pièces', labelAr:'عدد الغرف', labelEn:'Number of rooms',
        // shown for apartments/studios/duplex — hidden for terrain/commercial
        showFor: ['f1','f2','f3','f4','f5plus','studio','villa','house','duplex'],
        options:['1 pièce','2 pièces','3 pièces','4 pièces','5 pièces','6 pièces','7 pièces+']
          .map((v,i)=>({labelFr:v, labelAr:`${i+1} غرف`, labelEn:`${i+1} room(s)`, value:String(i+1)})),
      },
      {
        id:'floor', type:'select',
        labelFr:'Étage', labelAr:'الطابق', labelEn:'Floor',
        // Only for apartments — NOT for villas/houses/terrain
        showFor: ['f1','f2','f3','f4','f5plus','studio'],
        options:[
          {labelFr:'Rez-de-chaussée (RDC)', labelAr:'الطابق الأرضي', labelEn:'Ground floor', value:'rdc'},
          {labelFr:'1er étage',  labelAr:'الطابق الأول',   labelEn:'1st floor',   value:'1'},
          {labelFr:'2ème étage', labelAr:'الطابق الثاني',  labelEn:'2nd floor',   value:'2'},
          {labelFr:'3ème étage', labelAr:'الطابق الثالث',  labelEn:'3rd floor',   value:'3'},
          {labelFr:'4ème étage', labelAr:'الطابق الرابع',  labelEn:'4th floor',   value:'4'},
          {labelFr:'5ème étage', labelAr:'الطابق الخامس',  labelEn:'5th floor',   value:'5'},
          {labelFr:'6ème+ étage',labelAr:'السادس فأكثر',   labelEn:'6th+ floor',  value:'6plus'},
          {labelFr:'Dernier étage',labelAr:'الطابق الأخير',labelEn:'Top floor',   value:'top'},
        ],
      },
      {
        id:'floors_total', type:'select',
        labelFr:'Nombre d\'étages (R+…)', labelAr:'عدد الطوابق', labelEn:'Total floors',
        // Only for villas, houses, duplex — NOT for apartments
        showFor: ['villa','house','duplex'],
        options:[
          {labelFr:'Plain-pied (R+0)', labelAr:'طابق أرضي فقط', labelEn:'Single storey', value:'r0'},
          {labelFr:'R+1 (2 niveaux)', labelAr:'طابقان', labelEn:'2 levels', value:'r1'},
          {labelFr:'R+2 (3 niveaux)', labelAr:'3 طوابق', labelEn:'3 levels', value:'r2'},
          {labelFr:'R+3 (4 niveaux)', labelAr:'4 طوابق', labelEn:'4 levels', value:'r3'},
          {labelFr:'R+4 et plus',     labelAr:'5 طوابق فأكثر', labelEn:'5+ levels', value:'r4plus'},
        ],
      },
      {
        id:'bathrooms', type:'select',
        labelFr:'Salles de bain', labelAr:'دورات المياه', labelEn:'Bathrooms',
        showFor: ['f2','f3','f4','f5plus','villa','house','duplex'],
        options:['1','2','3','4+'].map(v=>({labelFr:v+' SDB',labelAr:v+' حمام',labelEn:v+' bath',value:v})),
      },
      {
        id:'amenities', type:'multi',
        labelFr:'Équipements', labelAr:'المرافق', labelEn:'Amenities',
        options:[
          {labelFr:'Parking',       labelAr:'موقف سيارات', labelEn:'Parking',    value:'parking'},
          {labelFr:'Ascenseur',     labelAr:'مصعد',         labelEn:'Elevator',   value:'elevator'},
          {labelFr:'Gardien',       labelAr:'حارس',         labelEn:'Guard',      value:'guard'},
          {labelFr:'Climatisation', labelAr:'مكيف',         labelEn:'AC',         value:'ac'},
          {labelFr:'Jardin',        labelAr:'حديقة',        labelEn:'Garden',     value:'garden'},
          {labelFr:'Piscine',       labelAr:'حمام سباحة',  labelEn:'Pool',       value:'pool'},
          {labelFr:'Cave',          labelAr:'قبو',          labelEn:'Cellar',     value:'cellar'},
          {labelFr:'Terrasse',      labelAr:'شرفة',         labelEn:'Terrace',    value:'terrace'},
          {labelFr:'Meublé',        labelAr:'مفروش',        labelEn:'Furnished',  value:'furnished'},
        ],
      },
    ],
    placeholders: {
      title: {
        fr:'Ex: Appartement F4 lumineux — Centre-ville Alger',
        ar:'مثال: شقة F4 مضيئة — وسط مدينة الجزائر',
        en:'Ex: Bright F4 apartment — Algiers city center',
      },
      description: {
        fr:`Décrivez en détail votre bien :
• Situation : quartier, proximité commerces/transports/écoles
• État général : neuf / rénové / à rénover
• Équipements : climatisation, double vitrage, cuisine équipée…
• Spécificités : vue, exposition, calme, sécurité
• Charges et documents disponibles (titre foncier, acte notarié…)`,
        ar:`صف عقارك بالتفصيل:
• الموقع: الحي، قرب المحلات/النقل/المدارس
• الحالة العامة: جديد / مجدد / يحتاج تجديد
• المرافق: مكيف، نوافذ مزدوجة، مطبخ مجهز...
• مميزات: إطلالة، هدوء، أمن
• الوثائق المتوفرة (عقد ملكية، وثيقة رسمية...)`,
        en:`Describe your property in detail:
• Location: neighborhood, proximity to shops/transport/schools
• General condition: new / renovated / needs renovation
• Equipment: AC, double glazing, equipped kitchen...
• Special features: view, quiet, security
• Available documents (title deed, notarial act...)`,
      },
    },
  },

  // ─── 2. VÉHICULES ──────────────────────────────────────────────────────
  {
    id:'2', nameFr:'Véhicules', nameAr:'مركبات', nameEn:'Vehicles',
    icon:'🚗', color:'#EF4444',
    subCategories:[
      {id:'2a',nameFr:'Voitures',nameAr:'سيارات',nameEn:'Cars'},
      {id:'2b',nameFr:'Motos & Scooters',nameAr:'دراجات نارية',nameEn:'Motorcycles'},
      {id:'2c',nameFr:'Utilitaires',nameAr:'سيارات نفعية',nameEn:'Vans'},
      {id:'2d',nameFr:'Camions',nameAr:'شاحنات',nameEn:'Trucks'},
      {id:'2e',nameFr:'Engins BTP',nameAr:'آليات البناء',nameEn:'Construction'},
      {id:'2f',nameFr:'Pièces & Accessoires',nameAr:'قطع غيار',nameEn:'Parts'},
    ],
    filters:[
      {
        id:'vehicle_type', type:'select',
        labelFr:'Type', labelAr:'النوع', labelEn:'Type', required:true,
        options:[
          {labelFr:'Voiture',         labelAr:'سيارة',          labelEn:'Car',        value:'car'},
          {labelFr:'SUV / 4×4',       labelAr:'دفع رباعي',     labelEn:'SUV / 4x4',  value:'suv'},
          {labelFr:'Pick-up',         labelAr:'بيك أب',         labelEn:'Pick-up',    value:'pickup'},
          {labelFr:'Moto',            labelAr:'دراجة نارية',   labelEn:'Motorcycle', value:'moto'},
          {labelFr:'Scooter',         labelAr:'سكوتر',          labelEn:'Scooter',    value:'scooter'},
          {labelFr:'Fourgonnette',    labelAr:'فانيت',          labelEn:'Van',        value:'van'},
          {labelFr:'Camion',          labelAr:'شاحنة',          labelEn:'Truck',      value:'truck'},
          {labelFr:'Tracteur / Engin',labelAr:'جرار / آلة',    labelEn:'Tractor',    value:'tractor'},
          {labelFr:'Pièce détachée',  labelAr:'قطعة غيار',     labelEn:'Part',       value:'part'},
        ],
      },
      {
        id:'brand', type:'text',
        labelFr:'Marque', labelAr:'الماركة', labelEn:'Brand',
        required:true, placeholder:'Ex: Volkswagen, Toyota, Mercedes…',
      },
      {
        id:'model', type:'text',
        labelFr:'Modèle', labelAr:'الموديل', labelEn:'Model',
        required:true, placeholder:'Ex: Golf 8, Hilux, Classe C…',
      },
      {
        id:'year', type:'select',
        labelFr:'Année', labelAr:'السنة', labelEn:'Year', required:true,
        options: Array.from({length:26},(_,i)=>{const y=String(2025-i); return {labelFr:y,labelAr:y,labelEn:y,value:y}}),
      },
      {
        id:'fuel', type:'select',
        labelFr:'Carburant', labelAr:'الوقود', labelEn:'Fuel', required:true,
        options:[
          {labelFr:'Diesel',       labelAr:'ديزل',    labelEn:'Diesel',    value:'diesel'},
          {labelFr:'Essence',      labelAr:'بنزين',   labelEn:'Gasoline',  value:'gasoline'},
          {labelFr:'Hybride',      labelAr:'هجين',    labelEn:'Hybrid',    value:'hybrid'},
          {labelFr:'Électrique',   labelAr:'كهربائي', labelEn:'Electric',  value:'electric'},
          {labelFr:'GPL',          labelAr:'غاز',     labelEn:'LPG',       value:'lpg'},
        ],
      },
      {
        id:'gearbox', type:'select',
        labelFr:'Boîte de vitesses', labelAr:'ناقل الحركة', labelEn:'Gearbox',
        options:[
          {labelFr:'Manuelle',    labelAr:'يدوي',       labelEn:'Manual',    value:'manual'},
          {labelFr:'Automatique', labelAr:'أوتوماتيك',  labelEn:'Automatic', value:'auto'},
          {labelFr:'Semi-auto',   labelAr:'شبه أوتو',  labelEn:'Semi-auto', value:'semi'},
        ],
      },
      {
        id:'mileage', type:'number',
        labelFr:'Kilométrage (km)', labelAr:'عداد المسافة (كم)', labelEn:'Mileage (km)',
        required:true, min:0, max:2000000, step:1000, placeholder:'Ex: 45000',
      },
      {
        id:'color', type:'text',
        labelFr:'Couleur', labelAr:'اللون', labelEn:'Color',
        placeholder:'Ex: Blanc nacré, Gris graphite…',
      },
      {
        id:'fiscal_power', type:'number',
        labelFr:'Puissance fiscale (CV)', labelAr:'القوة الجبائية', labelEn:'Horsepower',
        min:1, max:999, step:1, placeholder:'Ex: 7',
      },
    ],
    placeholders:{
      title:{
        fr:'Ex: Volkswagen Golf 8 R-Line 2024 — Automatique — 12 000 km',
        ar:'مثال: فولكسفاغن جولف 8 R-Line 2024 — أوتوماتيك — 12000 كم',
        en:'Ex: Volkswagen Golf 8 R-Line 2024 — Automatic — 12,000 km',
      },
      description:{
        fr:`Décrivez votre véhicule honnêtement :
• État général : très bon / bon / moyen (citez les défauts)
• Entretien : carnet de révision, dernière révision (km)
• Options : GPS, toit ouvrant, cuir, caméra recul, ACC…
• Historique : premier propriétaire, jamais accidenté ?
• Documents : carte grise, CT valide jusqu'à…
• Raison de la vente`,
        ar:`صف مركبتك بصدق:
• الحالة العامة: ممتازة / جيدة / متوسطة (اذكر العيوب)
• الصيانة: كتيب الصيانة، آخر صيانة (كم)
• المزايا: GPS، سقف بانورامي، جلد، كاميرا خلفية...
• التاريخ: مالك أول؟ لم يتعرض لحادث؟
• الوثائق: بطاقة رمادية، تقنية صالحة حتى...
• سبب البيع`,
        en:`Describe your vehicle honestly:
• Condition: excellent / good / average (mention defects)
• Maintenance: service booklet, last service (km)
• Options: GPS, sunroof, leather, rear camera, ACC...
• History: first owner, never in accident?
• Documents: registration, valid inspection until...
• Reason for selling`,
      },
    },
  },

  // ─── 3. HIGH-TECH ──────────────────────────────────────────────────────
  {
    id:'3', nameFr:'High-Tech', nameAr:'تكنولوجيا', nameEn:'High-Tech',
    icon:'📱', color:'#8B5CF6',
    subCategories:[
      {id:'3a',nameFr:'Téléphones & Tablettes',nameAr:'هواتف وأجهزة لوحية',nameEn:'Phones & Tablets'},
      {id:'3b',nameFr:'Ordinateurs',nameAr:'حواسيب',nameEn:'Computers'},
      {id:'3c',nameFr:'Consoles & Jeux vidéo',nameAr:'ألعاب فيديو',nameEn:'Gaming'},
      {id:'3d',nameFr:'Photo, Vidéo & Audio',nameAr:'صوت وصورة',nameEn:'Photo & Audio'},
      {id:'3e',nameFr:'Accessoires & Périphériques',nameAr:'ملحقات',nameEn:'Accessories'},
      {id:'3f',nameFr:'Drones & Impression 3D',nameAr:'طائرات بدون طيار',nameEn:'Drones & 3D'},
    ],
    filters:[
      {
        id:'tech_type', type:'select',
        labelFr:'Type', labelAr:'النوع', labelEn:'Type', required:true,
        options:[
          {labelFr:'Smartphone',       labelAr:'هاتف ذكي',   labelEn:'Smartphone',  value:'smartphone'},
          {labelFr:'Tablette',         labelAr:'جهاز لوحي', labelEn:'Tablet',      value:'tablet'},
          {labelFr:'Laptop',           labelAr:'لابتوب',     labelEn:'Laptop',      value:'laptop'},
          {labelFr:'PC Bureau',        labelAr:'حاسوب مكتبي',labelEn:'Desktop PC',  value:'desktop'},
          {labelFr:'Console de jeux',  labelAr:'جهاز ألعاب',labelEn:'Game console',value:'console'},
          {labelFr:'Appareil photo',   labelAr:'كاميرا',     labelEn:'Camera',      value:'camera'},
          {labelFr:'Drone',            labelAr:'طائرة بدون طيار',labelEn:'Drone',  value:'drone'},
          {labelFr:'Imprimante 3D',    labelAr:'طابعة ثلاثية الأبعاد',labelEn:'3D Printer',value:'3dprinter'},
          {labelFr:'Accessoire',       labelAr:'ملحق',       labelEn:'Accessory',   value:'accessory'},
        ],
      },
      {
        id:'brand', type:'text',
        labelFr:'Marque', labelAr:'العلامة التجارية', labelEn:'Brand',
        required:true, placeholder:'Apple, Samsung, Sony, HP…',
      },
      {
        id:'model', type:'text',
        labelFr:'Modèle exact', labelAr:'الموديل الدقيق', labelEn:'Exact model',
        required:true, placeholder:'iPhone 15 Pro Max, Galaxy S24 Ultra…',
      },
      {
        id:'storage', type:'select',
        labelFr:'Stockage', labelAr:'مساحة التخزين', labelEn:'Storage',
        showFor:['smartphone','tablet','laptop','desktop'],
        options:['32 Go','64 Go','128 Go','256 Go','512 Go','1 To','2 To']
          .map(v=>({labelFr:v,labelAr:v,labelEn:v,value:v})),
      },
      {
        id:'condition', type:'select',
        labelFr:'État', labelAr:'الحالة', labelEn:'Condition', required:true,
        options:[
          {labelFr:'Neuf scellé',       labelAr:'جديد مغلق',     labelEn:'Brand new sealed', value:'sealed'},
          {labelFr:'Neuf avec boîte',   labelAr:'جديد مع علبة',  labelEn:'New open box',     value:'new_box'},
          {labelFr:'Très bon état',     labelAr:'حالة ممتازة',   labelEn:'Very good',        value:'very_good'},
          {labelFr:'Bon état',          labelAr:'حالة جيدة',     labelEn:'Good',             value:'good'},
          {labelFr:'État correct',      labelAr:'حالة مقبولة',   labelEn:'Acceptable',       value:'fair'},
          {labelFr:'À réparer',         labelAr:'يحتاج إصلاح',  labelEn:'For repair',       value:'repair'},
        ],
      },
      {
        id:'warranty', type:'select',
        labelFr:'Garantie restante', labelAr:'الضمان المتبقي', labelEn:'Remaining warranty',
        options:[
          {labelFr:'Aucune',       labelAr:'لا يوجد',    labelEn:'None',         value:'none'},
          {labelFr:'< 3 mois',     labelAr:'أقل من 3 أشهر',labelEn:'< 3 months',value:'3m'},
          {labelFr:'3 à 6 mois',  labelAr:'3 إلى 6 أشهر',labelEn:'3-6 months', value:'6m'},
          {labelFr:'6 à 12 mois', labelAr:'6 إلى 12 شهر',labelEn:'6-12 months',value:'12m'},
          {labelFr:'+ 12 mois',   labelAr:'أكثر من سنة', labelEn:'12+ months',  value:'12mplus'},
        ],
      },
    ],
    placeholders:{
      title:{
        fr:'Ex: iPhone 15 Pro Max 256 Go Titane Naturel — Garantie Apple 10 mois',
        ar:'مثال: آيفون 15 برو ماكس 256 جيجا تيتانيوم طبيعي — ضمان آبل 10 أشهر',
        en:'Ex: iPhone 15 Pro Max 256GB Natural Titanium — 10 months Apple Warranty',
      },
      description:{
        fr:`Détaillez votre article :
• Modèle exact, capacité, couleur
• État détaillé : batterie (%), rayures, historique chutes
• Accessoires inclus : boîte, câble, chargeur, coque…
• Garantie : constructeur ou AppleCare / SAV ?
• Raison de la vente
• Échange possible ? (précisez contre quoi)`,
        ar:`فصّل منتجك:
• الموديل الدقيق، السعة، اللون
• الحالة التفصيلية: البطارية (%)، خدوش، سقطات
• الملحقات: علبة، كابل، شاحن، غطاء...
• الضمان: من الشركة أو AppleCare؟
• سبب البيع
• تبادل ممكن؟ (حدد مع ماذا)`,
        en:`Detail your item:
• Exact model, capacity, color
• Detailed condition: battery (%), scratches, drop history
• Included accessories: box, cable, charger, case...
• Warranty: manufacturer or AppleCare?
• Reason for selling
• Open to exchange? (specify for what)`,
      },
    },
  },

  // ─── 4. EMPLOI ─────────────────────────────────────────────────────────
  {
    id:'4', nameFr:'Emploi', nameAr:'توظيف', nameEn:'Jobs',
    icon:'💼', color:'#10B981',
    subCategories:[
      {id:'4a',nameFr:'Offres d\'emploi',nameAr:'عروض عمل',nameEn:'Job offers'},
      {id:'4b',nameFr:'Demandes d\'emploi',nameAr:'طلبات عمل',nameEn:'Job wanted'},
      {id:'4c',nameFr:'Stages & Alternance',nameAr:'تدريب',nameEn:'Internships'},
      {id:'4d',nameFr:'Freelance & Missions',nameAr:'عمل حر',nameEn:'Freelance'},
    ],
    filters:[
      {
        id:'job_type', type:'select',
        labelFr:'Type de contrat', labelAr:'نوع العقد', labelEn:'Contract type', required:true,
        options:[
          {labelFr:'CDI',               labelAr:'عقد دائم',      labelEn:'Permanent',     value:'cdi'},
          {labelFr:'CDD',               labelAr:'عقد مؤقت',     labelEn:'Fixed-term',    value:'cdd'},
          {labelFr:'Temps partiel',     labelAr:'دوام جزئي',    labelEn:'Part-time',     value:'parttime'},
          {labelFr:'Freelance / Mission',labelAr:'عمل حر',       labelEn:'Freelance',     value:'freelance'},
          {labelFr:'Stage',             labelAr:'تدريب',         labelEn:'Internship',    value:'internship'},
          {labelFr:'Alternance',        labelAr:'تناوب',         labelEn:'Apprenticeship',value:'apprentice'},
          {labelFr:'Saisonnier',        labelAr:'موسمي',         labelEn:'Seasonal',      value:'seasonal'},
        ],
      },
      {
        id:'sector', type:'select',
        labelFr:'Secteur', labelAr:'القطاع', labelEn:'Sector', required:true,
        options:[
          {labelFr:'Informatique / IT',      labelAr:'إعلام آلي',        labelEn:'IT',          value:'it'},
          {labelFr:'BTP / Génie civil',      labelAr:'بناء',             labelEn:'Construction',value:'btp'},
          {labelFr:'Santé / Médical',        labelAr:'صحة',              labelEn:'Healthcare',  value:'health'},
          {labelFr:'Éducation / Formation',  labelAr:'تعليم',            labelEn:'Education',   value:'education'},
          {labelFr:'Commerce / Vente',       labelAr:'تجارة',            labelEn:'Commerce',    value:'commerce'},
          {labelFr:'Finance / Comptabilité', labelAr:'مالية ومحاسبة',   labelEn:'Finance',     value:'finance'},
          {labelFr:'Industrie / Production', labelAr:'صناعة',            labelEn:'Industry',    value:'industry'},
          {labelFr:'Transport / Logistique', labelAr:'نقل',              labelEn:'Transport',   value:'transport'},
          {labelFr:'Hôtellerie / Tourisme',  labelAr:'فندقة وسياحة',    labelEn:'Hospitality', value:'hospitality'},
          {labelFr:'Agriculture',            labelAr:'فلاحة',            labelEn:'Agriculture', value:'agriculture'},
          {labelFr:'Administration',         labelAr:'إدارة',            labelEn:'Admin',       value:'admin'},
          {labelFr:'Autre',                  labelAr:'أخرى',             labelEn:'Other',       value:'other'},
        ],
      },
      {
        id:'experience', type:'select',
        labelFr:'Expérience requise', labelAr:'الخبرة المطلوبة', labelEn:'Experience required',
        options:[
          {labelFr:'Débutant accepté',   labelAr:'مبتدئ مقبول',   labelEn:'Entry level',   value:'0'},
          {labelFr:'1 à 2 ans',          labelAr:'1 إلى 2 سنة',   labelEn:'1-2 years',     value:'1_2'},
          {labelFr:'2 à 5 ans',          labelAr:'2 إلى 5 سنوات', labelEn:'2-5 years',     value:'2_5'},
          {labelFr:'5 à 10 ans',         labelAr:'5 إلى 10 سنوات',labelEn:'5-10 years',    value:'5_10'},
          {labelFr:'10+ ans',            labelAr:'أكثر من 10 سنوات',labelEn:'10+ years',   value:'10plus'},
        ],
      },
      {
        id:'work_mode', type:'select',
        labelFr:'Mode de travail', labelAr:'نمط العمل', labelEn:'Work mode',
        options:[
          {labelFr:'Présentiel',       labelAr:'حضوري',        labelEn:'On-site',  value:'onsite'},
          {labelFr:'Télétravail',      labelAr:'عن بعد',       labelEn:'Remote',   value:'remote'},
          {labelFr:'Hybride',          labelAr:'هجين',         labelEn:'Hybrid',   value:'hybrid'},
          {labelFr:'Déplacement requis',labelAr:'تنقل مطلوب', labelEn:'Travel required',value:'travel'},
        ],
      },
    ],
    placeholders:{
      title:{
        fr:'Ex: Développeur React Senior — CDI — Alger — Télétravail partiel',
        ar:'مثال: مطور React أول — عقد دائم — الجزائر — عمل جزئي عن بعد',
        en:'Ex: Senior React Developer — Permanent — Algiers — Partial remote',
      },
      description:{
        fr:`Décrivez le poste en détail :
• Nom de l'entreprise (ou secteur si confidentiel)
• Missions principales et responsabilités
• Profil recherché : diplôme, compétences, langues
• Conditions : salaire (fourchette), avantages (véhicule, mutuelle, tickets resto…)
• Horaires et lieu de travail
• Comment postuler : email, lien, téléphone`,
        ar:`صف المنصب بالتفصيل:
• اسم المؤسسة (أو القطاع إذا كان سريًا)
• المهام الرئيسية والمسؤوليات
• الملف المطلوب: شهادة، كفاءات، لغات
• الشروط: الراتب (شريحة)، المزايا (سيارة، تأمين، قسائم مطعم...)
• أوقات العمل والموقع
• طريقة التقديم: بريد إلكتروني، رابط، هاتف`,
        en:`Describe the position in detail:
• Company name (or sector if confidential)
• Main duties and responsibilities
• Required profile: degree, skills, languages
• Terms: salary range, benefits (car, insurance, meal vouchers...)
• Working hours and location
• How to apply: email, link, phone`,
      },
    },
  },

  // ─── 5. MAISON ─────────────────────────────────────────────────────────
  {
    id:'5', nameFr:'Maison & Jardin', nameAr:'المنزل والحديقة', nameEn:'Home & Garden',
    icon:'🛋️', color:'#F59E0B',
    subCategories:[
      {id:'5a',nameFr:'Meubles',nameAr:'أثاث',nameEn:'Furniture'},
      {id:'5b',nameFr:'Électroménager',nameAr:'أجهزة منزلية',nameEn:'Appliances'},
      {id:'5c',nameFr:'Décoration',nameAr:'ديكور',nameEn:'Decoration'},
      {id:'5d',nameFr:'Jardin & Extérieur',nameAr:'حديقة',nameEn:'Garden'},
      {id:'5e',nameFr:'Bricolage & Outils',nameAr:'أدوات يدوية',nameEn:'DIY & Tools'},
    ],
    filters:[
      {
        id:'home_type', type:'select',
        labelFr:'Catégorie', labelAr:'الفئة', labelEn:'Category', required:true,
        options:[
          {labelFr:'Meuble',          labelAr:'أثاث',          labelEn:'Furniture',   value:'furniture'},
          {labelFr:'Électroménager',  labelAr:'جهاز منزلي',    labelEn:'Appliance',   value:'appliance'},
          {labelFr:'Décoration',      labelAr:'ديكور',         labelEn:'Decor',       value:'decor'},
          {labelFr:'Literie',         labelAr:'فراش',          labelEn:'Bedding',     value:'bedding'},
          {labelFr:'Cuisine',         labelAr:'مطبخ',          labelEn:'Kitchen',     value:'kitchen'},
          {labelFr:'Salle de bain',   labelAr:'حمام',          labelEn:'Bathroom',    value:'bathroom'},
          {labelFr:'Jardin',          labelAr:'حديقة',         labelEn:'Garden',      value:'garden'},
          {labelFr:'Outil / Bricolage',labelAr:'أدوات',       labelEn:'Tools',       value:'tools'},
        ],
      },
      {
        id:'condition', type:'select',
        labelFr:'État', labelAr:'الحالة', labelEn:'Condition', required:true,
        options:[
          {labelFr:'Neuf (jamais utilisé)',  labelAr:'جديد (لم يُستخدم)',  labelEn:'New (unused)',    value:'new'},
          {labelFr:'Comme neuf',             labelAr:'كالجديد',            labelEn:'Like new',        value:'like_new'},
          {labelFr:'Très bon état',          labelAr:'حالة ممتازة',        labelEn:'Very good',       value:'very_good'},
          {labelFr:'Bon état',               labelAr:'حالة جيدة',          labelEn:'Good',            value:'good'},
          {labelFr:'État correct',           labelAr:'حالة مقبولة',        labelEn:'Acceptable',      value:'fair'},
          {labelFr:'Pièces / À réparer',     labelAr:'للإصلاح',           labelEn:'For parts',       value:'parts'},
        ],
      },
      {
        id:'brand', type:'text',
        labelFr:'Marque (si applicable)', labelAr:'الماركة (إن وجدت)', labelEn:'Brand (if applicable)',
        placeholder:'Samsung, Bosch, IKEA, LG…',
      },
    ],
    placeholders:{
      title:{
        fr:'Ex: Canapé d\'angle convertible cuir anthracite — Très bon état',
        ar:'مثال: كنبة ركنية قابلة للتحويل جلد رمادي — حالة ممتازة',
        en:'Ex: Corner sofa bed anthracite leather — Very good condition',
      },
      description:{
        fr:`Décrivez votre article :
• Dimensions exactes (L × l × H en cm)
• Matière et couleur précise
• Marque et modèle si disponibles
• Historique : âge, raison de la vente
• Défauts éventuels : rayures, taches, réparations
• Livraison possible ? (coût supplémentaire)
• Montage/démontage requis ?`,
        ar:`صف المنتج:
• الأبعاد الدقيقة (ط × ع × ارتفاع بالسم)
• المادة واللون الدقيق
• الماركة والموديل إن وجدا
• التاريخ: العمر، سبب البيع
• العيوب المحتملة: خدوش، بقع، إصلاحات
• هل التوصيل ممكن؟ (بتكلفة إضافية)
• هل يلزم تركيب/فك؟`,
        en:`Describe your item:
• Exact dimensions (W × D × H in cm)
• Material and exact color
• Brand and model if available
• History: age, reason for selling
• Potential defects: scratches, stains, repairs
• Delivery possible? (extra cost)
• Assembly/disassembly required?`,
      },
    },
  },

  // ─── Remaining categories (simpler) ───────────────────────────────────
  {
    id:'6', nameFr:'Mode', nameAr:'موضة', nameEn:'Fashion',
    icon:'👗', color:'#EC4899',
    subCategories:[
      {id:'6a',nameFr:'Vêtements Homme',nameAr:'ملابس رجالية',nameEn:"Men's"},
      {id:'6b',nameFr:'Vêtements Femme',nameAr:'ملابس نسائية',nameEn:"Women's"},
      {id:'6c',nameFr:'Enfants',nameAr:'ملابس أطفال',nameEn:"Children's"},
      {id:'6d',nameFr:'Chaussures',nameAr:'أحذية',nameEn:'Shoes'},
      {id:'6e',nameFr:'Accessoires',nameAr:'إكسسوارات',nameEn:'Accessories'},
      {id:'6f',nameFr:'Tenues traditionnelles',nameAr:'ملابس تقليدية',nameEn:'Traditional'},
    ],
    filters:[
      {id:'gender',type:'select',labelFr:'Genre',labelAr:'الجنس',labelEn:'Gender',required:true,
        options:[{labelFr:'Homme',labelAr:'رجال',labelEn:'Men',value:'men'},{labelFr:'Femme',labelAr:'نساء',labelEn:'Women',value:'women'},{labelFr:'Enfant',labelAr:'أطفال',labelEn:'Kids',value:'kids'},{labelFr:'Unisexe',labelAr:'للجنسين',labelEn:'Unisex',value:'unisex'}]},
      {id:'size',type:'text',labelFr:'Taille',labelAr:'المقاس',labelEn:'Size',placeholder:'S, M, L, XL, 42, 44…'},
      {id:'brand',type:'text',labelFr:'Marque',labelAr:'الماركة',labelEn:'Brand',placeholder:'Zara, H&M, Nike…'},
      {id:'condition',type:'select',labelFr:'État',labelAr:'الحالة',labelEn:'Condition',required:true,
        options:[{labelFr:'Neuf avec étiquette',labelAr:'جديد مع بطاقة',labelEn:'New with tag',value:'new'},{labelFr:'Neuf sans étiquette',labelAr:'جديد بدون بطاقة',labelEn:'New no tag',value:'new_nt'},{labelFr:'Très bon état',labelAr:'ممتاز',labelEn:'Very good',value:'very_good'},{labelFr:'Bon état',labelAr:'جيد',labelEn:'Good',value:'good'},{labelFr:'Correct',labelAr:'مقبول',labelEn:'Fair',value:'fair'}]},
    ],
    placeholders:{title:{fr:'Ex: Caftan de cérémonie brodé main — Taille 40 — Porté 1 fois',ar:'مثال: قفطان حفلات مطرز يدويًا — مقاس 40 — مُلبس مرة واحدة',en:'Ex: Hand-embroidered ceremony caftan — Size 40 — Worn once'},description:{fr:'Taille, couleur, matière, marque, état détaillé, lavage, raison de la vente.',ar:'المقاس، اللون، القماش، الماركة، الحالة التفصيلية، الغسيل، سبب البيع.',en:'Size, color, fabric, brand, detailed condition, washing, reason for selling.'}},
  },
  {
    id:'7', nameFr:'Agriculture', nameAr:'فلاحة', nameEn:'Agriculture',
    icon:'🌾', color:'#84CC16',
    subCategories:[
      {id:'7a',nameFr:'Terrains agricoles',nameAr:'أراضي زراعية',nameEn:'Agricultural land'},
      {id:'7b',nameFr:'Équipements agricoles',nameAr:'معدات فلاحية',nameEn:'Equipment'},
      {id:'7c',nameFr:'Bétail & Élevage',nameAr:'مواشي',nameEn:'Livestock'},
      {id:'7d',nameFr:'Semences & Plants',nameAr:'بذور ونباتات',nameEn:'Seeds & Plants'},
    ],
    filters:[
      {id:'agri_type',type:'select',labelFr:'Type',labelAr:'النوع',labelEn:'Type',required:true,
        options:[{labelFr:'Terrain',labelAr:'أرض',labelEn:'Land',value:'land'},{labelFr:'Tracteur',labelAr:'جرار',labelEn:'Tractor',value:'tractor'},{labelFr:'Autre équipement',labelAr:'معدة أخرى',labelEn:'Other equipment',value:'equipment'},{labelFr:'Bovins',labelAr:'أبقار',labelEn:'Cattle',value:'cattle'},{labelFr:'Ovins',labelAr:'أغنام',labelEn:'Sheep',value:'sheep'},{labelFr:'Volaille',labelAr:'دواجن',labelEn:'Poultry',value:'poultry'},{labelFr:'Semences',labelAr:'بذور',labelEn:'Seeds',value:'seeds'}]},
      {id:'surface',type:'number',labelFr:'Superficie (ha)',labelAr:'المساحة (هكتار)',labelEn:'Area (ha)',min:0,max:100000,step:0.5,placeholder:'Ex: 5.5',showFor:['land']},
    ],
    placeholders:{title:{fr:'Ex: Tracteur John Deere 5075E 2019 — 850h — Très bon état',ar:'مثال: جرار John Deere 5075E 2019 — 850 ساعة — حالة ممتازة',en:'Ex: John Deere 5075E tractor 2019 — 850h — Very good condition'},description:{fr:'Marque, modèle, année, heures, état, entretien, documents.',ar:'الماركة، الموديل، السنة، الساعات، الحالة، الصيانة، الوثائق.',en:'Brand, model, year, hours, condition, maintenance, documents.'}},
  },
  {
    id:'8', nameFr:'Loisirs & Sports', nameAr:'ترفيه ورياضة', nameEn:'Leisure & Sports',
    icon:'🎾', color:'#F97316',
    subCategories:[{id:'8a',nameFr:'Sports & Fitness',nameAr:'رياضة',nameEn:'Sports'},{id:'8b',nameFr:'Jeux & Jouets',nameAr:'ألعاب',nameEn:'Toys'},{id:'8c',nameFr:'Instruments de musique',nameAr:'آلات موسيقية',nameEn:'Music'},{id:'8d',nameFr:'Livres & BD',nameAr:'كتب',nameEn:'Books'},{id:'8e',nameFr:'Camping & Randonnée',nameAr:'تخييم',nameEn:'Camping'}],
    filters:[
      {id:'condition',type:'select',labelFr:'État',labelAr:'الحالة',labelEn:'Condition',required:true,options:[{labelFr:'Neuf',labelAr:'جديد',labelEn:'New',value:'new'},{labelFr:'Très bon état',labelAr:'ممتاز',labelEn:'Very good',value:'very_good'},{labelFr:'Bon état',labelAr:'جيد',labelEn:'Good',value:'good'},{labelFr:'Correct',labelAr:'مقبول',labelEn:'Fair',value:'fair'}]},
    ],
    placeholders:{title:{fr:'Ex: Vélo de route Specialized Tarmac SL7 Taille 56 — 2 saisons',ar:'مثال: دراجة طريق Specialized Tarmac SL7 مقاس 56 — موسمان',en:'Ex: Specialized Tarmac SL7 road bike size 56 — 2 seasons'},description:{fr:'Taille/taille, état, marque, accessoires inclus, raison de la vente.',ar:'الحجم، الحالة، الماركة، الملحقات المضمنة، سبب البيع.',en:'Size, condition, brand, included accessories, reason for selling.'}},
  },
  {
    id:'9', nameFr:'Services', nameAr:'خدمات', nameEn:'Services',
    icon:'🔧', color:'#6366F1',
    subCategories:[{id:'9a',nameFr:'Artisanat & BTP',nameAr:'حرف ومقاولة',nameEn:'Trades'},{id:'9b',nameFr:'Cours & Tutorat',nameAr:'دروس خصوصية',nameEn:'Tutoring'},{id:'9c',nameFr:'Transport & Déménagement',nameAr:'نقل',nameEn:'Transport'},{id:'9d',nameFr:'Nettoyage & Entretien',nameAr:'نظافة',nameEn:'Cleaning'},{id:'9e',nameFr:'Informatique & Web',nameAr:'إعلام آلي وويب',nameEn:'IT & Web'},{id:'9f',nameFr:'Autres services',nameAr:'خدمات أخرى',nameEn:'Other'}],
    filters:[
      {id:'service_type',type:'select',labelFr:'Type de service',labelAr:'نوع الخدمة',labelEn:'Service type',required:true,options:[{labelFr:'Artisan / BTP',labelAr:'حرفي / بناء',labelEn:'Trade / Construction',value:'trade'},{labelFr:'Cours particulier',labelAr:'دروس خاصة',labelEn:'Private lesson',value:'lesson'},{labelFr:'Transport',labelAr:'نقل',labelEn:'Transport',value:'transport'},{labelFr:'Nettoyage',labelAr:'تنظيف',labelEn:'Cleaning',value:'cleaning'},{labelFr:'IT / Développement',labelAr:'تطوير ويب',labelEn:'IT / Dev',value:'it'},{labelFr:'Design / Graphisme',labelAr:'تصميم',labelEn:'Design',value:'design'},{labelFr:'Autre',labelAr:'أخرى',labelEn:'Other',value:'other'}]},
      {id:'availability',type:'select',labelFr:'Disponibilité',labelAr:'التوفر',labelEn:'Availability',options:[{labelFr:'Immédiate',labelAr:'فوري',labelEn:'Immediate',value:'now'},{labelFr:'Jours ouvrables',labelAr:'أيام العمل',labelEn:'Weekdays',value:'weekdays'},{labelFr:'Week-end',labelAr:'نهاية الأسبوع',labelEn:'Weekends',value:'weekend'},{labelFr:'Sur rendez-vous',labelAr:'بموعد',labelEn:'By appointment',value:'appointment'}]},
    ],
    placeholders:{title:{fr:'Ex: Plombier agréé — Dépannage urgent 24h/7j — Alger et banlieue',ar:'مثال: سباك معتمد — تدخل عاجل 24/7 — الجزائر والضواحي',en:'Ex: Licensed plumber — Emergency 24/7 — Algiers area'},description:{fr:'Décrivez vos qualifications, expérience, zone d\'intervention, tarifs et modalités de contact.',ar:'صف مؤهلاتك، خبرتك، منطقة التدخل، الأسعار وطريقة التواصل.',en:'Describe your qualifications, experience, coverage area, rates and contact details.'}},
  },
  {
    id:'10', nameFr:'Animaux', nameAr:'حيوانات أليفة', nameEn:'Pets',
    icon:'🐕', color:'#D97706',
    subCategories:[{id:'10a',nameFr:'Chiens',nameAr:'كلاب',nameEn:'Dogs'},{id:'10b',nameFr:'Chats',nameAr:'قطط',nameEn:'Cats'},{id:'10c',nameFr:'Oiseaux',nameAr:'طيور',nameEn:'Birds'},{id:'10d',nameFr:'Poissons & Aquariophilie',nameAr:'أسماك',nameEn:'Fish'},{id:'10e',nameFr:'Autres animaux',nameAr:'حيوانات أخرى',nameEn:'Other animals'},{id:'10f',nameFr:'Accessoires & Alimentation',nameAr:'مستلزمات',nameEn:'Accessories'}],
    filters:[
      {id:'animal_type',type:'select',labelFr:'Animal',labelAr:'الحيوان',labelEn:'Animal',required:true,options:[{labelFr:'Chien',labelAr:'كلب',labelEn:'Dog',value:'dog'},{labelFr:'Chat',labelAr:'قطة',labelEn:'Cat',value:'cat'},{labelFr:'Oiseau',labelAr:'طائر',labelEn:'Bird',value:'bird'},{labelFr:'Perroquet',labelAr:'ببغاء',labelEn:'Parrot',value:'parrot'},{labelFr:'Poisson',labelAr:'سمكة',labelEn:'Fish',value:'fish'},{labelFr:'Tortue',labelAr:'سلحفاة',labelEn:'Turtle',value:'turtle'},{labelFr:'Lapin',labelAr:'أرنب',labelEn:'Rabbit',value:'rabbit'},{labelFr:'Accessoire',labelAr:'مستلزمات',labelEn:'Accessory',value:'accessory'}]},
      {id:'vaccinated',type:'select',labelFr:'Vacciné',labelAr:'ملقح',labelEn:'Vaccinated',showFor:['dog','cat','bird','parrot','rabbit'],options:[{labelFr:'Oui, carnet à jour',labelAr:'نعم، سجل محدث',labelEn:'Yes, up to date',value:'yes'},{labelFr:'Partiellement',labelAr:'جزئيًا',labelEn:'Partial',value:'partial'},{labelFr:'Non',labelAr:'لا',labelEn:'No',value:'no'}]},
      {id:'pedigree',type:'select',labelFr:'Pedigree / LOF',labelAr:'شجرة النسب',labelEn:'Pedigree',showFor:['dog','cat'],options:[{labelFr:'Oui, inscrit',labelAr:'نعم، مسجل',labelEn:'Yes, registered',value:'yes'},{labelFr:'Non',labelAr:'لا',labelEn:'No',value:'no'}]},
    ],
    placeholders:{title:{fr:'Ex: Chiot Berger Allemand LOF — 2 mois — Vacciné — Alger',ar:'مثال: جرو راعي ألماني LOF — شهران — ملقح — الجزائر',en:'Ex: German Shepherd puppy LOF — 2 months — Vaccinated — Algiers'},description:{fr:'Race, âge, sexe, couleur, vaccins, pedigree, alimentation actuelle, tempérament, raison de la vente.',ar:'السلالة، العمر، الجنس، اللون، اللقاحات، شجرة النسب، الطعام الحالي، الطباع، سبب البيع.',en:'Breed, age, sex, color, vaccinations, pedigree, current diet, temperament, reason for selling.'}},
  },
  {
    id:'11', nameFr:'Matériaux & BTP', nameAr:'مواد البناء', nameEn:'Building Materials',
    icon:'🧱', color:'#78716C',
    subCategories:[{id:'11a',nameFr:'Matériaux de construction',nameAr:'مواد بناء',nameEn:'Materials'},{id:'11b',nameFr:'Outillage & Électroportatif',nameAr:'أدوات كهربائية',nameEn:'Power tools'},{id:'11c',nameFr:'Sanitaire & Plomberie',nameAr:'صرف صحي',nameEn:'Plumbing'},{id:'11d',nameFr:'Électricité',nameAr:'كهرباء',nameEn:'Electrical'},{id:'11e',nameFr:'Groupes électrogènes',nameAr:'مولدات كهربائية',nameEn:'Generators'}],
    filters:[
      {id:'btp_type',type:'select',labelFr:'Type',labelAr:'النوع',labelEn:'Type',required:true,options:[{labelFr:'Matériau',labelAr:'مادة بناء',labelEn:'Material',value:'material'},{labelFr:'Outil manuel',labelAr:'أداة يدوية',labelEn:'Hand tool',value:'hand_tool'},{labelFr:'Outil électroportatif',labelAr:'أداة كهربائية',labelEn:'Power tool',value:'power_tool'},{labelFr:'Engin / Machine',labelAr:'آلة',labelEn:'Machine',value:'machine'},{labelFr:'Sanitaire',labelAr:'صحي',labelEn:'Plumbing',value:'plumbing'},{labelFr:'Électricité',labelAr:'كهرباء',labelEn:'Electrical',value:'electrical'},{labelFr:'Groupe électrogène',labelAr:'مولد كهربائي',labelEn:'Generator',value:'generator'}]},
      {id:'quantity',type:'number',labelFr:'Quantité disponible',labelAr:'الكمية المتاحة',labelEn:'Available quantity',min:1,max:100000,step:1,placeholder:'Ex: 200 (m², unités, tonnes…)'},
    ],
    placeholders:{title:{fr:'Ex: Lot carrelage grès céramique 60×60 gris béton mat — 150 m²',ar:'مثال: مجموعة بلاط سيراميك 60×60 رمادي مطفي — 150 م²',en:'Ex: Ceramic floor tile 60×60 mat concrete grey — 150 sqm'},description:{fr:'Type exact, dimensions, quantité, marque, couleur/référence, raison de la vente (chantier terminé, surplus…).',ar:'النوع الدقيق، الأبعاد، الكمية، الماركة، اللون/المرجع، سبب البيع (ورشة منتهية، فائض...).',en:'Exact type, dimensions, quantity, brand, color/reference, reason for selling (finished project, surplus...).'}},
  },
];

export function getCategoryById(id: string) { return CATEGORIES.find(c => c.id === id); }
export function getCategoryName(id: string, lang: 'fr'|'ar'|'en' = 'fr'): string {
  const cat = getCategoryById(id);
  if (!cat) return '';
  return lang === 'ar' ? cat.nameAr : lang === 'en' ? cat.nameEn : cat.nameFr;
}
