import React, { useEffect } from 'react';
import { Home, Maximize2, Layers, Bath, Car, Wifi } from 'lucide-react';
import AutocompleteInput from '../ui/AutocompleteInput';
import { PROPERTY_TYPES, FLOOR_OPTIONS, LEVELS_OPTIONS, AMENITIES, QUARTIERS } from '../../lib/formData';
import { WILAYAS } from '../../data/wilayas';

interface Props {
  attrs:     Record<string, string>;
  onChange:  (key: string, val: string) => void;
  wilayaId:  string;
  language:  string;
  onReady:   (complete: boolean) => void;
}

const F = ({ label, required, children }: { label:string; required?:boolean; children:React.ReactNode }) => (
  <div>
    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">
      {label}{required && <span className="text-dz-red ml-0.5">*</span>}
    </label>
    {children}
  </div>
);

const Sel = ({ value, onChange, options, placeholder }: any) => (
  <select value={value||''} onChange={e=>onChange(e.target.value)}
    className="w-full bg-muted border border-border rounded-xl px-3 py-3 text-sm outline-none focus:border-dz-green cursor-pointer">
    <option value="">{placeholder}</option>
    {options.map((o:any) => <option key={o.value||o} value={o.value||o}>{o.label||o}</option>)}
  </select>
);

const isApartment = (t: string) => ['f1','f2','f3','f4','f5','f6plus','studio'].includes(t);
const isVilla     = (t: string) => ['villa','villa_jumelee','duplex','triplex','maison'].includes(t);
const hasSurface  = (t: string) => !['parking'].includes(t);

const ImmobilierForm: React.FC<Props> = ({ attrs, onChange, wilayaId, language, onReady }) => {
  const ptype    = attrs.property_type || '';
  const quartiers = wilayaId ? (QUARTIERS[wilayaId] || []) : [];

  useEffect(() => {
    const required = ['property_type','transaction','surface'];
    onReady(required.every(k => !!attrs[k]));
  }, [attrs]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Type de bien */}
        <F label="Type de bien" required>
          <Sel value={ptype} onChange={(v:string) => onChange('property_type', v)}
            options={PROPERTY_TYPES} placeholder="Choisir le type…"/>
        </F>

        {/* Transaction */}
        <F label="Transaction" required>
          <Sel value={attrs.transaction} onChange={(v:string) => onChange('transaction', v)}
            options={[
              {value:'sale',label:'Vente'},
              {value:'rent',label:'Location'},
              {value:'rent_sale',label:'Location-vente (LPP)'},
              {value:'exchange',label:'Échange'},
            ]} placeholder="Vente ou location ?"/>
        </F>

        {/* Surface */}
        {hasSurface(ptype) && (
          <F label="Surface habitable (m²)" required>
            <div className="relative">
              <Maximize2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/>
              <input type="number" min="10" max="100000" step="5"
                value={attrs.surface||''} onChange={e=>onChange('surface',e.target.value)}
                placeholder="Ex: 95"
                className="w-full bg-muted border border-border rounded-xl pl-9 pr-4 py-3 text-sm outline-none focus:border-dz-green"/>
            </div>
          </F>
        )}

        {/* Terrain pour terrain/ferme */}
        {['terrain_resid','terrain_agri','terrain_comm','ferme'].includes(ptype) && (
          <F label="Superficie totale (m²)">
            <input type="number" min="50" step="50"
              value={attrs.terrain_surface||''} onChange={e=>onChange('terrain_surface',e.target.value)}
              placeholder="Ex: 2000"
              className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-dz-green"/>
          </F>
        )}

        {/* Pièces */}
        {(isApartment(ptype) || isVilla(ptype)) && (
          <F label="Nombre de pièces">
            <Sel value={attrs.rooms} onChange={(v:string) => onChange('rooms', v)}
              options={['1 pièce','2 pièces','3 pièces','4 pièces','5 pièces','6 pièces','7+ pièces'].map((l,i)=>({value:String(i+1),label:l}))}
              placeholder="Nombre de pièces"/>
          </F>
        )}

        {/* Étage (appartements) */}
        {isApartment(ptype) && (
          <F label="Étage">
            <Sel value={attrs.floor} onChange={(v:string) => onChange('floor', v)}
              options={FLOOR_OPTIONS} placeholder="Quel étage ?"/>
          </F>
        )}

        {/* Niveaux (villas) */}
        {isVilla(ptype) && (
          <F label="Nombre de niveaux (R+…)">
            <Sel value={attrs.levels} onChange={(v:string) => onChange('levels', v)}
              options={LEVELS_OPTIONS} placeholder="R+0, R+1, R+2…"/>
          </F>
        )}

        {/* SDB */}
        {(isApartment(ptype) || isVilla(ptype)) && (
          <F label="Salles de bain">
            <Sel value={attrs.bathrooms} onChange={(v:string) => onChange('bathrooms', v)}
              options={['1','2','3','4+'].map(v=>({value:v,label:v+' SDB'}))}
              placeholder="Nombre de SDB"/>
          </F>
        )}

        {/* Age / État */}
        <F label="État général">
          <Sel value={attrs.state} onChange={(v:string) => onChange('state', v)}
            options={[
              {value:'new',        label:'Neuf / Jamais habité'},
              {value:'excellent',  label:'Excellent état'},
              {value:'good',       label:'Bon état'},
              {value:'renovated',  label:'Rénové récemment'},
              {value:'to_renovate',label:'À rénover'},
            ]} placeholder="État du bien"/>
        </F>

        {/* Quartier autocomplete */}
        {quartiers.length > 0 && (
          <AutocompleteInput
            label="Quartier / Commune"
            value={attrs.quartier || ''}
            onChange={v => onChange('quartier', v)}
            suggestions={quartiers}
            placeholder="Ex: Hydra, Ben Aknoun…"
          />
        )}
      </div>

      {/* Équipements */}
      <F label="Équipements & Commodités">
        <div className="flex flex-wrap gap-2">
          {AMENITIES.map(a => {
            const vals = (attrs.amenities || '').split(',').filter(Boolean);
            const on   = vals.includes(a.value);
            return (
              <button key={a.value} type="button"
                onClick={() => {
                  const next = on ? vals.filter(v=>v!==a.value) : [...vals, a.value];
                  onChange('amenities', next.join(','));
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  on ? 'bg-dz-green text-white border-dz-green' : 'bg-muted border-border text-muted-foreground hover:border-dz-green/40'
                }`}>
                {a.label}
              </button>
            );
          })}
        </div>
      </F>
    </div>
  );
};

export default ImmobilierForm;
