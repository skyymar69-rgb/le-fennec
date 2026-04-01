import type { Category } from '../types';

export const CATEGORIES: Category[] = [
  {
    id:'1', nameFr:'Immobilier', nameAr:'عقارات', nameEn:'Real Estate',
    icon:'🏠', color:'#3B82F6',
    subCategories:[
      {id:'1a',nameFr:'Appartements',nameAr:'شقق',nameEn:'Apartments'},
      {id:'1b',nameFr:'Villas',nameAr:'فيلات',nameEn:'Villas'},
      {id:'1c',nameFr:'Terrains',nameAr:'أراضي',nameEn:'Land'},
      {id:'1d',nameFr:'Locaux commerciaux',nameAr:'محلات تجارية',nameEn:'Commercial'},
      {id:'1e',nameFr:'Locations',nameAr:'إيجارات',nameEn:'Rentals'},
    ],
    filters:[
      {id:'type',type:'select',labelFr:'Type',labelAr:'النوع',labelEn:'Type',
        options:[
          {labelFr:'Appartement',labelAr:'شقة',labelEn:'Apartment',value:'apartment'},
          {labelFr:'Villa',labelAr:'فيلا',labelEn:'Villa',value:'villa'},
          {labelFr:'Studio',labelAr:'استوديو',labelEn:'Studio',value:'studio'},
          {labelFr:'Bureau',labelAr:'مكتب',labelEn:'Office',value:'office'},
          {labelFr:'Terrain',labelAr:'أرض',labelEn:'Land',value:'land'},
          {labelFr:'Local commercial',labelAr:'محل',labelEn:'Commercial',value:'commercial'},
        ]},
      {id:'rooms',type:'select',labelFr:'Pièces',labelAr:'الغرف',labelEn:'Rooms',
        options:['1','2','3','4','5+'].map(v=>({labelFr:v+' pièce(s)',labelAr:v+' غرفة',labelEn:v+' room(s)',value:v}))},
      {id:'surface_min',type:'number',labelFr:'Surface min (m²)',labelAr:'المساحة الدنيا (م²)',labelEn:'Min area (m²)',min:0,max:10000,step:10,placeholder:'Ex: 80'},
      {id:'floor',type:'select',labelFr:'Étage',labelAr:'الطابق',labelEn:'Floor',
        options:['RDC','1er','2ème','3ème','4ème','5ème+'].map(v=>({labelFr:v,labelAr:v,labelEn:v,value:v}))},
    ],
  },
  {
    id:'2', nameFr:'Véhicules', nameAr:'مركبات', nameEn:'Vehicles',
    icon:'🚗', color:'#EF4444',
    subCategories:[
      {id:'2a',nameFr:'Voitures',nameAr:'سيارات',nameEn:'Cars'},
      {id:'2b',nameFr:'Motos & Scooters',nameAr:'دراجات',nameEn:'Motorcycles'},
      {id:'2c',nameFr:'Utilitaires',nameAr:'سيارات نفعية',nameEn:'Vans'},
      {id:'2d',nameFr:'Camions',nameAr:'شاحنات',nameEn:'Trucks'},
      {id:'2e',nameFr:'Pièces & Accessoires',nameAr:'قطع غيار',nameEn:'Parts'},
    ],
    filters:[
      {id:'year_min',type:'select',labelFr:'Année min',labelAr:'السنة الدنيا',labelEn:'Min year',
        options:['2024','2023','2022','2021','2020','2019','2018','2015','2010','2005','2000'].map(v=>({labelFr:v,labelAr:v,labelEn:v,value:v}))},
      {id:'fuel',type:'select',labelFr:'Carburant',labelAr:'الوقود',labelEn:'Fuel',
        options:[
          {labelFr:'Diesel',labelAr:'ديزل',labelEn:'Diesel',value:'Diesel'},
          {labelFr:'Essence',labelAr:'بنزين',labelEn:'Gasoline',value:'Essence'},
          {labelFr:'Hybride',labelAr:'هجين',labelEn:'Hybrid',value:'Hybride'},
          {labelFr:'Électrique',labelAr:'كهربائي',labelEn:'Electric',value:'Électrique'},
          {labelFr:'GPL',labelAr:'غاز',labelEn:'LPG',value:'GPL'},
        ]},
      {id:'gearbox',type:'select',labelFr:'Boîte de vitesses',labelAr:'ناقل الحركة',labelEn:'Gearbox',
        options:[
          {labelFr:'Manuelle',labelAr:'يدوي',labelEn:'Manual',value:'Manuelle'},
          {labelFr:'Automatique',labelAr:'أوتوماتيك',labelEn:'Automatic',value:'Automatique'},
        ]},
      {id:'mileage_max',type:'select',labelFr:'Kilométrage max',labelAr:'الحد الأقصى للمسافة',labelEn:'Max mileage',
        options:['10000','30000','50000','100000','150000','200000'].map(v=>({
          labelFr:Number(v).toLocaleString()+' km',labelAr:Number(v).toLocaleString()+' كم',
          labelEn:Number(v).toLocaleString()+' km',value:v}))},
    ],
  },
  {
    id:'3', nameFr:'High-Tech', nameAr:'تكنولوجيا', nameEn:'High-Tech',
    icon:'📱', color:'#8B5CF6',
    subCategories:[
      {id:'3a',nameFr:'Téléphones',nameAr:'هواتف',nameEn:'Phones'},
      {id:'3b',nameFr:'Ordinateurs',nameAr:'حواسيب',nameEn:'Computers'},
      {id:'3c',nameFr:'Tablettes',nameAr:'أجهزة لوحية',nameEn:'Tablets'},
      {id:'3d',nameFr:'Consoles & Jeux',nameAr:'ألعاب',nameEn:'Gaming'},
      {id:'3e',nameFr:'Photo & Audio',nameAr:'صوت وصورة',nameEn:'Photo & Audio'},
    ],
    filters:[
      {id:'brand',type:'select',labelFr:'Marque',labelAr:'العلامة',labelEn:'Brand',
        options:['Apple','Samsung','Huawei','Xiaomi','Oppo','Sony','HP','Dell','Lenovo','Asus'].map(v=>({labelFr:v,labelAr:v,labelEn:v,value:v}))},
      {id:'state',type:'select',labelFr:'État',labelAr:'الحالة',labelEn:'Condition',
        options:[
          {labelFr:'Neuf',labelAr:'جديد',labelEn:'New',value:'new'},
          {labelFr:'Comme neuf',labelAr:'كالجديد',labelEn:'Like new',value:'like_new'},
          {labelFr:'Très bon état',labelAr:'حالة ممتازة',labelEn:'Very good',value:'good'},
          {labelFr:'Bon état',labelAr:'حالة جيدة',labelEn:'Good',value:'fair'},
        ]},
    ],
  },
  {
    id:'4', nameFr:'Emploi', nameAr:'توظيف', nameEn:'Jobs',
    icon:'💼', color:'#F59E0B',
    subCategories:[
      {id:'4a',nameFr:'Offres d\'emploi',nameAr:'عروض عمل',nameEn:'Job offers'},
      {id:'4b',nameFr:'Formation',nameAr:'تكوين',nameEn:'Training'},
      {id:'4c',nameFr:'Freelance',nameAr:'مستقل',nameEn:'Freelance'},
    ],
    filters:[
      {id:'type',type:'select',labelFr:'Type',labelAr:'النوع',labelEn:'Type',
        options:[
          {labelFr:'CDI',labelAr:'دائم',labelEn:'Permanent',value:'CDI'},
          {labelFr:'CDD',labelAr:'مؤقت',labelEn:'Contract',value:'CDD'},
          {labelFr:'Freelance',labelAr:'مستقل',labelEn:'Freelance',value:'Freelance'},
          {labelFr:'Stage',labelAr:'تدريب',labelEn:'Internship',value:'Stage'},
        ]},
      {id:'sector',type:'select',labelFr:'Secteur',labelAr:'القطاع',labelEn:'Sector',
        options:['Informatique','BTP','Santé','Éducation','Commerce','Industrie','Finance'].map(v=>({labelFr:v,labelAr:v,labelEn:v,value:v}))},
    ],
  },
  {
    id:'5', nameFr:'Maison', nameAr:'المنزل', nameEn:'Home',
    icon:'🛋️', color:'#10B981',
    subCategories:[
      {id:'5a',nameFr:'Mobilier',nameAr:'أثاث',nameEn:'Furniture'},
      {id:'5b',nameFr:'Électroménager',nameAr:'أجهزة منزلية',nameEn:'Appliances'},
      {id:'5c',nameFr:'Décoration',nameAr:'ديكور',nameEn:'Decoration'},
    ],
    filters:[
      {id:'state',type:'select',labelFr:'État',labelAr:'الحالة',labelEn:'Condition',
        options:[
          {labelFr:'Neuf',labelAr:'جديد',labelEn:'New',value:'new'},
          {labelFr:'Bon état',labelAr:'حالة جيدة',labelEn:'Good',value:'good'},
          {labelFr:'Occasion',labelAr:'مستعمل',labelEn:'Used',value:'used'},
        ]},
    ],
  },
  {
    id:'6', nameFr:'Mode', nameAr:'موضة', nameEn:'Fashion',
    icon:'👗', color:'#EC4899',
    subCategories:[
      {id:'6a',nameFr:'Vêtements Homme',nameAr:'ملابس رجالية',nameEn:"Men's clothing"},
      {id:'6b',nameFr:'Vêtements Femme',nameAr:'ملابس نسائية',nameEn:"Women's clothing"},
      {id:'6c',nameFr:'Enfants',nameAr:'ملابس أطفال',nameEn:"Children's"},
      {id:'6d',nameFr:'Chaussures',nameAr:'أحذية',nameEn:'Shoes'},
      {id:'6e',nameFr:'Accessoires',nameAr:'إكسسوارات',nameEn:'Accessories'},
    ],
    filters:[
      {id:'size',type:'select',labelFr:'Taille',labelAr:'المقاس',labelEn:'Size',
        options:['XS','S','M','L','XL','XXL','XXXL'].map(v=>({labelFr:v,labelAr:v,labelEn:v,value:v}))},
      {id:'gender',type:'select',labelFr:'Genre',labelAr:'الجنس',labelEn:'Gender',
        options:[
          {labelFr:'Homme',labelAr:'رجالي',labelEn:'Men',value:'men'},
          {labelFr:'Femme',labelAr:'نسائي',labelEn:'Women',value:'women'},
          {labelFr:'Enfant',labelAr:'أطفال',labelEn:'Children',value:'children'},
          {labelFr:'Unisexe',labelAr:'للجنسين',labelEn:'Unisex',value:'unisex'},
        ]},
    ],
  },
  {
    id:'7', nameFr:'Agriculture', nameAr:'فلاحة', nameEn:'Agriculture',
    icon:'🌾', color:'#84CC16',
    subCategories:[
      {id:'7a',nameFr:'Terrains agricoles',nameAr:'أراضي زراعية',nameEn:'Agricultural land'},
      {id:'7b',nameFr:'Équipements',nameAr:'معدات',nameEn:'Equipment'},
      {id:'7c',nameFr:'Bétail',nameAr:'مواشي',nameEn:'Livestock'},
    ],
    filters:[
      {id:'type',type:'select',labelFr:'Type',labelAr:'النوع',labelEn:'Type',
        options:[
          {labelFr:'Terrain',labelAr:'أرض',labelEn:'Land',value:'land'},
          {labelFr:'Équipement',labelAr:'معدات',labelEn:'Equipment',value:'equipment'},
          {labelFr:'Bétail',labelAr:'مواشي',labelEn:'Livestock',value:'livestock'},
          {labelFr:'Semences',labelAr:'بذور',labelEn:'Seeds',value:'seeds'},
        ]},
    ],
  },
  {
    id:'8', nameFr:'Loisirs', nameAr:'ترفيه', nameEn:'Leisure',
    icon:'🎮', color:'#F97316',
    subCategories:[
      {id:'8a',nameFr:'Sports',nameAr:'رياضة',nameEn:'Sports'},
      {id:'8b',nameFr:'Jeux & Jouets',nameAr:'ألعاب',nameEn:'Games & Toys'},
      {id:'8c',nameFr:'Livres & Musique',nameAr:'كتب وموسيقى',nameEn:'Books & Music'},
      {id:'8d',nameFr:'Voyage',nameAr:'سفر',nameEn:'Travel'},
    ],
    filters:[],
  },
  {
    id:'9', nameFr:'Services', nameAr:'خدمات', nameEn:'Services',
    icon:'🔧', color:'#6366F1',
    subCategories:[
      {id:'9a',nameFr:'Artisanat',nameAr:'حرف يدوية',nameEn:'Crafts'},
      {id:'9b',nameFr:'Cours & Formation',nameAr:'دروس',nameEn:'Lessons'},
      {id:'9c',nameFr:'Transport',nameAr:'نقل',nameEn:'Transport'},
      {id:'9d',nameFr:'Nettoyage',nameAr:'تنظيف',nameEn:'Cleaning'},
    ],
    filters:[
      {id:'type',type:'select',labelFr:'Type',labelAr:'النوع',labelEn:'Type',
        options:[
          {labelFr:'Artisanat',labelAr:'حرفة',labelEn:'Craft',value:'craft'},
          {labelFr:'Cours',labelAr:'دروس',labelEn:'Lessons',value:'lessons'},
          {labelFr:'Transport',labelAr:'نقل',labelEn:'Transport',value:'transport'},
        ]},
    ],
  },
  {
    id:'10', nameFr:'Animaux', nameAr:'حيوانات', nameEn:'Animals',
    icon:'🐕', color:'#D97706',
    subCategories:[
      {id:'10a',nameFr:'Chiens',nameAr:'كلاب',nameEn:'Dogs'},
      {id:'10b',nameFr:'Chats',nameAr:'قطط',nameEn:'Cats'},
      {id:'10c',nameFr:'Oiseaux',nameAr:'طيور',nameEn:'Birds'},
      {id:'10d',nameFr:'Accessoires',nameAr:'مستلزمات',nameEn:'Accessories'},
    ],
    filters:[],
  },
  {
    id:'11', nameFr:'Matériaux BTP', nameAr:'مواد البناء', nameEn:'Building Materials',
    icon:'🧱', color:'#78716C',
    subCategories:[
      {id:'11a',nameFr:'Matériaux',nameAr:'مواد',nameEn:'Materials'},
      {id:'11b',nameFr:'Outils',nameAr:'أدوات',nameEn:'Tools'},
      {id:'11c',nameFr:'Équipements',nameAr:'معدات',nameEn:'Equipment'},
    ],
    filters:[],
  },
];

export function getCategoryById(id: string) {
  return CATEGORIES.find(c => c.id === id);
}

export function getCategoryName(id: string, lang: 'fr' | 'ar' | 'en' = 'fr'): string {
  const cat = getCategoryById(id);
  if (!cat) return '';
  return lang === 'ar' ? cat.nameAr : lang === 'en' ? cat.nameEn : cat.nameFr;
}
