/**
 * Données structurées pour l'autocomplete de chaque catégorie
 * Spécifique à l'Algérie — marques, modèles, quartiers, etc.
 */

// ── Véhicules ─────────────────────────────────────────────────────────────
export const CAR_BRANDS: Record<string, string[]> = {
  'Volkswagen':   ['Golf 8','Golf 8 GTI','Golf 8 R','Polo 6','Tiguan','T-Roc','Passat','Touareg','Arteon'],
  'Renault':      ['Clio 5','Symbol','Mégane 4','Talisman','Duster','Sandero','Kadjar','Captur','Kwid','Logan'],
  'Toyota':       ['Corolla','Yaris','Camry','RAV4','Land Cruiser','Hilux','Prado','C-HR','Fortuner','Avanza'],
  'Hyundai':      ['Tucson','Elantra','i30','i20','Accent','Creta','Santa Fe','Sonata','Ioniq'],
  'Kia':          ['Sportage','Cerato','Picanto','Rio','Sorento','Stonic','Sonet','K5','EV6'],
  'Peugeot':      ['208','2008','301','3008','408','508','Partner','Rifter','Expert'],
  'Citroën':      ['C3','C4','C-Elysée','Berlingo','Jumpy','C5 Aircross'],
  'Mercedes':     ['Classe A','Classe C','Classe E','Classe S','GLC','GLE','GLB','Sprinter','Vito'],
  'BMW':          ['Série 1','Série 3','Série 5','X1','X3','X5','X6','M3','M5'],
  'Audi':         ['A1','A3','A4','A6','Q2','Q3','Q5','Q7','TT'],
  'Ford':         ['Ranger','Puma','Kuga','Transit','Focus','Mustang'],
  'Nissan':       ['Juke','Qashqai','X-Trail','Navara','Pathfinder','Micra'],
  'Mitsubishi':   ['L200','Outlander','Eclipse Cross','Pajero','ASX'],
  'Dacia':        ['Duster','Sandero','Logan','Spring','Jogger'],
  'Seat':         ['Ibiza','Arona','Leon','Ateca','Tarraco'],
  'Skoda':        ['Fabia','Octavia','Superb','Kodiaq','Karoq','Kamiq'],
  'Chevrolet':    ['Aveo','Cruze','Spark','Tahoe','Silverado'],
  'Mazda':        ['CX-3','CX-5','Mazda3','Mazda6','MX-5'],
  'Subaru':       ['Outback','Forester','XV','Impreza','WRX'],
  'Suzuki':       ['Swift','Vitara','Jimny','Baleno','Ertiga'],
  'Isuzu':        ['D-Max','MU-X','N-Series','KB'],
  'Great Wall':   ['Haval H6','Haval H9','Wingle 7','Cannon'],
  'Chery':        ['Tiggo 4','Tiggo 8','Arrizo 6'],
  'MG':           ['MG5','MG6','ZS','HS','RX5'],
  'BYD':          ['Atto 3','Han','Tang','Dolphin','Seal'],
};

export const CAR_FUELS = ['Diesel','Essence','Hybride','Hybride Plug-in','Électrique','GPL','GNV'];
export const CAR_GEARBOXES = ['Manuelle','Automatique','Semi-automatique','CVT'];
export const CAR_COLORS = ['Blanc','Noir','Gris métallisé','Argent','Bleu','Rouge','Vert','Beige','Bordeaux','Or','Orange','Brun','Blanc nacré','Noir brillant','Gris anthracite'];
export const CAR_CONDITIONS = ['Jamais accidenté','Clé en main','Importé récemment','Révision faite','Carnet d\'entretien complet'];

// ── Immobilier ────────────────────────────────────────────────────────────
export const PROPERTY_TYPES = [
  {value:'f1',label:'Appartement F1 (Studio + SDB)'},
  {value:'f2',label:'Appartement F2 (1 chambre)'},
  {value:'f3',label:'Appartement F3 (2 chambres)'},
  {value:'f4',label:'Appartement F4 (3 chambres)'},
  {value:'f5',label:'Appartement F5 (4 chambres)'},
  {value:'f6plus',label:'Appartement F6+ (5 ch. et +)'},
  {value:'studio',label:'Studio'},
  {value:'villa',label:'Villa'},
  {value:'villa_jumelee',label:'Villa jumelée'},
  {value:'duplex',label:'Duplex'},
  {value:'triplex',label:'Triplex'},
  {value:'maison',label:'Maison individuelle'},
  {value:'ferme',label:'Ferme / Corps de ferme'},
  {value:'terrain_resid',label:'Terrain résidentiel'},
  {value:'terrain_agri',label:'Terrain agricole'},
  {value:'terrain_comm',label:'Terrain commercial'},
  {value:'local',label:'Local commercial'},
  {value:'bureau',label:'Bureau'},
  {value:'entrepot',label:'Entrepôt / Hangar'},
  {value:'parking',label:'Parking / Garage'},
];

export const FLOOR_OPTIONS = [
  {value:'rdc',label:'Rez-de-chaussée (RDC)'},
  {value:'1',label:'1er étage'},
  {value:'2',label:'2ème étage'},
  {value:'3',label:'3ème étage'},
  {value:'4',label:'4ème étage'},
  {value:'5',label:'5ème étage'},
  {value:'6',label:'6ème étage'},
  {value:'7plus',label:'7ème étage et plus'},
  {value:'top',label:'Dernier étage (terrasse)'},
];

export const LEVELS_OPTIONS = [
  {value:'r0',label:'Plain-pied (R+0) — 1 niveau'},
  {value:'r1',label:'R+1 — 2 niveaux'},
  {value:'r2',label:'R+2 — 3 niveaux'},
  {value:'r3',label:'R+3 — 4 niveaux'},
  {value:'r4plus',label:'R+4 et plus'},
];

export const AMENITIES = [
  {value:'ascenseur',label:'Ascenseur'},
  {value:'parking',label:'Parking / Garage'},
  {value:'gardien',label:'Gardien 24h'},
  {value:'climatisation',label:'Climatisation'},
  {value:'chauffage',label:'Chauffage central'},
  {value:'cuisine_equipee',label:'Cuisine équipée'},
  {value:'double_vitrage',label:'Double vitrage'},
  {value:'piscine',label:'Piscine'},
  {value:'jardin',label:'Jardin / Terrain'},
  {value:'terrasse',label:'Terrasse / Balcon'},
  {value:'cave',label:'Cave / Débarras'},
  {value:'meuble',label:'Meublé'},
  {value:'interphone',label:'Interphone / Digicode'},
  {value:'videosurveillance',label:'Vidéosurveillance'},
  {value:'energie_solaire',label:'Énergie solaire'},
];

// ── High-Tech ─────────────────────────────────────────────────────────────
export const PHONE_BRANDS: Record<string,string[]> = {
  'Apple':    ['iPhone 16 Pro Max','iPhone 16 Pro','iPhone 16 Plus','iPhone 16','iPhone 15 Pro Max','iPhone 15 Pro','iPhone 15','iPhone 14 Pro Max','iPhone 14 Pro','iPhone 14','iPhone 13','iPhone 12','iPhone SE 3'],
  'Samsung':  ['Galaxy S25 Ultra','Galaxy S25+','Galaxy S25','Galaxy S24 Ultra','Galaxy S24+','Galaxy S24','Galaxy S23 Ultra','Galaxy A55','Galaxy A35','Galaxy A25','Galaxy Z Fold 6','Galaxy Z Flip 6'],
  'Xiaomi':   ['Xiaomi 14T Pro','Xiaomi 14T','Xiaomi 14 Ultra','Redmi Note 13 Pro+','Redmi Note 13 Pro','Redmi Note 13','Poco X6 Pro','Poco F6 Pro','Redmi 13C'],
  'Huawei':   ['Pura 70 Pro','Pura 70','Mate 60 Pro','Nova 12 Ultra','Nova 12 Pro','P60 Pro','MatePad Pro'],
  'Oppo':     ['Find X8 Pro','Find X8','Reno 12 Pro','Reno 12 F','A3 Pro','Find N3 Flip'],
  'OnePlus':  ['13','12','Nord 4','Nord CE 4','11','12R'],
  'Vivo':     ['X100 Pro','X100','V30 Pro','V30','Y200','T3 Pro'],
  'Tecno':    ['Phantom X2 Pro','Camon 30 Premier','Spark 20 Pro+','Pova 6 Pro'],
  'Infinix':  ['Zero 40','Note 40 Pro','Hot 40 Pro','Smart 8 Plus'],
};

export const LAPTOP_BRANDS: Record<string,string[]> = {
  'Apple':    ['MacBook Pro 16" M4 Max','MacBook Pro 14" M4 Pro','MacBook Air 15" M3','MacBook Air 13" M3','MacBook Pro 13" M2'],
  'Dell':     ['XPS 15 OLED','XPS 13 Plus','Inspiron 15 i7','Latitude 5540','Alienware m18','Alienware x16'],
  'HP':       ['Spectre x360 14','EliteBook 840 G11','Envy 16','Omen 17','Pavilion 15 i5','ZBook Studio'],
  'Lenovo':   ['ThinkPad X1 Carbon Gen 12','ThinkPad T14s','IdeaPad 5 Pro','Legion 5 Pro','Yoga 9i','LOQ 16'],
  'Asus':     ['ROG Zephyrus G16','ProArt Studiobook 16','ZenBook 14X OLED','VivoBook Pro 15','TUF Gaming F17'],
  'Acer':     ['Predator Helios Neo 18','Swift Edge 16','Aspire 5 i7','Nitro 17','ConceptD 5'],
  'MSI':      ['Raider GE78 HX','Titan GT77','Creator Z16','Stealth 16 Studio','Katana 17'],
};

export const STORAGE_OPTIONS = ['16 Go','32 Go','64 Go','128 Go','256 Go','512 Go','1 To','2 To','4 To'];
export const RAM_OPTIONS = ['4 Go','6 Go','8 Go','12 Go','16 Go','24 Go','32 Go','48 Go','64 Go'];

// ── Mode / Vêtements ──────────────────────────────────────────────────────
export const FASHION_BRANDS = [
  'Zara','H&M','Mango','Bershka','Pull&Bear','Massimo Dutti','Nike','Adidas','Puma','New Balance',
  'Gucci','Louis Vuitton','Balenciaga','Off-White','Stone Island','Hugo Boss','Ralph Lauren',
  'Tommy Hilfiger','Calvin Klein','Lacoste','Burberry','Versace','Fendi','Dior','Chanel',
  'Stradivarius','Reserved','Primark','Uniqlo','Gap','Levi\'s','Wrangler','Diesel',
  // Algerian/local brands
  'Maison Khalti','Fatma n\'Soumer','Karakou','Djellaba tradition'
];

export const SIZES_CLOTHES = ['XXS','XS','S','M','L','XL','XXL','3XL','4XL'];
export const SIZES_SHOES = ['35','36','37','38','39','40','41','42','43','44','45','46','47'];
export const SIZES_KIDS = ['0-3 mois','3-6 mois','6-12 mois','1 an','2 ans','3 ans','4 ans','5 ans','6 ans','8 ans','10 ans','12 ans','14 ans'];

// ── Quartiers par wilaya ───────────────────────────────────────────────────
export const QUARTIERS: Record<string, string[]> = {
  '16': ['Hydra','El Biar','Ben Aknoun','Dely Ibrahim','Birkhadem','Bir Mourad Raïs','Kouba','Bachdjerrah','El Harrach','Bab Ezzouar','Riadh El Feth','Hussein Dey','Sidi M\'hamed','Les Annassers','Draria','Cheraga','Ain Benian','Ain Taya','Bordj El Kiffan','Mohammadia','Réghaïa'],
  '31': ['Es Senia','Bir El Djir','Arzew','Ain El Turk','Bousfer','Saint-Hubert','Haï El Yasmine','Haï Nedjma','Sidi El Bachir','Khemisti','Caroubier'],
  '25': ['Sidi Mabrouk','El Khroub','Ain Smara','Zighoud Youcef','Hamma Bouziane','Ibn Badis','Didouche Mourad'],
  '09': ['Boufarik','Bougara','Larbaa','Chiffa','Meftah','Souma','Bni Tamou'],
  '35': ['Boumerdès','Thénia','Tidjelabine','Khemis El Khechna','Boudouaou','Zemmouri'],
  '19': ['El Eulma','Ain Oulmene','Bougaa','Salah Bey','Ain Arnat'],
  '06': ['El Kseur','Akbou','Sidi Aich','Aokas','Souk El Tenine','Amizour'],
  '15': ['Azazga','Draa El Mizan','Ouaguenoun','Tigzirt','Maatkas'],
  '05': ['Arris','N\'Gaous','Merouana','Ain Touta','Barika'],
  '42': ['Koléa','Hadjout','Fouka','Cherchell','Gouraya','Sidi Ghiles'],
};

// ── Animaux ───────────────────────────────────────────────────────────────
export const DOG_BREEDS = [
  'Berger Allemand','Berger Belge Malinois','Rottweiler','Dobermann','Labrador','Golden Retriever',
  'Caniche','Husky Sibérien','Bouledogue Français','Spitz Nain','Chihuahua','Yorkshire Terrier',
  'Cocker Spaniel','Dalmatien','Boxer','Chow-Chow','Akita Inu','Shiba Inu','Carlin','Shi-Tzu',
  'Lévrier','Sloughi (Algérien)','Aïdi (Berbère)','Dogue Allemand',
];

export const CAT_BREEDS = [
  'Persan','Maine Coon','Ragdoll','Siamois','British Shorthair','Scottish Fold','Bengal',
  'Abyssin','Norvégien','Sibérien','Turc de Van','Angora Turc','Sphynx','Sacré de Birmanie',
  'Européen commun',
];

export const BIRD_BREEDS = [
  'Canari','Perruche ondulée','Perruche Calopsitte','Inséparable','Ara Macao','Ara Hyacinthe',
  'Gris du Gabon','Amazone','Conure','Eclectus','Loriot','Moineau','Tourterelle','Pigeon de race',
];

// ── Services ──────────────────────────────────────────────────────────────
export const SERVICE_TYPES = [
  {value:'plomberie',label:'Plomberie & Sanitaire'},
  {value:'electricite',label:'Électricité & Domotique'},
  {value:'maconnerie',label:'Maçonnerie & Gros œuvre'},
  {value:'peinture',label:'Peinture & Revêtement'},
  {value:'menuiserie_alu',label:'Menuiserie Aluminium & PVC'},
  {value:'menuiserie_bois',label:'Menuiserie Bois & Ébénisterie'},
  {value:'carrelage',label:'Carrelage & Revêtements sol'},
  {value:'climatisation',label:'Climatisation & Ventilation'},
  {value:'toiture',label:'Toiture & Étanchéité'},
  {value:'jardinage',label:'Jardinage & Paysagisme'},
  {value:'nettoyage',label:'Nettoyage & Entretien'},
  {value:'demenagement',label:'Déménagement & Transport'},
  {value:'cours_maths',label:'Cours Maths / Physique'},
  {value:'cours_arabe',label:'Cours d\'Arabe / Coran'},
  {value:'cours_francais',label:'Cours de Français'},
  {value:'cours_anglais',label:'Cours d\'Anglais'},
  {value:'cours_info',label:'Cours Informatique & Bureautique'},
  {value:'developpement',label:'Développement Web & Mobile'},
  {value:'design',label:'Design Graphique & Impression'},
  {value:'photo_video',label:'Photographie & Vidéo'},
  {value:'coiffure',label:'Coiffure & Esthétique'},
  {value:'comptabilite',label:'Comptabilité & Fiscalité'},
  {value:'juridique',label:'Conseil Juridique'},
  {value:'sante',label:'Santé & Paramédical'},
  {value:'autre',label:'Autre service'},
];
