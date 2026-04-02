import React, { useEffect } from 'react';
import AutocompleteInput from '../ui/AutocompleteInput';
import { DOG_BREEDS, CAT_BREEDS, BIRD_BREEDS } from '../../lib/formData';
interface Props { attrs:Record<string,string>; onChange:(k:string,v:string)=>void; onReady:(c:boolean)=>void; }
const F=({label,req,children}:{label:string;req?:boolean;children:React.ReactNode})=>(<div><label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">{label}{req&&<span className="text-dz-red ml-0.5">*</span>}</label>{children}</div>);
const Sel=({value,onChange,opts,ph}:any)=>(<select value={value||''} onChange={e=>onChange(e.target.value)} className="w-full bg-muted border border-border rounded-xl px-3 py-3 text-sm outline-none focus:border-dz-green cursor-pointer"><option value="">{ph}</option>{opts.map((o:any)=><option key={o.value||o} value={o.value||o}>{o.label||o}</option>)}</select>);
export default function AnimauxForm({attrs,onChange,onReady}:Props){
  const type=attrs.animal_type||'';
  const breeds=type==='dog'?DOG_BREEDS:type==='cat'?CAT_BREEDS:type==='bird'?BIRD_BREEDS:[];
  useEffect(()=>{ onReady(['animal_type'].every(k=>!!attrs[k])); },[attrs]);
  return(<div className="space-y-4"><div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <F label="Type d'animal" req><Sel value={type} onChange={(v:string)=>{ onChange('animal_type',v); onChange('breed',''); }} opts={[{value:'dog',label:'🐕 Chien'},{value:'cat',label:'🐈 Chat'},{value:'bird',label:'🐦 Oiseau'},{value:'parrot',label:'🦜 Perroquet'},{value:'rabbit',label:'🐇 Lapin'},{value:'turtle',label:'🐢 Tortue'},{value:'fish',label:'🐟 Poisson / Aquarium'},{value:'hamster',label:'🐹 Rongeur'},{value:'accessory',label:'🧺 Accessoire / Nourriture'}]} ph="Type d'animal"/></F>
    {breeds.length>0&&<AutocompleteInput label="Race / Espèce" value={attrs.breed||''} onChange={v=>onChange('breed',v)} suggestions={breeds} placeholder="Sélectionner la race…"/>}
    <F label="Âge"><Sel value={attrs.age} onChange={(v:string)=>onChange('age',v)} opts={[{value:'0_3m',label:'0 à 3 mois'},{value:'3_6m',label:'3 à 6 mois'},{value:'6_12m',label:'6 à 12 mois'},{value:'1y',label:'1 an'},{value:'2y',label:'2 ans'},{value:'3_5y',label:'3 à 5 ans'},{value:'5_10y',label:'5 à 10 ans'},{value:'10yplus',label:'Plus de 10 ans'}]} ph="Âge de l'animal"/></F>
    <F label="Sexe"><Sel value={attrs.gender} onChange={(v:string)=>onChange('gender',v)} opts={[{value:'male',label:'Mâle'},{value:'female',label:'Femelle'},{value:'unknown',label:'Non déterminé'}]} ph="Sexe"/></F>
    <F label="Vacciné(e)"><Sel value={attrs.vaccinated} onChange={(v:string)=>onChange('vaccinated',v)} opts={[{value:'yes_uptodate',label:'Oui — carnet de vaccination à jour'},{value:'yes_partial',label:'Oui — partiellement vacciné'},{value:'no',label:'Non vacciné'}]} ph="Statut vaccinations"/></F>
    <F label="Pedigree / LOF"><Sel value={attrs.pedigree} onChange={(v:string)=>onChange('pedigree',v)} opts={[{value:'yes_registered',label:'Oui — inscrit (LOF/LOOF)'},{value:'yes_not_registered',label:'Pure race — non inscrit'},{value:'no',label:'Non / Croisé'}]} ph="Pedigree"/></F>
    <F label="Saillie / Stérilisé"><Sel value={attrs.sterilized} onChange={(v:string)=>onChange('sterilized',v)} opts={[{value:'yes',label:'Stérilisé(e)'},{value:'no',label:'Non stérilisé(e)'},{value:'can_sail',label:'Pour saillie (reproducteur)'}]} ph="Stérilisation"/></F>
    <F label="Couleur / Robe"><input type="text" value={attrs.color||''} onChange={e=>onChange('color',e.target.value)} placeholder="Ex: Noir et feu, Tigré, Blanc…" className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-dz-green"/></F>
  </div></div>);
}
