import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const CONTENT: Record<string, { fr: string; en: string; ar: string; title: { fr: string; en: string; ar: string } }> = {
  terms: {
    title: { fr: "Conditions Générales d'Utilisation", en: 'Terms of Use', ar: 'شروط الاستخدام' },
    fr: `**Le Fennec** est une plateforme gratuite d'annonces classées en Algérie.\n\nEn utilisant ce service, vous acceptez de :\n- Publier uniquement des annonces légales\n- Respecter les autres utilisateurs\n- Ne pas publier de contenu trompeur\n\nNous nous réservons le droit de supprimer tout contenu non conforme.`,
    en: `**Le Fennec** is a free classifieds platform in Algeria.\n\nBy using this service, you agree to:\n- Post only legal listings\n- Respect other users\n- Not post misleading content\n\nWe reserve the right to remove non-compliant content.`,
    ar: `**الفنك** منصة إعلانات مبوبة مجانية في الجزائر.\n\nباستخدام هذه الخدمة، أنت توافق على:\n- نشر إعلانات قانونية فقط\n- احترام المستخدمين الآخرين\n- عدم نشر محتوى مضلل\n\ننحتفظ بالحق في إزالة أي محتوى غير ملائم.`,
  },
  privacy: {
    title: { fr: 'Politique de Confidentialité', en: 'Privacy Policy', ar: 'سياسة الخصوصية' },
    fr: `Nous collectons uniquement les données nécessaires au fonctionnement du service.\n\nVos données ne sont jamais vendues à des tiers.\n\nVous pouvez demander la suppression de votre compte à tout moment.`,
    en: `We only collect data necessary for the service to function.\n\nYour data is never sold to third parties.\n\nYou can request account deletion at any time.`,
    ar: `نجمع فقط البيانات الضرورية لتشغيل الخدمة.\n\nبياناتك لا تُباع لأطراف ثالثة أبدًا.\n\nيمكنك طلب حذف حسابك في أي وقت.`,
  },
};

const LegalPage: React.FC = () => {
  const { slug }    = useParams<{ slug: string }>();
  const { language } = useLanguage();
  const page        = CONTENT[slug || 'terms'] || CONTENT.terms;
  const title       = page.title[language as keyof typeof page.title] || page.title.fr;
  const content     = (page[language as keyof typeof page] as string) || page.fr;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-dz-green mb-6 transition-colors">
        <ChevronLeft size={16} /> Retour
      </Link>
      <h1 className="text-2xl font-black text-foreground mb-6">{title}</h1>
      <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground leading-relaxed space-y-4">
        {content.split('\n\n').map((para, i) => (
          <p key={i}>{para.replace(/\*\*(.*?)\*\*/g, '$1')}</p>
        ))}
      </div>
    </div>
  );
};

export default LegalPage;
