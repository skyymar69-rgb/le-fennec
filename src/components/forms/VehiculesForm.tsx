import React, { useState, useEffect } from 'react';
import { Car, Gauge, Palette, Settings } from 'lucide-react';
import AutocompleteInput from '../ui/AutocompleteInput';
import { CAR_BRANDS, CAR_FUELS, CAR_GEARBOXES, CAR_COLORS } from '../../lib/formData';

const YEARS = Array.from({length:30},(_,i)=>String(2025-i));
const BRANDS = Object.keys(CAR_BRANDS);

interface Props { attrs:Record<string,string>; onChange:(k:string,v:string)=>void; onReady:(c:boolean)=>void; }

const F = ({label,req,children}:{label:string;req?:boolean;children:React.ReactNode}) => (
  <div>
    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">
      {label}{req&&<span className="text-dz-red ml-0.5">*</span>}
    </label>
    {children}
  </div>
);
const Sel=({value,onChange,opts,ph}:any)=>(
  <select value={value||''} onChange={e=>onChange(e.target.value)}
    className="w-full bg-muted border border-border rounded-xl px-3 py-3 text-sm outline-none focus:border-dz-green cursor-pointer">
    <option value="">{ph}</option>
    {opts.map((o:any)=><option key={o.value||o} value={o.value||o}>{o.label||o}</option>)}
  </select>
);

const VehiculesForm:React.FC<Props>=({attrs,onChange,onReady})=>{
  const brand    = attrs.brand || '';
  const models   = brand ? (CAR_BRANDS[brand] || []) : [];
  const allModels = Object.values(CAR_BRANDS).flat();

  useEffect(()=>{
    onReady(['brand','model','year','fuel','mileage'].every(k=>!!attrs[k]));
  },[attrs]);

  return(
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Type */}
        <F label="Type de véhicule" req>
          <Sel value={attrs.vehicle_type} onChange={(v:string)=>onChange('vehicle_type',v)}
            opts={[
              {value:'car',      label:'Voiture particulière'},
              {value:'suv',      label:'SUV / 4×4 / Crossover'},
              {value:'pickup',   label:'Pick-up'},
              {value:'van',      label:'Fourgonnette / Utilitaire'},
              {value:'truck',    label:'Camion / Poids lourd'},
              {value:'moto',     label:'Moto'},
              {value:'scooter',  label:'Scooter'},
              {value:'tractor',  label:'Tracteur / Engin agricole'},
              {value:'part',     label:'Pièce détachée'},
            ]} ph="Type de véhicule"/>
        </F>

        {/* Marque avec autocomplete */}
        <AutocompleteInput
          label="Marque *"
          value={brand}
          onChange={v=>{ onChange('brand',v); if(!CAR_BRANDS[v]) onChange('model',''); }}
          onSelect={v=>{ onChange('brand',v); onChange('model',''); }}
          suggestions={BRANDS}
          placeholder="Volkswagen, Toyota, Renault…"
          icon={<Car size={14}/>}
        />

        {/* Modèle */}
        <AutocompleteInput
          label="Modèle *"
          value={attrs.model||''}
          onChange={v=>onChange('model',v)}
          suggestions={models.length ? models : allModels}
          placeholder={brand ? `Modèle ${brand}…` : 'Sélectionnez la marque d\'abord'}
          icon={<Settings size={14}/>}
        />

        {/* Année */}
        <F label="Année" req>
          <Sel value={attrs.year} onChange={(v:string)=>onChange('year',v)}
            opts={YEARS.map(y=>({value:y,label:y}))} ph="Année du véhicule"/>
        </F>

        {/* Carburant */}
        <F label="Carburant" req>
          <Sel value={attrs.fuel} onChange={(v:string)=>onChange('fuel',v)}
            opts={CAR_FUELS} ph="Type de carburant"/>
        </F>

        {/* Boîte */}
        <F label="Boîte de vitesses">
          <Sel value={attrs.gearbox} onChange={(v:string)=>onChange('gearbox',v)}
            opts={CAR_GEARBOXES} ph="Type de boîte"/>
        </F>

        {/* Kilométrage */}
        <F label="Kilométrage (km)" req>
          <div className="relative">
            <Gauge size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/>
            <input type="number" min="0" max="2000000" step="1000"
              value={attrs.mileage||''} onChange={e=>onChange('mileage',e.target.value)}
              placeholder="Ex: 45 000"
              className="w-full bg-muted border border-border rounded-xl pl-9 pr-4 py-3 text-sm outline-none focus:border-dz-green"/>
          </div>
        </F>

        {/* Couleur */}
        <AutocompleteInput
          label="Couleur"
          value={attrs.color||''}
          onChange={v=>onChange('color',v)}
          suggestions={CAR_COLORS}
          placeholder="Blanc, Gris métallisé…"
          icon={<Palette size={14}/>}
        />

        {/* Puissance fiscale */}
        <F label="Puissance fiscale (CV)">
          <input type="number" min="1" max="99" step="1"
            value={attrs.fiscal_power||''} onChange={e=>onChange('fiscal_power',e.target.value)}
            placeholder="Ex: 7"
            className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-dz-green"/>
        </F>

        {/* Origine */}
        <F label="Origine">
          <Sel value={attrs.origin} onChange={(v:string)=>onChange('origin',v)}
            opts={[
              {value:'algerie',  label:'🇩🇿 Algérie (marché local)'},
              {value:'europe',   label:'🇪🇺 Europe (importé)'},
              {value:'emirats',  label:'🇦🇪 Émirats / Moyen-Orient'},
              {value:'usa',      label:'🇺🇸 États-Unis'},
              {value:'japon',    label:'🇯🇵 Japon (importé)'},
              {value:'chine',    label:'🇨🇳 Chine'},
            ]} ph="Origine du véhicule"/>
        </F>

        {/* Nombre de propriétaires */}
        <F label="Nombre de propriétaires">
          <Sel value={attrs.owners} onChange={(v:string)=>onChange('owners',v)}
            opts={['1 seul propriétaire','2 propriétaires','3 propriétaires et plus'].map((l,i)=>({value:String(i+1),label:l}))}
            ph="1er propriétaire ?"/>
        </F>
      </div>

      {/* Options checkboxes */}
      <F label="Options & Équipements">
        <div className="flex flex-wrap gap-2">
          {['GPS intégré','Caméra recul','Régulateur adaptatif (ACC)','Toit ouvrant panoramique','Sièges chauffants','Sièges ventilés','Sièges cuir','Jantes alliage','Aide au stationnement','Lane Assist','Démarrage sans clé','Chargeur induction','Écran tactile','Son premium','Apple CarPlay / Android Auto','Attelage remorque'].map(o=>{
            const vals=(attrs.options||'').split(',').filter(Boolean);
            const on=vals.includes(o);
            return(
              <button key={o} type="button"
                onClick={()=>{ const n=on?vals.filter(v=>v!==o):[...vals,o]; onChange('options',n.join(',')); }}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${on?'bg-dz-green text-white border-dz-green':'bg-muted border-border text-muted-foreground hover:border-dz-green/40'}`}>
                {o}
              </button>
            );
          })}
        </div>
      </F>

      {/* État général */}
      <F label="État général">
        <Sel value={attrs.state} onChange={(v:string)=>onChange('state',v)}
          opts={[
            {value:'perfect',   label:'Parfait état / Comme neuf'},
            {value:'excellent',  label:'Excellent état / Très peu de km'},
            {value:'good',       label:'Bon état général'},
            {value:'correct',    label:'État correct / Quelques défauts mineurs'},
            {value:'repair',     label:'À remettre en état'},
          ]} ph="État général du véhicule"/>
      </F>
    </div>
  );
};

export default VehiculesForm;
