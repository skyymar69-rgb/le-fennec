import type { Listing } from '../types';

const NOW = Date.now();
const DAY = 86_400_000;

// ─── Unsplash images by category (real, reliable) ─────────────
const IMG = {
  immo:  [
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
    'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
    'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80',
    'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80',
    'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80',
  ],
  auto:  [
    'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800&q=80',
    'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80',
    'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80',
    'https://images.unsplash.com/photo-1549924231-f129b911e442?w=800&q=80',
    'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80',
    'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&q=80',
    'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&q=80',
    'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80',
    'https://images.unsplash.com/photo-1567818735868-e71b99932e29?w=800&q=80',
    'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80',
  ],
  tech:  [
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80',
    'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&q=80',
    'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=800&q=80',
    'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&q=80',
    'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&q=80',
    'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&q=80',
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80',
    'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&q=80',
  ],
  emploi:[
    'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=800&q=80',
    'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&q=80',
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80',
    'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&q=80',
  ],
  maison:[
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
    'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800&q=80',
    'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
  ],
  mode:  [
    'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=80',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
    'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800&q=80',
    'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=800&q=80',
  ],
  agri:  [
    'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&q=80',
    'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80',
    'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=800&q=80',
  ],
  loisir:[
    'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80',
    'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
  ],
  service:[
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80',
    'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&q=80',
  ],
  animal:[
    'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80',
    'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&q=80',
  ],
  btp:   [
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80',
    'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?w=800&q=80',
  ],
};

const mk = (
  id: string, title: string, price: number, loc: string, wId: string,
  cat: string, catId: string, imgs: string[], desc: string,
  attrs: Record<string,unknown>, trust: number, quality: number,
  boost: 0|1|2|3 = 0, urgent = false, verified = false, premium = false,
  condition: string = 'good', daysAgo = 1, negotiable = false,
): Listing => ({
  id, title, slug: title.toLowerCase().replace(/[^a-z0-9]+/g,'-') + '-' + id,
  price, currency: 'DZD', negotiable,
  location: loc, wilayaId: wId, wilayaName: loc.split(',')[0],
  imageUrl: imgs[0], images: imgs,
  category: cat, categoryId: catId,
  isVerified: verified, isPremium: premium, isUrgent: urgent,
  condition: condition as any,
  date: daysAgo === 0 ? "Aujourd'hui" : daysAgo === 1 ? 'Hier' : `Il y a ${daysAgo}j`,
  timestamp: NOW - DAY * daysAgo,
  views: Math.floor(Math.random() * 3000) + 50,
  contacts: Math.floor(Math.random() * 80),
  favorites: Math.floor(Math.random() * 120),
  description: desc, attributes: attrs,
  ranking: { trustScore: trust, qualityScore: quality, clickRate: quality/1000, boostLevel: boost },
  status: 'active', userId: 'demo',
});

export const ALL_LISTINGS: Listing[] = [

// ══════════════════════════════════════
// 1 — IMMOBILIER (15 annonces)
// ══════════════════════════════════════
mk('im01','Appartement F4 Haut Standing — Hydra, Alger',45_000_000,'Alger, Hydra','16','Immobilier','1',
  [IMG.immo[0],IMG.immo[1],IMG.immo[4]],
  'Superbe F4 120m² au 5ème étage avec vue panoramique sur Alger. Finitions haut de gamme, double vitrage, volets roulants motorisés. Gardien 24h/24, parking sécurisé, ascenseur récent. Proche du métro El Harrach et des grandes surfaces.',
  {surface:120,pièces:'F4',étage:'5ème',parking:true,ascenseur:true,état:'Neuf'},95,92,1,false,true,true,'new',0,false),

mk('im02','Studio Meublé — Bab Ezzouar, Alger',18_000_000,'Alger, Bab Ezzouar','16','Immobilier','1',
  [IMG.immo[2]],
  'Studio 38m² entièrement meublé et équipé. Proche Université USTHB et pôle technologique. Idéal pour étudiant ou jeune professionnel. Charges incluses.',
  {surface:38,pièces:'Studio',étage:'2ème',meublé:true,état:'Bon état'},60,65,0,false,false,false,'good',2),

mk('im03','Villa avec piscine — Bord de mer, Tipaza',85_000_000,'Tipaza','42','Immobilier','1',
  [IMG.immo[6],IMG.immo[7],IMG.immo[9]],
  'Villa de standing 450m² sur terrain 800m² avec piscine à débordement et vue mer. 5 chambres, 3 salons, cuisine américaine entièrement équipée. Jardin paysager, éclairage automatique, vidéosurveillance. Accès plage privée à 200m.',
  {surface:450,pièces:'5+',piscine:true,jardin:true,étages:2,état:'Neuf'},98,95,2,false,true,true,'new',3,true),

mk('im04','Local Commercial 80m² — Centre Oran',12_500_000,'Oran, Centre','31','Immobilier','1',
  [IMG.immo[3]],
  'Local commercial en plein centre-ville d\'Oran, 80m² au rez-de-chaussée. Grande vitrine sur rue commerçante, accès PMR, électricité triphasée. Idéal commerce, agence, showroom. Bail commercial disponible.',
  {surface:80,type:'Commercial',façade:'12m',vitrine:true,état:'Bon état'},80,75,0,false,false,false,'good',4),

mk('im05','Appartement F3 — Sidi Bel Abbès',8_500_000,'Sidi Bel Abbès','22','Immobilier','1',
  [IMG.immo[5]],
  'F3 65m² au 3ème étage avec balcon. Quartier calme et résidentiel, proche commerces et école primaire. Double séjour, deux chambres, cuisine équipée. Bon état général.',
  {surface:65,pièces:'F3',étage:'3ème',balcon:true,état:'Bon état'},70,68,0,false,false,false,'good',1,true),

mk('im06','Terrain Constructible 500m² — Cheraga',22_000_000,'Alger, Chéraga','16','Immobilier','1',
  [IMG.immo[8]],
  'Terrain constructible 500m² viabilisé (eau, gaz, électricité) en zone résidentielle de Chéraga. Acte notarié, COS 1.2, R+2 autorisé. Pas d\'intermédiaires.',
  {surface:500,type:'Terrain',COS:'1.2',R:'+2',acte:'Notarié'},85,72,0,false,true,false,'new',5),

mk('im07','Duplex F5 — Birkhadem, Alger',38_000_000,'Alger, Birkhadem','16','Immobilier','1',
  [IMG.immo[1],IMG.immo[4]],
  'Magnifique duplex F5 180m² avec terrasse privative 40m². Quartier résidentiel prisé, vue dégagée. Cuisine entièrement équipée Bosch, marbre sol, menuiseries aluminium thermique.',
  {surface:180,pièces:'F5',terrasse:'40m²',duplex:true,état:'Neuf'},90,88,1,false,true,false,'new',2),

mk('im08','Villa F6 — Annaba Plage',55_000_000,'Annaba','23','Immobilier','1',
  [IMG.immo[6],IMG.immo[9]],
  'Belle villa F6 250m² à 300m de la plage Rizzi Amor. Jardin arborisé 600m², piscine, garage double. Construction 2020. Idéale résidence principale ou saisonnière.',
  {surface:250,pièces:'F6',piscine:true,garage:true,état:'Neuf'},88,85,0,false,true,false,'new',6),

mk('im09','Appartement F2 — Constantine Centre',6_500_000,'Constantine','25','Immobilier','1',
  [IMG.immo[2]],
  'F2 50m² au cœur de Constantine. Rénové entièrement en 2024 : peinture, carrelage, plomberie, électricité. Proche marché couvert et transports en commun.',
  {surface:50,pièces:'F2',étage:'1er',rénové:2024,état:'Rénové'},65,60,0,false,false,false,'good',8),

mk('im10','Ferme 3 hectares avec maison — Médéa',18_000_000,'Médéa','26','Immobilier','1',
  [IMG.immo[7]],
  'Ferme agricole 3 hectares avec maison d\'habitation 4 pièces. Puits artésien, verger (oliviers, arbres fruitiers), hangar de stockage. Titre foncier, eau abondante.',
  {surface:30_000,type:'Ferme',eau:true,verger:true,maison:'4 pièces'},80,70,0,false,false,false,'good',10,true),

mk('im11','Bureau 120m² — Kouba, Alger',2_800_000,'Alger, Kouba','16','Immobilier','1',
  [IMG.immo[3]],
  'Bureau de standing 120m² au 4ème étage d\'une tour administrative. Open space divisible, salle de réunion, parking. Disponible immédiatement. Prix à la location mensuelle.',
  {surface:120,type:'Bureau',salles:3,parking:true,état:'Neuf'},75,70,0,false,false,false,'new',1),

mk('im12','Appartement F4 — Sétif Résidentiel',14_500_000,'Sétif','19','Immobilier','1',
  [IMG.immo[0],IMG.immo[5]],
  'Grand F4 105m² dans résidence sécurisée avec gardiennage. Séjour spacieux, cuisine américaine, 3 chambres dont une suite parentale. Cave incluse.',
  {surface:105,pièces:'F4',cave:true,gardiennage:true,état:'Bon état'},78,75,0,false,true,false,'good',3),

mk('im13','Terrain Agricole 5ha — Mascara',12_000_000,'Mascara','29','Immobilier','1',
  [IMG.immo[8]],
  'Terrain agricole irrigué 5 hectares, acte notarié. Sol fertile, puits artésien débit 8L/s, accès piste carrossable. Actuellement en culture de céréales.',
  {surface:50_000,type:'Terrain agricole',eau:true,acte:'Notarié'},80,72,0,false,false,false,'new',7,true),

mk('im14','Villa R+1 — Oran les Amandiers',42_000_000,'Oran','31','Immobilier','1',
  [IMG.immo[6],IMG.immo[7]],
  'Villa R+1 200m² en quartier résidentiel Amandiers. 4 chambres, 2 salons (oriental/européen), cuisine équipée, jardin 300m². Garderie, école et centre commercial à 5 min.',
  {surface:200,pièces:'F4+',jardin:'300m²',étages:2,état:'Bon état'},85,80,0,false,true,false,'good',4,true),

mk('im15','Studio Neuf — Blida Résidence',9_200_000,'Blida','09','Immobilier','1',
  [IMG.immo[2]],
  'Studio neuf 35m² livraison immédiate dans résidence de standing. Finitions haut de gamme, double vitrage, climatisation réversible. Copropriété avec gardien et interphone.',
  {surface:35,pièces:'Studio',état:'Neuf',clim:true,interphone:true},72,68,0,false,false,false,'new',0),

// ══════════════════════════════════════
// 2 — VÉHICULES (15 annonces)
// ══════════════════════════════════════
mk('ve01','Volkswagen Golf 8 R-Line 2024 — Automatique',7_500_000,'Oran','31','Véhicules','2',
  [IMG.auto[0],IMG.auto[3]],
  'Golf 8 R-Line 1.5 TSI 150ch DSG7. Premier propriétaire, entretien chez concessionnaire VW Oran. Toutes options : Virtual Cockpit, ACC, caméra 360°, toit panoramique. Kilométrage garanti.',
  {année:2024,carburant:'Essence',boîte:'Automatique',km:12_000,couleur:'Blanc Nacré',puissance:'150ch',garantie:'Constructeur'},92,95,2,true,true,false,'like_new',0,true),

mk('ve02','Toyota Hilux Double Cab 4x4 2021',9_800_000,'Constantine','25','Véhicules','2',
  [IMG.auto[6],IMG.auto[7]],
  'Hilux 2.8L D-4D 204ch 4x4 automatique. Treuil Warn, barre de protection avant/arrière, tendeau benne. Révisions effectuées Toyota, pneus neufs 2024. Idéal chantier et désert.',
  {année:2021,carburant:'Diesel',boîte:'Automatique',km:65_000,couleur:'Blanc',puissance:'204ch'},88,90,1,false,true,false,'good',5),

mk('ve03','Mercedes-Benz Classe C 220d AMG Line 2022',18_500_000,'Alger','16','Véhicules','2',
  [IMG.auto[1],IMG.auto[4]],
  'Classe C 220d AMG Line 200ch. Couleur gris graphite, intérieur cuir noir. MBUX, aide au stationnement, sièges chauffants. Facture concessionnaire, garantie 12 mois.',
  {année:2022,carburant:'Diesel',boîte:'Automatique',km:28_000,couleur:'Gris Graphite',puissance:'200ch'},95,96,2,false,true,true,'like_new',1),

mk('ve04','Renault Clio 5 RS Line 1.0 TCe 2023',3_200_000,'Blida','09','Véhicules','2',
  [IMG.auto[4]],
  'Clio 5 RS Line 100ch, essence. Carnet d\'entretien complet Renault. Garantie constructeur encore valide. Parfait état, jamais accidentée. CT valide 2026.',
  {année:2023,carburant:'Essence',boîte:'Manuelle',km:32_000,couleur:'Rouge Flamme',puissance:'100ch'},78,82,0,false,false,false,'good',2,true),

mk('ve05','Dacia Duster 4x4 Prestige 2022',4_200_000,'Sétif','19','Véhicules','2',
  [IMG.auto[5],IMG.auto[8]],
  'Duster 1.3 TCe 130ch 4x4 finition Prestige. Caméra de recul, GPS, clim automatique, jantes 17". Entretien Dacia, pneus hivernaux inclus.',
  {année:2022,carburant:'Essence',boîte:'Manuelle',km:41_000,couleur:'Gris Highland',puissance:'130ch'},80,78,0,false,false,false,'good',3),

mk('ve06','Peugeot 208 GT 2023 — Comme Neuf',3_800_000,'Alger, Kouba','16','Véhicules','2',
  [IMG.auto[2]],
  '208 GT 1.2 PureTech 100ch. Achetée il y a 8 mois, aucun accroc. Écran tactile 10", CarPlay, détection fatigue. Raison de vente: mutation professionnelle.',
  {année:2023,carburant:'Essence',boîte:'Automatique',km:8_500,couleur:'Bleu Vertigo',puissance:'100ch'},82,85,0,false,false,false,'like_new',0),

mk('ve07','Hyundai Tucson 1.6T-GDi 2021',6_300_000,'Oran','31','Véhicules','2',
  [IMG.auto[9],IMG.auto[0]],
  'Tucson 1.6 T-GDi 150ch. SUV familial en excellent état. Toit ouvrant panoramique, sièges ventilés, régulateur adaptatif. 2 propriétaires, révisions strictes.',
  {année:2021,carburant:'Essence',boîte:'Automatique',km:55_000,couleur:'Blanc Cristal',puissance:'150ch'},75,80,0,false,false,false,'good',4),

mk('ve08','Kia Sportage GT-Line 2023 — Full Options',7_200_000,'Annaba','23','Véhicules','2',
  [IMG.auto[3],IMG.auto[6]],
  'Sportage 1.6 T-GDi 150ch GT-Line. 0 km au compteur, véhicule de démonstration concessionnaire. Toutes options: ADAS, toit panoramique, ambient light.',
  {année:2023,carburant:'Essence',boîte:'Automatique',km:3_200,couleur:'Acier Sombre',puissance:'150ch'},90,93,1,true,true,false,'like_new',0),

mk('ve09','Yamaha R3 320cc 2022 — Moto Sport',1_850_000,'Alger','16','Véhicules','2',
  [IMG.auto[7]],
  'Yamaha YZF-R3 320cc 42ch. Motos dans parfait état, révision effectuée 2024. Équipements inclus: casque, gants, combinaison. Carte grise au nom du vendeur.',
  {année:2022,carburant:'Essence',km:14_000,type:'Moto sport',puissance:'42ch'},70,72,0,false,false,false,'good',2),

mk('ve10','Citroën Berlingo XL Pro 2022 — Utilitaire',4_500_000,'Alger, Bachdjerrah','16','Véhicules','2',
  [IMG.auto[8]],
  'Berlingo XL cargo 1.5 BlueHDi 100ch. Long, 3 places, 3 portes latérales. Caméra recul, GPS, clim. Parfait pour artisan ou livraison. CT valide.',
  {année:2022,carburant:'Diesel',boîte:'Manuelle',km:48_000,type:'Utilitaire',charge:'700kg'},72,70,0,false,false,false,'good',6,true),

mk('ve11','BMW Série 3 318d M Sport 2020',11_500_000,'Alger','16','Véhicules','2',
  [IMG.auto[1],IMG.auto[9]],
  'Série 3 318d M Sport 150ch. Options M: volant chauffant, vitres surteintées, jantes 18" M. Entretien BMW, historique complet. Échange possible.',
  {année:2020,carburant:'Diesel',boîte:'Automatique',km:72_000,couleur:'Noir Saphir',puissance:'150ch'},85,88,0,false,true,false,'good',7),

mk('ve12','Mitsubishi L200 Triton 4x4 2019',7_900_000,'Béjaïa','06','Véhicules','2',
  [IMG.auto[5]],
  'L200 Triton 2.4 DI-D 150ch 4x4. Pick-up idéal pour terrain difficile. Cabine double, benne traitée, boîte de transfert. Révisé, prêt pour le Sahara.',
  {année:2019,carburant:'Diesel',boîte:'Manuelle',km:89_000,type:'Pick-up 4x4',puissance:'150ch'},76,74,0,false,false,false,'good',5,true),

mk('ve13','Audi A3 Sportback S-Line 35 TFSI 2021',12_800_000,'Oran','31','Véhicules','2',
  [IMG.auto[2],IMG.auto[4]],
  'A3 35 TFSI 150ch S-Line. Virtual Cockpit, Bang & Olufsen, sièges sport S-Line. Un seul propriétaire, suivi Audi exclusif. Pas d\'accident.',
  {année:2021,carburant:'Essence',boîte:'Automatique',km:35_000,couleur:'Gris Fleuret',puissance:'150ch'},88,90,1,false,true,false,'like_new',2),

mk('ve14','Nissan Navara Double Cab 2020',6_800_000,'Tizi Ouzou','15','Véhicules','2',
  [IMG.auto[6]],
  'Navara 2.3 dCi 190ch 4x4. Finition Tekna: cuir, GPS, caméra 360°. Attelage, protection moteur, benne modulable. Idéal usage mixte professionnel/loisir.',
  {année:2020,carburant:'Diesel',boîte:'Automatique',km:61_000,type:'Pick-up 4x4',puissance:'190ch'},80,82,0,false,false,false,'good',9),

mk('ve15','Volkswagen Transporter T6.1 2022',8_200_000,'Alger','16','Véhicules','2',
  [IMG.auto[8],IMG.auto[3]],
  'Transporter T6.1 2.0 TDI 150ch. Double cabine 6 places + cargo. Climatisation avant/arrière, GPS, attelage 2.5t. Idéal société BTP ou transport.',
  {année:2022,carburant:'Diesel',boîte:'Manuelle',km:38_000,type:'Minibus/Cargo',places:6},83,80,0,false,false,false,'good',1),

// ══════════════════════════════════════
// 3 — HIGH-TECH (12 annonces)
// ══════════════════════════════════════
mk('ht01','MacBook Pro M3 Max 16" — 36Go/1To',650_000,'Sétif','19','High-Tech','3',
  [IMG.tech[0]],
  'MacBook Pro 16" M3 Max, 36Go RAM, 1To SSD, chip Neural Engine. Acheté il y a 3 mois, utilisé en développement web. Batterie 95% santé. Facture et garantie Apple. Boîte, chargeur MagSafe originaux.',
  {marque:'Apple',modèle:'MacBook Pro 16"',ram:'36Go',stockage:'1To',batterie:'95%',état:'Comme neuf'},65,72,0,false,false,false,'like_new',2),

mk('ht02','iPhone 15 Pro Max 256Go Titane Naturel',185_000,'Alger','16','High-Tech','3',
  [IMG.tech[1]],
  'iPhone 15 Pro Max 256Go couleur Titane Naturel. Acheté le 15/01/2025, 2 mois d\'utilisation. Jamais tombé, toujours avec coque et verre trempé. Garantie Apple 10 mois restants. Face ID parfait.',
  {marque:'Apple',modèle:'iPhone 15 Pro Max',stockage:'256Go',couleur:'Titane Naturel',garantie:'10 mois'},22,32,0,false,false,false,'like_new',0),

mk('ht03','Samsung Galaxy S24 Ultra 512Go',220_000,'Oran','31','High-Tech','3',
  [IMG.tech[6]],
  'Galaxy S24 Ultra 512Go Titane Gris. S-Pen inclus, AI Galaxy activé. Parfait pour photographie et travail. Batterie 98%, zéro rayure. Boîte complète Samsung.',
  {marque:'Samsung',modèle:'S24 Ultra',stockage:'512Go',couleur:'Titane Gris',état:'Comme neuf'},58,65,0,false,false,false,'like_new',1),

mk('ht04','Dell XPS 15 9530 Intel Core i9 RTX 4070',580_000,'Alger, Hydra','16','High-Tech','3',
  [IMG.tech[4]],
  'Dell XPS 15 9530, Core i9-13900H, 32Go DDR5, SSD 1To NVMe, RTX 4070 8Go. Écran OLED 4K 3.5" tactile. Station de travail portable haut de gamme pour design et IA.',
  {marque:'Dell',modèle:'XPS 15 9530',cpu:'Intel i9-13900H',ram:'32Go',gpu:'RTX 4070',état:'Neuf'},78,80,0,false,false,false,'new',0),

mk('ht05','iPad Pro M2 12.9" + Apple Pencil 2 + Clavier',290_000,'Constantine','25','High-Tech','3',
  [IMG.tech[2]],
  'iPad Pro M2 12.9" 256Go WiFi + Cellular. Vendu avec Apple Pencil 2ème génération et Magic Keyboard Folio. Parfait pour architecte, designer ou étudiant.',
  {marque:'Apple',modèle:'iPad Pro 12.9" M2',stockage:'256Go',connectivité:'WiFi+5G',accessoires:'Pencil+Clavier'},70,75,0,false,false,false,'like_new',3),

mk('ht06','Sony PlayStation 5 Standard + 3 Jeux',95_000,'Blida','09','High-Tech','3',
  [IMG.tech[7]],
  'PS5 standard, achetée en 2023. Inclus: FIFA 25, Spider-Man 2, Hogwarts Legacy. Une manette DualSense supplémentaire. Tout en parfait état.',
  {marque:'Sony',modèle:'PlayStation 5',jeux:3,manettes:2,état:'Très bon état'},55,60,0,false,false,false,'good',2),

mk('ht07','DJI Mini 4 Pro Drone 4K + Fly More Combo',280_000,'Alger','16','High-Tech','3',
  [IMG.tech[3]],
  'DJI Mini 4 Pro avec Fly More Combo (3 batteries, station de charge, sac). Obstacle avoidance 360°, vidéo 4K HDR, temps de vol 34 min. Idéal photographie aérienne.',
  {marque:'DJI',modèle:'Mini 4 Pro',résolution:'4K HDR',batteries:3,autonomie:'34 min'},75,80,1,false,false,false,'like_new',1),

mk('ht08','Imprimante 3D Bambu Lab X1 Carbon',380_000,'Alger, Bir Mourad Raïs','16','High-Tech','3',
  [IMG.tech[5]],
  'Bambu Lab X1 Carbon, impression multimatériaux haute vitesse 500mm/s. AMS inclus (4 couleurs simultanées). Parfaite pour prototypage, ingénierie, design produit.',
  {marque:'Bambu Lab',modèle:'X1 Carbon',vitesse:'500mm/s',matériaux:'Multi',état:'Neuf'},80,85,0,false,false,false,'new',0),

mk('ht09','Apple Watch Ultra 2 Titane',210_000,'Alger','16','High-Tech','3',
  [IMG.tech[1]],
  'Apple Watch Ultra 2 titanium case 49mm. GPS + Cellular, autonomie 60h. Bracelet Ocean bleu indigo inclus. Achetée en décembre 2024. Parfait état.',
  {marque:'Apple',modèle:'Watch Ultra 2',boîtier:'Titane 49mm',batterie:'60h',état:'Comme neuf'},68,70,0,false,false,false,'like_new',1),

mk('ht10','Xiaomi 14T Pro 512Go — Nouveau',155_000,'Oran','31','High-Tech','3',
  [IMG.tech[6]],
  'Xiaomi 14T Pro 512Go Titan Black. Processeur Dimensity 9300+, écran AMOLED 144Hz, charge 120W. Caméra Leica triple 50MP. Neuf, scellé.',
  {marque:'Xiaomi',modèle:'14T Pro',stockage:'512Go',charge:'120W',état:'Neuf'},60,65,0,false,false,false,'new',0),

mk('ht11','MacBook Air M2 13" Minuit',380_000,'Annaba','23','High-Tech','3',
  [IMG.tech[0]],
  'MacBook Air M2 8Go/256Go couleur Minuit. Autonomie exceptionnelle 18h. Parfait pour étudiants et professionnels. Livré avec chargeur MagSafe 30W. 14 mois d\'utilisation légère.',
  {marque:'Apple',modèle:'MacBook Air 13" M2',ram:'8Go',stockage:'256Go',couleur:'Minuit'},65,68,0,false,false,false,'good',5),

mk('ht12','Écran 4K LG UltraGear 32" 144Hz Gaming',85_000,'Alger','16','High-Tech','3',
  [IMG.tech[4]],
  'LG UltraGear 32GN650-B 32" 4K Nano IPS 144Hz. Temps de réponse 1ms, G-Sync compatible, HDR600. Idéal gaming et création de contenu.',
  {marque:'LG',modèle:'UltraGear 32GN650',taille:'32"',résolution:'4K',taux:'144Hz'},72,74,0,false,false,false,'good',3),

// ══════════════════════════════════════
// 4 — EMPLOI (8 annonces)
// ══════════════════════════════════════
mk('em01','Développeur Full Stack React/Node.js — CDI',0,'Alger, El Biar','16','Emploi','4',
  [IMG.emploi[0]],
  'StartUp Alger (Fintech) recherche développeur Full Stack senior 3+ ans d\'expérience. Stack: React, TypeScript, Node.js, PostgreSQL, AWS. Remote possible 2j/sem. Package attractif + mutuelle + tickets restaurant.',
  {type:'CDI',secteur:'Informatique',expérience:'3+ ans',télétravail:'2j/sem',niveau:'Senior'},85,88,1,false,true,false,'new',1),

mk('em02','Ingénieur Génie Civil BTP — Oran',0,'Oran','31','Emploi','4',
  [IMG.emploi[2]],
  'Bureau d\'études SARIS Ingénierie recrute ingénieur GC pour projets d\'infrastructure. Béton armé, routes, ouvrages d\'art. Véhicule de fonction + assurance + logement de chantier.',
  {type:'CDI',secteur:'BTP',expérience:'2+ ans',avantages:'Véhicule + logement',niveau:'Confirmé'},78,80,0,false,false,false,'new',2),

mk('em03','Médecin Généraliste — Clinique Privée Annaba',0,'Annaba','23','Emploi','4',
  [IMG.emploi[1]],
  'Clinique Hippocrate Annaba recherche médecin généraliste pour consultation externe. Planning flexible, 3-5 jours/semaine. Rémunération selon convention + intéressement. Logement possible.',
  {type:'CDI',secteur:'Santé',expérience:'1+ an',planning:'Flexible',logement:'Possible'},80,82,0,false,false,false,'new',0),

mk('em04','Commercial B2B Région Centre — CDI',0,'Alger','16','Emploi','4',
  [IMG.emploi[3]],
  'Groupe agroalimentaire national recrute commercial B2B expérimenté pour la région Centre (Alger, Blida, Médéa). Objectifs, challenges motivants, voiture de fonction, carte carburant, commissions.',
  {type:'CDI',secteur:'Commerce',expérience:'2+ ans',région:'Centre Algérie',véhicule:true},72,74,0,false,false,false,'new',3),

mk('em05','Chef de Cuisine — Hôtel 5 Étoiles Alger',0,'Alger','16','Emploi','4',
  [IMG.emploi[0]],
  'Hôtel Sheraton Alger recrute chef de cuisine confirmé, maîtrise cuisine méditerranéenne et internationale. Management d\'équipe 15 personnes. Logement et avantages en nature.',
  {type:'CDI',secteur:'Hôtellerie',expérience:'5+ ans',équipe:'15 personnes'},82,84,1,false,false,false,'new',1),

mk('em06','Comptable Senior CPA — Constantine',0,'Constantine','25','Emploi','4',
  [IMG.emploi[2]],
  'Cabinet d\'expertise comptable Auditec recrute comptable senior. Maîtrise PCN, TVA, paie. Clients PME et grandes entreprises. Évolution Chef de mission possible.',
  {type:'CDI',secteur:'Finance',expérience:'4+ ans',certification:'CPA souhaité'},75,76,0,false,false,false,'new',4),

mk('em07','Enseignant Langues Anglais/Français — École Privée',0,'Blida','09','Emploi','4',
  [IMG.emploi[1]],
  'École privée Averroès Blida recrute enseignant(e) bilingue anglais-français pour cycle primaire/moyen. Pédagogie active, classe de 20 élèves. Débutant accepté avec formation.',
  {type:'CDI',secteur:'Éducation',expérience:'Débutant OK',niveau:'Primaire/Moyen'},65,68,0,false,false,false,'new',2),

mk('em08','Architecte d\'Intérieur — Agence Design Alger',0,'Alger, Hydra','16','Emploi','4',
  [IMG.emploi[3]],
  'Studio FORMA recrute architecte d\'intérieur créatif(ve). Maîtrise AutoCAD, 3ds Max, SketchUp. Projets résidentiels et hôteliers haut de gamme. Portefeuille exigé.',
  {type:'CDI',secteur:'Design',expérience:'2+ ans',logiciels:'AutoCAD, 3dsMax'},78,80,0,false,false,false,'new',5),

// ══════════════════════════════════════
// 5 — MAISON (8 annonces)
// ══════════════════════════════════════
mk('ma01','Canapé d\'Angle Convertible Cuir Premium',185_000,'Alger','16','Maison','5',
  [IMG.maison[0],IMG.maison[1]],
  'Canapé d\'angle convertible en cuir véritable couleur anthracite. Coffre de rangement intégré, méridienne réversible, têtières ajustables. Acheté chez Mobilis, 2 ans d\'utilisation légère.',
  {type:'Canapé',matière:'Cuir véritable',couleur:'Anthracite',conversion:'Lit 140cm',état:'Très bon état'},65,68,0,false,false,false,'good',3),

mk('ma02','Cuisine Équipée Complète Blanc Laqué',650_000,'Oran','31','Maison','5',
  [IMG.maison[2]],
  'Cuisine complète blanc laqué mat 3.6m linéaires. Electroménager Bosch intégré: réfrigérateur 2 portes, lave-vaisselle, four, plaque à induction, hotte. Déposée suite rénovation.',
  {type:'Cuisine',longueur:'3.6m',marque:'Bosch',état:'Très bon état',électro:true},75,78,0,false,false,false,'good',5,true),

mk('ma03','Machine à Laver LG 9kg Direct Drive',85_000,'Alger, Bab Ezzouar','16','Maison','5',
  [IMG.maison[3]],
  'LG F4V509S2T 9kg, moteur Direct Drive, AI DD technology. 14 programmes, vapeur Hygiene Steam, consommation A+++. 1 an d\'utilisation, parfait fonctionnement.',
  {marque:'LG',capacité:'9kg',programmes:14,énergie:'A+++',état:'Très bon état'},60,62,0,false,false,false,'good',1),

mk('ma04','Salon Marocain Complet 8 Places',120_000,'Constantine','25','Maison','5',
  [IMG.maison[0]],
  'Salon marocain 8 places en tissu velours bordeaux avec broderies dorées. Inclus: 8 coussins, table basse sculptée, 2 poufs. Fabriqué par artisan tlemcenien.',
  {type:'Salon marocain',places:8,tissu:'Velours',couleur:'Bordeaux',inclus:'Table+Poufs'},70,72,0,false,false,false,'good',2),

mk('ma05','Réfrigérateur Samsung Side-by-Side 636L',195_000,'Blida','09','Maison','5',
  [IMG.maison[4]],
  'Samsung RS68A8841S9 636L Side-by-Side Inox. Distributeur eau/glace, Family Hub préparé, Digital Inverter. 2 ans de garantie restants.',
  {marque:'Samsung',capacité:'636L',type:'Side-by-Side',énergie:'A++',garantie:'2 ans'},72,74,0,false,false,false,'good',6),

mk('ma06','Ensemble Chambre à Coucher Complète',280_000,'Alger','16','Maison','5',
  [IMG.maison[2]],
  'Chambre adulte complète: lit 180x200, 2 chevets, armoire 4 portes miroir, commode 5 tiroirs. Bois massif wengé. 3 ans d\'utilisation, très bon état.',
  {type:'Chambre',taille_lit:'180x200',bois:'Wengé',pièces:5,état:'Très bon état'},65,68,0,false,false,false,'good',4,true),

mk('ma07','Climatiseur Inverter Carrier 24000 BTU',145_000,'Oran','31','Maison','5',
  [IMG.maison[3]],
  'Carrier 42QHC024DS8 24000 BTU R32. Technologie Inverter, mode chaud/froid, filtre épurateur d\'air. Installé il y a 18 mois. Révision effectuée.',
  {marque:'Carrier',puissance:'24000 BTU',type:'Inverter',gaz:'R32',état:'Très bon état'},68,70,0,false,false,false,'good',2),

mk('ma08','Bureau Direction Bois Massif + Fauteuil',95_000,'Alger, Kouba','16','Maison','5',
  [IMG.maison[1]],
  'Bureau direction 180x90 bois massif chêne clair avec retour, tiroirs et caisson. Fauteuil direction cuir noir avec accoudoirs réglables. Parfait pour télétravail ou bureau à domicile.',
  {type:'Bureau direction',dimensions:'180x90',bois:'Chêne',fauteuil:true,état:'Bon état'},62,65,0,false,false,false,'good',7),

// ══════════════════════════════════════
// 6 — MODE (6 annonces)
// ══════════════════════════════════════
mk('mo01','Burnous Traditionnel Homme — Tissage Tlemcen',45_000,'Tlemcen','13','Mode','6',
  [IMG.mode[0]],
  'Burnous traditionnel homme en laine vierge, tissage artisanal de Tlemcen. Couleur crème ivoire, broderies dorées sur les manches et col. Taille unique (L-XL), jamais porté.',
  {type:'Burnous',matière:'Laine vierge',taille:'L-XL',état:'Neuf',artisanal:true},78,80,0,false,false,false,'new',3),

mk('mo02','Caftan Femme Mariage Haute Couture',180_000,'Alger, Hydra','16','Mode','6',
  [IMG.mode[1]],
  'Caftan de cérémonie haute couture, tissu brocart soie avec broderies main fines. Couleur vert emeraude et dorures. Taille 38-40, porté une seule fois.',
  {type:'Caftan',tissu:'Brocart soie',taille:'38-40',occasion:'Mariage',état:'Comme neuf'},75,78,0,false,false,false,'like_new',5),

mk('mo03','Costard Homme Hugo Boss Gris Anthracite',95_000,'Oran','31','Mode','6',
  [IMG.mode[2]],
  'Costume 2 pièces Hugo Boss Regular Fit gris anthracite. 100% laine vierge, doublure soie, boutons nacre. Taille 48 (FR). Porté 2 fois pour réunions. Nettoyage professionnel récent.',
  {marque:'Hugo Boss',taille:'48 FR',matière:'Laine vierge',état:'Comme neuf'},65,68,0,false,false,false,'like_new',2),

mk('mo04','Sneakers Nike Air Jordan 1 High OG — Taille 43',55_000,'Alger','16','Mode','6',
  [IMG.mode[3]],
  'Air Jordan 1 High OG "Chicago" colorway. Taille 43 EU, pointure 9.5 US. Neuves dans la boîte, non portées. Achetées à Dubaï.',
  {marque:'Nike',modèle:'Air Jordan 1 High OG',taille:'43 EU',couleur:'Chicago Red',état:'Neuf'},72,75,1,false,false,false,'new',0),

mk('mo05','Jellaba Femme Laine Brodée — Constantine',35_000,'Constantine','25','Mode','6',
  [IMG.mode[0]],
  'Jellaba femme en laine douce, broderies fleurs colorées sur les manches et bas. Couleur bleu roi. Taille 42, faite par couturière artisane de Constantine.',
  {type:'Jellaba',tissu:'Laine',taille:'42',couleur:'Bleu Roi',artisanal:true},60,62,0,false,false,false,'new',1),

mk('mo06','Lot Vêtements Enfant 3-8 ans',12_000,'Blida','09','Mode','6',
  [IMG.mode[1]],
  'Lot de 15 pièces vêtements enfant garçon, tailles 3 à 8 ans. Marques: Zara Kids, H&M, Bershka Kids. Bon état général, propres et repassés. Idéal famille nombreuse.',
  {pour:'Enfant garçon',tailles:'3-8 ans',pièces:15,marques:'Zara, H&M',état:'Bon état'},50,55,0,false,false,false,'good',4),

// ══════════════════════════════════════
// 7 — AGRICULTURE (5 annonces)
// ══════════════════════════════════════
mk('ag01','Tracteur New Holland T4.75 2019',4_800_000,'Mascara','29','Agriculture','7',
  [IMG.agri[0]],
  'Tracteur New Holland T4.75 95ch 4RM 2019. Cabine climatisée, transmission powershift, chargeur frontal. 1200 heures d\'utilisation. Révisé chez concessionnaire. Prêt à travailler.',
  {marque:'New Holland',modèle:'T4.75',puissance:'95ch',heures:1200,état:'Bon état'},80,82,0,false,false,false,'good',3,true),

mk('ag02','Troupeau Brebis Ouled Djellal — 40 têtes',2_400_000,'Ouled Djellal','51','Agriculture','7',
  [IMG.agri[1]],
  '40 brebis race Ouled Djellal, 3-4 ans, en pleine production. Vaccinées, vermifugées. Bonnes mères, excellente production lainière. Vendu avec bélier reproducteur. Certificat vétérinaire.',
  {type:'Ovin',race:'Ouled Djellal',têtes:40,âge:'3-4 ans',vaccins:true},75,78,0,false,false,false,'good',2),

mk('ag03','Système d\'Irrigation Goutte-à-Goutte 2ha',380_000,'Médéa','26','Agriculture','7',
  [IMG.agri[2]],
  'Système complet irrigation goutte-à-goutte pour 2 hectares. Pompe submersible 3hp, filtres à sable et à disques, programmateur électronique 8 stations, tuyaux PE et goutteurs.',
  {surface:'2ha',type:'Goutte-à-goutte',pompe:'3hp',stations:8,état:'Bon état'},72,74,0,false,false,false,'good',5),

mk('ag04','Terrain Agricole Irrigué 8ha — Tiaret',28_000_000,'Tiaret','14','Agriculture','7',
  [IMG.agri[0]],
  'Domaine agricole 8 hectares avec deux forages, réseau irrigation intégré, hangar 200m². Actuellement en verger (pommiers, poiriers). Acte de propriété. Accès route nationale.',
  {surface:'8ha',eau:'2 forages',verger:'Pommiers/Poiriers',hangar:'200m²',acte:true},85,88,0,false,true,false,'good',7,true),

mk('ag05','Moissonneuse-Batteuse John Deere S660 2018',12_500_000,'Tiaret','14','Agriculture','7',
  [IMG.agri[2]],
  'John Deere S660 6 secoueurs, 485ch. Barre de coupe de 7.6m. 850 heures moteur. Revisions régulières chez agro-équipement. Prête pour moisson 2025.',
  {marque:'John Deere',modèle:'S660',puissance:'485ch',heures:850,barre:'7.6m'},82,84,0,false,false,false,'good',4),

// ══════════════════════════════════════
// 8 — LOISIRS (5 annonces)
// ══════════════════════════════════════
mk('lo01','Vélo de Route Carbon Specialized Tarmac SL7',580_000,'Alger','16','Loisirs','8',
  [IMG.loisir[0]],
  'Specialized Tarmac SL7 Expert, cadre carbone Ultra Light, Shimano Ultegra Di2 électronique. Taille 56 (L). 2 saisons d\'utilisation légère. Roues Roval CL 50, pédales Look Keo.',
  {marque:'Specialized',modèle:'Tarmac SL7',taille:'56 (L)',transmission:'Shimano Ultegra Di2',état:'Très bon état'},78,82,0,false,false,false,'good',2),

mk('lo02','Tente Randonnée 3 Personnes MSR + Sac Couchage',95_000,'Alger','16','Loisirs','8',
  [IMG.loisir[2]],
  'Lot camping montagne: tente MSR Hubba NX 3P ultralight (1.72kg), 2 sacs de couchage Forclaz -10°C, 2 matelas autogonflants, réchaud gaz Primus. 5 sorties Djurdjura.',
  {type:'Camping montagne',tente:'MSR Hubba NX 3P',sacs_couchage:2,utilisations:5},65,70,0,false,false,false,'good',3),

mk('lo03','Table de Tennis de Table Cornilleau 500X',145_000,'Oran','31','Loisirs','8',
  [IMG.loisir[1]],
  'Table Cornilleau 500X intérieur, plateau 25mm, pieds acier, système Safety undercarriage. Inclus: 2 raquettes Donic, 6 balles. Achetée en 2022.',
  {marque:'Cornilleau',modèle:'500X',plateau:'25mm',inclus:'Raquettes+Balles',état:'Très bon état'},68,70,0,false,false,false,'good',4),

mk('lo04','Guitare Acoustique Taylor 214ce + Housse',185_000,'Alger','16','Loisirs','8',
  [IMG.loisir[0]],
  'Guitare acoustique Taylor 214ce, table épicéa, fond et éclisses palissandre. Manche acajou, sillet Tusq. Micro ES2 Taylor. Housse rigide Taylor incluse. Parfait état, cordes Elixir récentes.',
  {marque:'Taylor',modèle:'214ce',table:'Épicéa',manche:'Acajou',état:'Comme neuf'},72,75,0,false,false,false,'like_new',1),

mk('lo05','Équipement Plongée Complet — Mares',280_000,'Annaba','23','Loisirs','8',
  [IMG.loisir[2]],
  'Kit plongée sous-marine complet Mares: combinaison 5mm taille M, détendeur + octopus, BCD, ordinateur Suunto Eon Core, palmes, masque. 30 plongées max.',
  {marque:'Mares',taille:'M',plongées:30,ordinateur:'Suunto',état:'Très bon état'},75,78,0,false,false,false,'good',6),

// ══════════════════════════════════════
// 9 — SERVICES (5 annonces)
// ══════════════════════════════════════
mk('sv01','Cours Particuliers Maths/Physique — Lycée & Université',0,'Alger, Kouba','16','Services','9',
  [IMG.service[0]],
  'Professeur agrégé en maths et physique propose cours particuliers niveaux lycée (1ère, terminale bac) et 1ère année universitaire. Méthode structurée, résultats prouvés. 45 élèves en 5 ans. Domicile ou en ligne.',
  {type:'Cours particuliers',niveaux:'Lycée/Université',matières:'Maths/Physique',modalité:'Domicile/En ligne'},85,88,1,false,true,false,'new',1),

mk('sv02','Plombier Professionnel — Dépannage 24h/7j',0,'Oran','31','Services','9',
  [IMG.service[1]],
  'Plombier agréé avec 15 ans d\'expérience. Dépannage urgent, installation sanitaire, chauffe-eau, climatisation. Devis gratuit, facture fournie, garantie 1 an sur les travaux.',
  {type:'Artisanat',spécialité:'Plomberie',urgence:'24h/7j',expérience:'15 ans',garantie:'1 an'},80,82,0,false,true,false,'new',0),

mk('sv03','Location Salle Événements 250 Personnes — Alger',0,'Alger, Ben Aknoun','16','Services','9',
  [IMG.service[0]],
  'Salle de fêtes Le Palais 250 personnes, parking 60 places. Sono professionnelle, éclairage ambiance, cuisine équipée, vestiaire. Disponible weekends et jours fériés. Tarif selon formule.',
  {type:'Location salle',capacité:'250 pers.',parking:'60 places',sono:true,cuisine:true},78,80,0,false,false,false,'new',2),

mk('sv04','Développeur Web Freelance — Sites & Applications',0,'Alger','16','Services','9',
  [IMG.service[1]],
  '5 ans d\'expérience en développement web (React, Node.js, WordPress). Sites vitrine, e-commerce, applications métier. Portfolio sur demande. Devis gratuit sous 24h. Délais respectés.',
  {type:'Freelance',technologies:'React/Node/WordPress',expérience:'5 ans',délai:'Selon projet'},82,85,1,false,false,false,'new',0),

mk('sv05','Transport Déménagement — Tout Algérie',0,'Alger','16','Services','9',
  [IMG.service[0]],
  'Entreprise de déménagement professionnelle avec 3 camions (20, 30, 50m³). Emballage, démontage/remontage meubles, assurance incluse. Intervention dans 48 wilayas.',
  {type:'Transport',camions:3,capacités:'20/30/50m³',couverture:'48 wilayas',assurance:true},75,78,0,false,false,false,'new',1),

// ══════════════════════════════════════
// 10 — ANIMAUX (4 annonces)
// ══════════════════════════════════════
mk('an01','Chiot Berger Allemand LOF — 2 Mois',85_000,'Alger, Birkhadem','16','Animaux','10',
  [IMG.animal[0]],
  'Chiots berger allemand pur race, lignée championne, LOF inscrit. Parents sur place, tests de santé effectués. Vaccinés, identifiés, vermifugés. Disponible à partir du 15 mars.',
  {race:'Berger Allemand',âge:'2 mois',LOF:true,vaccins:true,disponible:'15 Mars'},80,82,1,false,true,false,'new',1),

mk('an02','Perroquet Ara Macao Apprivoisé — 3 Ans',320_000,'Alger','16','Animaux','10',
  [IMG.animal[1]],
  'Ara Macao (perroquet ara rouge) 3 ans, très apprivoisé, parle une trentaine de mots. Cage inox grand modèle, jouets, perchoirs inclus. Cède causa départ à l\'étranger.',
  {espèce:'Ara Macao',âge:'3 ans',apprivoisé:true,cage:true,mots:'30+'},78,80,0,false,false,false,'good',2,true),

mk('an03','Chaton Ragdoll Pure Race — Inscrit LOOF',45_000,'Oran','31','Animaux','10',
  [IMG.animal[0]],
  'Chatons Ragdoll pure race, inscrits LOOF. 3 mâles et 1 femelle disponibles, 3 mois. Vaccinés, identifiés (puce), vermifugés. Parents sur place. Très doux, idéal appartement.',
  {race:'Ragdoll',âge:'3 mois',LOOF:true,vaccins:true},72,75,0,false,false,false,'new',0),

mk('an04','Aquarium Marin Complet 450L',280_000,'Alger','16','Animaux','10',
  [IMG.animal[1]],
  'Aquarium marin 450L complet: cuve verre 12mm, filtre sump, éclairage LED Orphek, pompes Tunze, bac de refuge, chiller, osmoseur. Poissons et coraux LPS inclus.',
  {volume:'450L',type:'Marin',filtration:'Sump',éclairage:'Orphek LED',inclus:'Poissons+Coraux'},75,78,0,false,false,false,'good',3),

// ══════════════════════════════════════
// 11 — MATÉRIAUX BTP (4 annonces)
// ══════════════════════════════════════
mk('bt01','Lot Carrelage Grès Cérame 60x60 — 150m²',185_000,'Alger','16','Matériaux BTP','11',
  [IMG.btp[0]],
  '150m² de carrelage grès cérame rectifié 60x60 coloris gris béton mat. Qualité premium, anti-glisse, rectifié. Chutes de chantier, lot unique. Prix à débattre pour tout enlèvement.',
  {type:'Carrelage',format:'60x60',matière:'Grès cérame',coloris:'Gris béton mat',quantité:'150m²'},72,74,0,false,false,false,'new',2,true),

mk('bt02','Porte-Fenêtre Aluminium Thermique 3 Vantaux',95_000,'Oran','31','Matériaux BTP','11',
  [IMG.btp[1]],
  'Porte-fenêtre aluminium thermique 3 vantaux 3m x 2.4m. Double vitrage 4/16/4 argon, seuil à rupture de pont thermique. Couleur gris anthracite. Déposée suite rénovation.',
  {type:'Menuiserie',matière:'Aluminium',dimensions:'3m x 2.4m',vitrage:'Double',couleur:'Gris Anthracite'},68,70,0,false,false,false,'good',5),

mk('bt03','Groupe Électrogène Diesel Cummins 100 KVA',3_500_000,'Alger','16','Matériaux BTP','11',
  [IMG.btp[0]],
  'Groupe électrogène diesel Cummins 100 KVA silencieux. 450 heures de fonctionnement. Révision moteur effectuée. Idéal chantier, hôtel, clinique. Documentation complète.',
  {marque:'Cummins',puissance:'100 KVA',type:'Diesel silencieux',heures:450,état:'Bon état'},80,82,0,false,false,false,'good',4,true),

mk('bt04','Échafaudage Tubulaire 200m² — Complet',850_000,'Constantine','25','Matériaux BTP','11',
  [IMG.btp[1]],
  'Lot échafaudage tubulaire galvanisé 200m² de surface. Cadres, diagonales, planchers aluminium, pieds réglables. Très bon état. Idéal entreprise BTP ou location.',
  {type:'Échafaudage',surface:'200m²',matière:'Tubulaire galvanisé',état:'Très bon état'},75,78,0,false,false,false,'good',6),

];
