/**
 * Générateur de 1000+ annonces fictives ultra-réalistes
 * Style Ouedkniss / Le Bon Coin Algérie
 */
const fs = require('fs');

const NOW = Date.now();
const DAY = 86_400_000;

// ── Wilayas with realistic distribution ──────────────────────────────────
const WILAYAS = [
  {code:'16',fr:'Alger',     w:18},
  {code:'31',fr:'Oran',      w:10},
  {code:'25',fr:'Constantine',w:7},
  {code:'09',fr:'Blida',     w:6},
  {code:'19',fr:'Sétif',     w:5},
  {code:'06',fr:'Béjaïa',    w:4},
  {code:'23',fr:'Annaba',    w:4},
  {code:'05',fr:'Batna',     w:4},
  {code:'35',fr:'Boumerdès', w:4},
  {code:'15',fr:'Tizi Ouzou',w:4},
  {code:'42',fr:'Tipaza',    w:3},
  {code:'31',fr:'Oran',      w:3},
  {code:'13',fr:'Tlemcen',   w:3},
  {code:'22',fr:'Sidi Bel Abbès',w:2},
  {code:'29',fr:'Mascara',   w:2},
  {code:'28',fr:'M\'Sila',   w:2},
  {code:'07',fr:'Biskra',    w:2},
  {code:'03',fr:'Laghouat',  w:2},
  {code:'17',fr:'Djelfa',    w:2},
  {code:'26',fr:'Médéa',     w:2},
  {code:'43',fr:'Mila',      w:1},
  {code:'41',fr:'Souk Ahras',w:1},
  {code:'34',fr:'BBA',       w:1},
  {code:'48',fr:'Relizane',  w:1},
  {code:'14',fr:'Tiaret',    w:1},
  {code:'18',fr:'Jijel',     w:1},
  {code:'02',fr:'Chlef',     w:1},
  {code:'21',fr:'Skikda',    w:1},
];

function pickWilaya() {
  const total = WILAYAS.reduce((s,w)=>s+w.w,0);
  let r = Math.random()*total;
  for(const w of WILAYAS){ r-=w.w; if(r<=0) return w; }
  return WILAYAS[0];
}

let counter = 1;
const all = [];

function daysAgo(d){ return NOW - DAY*d; }
function rand(a,b){ return Math.floor(Math.random()*(b-a+1))+a; }
function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
function slug(t,id){ return t.toLowerCase().replace(/[^a-z0-9]+/g,'-').slice(0,60)+'-'+id; }

function mk(overrides){
  const id = String(counter++);
  const wil = pickWilaya();
  const dAgo = rand(0,30);
  return {
    id, slug: slug(overrides.title||'annonce', id),
    currency:'DZD', negotiable: Math.random()>0.6,
    wilayaId: wil.code, wilayaName: wil.fr,
    location: wil.fr,
    date: dAgo===0 ? "Aujourd'hui" : dAgo===1 ? 'Hier' : `Il y a ${dAgo}j`,
    timestamp: daysAgo(dAgo + Math.random()),
    views: rand(10,4000),
    contacts: rand(0,120),
    favorites: rand(0,80),
    status:'active', userId:'demo',
    isVerified: Math.random()>0.7,
    isPremium:  Math.random()>0.85,
    isUrgent:   Math.random()>0.88,
    ranking:{
      trustScore:  rand(30,98),
      qualityScore: rand(40,95),
      clickRate: parseFloat((Math.random()*0.1).toFixed(3)),
      boostLevel: Math.random()>0.85 ? rand(1,2) : 0,
    },
    ...overrides,
    images: overrides.images || [overrides.imageUrl],
  };
}

// ════════════════════════════════════════════════════════════════
// IMMOBILIER — 180 annonces
// ════════════════════════════════════════════════════════════════
const IMMO_IMGS = [
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
  'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80',
  'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&q=80',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
  'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
  'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80',
  'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80',
  'https://images.unsplash.com/photo-1604014237800-1c9102c219da?w=800&q=80',
  'https://images.unsplash.com/photo-1513584684374-8bab748fbf90?w=800&q=80',
];

const APPT_TYPES = ['F2','F3','F3','F4','F4','F4','F5','Studio','F3','F4'];
const APPT_FLOOR = ['RDC','1er étage','2ème étage','3ème étage','4ème étage','5ème étage','Dernier étage'];
const APPT_STATE = ['Neuf','Très bon état','Bon état','À rénover','Rénové 2024','Clé en main'];
const APPT_QUART = ['Hydra','Bab Ezzouar','Bir Mourad Raïs','Kouba','Bachdjerrah','El Harrach','Dely Ibrahim','Ben Aknoun','Ain Benian','Cheraga','Riadh El Feth','Hussein Dey','Sidi M\'hamed','Les Annassers','Draria'];
const VILLA_QUART = ['Birkhadem','El Biar','Pointe Pescade','Zéralda','Saoula','Baba Hassen','Les Eucalyptus'];

// Appartements à vendre
for(let i=0;i<60;i++){
  const type = pick(APPT_TYPES);
  const surf = rand(55,200);
  const floor = pick(APPT_FLOOR);
  const state = pick(APPT_STATE);
  const q = pick(APPT_QUART);
  const price = surf * rand(80000,250000);
  const img = IMMO_IMGS[i % IMMO_IMGS.length];
  all.push(mk({
    title:`Appartement ${type} ${surf}m² — ${q}`,
    price, imageUrl:img, images:[img, IMMO_IMGS[(i+1)%IMMO_IMGS.length]],
    category:'Immobilier', categoryId:'1', condition:'good',
    description:`${state}. Appartement ${type} de ${surf}m² au ${floor}. Quartier ${q}, proche commerces et transports. ${rand(1,3)} SDB, séjour spacieux, cuisine équipée. ${Math.random()>0.5?'Parking inclus.':''} ${Math.random()>0.6?'Ascenseur.':''} Titre foncier disponible.`,
    attributes:{property_type:type.toLowerCase().replace('+','plus'),surface:surf,floor:floor,state,transaction:'sale'},
  }));
}

// Appartements à louer
for(let i=0;i<30;i++){
  const type = pick(['F2','F3','F3','F4','Studio']);
  const surf = rand(40,130);
  const q = pick(APPT_QUART);
  const price = rand(30000,120000);
  const img = IMMO_IMGS[i % IMMO_IMGS.length];
  all.push(mk({
    title:`Location ${type} ${surf}m² — ${q}`,
    price, imageUrl:img, images:[img],
    category:'Immobilier', categoryId:'1', condition:'good',
    description:`Location d'un appartement ${type} de ${surf}m². Quartier ${q}. ${pick(APPT_STATE)}. Charges comprises. Caution 1 mois. Contact sérieux uniquement.`,
    attributes:{property_type:type.toLowerCase(),surface:surf,transaction:'rent'},
  }));
}

// Villas
for(let i=0;i<30;i++){
  const surf = rand(180,600);
  const rooms = rand(4,8);
  const q = pick(VILLA_QUART);
  const price = surf * rand(120000,350000);
  const img = pick(IMMO_IMGS);
  all.push(mk({
    title:`Villa ${rooms} pièces ${surf}m² — ${q}${Math.random()>0.5?' avec piscine':''}`,
    price, imageUrl:img, images:[img, IMMO_IMGS[rand(0,IMMO_IMGS.length-1)]],
    category:'Immobilier', categoryId:'1', condition:'new',
    description:`Magnifique villa de ${surf}m² sur terrain ${rand(300,1500)}m². ${rooms} chambres, ${rand(2,4)} SDB, cuisine entièrement équipée.${Math.random()>0.5?' Piscine.':''} Gardien 24h. Titre foncier. ${pick(['Construction 2022','Construction 2023','Livrée 2024','Neuve','Renovation totale 2024'])}.`,
    attributes:{property_type:'villa',surface:surf,rooms:String(rooms),floors_total:pick(['r1','r2','r0']),transaction:'sale'},
  }));
}

// Terrains
for(let i=0;i<30;i++){
  const surf = rand(200,5000);
  const price = surf * rand(20000,150000);
  const img = pick(IMMO_IMGS);
  all.push(mk({
    title:`Terrain constructible ${surf}m² — ${pick(['Zone résidentielle','Zone industrielle','Zone agricole','Bord de route'])}`,
    price, imageUrl:img, images:[img],
    category:'Immobilier', categoryId:'1', condition:'new',
    description:`Terrain nu de ${surf}m² viabilisé (eau, gaz, électricité). COS favorable. Acte notarié disponible. Accès facile. ${Math.random()>0.5?'R+2 autorisé.':''} Pas d'intermédiaires.`,
    attributes:{property_type:'land',surface:surf,transaction:'sale'},
  }));
}

// Locaux commerciaux
for(let i=0;i<30;i++){
  const surf = rand(30,400);
  const price = rand(15000000,200000000);
  all.push(mk({
    title:`Local commercial ${surf}m² — ${pick(['Centre-ville','Zone commerciale','Rue commerçante','Galerie marchande'])}`,
    price, imageUrl:pick(IMMO_IMGS), images:[pick(IMMO_IMGS)],
    category:'Immobilier', categoryId:'1', condition:'good',
    description:`Local commercial de ${surf}m² au rez-de-chaussée. Grande vitrine, ${Math.random()>0.5?'climatisation,':''} électricité triphasée. ${pick(['Vente','Location'])} — Bail commercial disponible.`,
    attributes:{property_type:'commercial',surface:surf,transaction:pick(['sale','rent'])},
  }));
}

// ════════════════════════════════════════════════════════════════
// VÉHICULES — 200 annonces
// ════════════════════════════════════════════════════════════════
const AUTO_IMGS = [
  'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800&q=80',
  'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80',
  'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80',
  'https://images.unsplash.com/photo-1549924231-f129b911e442?w=800&q=80',
  'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80',
  'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&q=80',
  'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&q=80',
  'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80',
  'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80',
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80',
  'https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=800&q=80',
  'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&q=80',
];

const CARS = [
  {brand:'Volkswagen',models:['Golf 8 GTI','Golf 8 R-Line','Polo 6','Tiguan','T-Roc','Passat'],priceRange:[2800000,12000000]},
  {brand:'Renault',models:['Clio 5','Symbol','Mégane 4','Dacia Duster','Dacia Sandero','Renault Kwid'],priceRange:[1200000,5500000]},
  {brand:'Toyota',models:['Hilux','Corolla','Yaris','Land Cruiser','RAV4','Camry'],priceRange:[2500000,15000000]},
  {brand:'Hyundai',models:['Tucson','i30','Elantra','Creta','Santa Fe','Accent'],priceRange:[1800000,8000000]},
  {brand:'Kia',models:['Sportage','Picanto','Rio','Sonet','Cerato','Stonic'],priceRange:[1600000,7500000]},
  {brand:'Peugeot',models:['208','2008','301','3008','Partner'],priceRange:[1400000,5000000]},
  {brand:'Citroën',models:['C3','C4','Berlingo','C-Elysée'],priceRange:[1300000,4500000]},
  {brand:'Mercedes',models:['Classe C','Classe E','GLC','Classe A','Sprinter'],priceRange:[5000000,25000000]},
  {brand:'BMW',models:['Série 3','X3','X5','Série 5','M3'],priceRange:[6000000,28000000]},
  {brand:'Audi',models:['A3','A4','Q3','Q5','A6'],priceRange:[5500000,22000000]},
  {brand:'Ford',models:['Ranger','Puma','Kuga','Transit'],priceRange:[2200000,9000000]},
  {brand:'Nissan',models:['Navara','Qashqai','X-Trail','Juke'],priceRange:[2500000,9500000]},
  {brand:'Mitsubishi',models:['L200','Outlander','Eclipse Cross'],priceRange:[3000000,10000000]},
  {brand:'Seat',models:['Ibiza','Arona','Leon','Ateca'],priceRange:[1800000,5500000]},
  {brand:'Skoda',models:['Octavia','Fabia','Kodiaq','Karoq'],priceRange:[2000000,7000000]},
];
const FUELS = ['Diesel','Essence','Hybride','GPL'];
const GEARBOXES = ['Manuelle','Automatique'];
const COLORS = ['Blanc','Noir','Gris','Bleu','Rouge','Argent','Beige','Vert','Bordeaux','Blanc nacré','Gris métallisé','Noir brillant'];
const CONDITIONS_CAR = ['like_new','like_new','good','good','good','fair'];

for(let i=0;i<200;i++){
  const car = pick(CARS);
  const model = pick(car.models);
  const year = rand(2015,2024);
  const km = rand(0,220000);
  const fuel = pick(FUELS);
  const gear = pick(GEARBOXES);
  const color = pick(COLORS);
  const price = rand(car.priceRange[0], car.priceRange[1]);
  const cond = pick(CONDITIONS_CAR);
  const img = AUTO_IMGS[i % AUTO_IMGS.length];

  all.push(mk({
    title:`${car.brand} ${model} ${year} — ${fuel} — ${km.toLocaleString()} km`,
    price, imageUrl:img, images:[img, AUTO_IMGS[(i+1)%AUTO_IMGS.length]],
    category:'Véhicules', categoryId:'2', condition:cond,
    description:`${car.brand} ${model} ${year}, ${fuel}, boîte ${gear}, ${color}, ${km.toLocaleString()} km. ${cond==='like_new'?'Excellent état, aucun accident.':'Bon état général.'} Carnet d'entretien ${Math.random()>0.5?'complet':'disponible'}. ${Math.random()>0.6?`Révision faite à ${Math.floor(km/10000)*10000} km.`:''} CT valide ${rand(2024,2026)}. Carte grise au nom du vendeur. ${Math.random()>0.5?`Options: ${pick(['GPS intégré','Toit ouvrant','Caméra recul','Régulateur adaptatif','Sièges chauffants','Bluetooth','Android Auto'])}.`:''}`,
    attributes:{vehicle_type:cond,brand:car.brand,model,year:String(year),fuel,gearbox:gear,mileage:km,color},
  }));
}

// ════════════════════════════════════════════════════════════════
// HIGH-TECH — 150 annonces
// ════════════════════════════════════════════════════════════════
const TECH_IMGS = [
  'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80',
  'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&q=80',
  'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&q=80',
  'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&q=80',
  'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&q=80',
  'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&q=80',
  'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=800&q=80',
  'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80',
  'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&q=80',
  'https://images.unsplash.com/photo-1593640495253-23196b27a87f?w=800&q=80',
];
const PHONES = [
  {brand:'Apple',models:['iPhone 15 Pro Max 256Go','iPhone 15 Pro 128Go','iPhone 15 128Go','iPhone 14 Pro 256Go','iPhone 14 128Go','iPhone 13 128Go','iPhone 12 64Go'],prices:[180000,160000,140000,155000,120000,95000,72000]},
  {brand:'Samsung',models:['Galaxy S24 Ultra 512Go','Galaxy S24+ 256Go','Galaxy S24 128Go','Galaxy A55 256Go','Galaxy A35 128Go','Galaxy A14 64Go','Galaxy S23 256Go'],prices:[240000,195000,165000,110000,80000,45000,145000]},
  {brand:'Xiaomi',models:['Xiaomi 14T Pro 512Go','Redmi Note 13 Pro 256Go','Redmi Note 13 128Go','Poco X6 Pro 256Go','Xiaomi 14 256Go','Redmi 13C 128Go'],prices:[155000,85000,65000,90000,165000,38000]},
  {brand:'Huawei',models:['P60 Pro','Nova 12','Mate 60 Pro','P50 Pro','Nova 11'],prices:[175000,95000,220000,130000,78000]},
  {brand:'Oppo',models:['Find X7 256Go','Reno 11 Pro','A79 5G','Find N3 Flip'],prices:[190000,105000,58000,235000]},
  {brand:'Tecno',models:['Camon 20 Premier','Spark 20 Pro','Pova 6 Pro'],prices:[52000,38000,45000]},
];
const LAPTOPS = [
  {brand:'Apple',models:['MacBook Pro 14" M3 Pro','MacBook Air 15" M3','MacBook Pro 16" M3 Max','MacBook Air 13" M2'],prices:[480000,380000,650000,320000]},
  {brand:'Dell',models:['XPS 15 i9 RTX','Inspiron 15 i7','Latitude 5540','Alienware m16'],prices:[580000,185000,220000,520000]},
  {brand:'HP',models:['EliteBook 840 G10','Pavilion 15 i5','Envy x360','Omen 16'],prices:[195000,145000,230000,380000]},
  {brand:'Lenovo',models:['ThinkPad X1 Carbon','IdeaPad 5 i7','Legion 5 Pro','Yoga 9i'],prices:[320000,175000,350000,295000]},
  {brand:'Asus',models:['ROG Strix G16','ZenBook 14','VivoBook 15 i5','ProArt Studiobook'],prices:[420000,210000,155000,480000]},
  {brand:'Acer',models:['Predator Helios Neo','Swift 3 i5','Aspire 5 i7','Nitro 5'],prices:[350000,165000,180000,280000]},
];

// Phones
for(let i=0;i<70;i++){
  const brand = pick(PHONES);
  const modelIdx = rand(0,brand.models.length-1);
  const model = brand.models[modelIdx];
  const basePrice = brand.prices[modelIdx] || brand.prices[0];
  const price = Math.round(basePrice * (0.85 + Math.random()*0.3));
  const cond = pick(['like_new','like_new','good','new']);
  const img = TECH_IMGS[i%TECH_IMGS.length];
  all.push(mk({
    title:`${brand.brand} ${model} — ${pick(['Neuf','Comme neuf','Très bon état','Bon état'])}${Math.random()>0.6?' — Garantie ':' '}${Math.random()>0.7?rand(3,12)+' mois':''}`,
    price, imageUrl:img, images:[img],
    category:'High-Tech', categoryId:'3', condition:cond,
    description:`${brand.brand} ${model} en ${cond==='new'?'parfait':'très bon'} état. ${Math.random()>0.5?'Avec boîte et accessoires originaux.':''} ${Math.random()>0.6?`Batterie ${rand(88,100)}%.`:''} ${Math.random()>0.5?`Acheté ${pick(['il y a 3 mois','il y a 6 mois','en 2024','en janvier 2025'])}.`:''} ${Math.random()>0.6?'Face ID / empreinte parfaite.':''} Raison: ${pick(['Upgrade','Cadeau','Double emploi','Départ à l\'étranger'])}.`,
    attributes:{tech_type:'smartphone',brand:brand.brand,model,condition:cond},
  }));
}

// Laptops
for(let i=0;i<40;i++){
  const brand = pick(LAPTOPS);
  const modelIdx = rand(0,brand.models.length-1);
  const model = brand.models[modelIdx];
  const basePrice = brand.prices[modelIdx] || brand.prices[0];
  const price = Math.round(basePrice * (0.8 + Math.random()*0.35));
  const img = TECH_IMGS[i%TECH_IMGS.length];
  all.push(mk({
    title:`${brand.brand} ${model} — ${rand(8,64)}Go RAM / ${pick(['256Go','512Go','1To','2To'])} SSD`,
    price, imageUrl:img, images:[img],
    category:'High-Tech', categoryId:'3', condition:pick(['like_new','good','good']),
    description:`${brand.brand} ${model}. ${rand(8,64)}Go RAM DDR5, SSD ${pick(['256Go','512Go','1To'])} NVMe, écran ${pick(['14"','15.6"','16"'])} ${pick(['FHD','2K','4K','OLED'])}. ${Math.random()>0.5?`Batterie ${rand(75,100)}%.`:''} ${Math.random()>0.6?'Chargeur original inclus.':''} ${Math.random()>0.5?`${rand(1,24)} mois de garantie restants.`:''} Facture disponible.`,
    attributes:{tech_type:'laptop',brand:brand.brand,model},
  }));
}

// Autres tech (consoles, tablettes, accessoires)
const OTHER_TECH = [
  {title:'Sony PlayStation 5 Standard + 2 manettes + 5 jeux',price:120000},
  {title:'PS5 Slim Edition Numérique',price:95000},
  {title:'Xbox Series X 1To + Game Pass',price:115000},
  {title:'Nintendo Switch OLED blanc + jeux',price:88000},
  {title:'Apple iPad Pro 12.9" M2 256Go WiFi',price:290000},
  {title:'Samsung Galaxy Tab S9+ 256Go 5G',price:215000},
  {title:'Apple Watch Ultra 2 Titane 49mm',price:210000},
  {title:'Samsung Galaxy Watch 6 Classic 47mm',price:95000},
  {title:'DJI Mini 4 Pro Fly More Combo',price:285000},
  {title:'DJI Air 3 Combo + ND Filters',price:380000},
  {title:'Sony WH-1000XM5 — Réduction de bruit',price:65000},
  {title:'Apple AirPods Pro 2ème génération',price:72000},
  {title:'Bose QuietComfort 45 — Bluetooth',price:58000},
  {title:'Écran Gaming ASUS ROG 27" 165Hz 2K',price:95000},
  {title:'Imprimante 3D Bambu Lab A1 Mini',price:195000},
  {title:'GoPro Hero 12 Black + accessoires',price:85000},
  {title:'Sony Alpha 7 IV + objectif 28-70mm',price:520000},
  {title:'Canon EOS R50 Kit 18-45mm',price:185000},
  {title:'iPad Air 5 256Go WiFi + Apple Pencil',price:225000},
  {title:'Samsung Galaxy Z Fold 5 512Go',price:350000},
  {title:'Huawei MateStation S — PC Bureau',price:145000},
  {title:'Routeur WiFi 6 TP-Link AX3000',price:25000},
  {title:'Disque dur externe 4To Seagate',price:18000},
  {title:'SSD Samsung 2To 980 Pro NVMe',price:35000},
  {title:'Carte graphique RTX 4070 Ti ASUS',price:280000},
  {title:'Processeur Intel Core i9-13900K',price:145000},
  {title:'Clavier mécanique Keychron K8 Pro',price:28000},
  {title:'Souris Logitech MX Master 3S',price:22000},
  {title:'Écran 4K LG UltraFine 27" Thunderbolt',price:185000},
  {title:'Station d\'accueil CalDigit TS4',price:95000},
  {title:'Xiaomi Mi Band 8 + bracelet premium',price:12000},
  {title:'Garmin Fenix 7 Solar Montre GPS',price:195000},
  {title:'Ring Video Doorbell 4',price:32000},
  {title:'Enceinte JBL Charge 5 Bluetooth',price:28000},
  {title:'Projecteur 4K Samsung The Premiere',price:450000},
  {title:'Kindle Scribe + stylet premium',price:68000},
  {title:'Lecteur NAS Synology DS923+',price:115000},
  {title:'Batterie externe Anker 26800mAh 140W',price:18000},
  {title:'Tablette Wacom Intuos Pro L',price:85000},
  {title:'Webcam Logitech Brio 4K',price:35000},
];

for(let i=0;i<40;i++){
  const item = OTHER_TECH[i%OTHER_TECH.length];
  const price = Math.round(item.price * (0.85 + Math.random()*0.3));
  all.push(mk({
    title:item.title,
    price, imageUrl:TECH_IMGS[i%TECH_IMGS.length], images:[TECH_IMGS[i%TECH_IMGS.length]],
    category:'High-Tech', categoryId:'3', condition:pick(['new','like_new','good']),
    description:`${item.title}. ${pick(['Comme neuf','Très bon état','Neuf scellé','Utilisé quelques mois'])}. ${Math.random()>0.5?'Boîte et accessoires complets.':''} ${Math.random()>0.6?`Garantie ${rand(3,18)} mois.`:''} Facture disponible. ${Math.random()>0.5?'Echange possible.':''}`,
    attributes:{tech_type:'accessory'},
  }));
}

// ════════════════════════════════════════════════════════════════
// EMPLOI — 80 annonces
// ════════════════════════════════════════════════════════════════
const EMPLOI_IMGS = [
  'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=800&q=80',
  'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&q=80',
  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80',
  'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&q=80',
  'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80',
];
const JOBS = [
  {title:'Développeur Full Stack React / Node.js — CDI',sector:'it',exp:'2_5',salary:'80000-150000'},
  {title:'Développeur Mobile Flutter — Alger',sector:'it',exp:'1_2',salary:'70000-120000'},
  {title:'Ingénieur DevOps AWS / Docker',sector:'it',exp:'2_5',salary:'100000-180000'},
  {title:'Data Scientist Python / Machine Learning',sector:'it',exp:'2_5',salary:'90000-160000'},
  {title:'Ingénieur Génie Civil — BTP',sector:'btp',exp:'2_5',salary:'70000-130000'},
  {title:'Chef de chantier expérimenté',sector:'btp',exp:'5_10',salary:'80000-150000'},
  {title:'Architecte DPLG — Bureau d\'études',sector:'btp',exp:'2_5',salary:'75000-140000'},
  {title:'Médecin généraliste — Clinique privée',sector:'health',exp:'1_2',salary:'120000-200000'},
  {title:'Infirmier(ère) diplômé(e) — Urgences',sector:'health',exp:'0',salary:'60000-90000'},
  {title:'Chirurgien-dentiste — Cabinet privé',sector:'health',exp:'0',salary:'150000-300000'},
  {title:'Pharmacien(ne) — Officine',sector:'health',exp:'0',salary:'90000-150000'},
  {title:'Enseignant(e) Maths / Physique — Lycée privé',sector:'education',exp:'1_2',salary:'50000-80000'},
  {title:'Directeur(trice) d\'école privée',sector:'education',exp:'5_10',salary:'120000-200000'},
  {title:'Commercial B2B — Agroalimentaire',sector:'commerce',exp:'1_2',salary:'60000-120000'},
  {title:'Responsable ventes — Grande surface',sector:'commerce',exp:'2_5',salary:'80000-140000'},
  {title:'Comptable CPA — Cabinet d\'expertise',sector:'finance',exp:'2_5',salary:'70000-120000'},
  {title:'Directeur Financier — Groupe industriel',sector:'finance',exp:'10plus',salary:'200000-400000'},
  {title:'Auditeur interne — Banque',sector:'finance',exp:'2_5',salary:'100000-180000'},
  {title:'Technicien de maintenance industrielle',sector:'industry',exp:'1_2',salary:'55000-90000'},
  {title:'Responsable production — Usine agroalimentaire',sector:'industry',exp:'5_10',salary:'120000-200000'},
  {title:'Chauffeur PL longue distance',sector:'transport',exp:'1_2',salary:'55000-85000'},
  {title:'Responsable logistique — Import/Export',sector:'transport',exp:'2_5',salary:'90000-150000'},
  {title:'Chef cuisinier — Hôtel 4 étoiles',sector:'hospitality',exp:'5_10',salary:'80000-140000'},
  {title:'Réceptionniste bilingue — Hôtel',sector:'hospitality',exp:'0',salary:'40000-65000'},
  {title:'Ingénieur agronome — Conseil agricole',sector:'agriculture',exp:'1_2',salary:'65000-110000'},
  {title:'Technicien topographe',sector:'btp',exp:'1_2',salary:'60000-100000'},
  {title:'Designer graphique / Motion design',sector:'it',exp:'1_2',salary:'55000-95000'},
  {title:'Community Manager / Content Creator',sector:'it',exp:'0',salary:'45000-80000'},
  {title:'Juriste d\'entreprise — Droit commercial',sector:'admin',exp:'2_5',salary:'90000-160000'},
  {title:'Assistante de direction trilingue',sector:'admin',exp:'1_2',salary:'55000-95000'},
];

for(let i=0;i<80;i++){
  const job = JOBS[i%JOBS.length];
  const img = EMPLOI_IMGS[i%EMPLOI_IMGS.length];
  all.push(mk({
    title:job.title,
    price:0,
    imageUrl:img, images:[img],
    category:'Emploi', categoryId:'4', condition:'new',
    description:`Nous recrutons un(e) ${job.title.split('—')[0].trim()} pour notre structure en pleine croissance.\n\nProfil recherché:\n• Diplôme ${pick(['BAC+2','BAC+3','BAC+4','BAC+5 ingénieur/master'])}\n• Expérience ${job.exp.replace('_',' à ')} ans dans le domaine\n• Maîtrise ${pick(['du français et de l\'arabe','de l\'arabe, français et anglais','des outils informatiques','des logiciels métier'])}\n\nNous offrons:\n• Salaire entre ${job.salary} DA/mois\n• ${pick(['Véhicule de service','Téléphone de service','Prime annuelle','Mutuelle','Formation continue'])}\n• Environnement de travail ${pick(['dynamique','stimulant','innovant','sérieux'])}\n\nEnvoyer CV + lettre de motivation à l'adresse email indiquée.`,
    attributes:{job_type:pick(['cdi','cdd','freelance']),sector:job.sector,experience:job.exp,work_mode:pick(['onsite','hybrid','remote'])},
  }));
}

// ════════════════════════════════════════════════════════════════
// MAISON & JARDIN — 80 annonces
// ════════════════════════════════════════════════════════════════
const MAISON_IMGS = [
  'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
  'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800&q=80',
  'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&q=80',
  'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
  'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80',
  'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=800&q=80',
];
const MAISON_ITEMS = [
  {t:'Salon marocain complet 8 places velours bordeaux',p:[90000,160000]},
  {t:'Canapé d\'angle convertible cuir premium',p:[150000,250000]},
  {t:'Chambre à coucher complète wengé 6 pièces',p:[200000,380000]},
  {t:'Cuisine équipée complète laqué blanc',p:[450000,850000]},
  {t:'Machine à laver LG 9kg Direct Drive',p:[75000,120000]},
  {t:'Réfrigérateur Samsung NoFrost 600L',p:[120000,200000]},
  {t:'Lave-vaisselle Bosch intégrable 60cm',p:[80000,140000]},
  {t:'Climatiseur Inverter 18000 BTU Carrier',p:[110000,180000]},
  {t:'Climatiseur Midea 24000 BTU Chaud/Froid',p:[130000,200000]},
  {t:'Table à manger 6 personnes + 6 chaises',p:[80000,180000]},
  {t:'Bureau direction bois massif + fauteuil',p:[70000,150000]},
  {t:'Bibliothèque murale modulable chêne',p:[45000,90000]},
  {t:'Lit 2 places 180×200 avec tiroirs',p:[65000,140000]},
  {t:'Armoire 4 portes miroir coulissant',p:[80000,160000]},
  {t:'Four micro-ondes combiné Whirlpool 30L',p:[25000,45000]},
  {t:'Aspirateur robot iRobot Roomba j7',p:[65000,120000]},
  {t:'Purificateur d\'air Philips 3000 Series',p:[35000,60000]},
  {t:'Chauffe-eau Thermor 100L',p:[28000,55000]},
  {t:'Ventilateur plafond 60cm LED',p:[12000,25000]},
  {t:'Barbecue Weber gaz 3 brûleurs',p:[55000,95000]},
  {t:'Piscine hors-sol Intex 4×2m',p:[45000,85000]},
  {t:'Salon jardin aluminium 6 places',p:[85000,165000]},
  {t:'Tondeuse autoportée MTD 96cm',p:[165000,280000]},
  {t:'Groupe électrogène 5KVA silencieux',p:[95000,180000]},
  {t:'Tableau électrique 3×36 modules',p:[18000,35000]},
  {t:'Carrelage sol grès 60×60 beige sable — 50m²',p:[20000,45000]},
  {t:'Rideau salon velours triple crochet',p:[8000,20000]},
  {t:'Lustre LED cristal 80cm',p:[18000,45000]},
  {t:'Miroir mural design 120×80cm',p:[12000,28000]},
  {t:'Cafetière Nespresso Vertuo Next',p:[18000,32000]},
];

for(let i=0;i<80;i++){
  const item = MAISON_ITEMS[i%MAISON_ITEMS.length];
  const price = rand(item.p[0], item.p[1]);
  const img = MAISON_IMGS[i%MAISON_IMGS.length];
  const cond = pick(['new','like_new','like_new','good','good']);
  all.push(mk({
    title:item.t + ' — ' + pick(['Neuf','Comme neuf','Très bon état','Bon état']),
    price, imageUrl:img, images:[img],
    category:'Maison & Jardin', categoryId:'5', condition:cond,
    description:`${item.t}. ${pick(['Neuf jamais utilisé','Comme neuf 2 mois d\'utilisation','Très bon état',`Acheté ${rand(2022,2024)} très peu utilisé`])}. ${Math.random()>0.5?'Facture et garantie disponibles.':''} ${Math.random()>0.5?'Livraison possible (frais en plus).':''} Raison: ${pick(['Déménagement','Cadeau en double','Rénovation','Upgrade'])}.`,
    attributes:{home_type:pick(['furniture','appliance','decor','kitchen']),condition:cond},
  }));
}

// ════════════════════════════════════════════════════════════════
// MODE — 60 annonces
// ════════════════════════════════════════════════════════════════
const MODE_IMGS = [
  'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=80',
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
  'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800&q=80',
  'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=800&q=80',
  'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&q=80',
  'https://images.unsplash.com/photo-1484327973588-c31f829103fe?w=800&q=80',
];
const MODE_ITEMS = [
  {t:'Burnous traditionnel homme laine Tlemcen',gender:'men',p:[35000,65000]},
  {t:'Caftan de cérémonie haute couture brodé',gender:'women',p:[120000,280000]},
  {t:'Costume homme Hugo Boss gris anthracite',gender:'men',p:[85000,160000]},
  {t:'Robe kabyle tenue traditionnelle',gender:'women',p:[25000,65000]},
  {t:'Jellaba femme laine brodée Constantine',gender:'women',p:[30000,60000]},
  {t:'Nike Air Jordan 1 High OG — Neuf',gender:'men',p:[45000,80000]},
  {t:'Adidas Yeezy Boost 350 V2',gender:'men',p:[55000,110000]},
  {t:'Veste Zara homme slim fit kaki',gender:'men',p:[12000,25000]},
  {t:'Sac à main Louis Vuitton Neverfull GM',gender:'women',p:[180000,320000]},
  {t:'Parfum Dior Sauvage 100ml — Original',gender:'men',p:[18000,28000]},
  {t:'Parfum Chanel N°5 50ml — Original',gender:'women',p:[22000,35000]},
  {t:'Lot 15 pièces vêtements enfant 3-8 ans',gender:'kids',p:[8000,20000]},
  {t:'Montre homme Citizen Eco-Drive acier',gender:'men',p:[28000,55000]},
  {t:'Manteau femme cachemire long',gender:'women',p:[45000,90000]},
  {t:'Baskets Nike Air Max 270 taille 42',gender:'men',p:[22000,38000]},
  {t:'Hijab soie premium collection 2024',gender:'women',p:[5000,12000]},
  {t:'Costume marié complet + cravate',gender:'men',p:[65000,130000]},
  {t:'Robe de soirée longue taille 38',gender:'women',p:[35000,75000]},
  {t:'Ceinture Louis Vuitton initiales',gender:'men',p:[28000,48000]},
  {t:'Sneakers New Balance 574 unisexe',gender:'men',p:[18000,32000]},
];

for(let i=0;i<60;i++){
  const item = MODE_ITEMS[i%MODE_ITEMS.length];
  const price = rand(item.p[0], item.p[1]);
  const img = MODE_IMGS[i%MODE_IMGS.length];
  const size = pick(['S','M','L','XL','42','44','38','40']);
  all.push(mk({
    title:`${item.t} — Taille ${size}`,
    price, imageUrl:img, images:[img],
    category:'Mode', categoryId:'6', condition:pick(['new','like_new','like_new','good']),
    description:`${item.t}. Taille ${size}. ${pick(['Neuf avec étiquette','Porté 1-2 fois','Très bon état','Neuf sans emballage'])}. ${Math.random()>0.6?'Photos disponibles sur demande.':''} ${Math.random()>0.5?'Échange possible même taille.':''} Envoi via Yalidine possible.`,
    attributes:{gender:item.gender,size},
  }));
}

// ════════════════════════════════════════════════════════════════
// AGRICULTURE — 50 annonces
// ════════════════════════════════════════════════════════════════
const AGRI_IMGS = [
  'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&q=80',
  'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80',
  'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=800&q=80',
  'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&q=80',
  'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&q=80',
];
const AGRI_ITEMS = [
  {t:'Tracteur John Deere 5075E 95ch 4RM 2019',p:[4200000,5800000],type:'tractor'},
  {t:'Tracteur New Holland T4.75 2020',p:[4800000,6500000],type:'tractor'},
  {t:'Motoculteur BCS 735 avec fraises',p:[350000,550000],type:'equipment'},
  {t:'Troupeau brebis Ouled Djellal 30 têtes',p:[1500000,2500000],type:'sheep'},
  {t:'Troupeau bovins mixte 15 têtes',p:[2800000,4500000],type:'cattle'},
  {t:'Terrain agricole irrigué 5ha — Médéa',p:[12000000,25000000],type:'land'},
  {t:'Terrain agricole 3ha avec puits',p:[8000000,18000000],type:'land'},
  {t:'Serre tunnel 500m² équipée',p:[850000,1400000],type:'equipment'},
  {t:'Système goutte-à-goutte 2ha complet',p:[320000,580000],type:'equipment'},
  {t:'Pulvérisateur attelé 400L',p:[180000,320000],type:'equipment'},
  {t:'Moissonneuse-batteuse Claas Tucano 2017',p:[9500000,13000000],type:'tractor'},
  {t:'Semis de tomates certifiées — 10 000 plants',p:[80000,150000],type:'seeds'},
  {t:'Semences blé dur certifiées 100 qx',p:[120000,200000],type:'seeds'},
  {t:'Ruches d\'abeilles x20 avec reines',p:[350000,600000],type:'other'},
  {t:'Vaches laitières Holstein x5',p:[1800000,2800000],type:'cattle'},
];

for(let i=0;i<50;i++){
  const item = AGRI_ITEMS[i%AGRI_ITEMS.length];
  const price = rand(item.p[0], item.p[1]);
  const img = AGRI_IMGS[i%AGRI_IMGS.length];
  all.push(mk({
    title:item.t,
    price, imageUrl:img, images:[img],
    category:'Agriculture', categoryId:'7', condition:pick(['good','like_new','new']),
    description:`${item.t}. ${pick(['Très bon état','Révisé récemment','En production','Disponible immédiatement'])}. ${Math.random()>0.5?'Documents et certificats disponibles.':''} ${Math.random()>0.6?'Visite possible sur place.':''} Pas d'intermédiaires. Contact sérieux.`,
    attributes:{agri_type:item.type},
  }));
}

// ════════════════════════════════════════════════════════════════
// LOISIRS & SPORTS — 60 annonces
// ════════════════════════════════════════════════════════════════
const LOISIR_IMGS = [
  'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80',
  'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80',
  'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&q=80',
  'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=800&q=80',
  'https://images.unsplash.com/photo-1526401485004-46910ecc8e51?w=800&q=80',
  'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=800&q=80',
];
const LOISIR_ITEMS = [
  {t:'Vélo route carbon Specialized Tarmac SL7 taille 56',p:[500000,750000]},
  {t:'VTT électrique Haibike Trekking 10 2023',p:[380000,580000]},
  {t:'Vélo électrique Decathlon Elops 900',p:[165000,240000]},
  {t:'Tapis roulant NordicTrack Commercial 2450',p:[195000,320000]},
  {t:'Vélo elliptique BH Fitness Carbon Pro',p:[145000,240000]},
  {t:'Banc de musculation multifonction',p:[85000,165000]},
  {t:'Station de musculation complète Technogym',p:[350000,600000]},
  {t:'Guitare acoustique Taylor 214ce',p:[165000,280000]},
  {t:'Piano numérique Yamaha P-145',p:'120000,195000'},
  {t:'Batterie acoustique Pearl Export 5 fûts',p:[95000,165000]},
  {t:'Saxophone alto Yamaha YAS-280',p:[145000,240000]},
  {t:'Table tennis Cornilleau 500X',p:[130000,190000]},
  {t:'Billard professionnel 7 pieds',p:[280000,450000]},
  {t:'Tente camping MSR Hubba Hubba NX 3P',p:[85000,140000]},
  {t:'Kayak gonflable Sea Eagle 380X',p:[95000,165000]},
  {t:'Planche de surf 7\'0 + combinaison',p:[85000,145000]},
  {t:'Équipement plongée Mares complet',p:[245000,380000]},
  {t:'Drone FPV BetaFPV Pavo360',p:[85000,145000]},
  {t:'Tableau peinture huile — Paysage algérien',p:[15000,45000]},
  {t:'Collection livres anciens — Lot 50 ouvrages',p:[25000,65000]},
];

for(let i=0;i<60;i++){
  const item = LOISIR_ITEMS[i%LOISIR_ITEMS.length];
  const pRange = typeof item.p === 'string' ? item.p.split(',').map(Number) : item.p;
  const price = rand(pRange[0], pRange[1]);
  const img = LOISIR_IMGS[i%LOISIR_IMGS.length];
  all.push(mk({
    title:item.t,
    price, imageUrl:img, images:[img],
    category:'Loisirs & Sports', categoryId:'8', condition:pick(['like_new','good','good','new']),
    description:`${item.t}. ${pick(['Peu utilisé','Excellent état','2 saisons d\'utilisation','Acheté en 2023','Très bon état'])}. ${Math.random()>0.5?'Accessoires inclus.':''} ${Math.random()>0.5?'Échange possible.':''}`,
    attributes:{condition:pick(['new','like_new','good'])},
  }));
}

// ════════════════════════════════════════════════════════════════
// SERVICES — 60 annonces
// ════════════════════════════════════════════════════════════════
const SERVICE_IMGS = [
  'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80',
  'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&q=80',
  'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80',
  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80',
  'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&q=80',
];
const SERVICE_ITEMS = [
  {t:'Cours particuliers Maths/Physique — Lycée & Terminale',type:'lesson',p:[2000,5000]},
  {t:'Cours d\'arabe classique et coran — Tous niveaux',type:'lesson',p:[1500,4000]},
  {t:'Cours d\'anglais individuel certifié IELTS',type:'lesson',p:[2500,6000]},
  {t:'Cours de français FLE — Alliance française',type:'lesson',p:[2000,5000]},
  {t:'Cours de code et algorithmique Python',type:'it',p:[3000,7000]},
  {t:'Développement site web vitrine + SEO',type:'it',p:[50000,200000]},
  {t:'Création application mobile Android/iOS',type:'it',p:[200000,800000]},
  {t:'Design logo et identité visuelle',type:'design',p:[15000,60000]},
  {t:'Photo et vidéo événementiel (mariage, fête)',type:'craft',p:[30000,120000]},
  {t:'Plombier — Installation sanitaire complète',type:'trade',p:[5000,50000]},
  {t:'Électricien agréé — Dépannage urgent 24h',type:'trade',p:[3000,20000]},
  {t:'Peinture bâtiment intérieur/extérieur',type:'trade',p:[25000,120000]},
  {t:'Carrelage et revêtements de sol',type:'trade',p:[30000,150000]},
  {t:'Menuiserie aluminium — Fenêtres sur mesure',type:'trade',p:[50000,300000]},
  {t:'Climatisation — Installation et maintenance',type:'trade',p:[25000,80000]},
  {t:'Nettoyage de chantier et locaux',type:'cleaning',p:[10000,60000]},
  {t:'Garde d\'enfants à domicile',type:'craft',p:[20000,50000]},
  {t:'Transport déménagement — Camion 20m³',type:'transport',p:[15000,80000]},
  {t:'Taxi aéroport — Service VIP 24h/7j',type:'transport',p:[3000,8000]},
  {t:'Réparation smartphones — Toutes marques',type:'it',p:[2000,15000]},
];

for(let i=0;i<60;i++){
  const item = SERVICE_ITEMS[i%SERVICE_ITEMS.length];
  const price = rand(item.p[0], item.p[1]);
  const img = SERVICE_IMGS[i%SERVICE_IMGS.length];
  all.push(mk({
    title:item.t,
    price, imageUrl:img, images:[img],
    category:'Services', categoryId:'9', condition:'new',
    description:`${item.t}.\n\n${pick(['5 ans d\'expérience.','Professionnel certifié.','Artisan agréé.','Formateur diplômé.'])} ${Math.random()>0.5?'Devis gratuit sous 24h.':''} ${Math.random()>0.5?'Zone d\'intervention: tout Alger et banlieue.':''} ${Math.random()>0.6?'Références disponibles sur demande.':''}`,
    attributes:{service_type:item.type,availability:'now'},
  }));
}

// ════════════════════════════════════════════════════════════════
// ANIMAUX — 40 annonces
// ════════════════════════════════════════════════════════════════
const ANIMAL_IMGS = [
  'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80',
  'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&q=80',
  'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800&q=80',
  'https://images.unsplash.com/photo-1592754862816-1a21a4ea2281?w=800&q=80',
  'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=800&q=80',
];
const ANIMALS = [
  {t:'Chiot Berger Allemand LOF — 2 mois vacciné',type:'dog',p:[60000,120000]},
  {t:'Chaton Ragdoll pure race LOOF — 3 mois',type:'cat',p:[35000,70000]},
  {t:'Chiot Golden Retriever — Pedigree',type:'dog',p:[55000,95000]},
  {t:'Chiot Husky Sibérien — Yeux vairons',type:'dog',p:[70000,130000]},
  {t:'Chat Persan blanc — 4 mois vacciné',type:'cat',p:[30000,60000]},
  {t:'Perroquet Ara Macao apprivoisé 3 ans',type:'parrot',p:[280000,420000]},
  {t:'Perroquet Gris du Gabon — Parle 50 mots',type:'parrot',p:[95000,165000]},
  {t:'Couple perruches inséparables avec cage',type:'bird',p:[8000,18000]},
  {t:'Canaris jaunes chanteurs — Lot de 4',type:'bird',p:[6000,15000]},
  {t:'Tortue grecque — Adulte 10 ans',type:'turtle',p:[12000,25000]},
  {t:'Lapin bélier nain avec cage',type:'rabbit',p:[8000,18000]},
  {t:'Aquarium marin 300L complet avec poissons',type:'fish',p:[200000,380000]},
  {t:'Chiot Rottweiler — 2 mois LOF',type:'dog',p:[65000,110000]},
  {t:'Chaton Maine Coon tabby — 3 mois',type:'cat',p:[45000,85000]},
  {t:'Caniche toy abricot — 4 mois',type:'dog',p:[40000,80000]},
];

for(let i=0;i<40;i++){
  const item = ANIMALS[i%ANIMALS.length];
  const price = rand(item.p[0], item.p[1]);
  const img = ANIMAL_IMGS[i%ANIMAL_IMGS.length];
  all.push(mk({
    title:item.t,
    price, imageUrl:img, images:[img],
    category:'Animaux', categoryId:'10', condition:'new',
    description:`${item.t}. Parents sur place. ${Math.random()>0.5?'Vacciné et vermifugé.':''} ${Math.random()>0.5?'Pedigree / LOF inscrit.':''} ${Math.random()>0.6?'Alimentation premium fournie pour 1 mois.':''} ${Math.random()>0.5?'Prix ferme, sérieux uniquement.':'Négociable pour personnes sérieuses.'}`,
    attributes:{animal_type:item.type,vaccinated:Math.random()>0.4?'yes':'partial'},
  }));
}

// ════════════════════════════════════════════════════════════════
// MATÉRIAUX BTP — 50 annonces
// ════════════════════════════════════════════════════════════════
const BTP_IMGS = [
  'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80',
  'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?w=800&q=80',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
  'https://images.unsplash.com/photo-1609862822285-cd5a4dd2a2de?w=800&q=80',
  'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&q=80',
];
const BTP_ITEMS = [
  {t:'Lot carrelage 60×60 grès céramique mat — 100m²',p:[60000,120000],type:'material'},
  {t:'Porte-fenêtre aluminium thermique 3 vantaux',p:[85000,150000],type:'plumbing'},
  {t:'Groupe électrogène Cummins 100 KVA diesel',p:[3200000,4500000],type:'generator'},
  {t:'Échafaudage tubulaire galvanisé 200m²',p:[750000,1200000],type:'equipment'},
  {t:'Perceuse à colonne Makita 350W',p:[28000,55000],type:'power_tool'},
  {t:'Meuleuse angle Bosch Professional 230mm',p:[18000,35000],type:'power_tool'},
  {t:'Pompe à eau submersible 1.5 CV',p:[25000,55000],type:'material'},
  {t:'Parpaings préfa standard 15×20×40 — lot 500',p:[20000,40000],type:'material'},
  {t:'Porte blindée acier 3 points 90×200',p:[95000,165000],type:'material'},
  {t:'Radiateurs eau chaude en aluminium x10',p:[45000,90000],type:'plumbing'},
  {t:'Tableau électrique Schneider 3×40A complet',p:[35000,65000],type:'electrical'},
  {t:'Câble électrique 2.5mm² 100m rouleau',p:[18000,32000],type:'electrical'},
  {t:'Robinetterie salle de bain Hansgrohe',p:[28000,65000],type:'plumbing'},
  {t:'Carrelage faïence salle de bain 30×60 — 30m²',p:[25000,50000],type:'material'},
  {t:'Niveaux laser rotatif Bosch Professional',p:[35000,70000],type:'power_tool'},
  {t:'Bétonnière 300L moteur diesel',p:[120000,200000],type:'machine'},
  {t:'Parquet flottant chêne massif 100m²',p:[120000,220000],type:'material'},
  {t:'Isolation laine de verre 100mm — 80m²',p:[25000,50000],type:'material'},
  {t:'Chaudière à gaz Vaillant 24kW condensation',p:[180000,280000],type:'plumbing'},
  {t:'Pompe de relevage eaux usées',p:[55000,110000],type:'plumbing'},
];

for(let i=0;i<50;i++){
  const item = BTP_ITEMS[i%BTP_ITEMS.length];
  const price = rand(item.p[0], item.p[1]);
  const img = BTP_IMGS[i%BTP_IMGS.length];
  all.push(mk({
    title:item.t,
    price, imageUrl:img, images:[img],
    category:'Matériaux & BTP', categoryId:'11', condition:pick(['new','like_new','good']),
    description:`${item.t}. ${pick(['Neuf jamais utilisé','Stock chantier terminé','Surplus de commande','Très bon état'])}. ${Math.random()>0.5?'Facture disponible.':''} ${Math.random()>0.5?'Chargement sur place, livraison possible.':''} Prix lot ou unitaire.`,
    attributes:{btp_type:item.type},
  }));
}

// ── Final stats & export ────────────────────────────────────────────────
const byCategory = {};
all.forEach(a=>{ byCategory[a.category]=(byCategory[a.category]||0)+1; });
console.log(`\n✅ Total annonces générées: ${all.length}`);
Object.entries(byCategory).sort((a,b)=>b[1]-a[1]).forEach(([cat,n])=>
  console.log(`   ${cat.padEnd(25)} ${n} annonces`)
);

const ts = `// Auto-generated — ${all.length} annonces fictives réalistes
// Catégories: Immobilier, Véhicules, High-Tech, Emploi, Maison, Mode, Agriculture, Loisirs, Services, Animaux, BTP
import type { Listing } from '../types';

export const ALL_LISTINGS: Listing[] = ${JSON.stringify(all, null, 2)};
`;

fs.writeFileSync('./src/data/listings.ts', ts);
console.log(`\n📁 Fichier: src/data/listings.ts (${(fs.statSync('./src/data/listings.ts').size/1024/1024).toFixed(1)} Mo)`);
