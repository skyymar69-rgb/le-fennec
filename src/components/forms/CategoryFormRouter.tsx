import React from 'react';
import ImmobilierForm from './ImmobilierForm';
import VehiculesForm  from './VehiculesForm';
import HighTechForm   from './HighTechForm';
import EmploiForm     from './EmploiForm';
import AnimauxForm    from './AnimauxForm';
import ServicesForm   from './ServicesForm';
import GenericForm    from './GenericForm';

interface Props {
  categoryId: string;
  attrs:      Record<string,string>;
  onChange:   (k:string,v:string)=>void;
  wilayaId?:  string;
  language:   string;
  onReady:    (c:boolean)=>void;
}

export default function CategoryFormRouter({ categoryId, attrs, onChange, wilayaId='', language, onReady }: Props) {
  const shared = { attrs, onChange, onReady };

  switch(categoryId) {
    case '1': return <ImmobilierForm {...shared} wilayaId={wilayaId} language={language}/>;
    case '2': return <VehiculesForm  {...shared}/>;
    case '3': return <HighTechForm   {...shared}/>;
    case '4': return <EmploiForm     {...shared}/>;
    case '10': return <AnimauxForm   {...shared}/>;
    case '9': return <ServicesForm   {...shared}/>;
    default:  return <GenericForm    {...shared} categoryId={categoryId}/>;
  }
}
