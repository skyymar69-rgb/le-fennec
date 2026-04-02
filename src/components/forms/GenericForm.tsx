import React, { useEffect } from 'react';
import AutocompleteInput from '../ui/AutocompleteInput';
import { FASHION_BRANDS, SIZES_CLOTHES, SIZES_SHOES } from '../../lib/formData';

interface Props {
  categoryId: string;
  attrs:      Record<string,string>;
  onChange:   (k:string,v:string)=>void;
  onReady:    (c:boolean)=>void;
}

const F=({label,req,children}:{label:string;req?:boolean;children:React.ReactNode})=>(<div><label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">{label}{req&&<span className="text-dz-red ml-0.5">*</span>}</label>{children}</div>);
const Sel=({value,onChange,opts,ph}:any)=>(<select value={value||''} onChange={e=>onChange(e.target.value)} className="w-full bg-muted border border-border rounded-xl px-3 py-3 text-sm outline-none focus:border-dz-green cursor-pointer"><option value="">{ph}</option>{opts.map((o:any)=><option key={o.value||o} value={o.value||o}>{o.label||o}</option>)}</select>);
const CONDITION_OPTS=[{value:'new',label:'Neuf (jamais utilisé)'},{value:'like_new',label:'Comme neuf'},{value:'very_good',label:'Très bon état'},{value:'good',label:'Bon état'},{value:'fair',label:'État correct'},{value:'parts',label:'Pour pièces / à réparer'}];

export default function GenericForm({categoryId,attrs,onChange,onReady}:Props){
  useEffect(()=>{ onReady(true); },[]);

  // Mode
  if(categoryId==='6') return(
    <div className="space-y-4"><div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <F label="Genre" req><Sel value={attrs.gender} onChange={(v:string)=>onChange('gender',v)} opts={[{value:'men',label:'Homme'},{value:'women',label:'Femme'},{value:'kids',label:'Enfant'},{value:'unisex',label:'Unisexe'}]} ph="Genre"/></F>
      <F label="Type d'article" req><Sel value={attrs.clothing_type} onChange={(v:string)=>onChange('clothing_type',v)} opts={['Haut / T-shirt','Veste / Manteau','Pantalon / Jean','Robe / Jupe','Chaussures','Sac / Maroquinerie','Accessoire','Parfum / Cosmétique','Sous-vêtement','Maillot de bain','Tenue traditionnelle (Caftan, Burnous…)','Djellaba / Haïk'].map(l=>({value:l.toLowerCase().replace(/\s+/g,'_'),label:l}))} ph="Type d'article"/></F>
      <AutocompleteInput label="Marque" value={attrs.brand||''} onChange={v=>onChange('brand',v)} suggestions={FASHION_BRANDS} placeholder="Zara, Nike, Hugo Boss…"/>
      <F label="Taille"><Sel value={attrs.size} onChange={(v:string)=>onChange('size',v)} opts={[...SIZES_CLOTHES,...SIZES_SHOES,'Taille unique']} ph="Taille / Pointure"/></F>
      <F label="Couleur"><input type="text" value={attrs.color||''} onChange={e=>onChange('color',e.target.value)} placeholder="Ex: Bleu marine, Noir, Blanc cassé…" className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-dz-green"/></F>
      <F label="État" req><Sel value={attrs.condition} onChange={(v:string)=>onChange('condition',v)} opts={[{value:'new_tag',label:'Neuf avec étiquette'},{value:'new_no_tag',label:'Neuf sans étiquette'},...CONDITION_OPTS.slice(1)]} ph="État"/></F>
    </div></div>
  );

  // Maison & Jardin
  if(categoryId==='5') return(
    <div className="space-y-4"><div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <F label="Catégorie" req><Sel value={attrs.home_type} onChange={(v:string)=>onChange('home_type',v)} opts={['Canapé / Sofa','Lit / Chambre complète','Table / Bureau','Armoire / Rangement','Électroménager (gros)','Petit électroménager','Cuisine équipée','Climatiseur','Chauffage','Luminaire / Éclairage','Décoration','Jardin / Extérieur','Outil / Bricolage','Matériel de nettoyage','Autre'].map(l=>({value:l.toLowerCase().replace(/[\s\/]+/g,'_'),label:l}))} ph="Catégorie d'article"/></F>
      <AutocompleteInput label="Marque" value={attrs.brand||''} onChange={v=>onChange('brand',v)} suggestions={['Samsung','LG','Bosch','Whirlpool','Indesit','Brandt','Carrier','Midea','GREE','Daikin','IKEA','Conforama','But','Bulthaup','SieMatic','Electrolux','Philips','Moulinex','Tefal','Dyson','Kärcher','Husqvarna','Stihl']} placeholder="Marque…"/>
      <F label="Dimensions (si applicable)"><input type="text" value={attrs.dimensions||''} onChange={e=>onChange('dimensions',e.target.value)} placeholder="Ex: 180×90×75 cm (L×l×H)" className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-dz-green"/></F>
      <F label="Couleur / Matière"><input type="text" value={attrs.color||''} onChange={e=>onChange('color',e.target.value)} placeholder="Ex: Blanc, Bois clair, Inox…" className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-dz-green"/></F>
      <F label="État" req><Sel value={attrs.condition} onChange={(v:string)=>onChange('condition',v)} opts={CONDITION_OPTS} ph="État"/></F>
      <F label="Livraison"><Sel value={attrs.delivery} onChange={(v:string)=>onChange('delivery',v)} opts={[{value:'no',label:'Non — à emporter'},{value:'yes_free',label:'Livraison gratuite'},{value:'yes_extra',label:'Livraison possible (frais en plus)'}]} ph="Livraison possible ?"/></F>
    </div></div>
  );

  // Agriculture
  if(categoryId==='7') return(
    <div className="space-y-4"><div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <F label="Catégorie" req><Sel value={attrs.agri_type} onChange={(v:string)=>onChange('agri_type',v)} opts={[{value:'tractor',label:'Tracteur'},{value:'harvester',label:'Moissonneuse-batteuse'},{value:'equipment',label:'Équipement / Machine agricole'},{value:'land',label:'Terrain agricole'},{value:'cattle',label:'Bovins (vaches, taureaux…)'},{value:'sheep',label:'Ovins (moutons, agneaux…)'},{value:'goat',label:'Caprins (chèvres…)'},{value:'poultry',label:'Volailles (poulets, dindes…)'},{value:'horses',label:'Équidés (chevaux, ânes…)'},{value:'bees',label:'Apiculture (ruches, miel)'},{value:'seeds',label:'Semences / Plants'},{value:'other',label:'Autre'}]} ph="Type de produit/animal"/></F>
      <AutocompleteInput label="Marque / Race" value={attrs.brand||''} onChange={v=>onChange('brand',v)} suggestions={['John Deere','New Holland','Case IH','Massey Ferguson','SAME','Claas','Fendt','Kubota','Deutz-Fahr','MTZ Belarus','RABE','Sfax Outillage','PRACI']} placeholder="Marque ou race…"/>
      <F label="Superficie / Quantité"><input type="text" value={attrs.quantity||''} onChange={e=>onChange('quantity',e.target.value)} placeholder="Ex: 5 ha, 50 têtes, 200 qx…" className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-dz-green"/></F>
      <F label="Heures / Année (machines)"><input type="number" min="0" value={attrs.hours||''} onChange={e=>onChange('hours',e.target.value)} placeholder="Ex: 2500 heures" className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-dz-green"/></F>
      <F label="État" req><Sel value={attrs.condition} onChange={(v:string)=>onChange('condition',v)} opts={CONDITION_OPTS.slice(0,4)} ph="État"/></F>
    </div></div>
  );

  // Loisirs & Sports
  if(categoryId==='8') return(
    <div className="space-y-4"><div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <F label="Catégorie" req><Sel value={attrs.leisure_type} onChange={(v:string)=>onChange('leisure_type',v)} opts={['Vélo','Vélo électrique','VTT','Tapis roulant / Elliptique','Musculation / Fitness','Tennis / Padel','Football / Ballon','Natation','Arts martiaux','Instrument de musique','Console / Jeux vidéo','Camping / Randonnée','Pêche / Chasse','Livres / BD / Romans','Jouet enfant','Jeu de société','Autre'].map(l=>({value:l.toLowerCase().replace(/[\s\/]+/g,'_'),label:l}))} ph="Type de loisir"/></F>
      <AutocompleteInput label="Marque" value={attrs.brand||''} onChange={v=>onChange('brand',v)} suggestions={['Décathlon','Nike','Adidas','Specialized','Trek','Yamaha','Fender','Gibson','Roland','PlayStation','Xbox','Nintendo','Coleman','Quechua','Domyos','Btwin','Kipsta']} placeholder="Marque…"/>
      <F label="État" req><Sel value={attrs.condition} onChange={(v:string)=>onChange('condition',v)} opts={CONDITION_OPTS} ph="État"/></F>
      <F label="Taille / Modèle"><input type="text" value={attrs.model||''} onChange={e=>onChange('model',e.target.value)} placeholder="Ex: Taille M, 56cm, Modèle Pro…" className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-dz-green"/></F>
    </div></div>
  );

  // Matériaux BTP
  if(categoryId==='11') return(
    <div className="space-y-4"><div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <F label="Catégorie" req><Sel value={attrs.btp_type} onChange={(v:string)=>onChange('btp_type',v)} opts={[{value:'tile',label:'Carrelage / Faïence'},{value:'paint',label:'Peinture / Enduit'},{value:'wood',label:'Parquet / Boiserie'},{value:'door',label:'Porte / Fenêtre / Volet'},{value:'plumbing',label:'Plomberie / Sanitaire'},{value:'electrical',label:'Électricité / Câblage'},{value:'cement',label:'Ciment / Béton / Sable'},{value:'brick',label:'Brique / Parpaing'},{value:'steel',label:'Fer à béton / Charpente métal'},{value:'insulation',label:'Isolation / Étanchéité'},{value:'generator',label:'Groupe électrogène'},{value:'hand_tool',label:'Outil manuel'},{value:'power_tool',label:'Outil électroportatif'},{value:'machine',label:'Machine / Engin de chantier'},{value:'scaffold',label:'Échafaudage'},{value:'other',label:'Autre matériau'}]} ph="Type de matériau / outil"/></F>
      <AutocompleteInput label="Marque" value={attrs.brand||''} onChange={v=>onChange('brand',v)} suggestions={['Bosch','Makita','DeWalt','Hilti','Stanley','Facom','Caterpillar','Schneider','Legrand','Grohe','Hansgrohe','Villeroy & Boch','Knauf','Saint-Gobain','Isover','COLAS','Lafarge','ERCO','Thermor','Atlantic']} placeholder="Marque…"/>
      <F label="Quantité disponible"><input type="text" value={attrs.quantity||''} onChange={e=>onChange('quantity',e.target.value)} placeholder="Ex: 50 m², 200 unités, 10 tonnes…" className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-dz-green"/></F>
      <F label="Dimensions / Référence"><input type="text" value={attrs.dimensions||''} onChange={e=>onChange('dimensions',e.target.value)} placeholder="Ex: 60×60cm, 45×90, Réf: 1234" className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-dz-green"/></F>
      <F label="État"><Sel value={attrs.condition} onChange={(v:string)=>onChange('condition',v)} opts={[{value:'new',label:'Neuf (surplus de chantier)'},{value:'good',label:'Bon état'},{value:'fair',label:'Occasion'}]} ph="État"/></F>
      <F label="Raison de la vente"><Sel value={attrs.reason} onChange={(v:string)=>onChange('reason',v)} opts={['Chantier terminé','Surplus de commande','Changement de projet','Stock à écouler'].map(l=>({value:l,label:l}))} ph="Pourquoi vous vendez ?"/></F>
    </div></div>
  );

  // Fallback générique
  return(
    <div className="space-y-4"><div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <F label="État" req><Sel value={attrs.condition} onChange={(v:string)=>onChange('condition',v)} opts={CONDITION_OPTS} ph="État de l'article"/></F>
      <F label="Marque"><input type="text" value={attrs.brand||''} onChange={e=>onChange('brand',e.target.value)} placeholder="Marque (si applicable)" className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-dz-green"/></F>
    </div></div>
  );
}
