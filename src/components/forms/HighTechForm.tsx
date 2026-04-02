import React, { useEffect } from 'react';
import { Smartphone, Laptop, Monitor, Package } from 'lucide-react';
import AutocompleteInput from '../ui/AutocompleteInput';
import { PHONE_BRANDS, LAPTOP_BRANDS, STORAGE_OPTIONS, RAM_OPTIONS } from '../../lib/formData';

interface Props { attrs:Record<string,string>; onChange:(k:string,v:string)=>void; onReady:(c:boolean)=>void; }
const F=({label,req,children}:{label:string;req?:boolean;children:React.ReactNode})=>(
  <div><label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">{label}{req&&<span className="text-dz-red ml-0.5">*</span>}</label>{children}</div>
);
const Sel=({value,onChange,opts,ph}:any)=>(
  <select value={value||''} onChange={e=>onChange(e.target.value)}
    className="w-full bg-muted border border-border rounded-xl px-3 py-3 text-sm outline-none focus:border-dz-green cursor-pointer">
    <option value="">{ph}</option>
    {opts.map((o:any)=><option key={o.value||o} value={o.value||o}>{o.label||o}</option>)}
  </select>
);

const TECH_TYPES = [
  {value:'smartphone',label:'📱 Smartphone'},
  {value:'tablet',    label:'📟 Tablette'},
  {value:'laptop',    label:'💻 Laptop / PC portable'},
  {value:'desktop',   label:'🖥️ PC Bureau / Tour'},
  {value:'monitor',   label:'🖥️ Écran / Moniteur'},
  {value:'console',   label:'🎮 Console de jeux'},
  {value:'camera',    label:'📷 Appareil photo / Caméra'},
  {value:'drone',     label:'🚁 Drone'},
  {value:'headphones',label:'🎧 Casque / Écouteurs / Enceinte'},
  {value:'watch',     label:'⌚ Montre connectée'},
  {value:'printer',   label:'🖨️ Imprimante / Scanner'},
  {value:'network',   label:'📡 Réseau / Routeur / NAS'},
  {value:'accessory', label:'🔌 Accessoire / Périphérique'},
  {value:'component', label:'⚙️ Composant PC (GPU, CPU…)'},
  {value:'other',     label:'Autre'},
];

const HighTechForm:React.FC<Props>=({attrs,onChange,onReady})=>{
  const techType = attrs.tech_type || '';
  const isPhone  = ['smartphone','tablet'].includes(techType);
  const isLaptop = ['laptop','desktop'].includes(techType);
  const allPhoneBrands = Object.keys(PHONE_BRANDS);
  const allLaptopBrands = Object.keys(LAPTOP_BRANDS);
  const brand = attrs.brand || '';
  const phoneModels = PHONE_BRANDS[brand] || [];
  const laptopModels = LAPTOP_BRANDS[brand] || [];
  const allPhoneModels = Object.values(PHONE_BRANDS).flat();
  const allLaptopModels = Object.values(LAPTOP_BRANDS).flat();

  useEffect(()=>{ onReady(['tech_type','brand','model','condition'].every(k=>!!attrs[k])); },[attrs]);

  return(
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <F label="Type d'appareil" req>
          <Sel value={techType} onChange={(v:string)=>{ onChange('tech_type',v); onChange('brand',''); onChange('model',''); }}
            opts={TECH_TYPES} ph="Quel type d'appareil ?"/>
        </F>

        <AutocompleteInput label="Marque *" value={brand}
          onChange={v=>{ onChange('brand',v); onChange('model',''); }}
          onSelect={v=>{ onChange('brand',v); onChange('model',''); }}
          suggestions={isLaptop ? allLaptopBrands : isPhone ? allPhoneBrands : [...allPhoneBrands,...allLaptopBrands,'Sony','DJI','Canon','Nikon','Samsung','LG','Philips']}
          placeholder="Apple, Samsung, Xiaomi…"/>

        <AutocompleteInput label="Modèle exact *" value={attrs.model||''}
          onChange={v=>onChange('model',v)}
          suggestions={isPhone ? (phoneModels.length?phoneModels:allPhoneModels) : isLaptop ? (laptopModels.length?laptopModels:allLaptopModels) : allPhoneModels}
          placeholder={brand?`Modèle ${brand}…`:'Modèle exact'}/>

        {(isPhone||isLaptop||techType==='tablet') && (
          <F label="Stockage">
            <Sel value={attrs.storage} onChange={(v:string)=>onChange('storage',v)}
              opts={STORAGE_OPTIONS} ph="Capacité stockage"/>
          </F>
        )}

        {isLaptop && (
          <F label="RAM">
            <Sel value={attrs.ram} onChange={(v:string)=>onChange('ram',v)}
              opts={RAM_OPTIONS} ph="Mémoire RAM"/>
          </F>
        )}

        {isPhone && (
          <F label="Capacité batterie">
            <AutocompleteInput value={attrs.battery||''} onChange={v=>onChange('battery',v)}
              suggestions={['100%','99%','98%','97%','96%','95%','90-94%','85-89%','80-84%','<80%']}
              placeholder="Ex: 95%"/>
          </F>
        )}

        <F label="État *" req>
          <Sel value={attrs.condition} onChange={(v:string)=>onChange('condition',v)}
            opts={[
              {value:'sealed',    label:'🆕 Neuf scellé (jamais ouvert)'},
              {value:'open_box',  label:'📦 Neuf avec boîte (ouvert)'},
              {value:'very_good', label:'⭐ Très bon état (quelques mois)'},
              {value:'good',      label:'✅ Bon état (utilisation normale)'},
              {value:'fair',      label:'⚠️ État correct (traces d\'usage)'},
              {value:'repair',    label:'🔧 À réparer / Pour pièces'},
            ]} ph="État de l'appareil"/>
        </F>

        <F label="Garantie restante">
          <Sel value={attrs.warranty} onChange={(v:string)=>onChange('warranty',v)}
            opts={[
              {value:'none',    label:'Aucune garantie'},
              {value:'3m',      label:'< 3 mois'},
              {value:'6m',      label:'3 à 6 mois'},
              {value:'12m',     label:'6 à 12 mois'},
              {value:'12mplus', label:'Plus de 12 mois'},
              {value:'applecare',label:'AppleCare actif'},
            ]} ph="Garantie restante"/>
        </F>

        <F label="Accessoires inclus">
          <div className="flex flex-wrap gap-2">
            {['Boîte d\'origine','Câble/Chargeur original','Écouteurs','Coque de protection','Verre trempé','Stylet','Documentations'].map(a=>{
              const vals=(attrs.accessories||'').split(',').filter(Boolean);
              const on=vals.includes(a);
              return(
                <button key={a} type="button"
                  onClick={()=>{ const n=on?vals.filter(v=>v!==a):[...vals,a]; onChange('accessories',n.join(',')); }}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${on?'bg-dz-green text-white border-dz-green':'bg-muted border-border text-muted-foreground hover:border-dz-green/40'}`}>
                  {a}
                </button>
              );
            })}
          </div>
        </F>
      </div>
    </div>
  );
};

export default HighTechForm;
