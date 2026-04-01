import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Scale, Shield, FileText, CreditCard, Building2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

// ─── Coordonnées KAYZEN LYON ────────────────────────────────
const KAYZEN = {
  name:    'KAYZEN LYON',
  siren:   '999 418 346 000 14',
  rcs:     'RCS Lyon : 999 418 346',
  tva:     'FR85 999418346',
  ape:     '4791B',
  address: '6, rue Pierre Termier, 69009 Lyon, France',
  phone:   '+33 (0)4 87 77 68 61',
  email:   'contact@kayzen-lyon.fr',
  web:     'https://www.kayzen-lyon.fr',
  agency:  'https://internet.kayzen-lyon.fr',
};
const SITE = 'Le Fennec DZ Market';
const SITE_URL = 'https://le-fennec-birs.vercel.app';
const DPO_EMAIL = 'privacy@kayzen-lyon.fr';
const DATE_VIGEUR = '1er avril 2025';

// ─── Legal pages content ────────────────────────────────────
const PAGES: Record<string, { title: string; icon: React.FC<any>; content: string }> = {

  mentions: {
    title: 'Mentions légales',
    icon: Building2,
    content: `
## 1. Éditeur du site

Le site **${SITE}** (ci-après « le Site ») est édité par :

**${KAYZEN.name}**
Siège social : ${KAYZEN.address}
SIREN : ${KAYZEN.siren}
${KAYZEN.rcs}
N° de TVA intracommunautaire : ${KAYZEN.tva}
Code APE : ${KAYZEN.ape}

Téléphone : ${KAYZEN.phone}
Email : ${KAYZEN.email}
Site web de l'éditeur : ${KAYZEN.web}
Agence web : ${KAYZEN.agency}

---

## 2. Directeur de la publication

Le directeur de la publication du Site est le représentant légal de ${KAYZEN.name}.

---

## 3. Hébergement

Le Site est hébergé par :

**Vercel Inc.**
340 Pine Street, Suite 800, San Francisco, CA 94104, USA
Site : https://vercel.com

---

## 4. Propriété intellectuelle

L'ensemble des éléments du Site (textes, images, logos, graphismes, code source, etc.) est protégé par le droit de la propriété intellectuelle applicable en France et en Algérie (ordonnance n° 03-05 du 19 juillet 2003 relative aux droits d'auteur et droits voisins, telle que modifiée). Toute reproduction, représentation, modification, publication ou adaptation, totale ou partielle, est interdite sans l'autorisation préalable écrite de ${KAYZEN.name}.

Le logotype « Le Fennec DZ Market » est la propriété exclusive de ${KAYZEN.name}. Toute utilisation non autorisée constitue une contrefaçon pouvant engager des poursuites judiciaires.

---

## 5. Responsabilité

${KAYZEN.name} s'efforce de maintenir l'exactitude des informations diffusées sur le Site. Toutefois, ${KAYZEN.name} ne saurait être tenu responsable des erreurs ou omissions et de l'indisponibilité du Site. Le Site se réserve le droit de modifier à tout moment son contenu.

${KAYZEN.name} ne peut être tenu responsable du contenu des annonces publiées par les utilisateurs. Chaque utilisateur est seul responsable des annonces qu'il dépose conformément aux présentes mentions légales et aux Conditions Générales d'Utilisation.

---

## 6. Loi applicable et juridiction

Les présentes mentions légales sont soumises au droit français. Pour les litiges impliquant des utilisateurs résidant en Algérie, les parties conviennent d'appliquer subsidiairement les dispositions de la loi algérienne n° 18-05 du 10 mai 2018 relative au commerce électronique.

En cas de litige, compétence est attribuée aux tribunaux compétents de Lyon (France), nonobstant pluralité de défendeurs.
`,
  },

  cgu: {
    title: "Conditions Générales d'Utilisation",
    icon: FileText,
    content: `
*Dernière mise à jour : ${DATE_VIGEUR}*

---

## Préambule

Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation du site **${SITE}** accessible à l'adresse ${SITE_URL}, exploité par **${KAYZEN.name}**, enregistrée au Registre du Commerce et des Sociétés de Lyon sous le numéro 999 418 346.

Le Site est un service de dépôt et consultation d'annonces classées, proposé **gratuitement** aux utilisateurs particuliers résidant en Algérie.

En accédant au Site, l'utilisateur accepte sans réserve les présentes CGU. Si l'utilisateur ne les accepte pas, il doit cesser d'utiliser le Site.

---

## Article 1 — Définitions

- **Site** : le service en ligne Le Fennec DZ Market accessible à l'adresse ${SITE_URL}
- **Éditeur** : ${KAYZEN.name}
- **Utilisateur** : toute personne physique accédant au Site
- **Annonceur** : utilisateur ayant déposé une annonce sur le Site
- **Annonce** : offre de vente, achat, location ou service publiée par un utilisateur
- **Compte** : espace personnel créé par l'utilisateur sur le Site

---

## Article 2 — Accès au service

### 2.1 Conditions d'accès

Le Site est accessible gratuitement à tout utilisateur disposant d'un accès à Internet. Certaines fonctionnalités (dépôt d'annonce, messagerie) nécessitent la création d'un compte.

L'utilisateur doit être âgé d'au moins **18 ans** ou avoir obtenu l'autorisation de son représentant légal pour utiliser le Site.

### 2.2 Création de compte

L'utilisateur s'engage à fournir des informations exactes et complètes lors de l'inscription. Il est responsable de la confidentialité de ses identifiants de connexion et de toutes les actions effectuées depuis son compte.

L'Éditeur se réserve le droit de suspendre ou supprimer tout compte en cas de violation des présentes CGU.

---

## Article 3 — Dépôt d'annonces

### 3.1 Gratuité

Le dépôt d'annonces est **entièrement gratuit** pour les particuliers. Des options de mise en avant payantes (boost, premium) pourront être proposées ultérieurement.

### 3.2 Obligations de l'annonceur

L'annonceur s'engage à :

- Ne publier que des annonces conformes à la législation algérienne (ordonnance n° 03-03 du 19 juillet 2003 relative à la concurrence, loi n° 04-02 du 23 juin 2004 fixant les règles applicables aux pratiques commerciales)
- Fournir des informations exactes sur les biens ou services proposés
- Être propriétaire ou disposer de l'autorisation de vendre le bien annoncé
- Ne pas publier plus d'annonces que ce que la bonne foi commerciale autorise

### 3.3 Contenu interdit

Sont strictement prohibées les annonces relatives à :

- Armes, munitions et explosifs (loi algérienne n° 91-07 du 4 mai 1991)
- Stupéfiants et substances psychotropes (ordonnance n° 76-48 du 4 juin 1976)
- Biens protégés par la loi (espèces protégées, patrimoine culturel, etc.)
- Contrefaçons de marques et produits piratés
- Contenu à caractère pornographique, pédophile ou incitant à la haine
- Services illégaux ou contrevenant à l'ordre public et aux bonnes mœurs

### 3.4 Modération

L'Éditeur se réserve le droit, sans obligation ni préavis, de supprimer toute annonce contrevenant aux présentes CGU ou aux lois en vigueur.

---

## Article 4 — Propriété intellectuelle des annonces

En déposant une annonce, l'utilisateur accorde à l'Éditeur une licence non exclusive, mondiale, à titre gratuit, pour reproduire, afficher et diffuser le contenu de l'annonce sur le Site et ses canaux de promotion.

L'utilisateur garantit qu'il dispose de tous les droits nécessaires sur le contenu publié (photos, textes, etc.).

---

## Article 5 — Responsabilité

### 5.1 Responsabilité de l'Éditeur

L'Éditeur ne saurait être tenu responsable :

- Du contenu des annonces publiées par les utilisateurs
- Des transactions effectuées entre les utilisateurs
- De la qualité ou de la conformité des biens et services annoncés
- De l'interruption temporaire du service pour des raisons techniques

### 5.2 Responsabilité de l'utilisateur

L'utilisateur est seul responsable de l'utilisation qu'il fait du Site et des informations qu'il y publie. Il s'engage à indemniser l'Éditeur de tout préjudice résultant d'une violation des présentes CGU.

---

## Article 6 — Protection des données personnelles

Le traitement des données personnelles est régi par la Politique de Confidentialité disponible sur le Site, conforme aux dispositions de la loi algérienne n° 18-07 du 10 juin 2018 relative à la protection des personnes physiques dans le traitement des données à caractère personnel.

---

## Article 7 — Cookies

Le Site utilise des cookies techniques nécessaires à son fonctionnement. L'utilisateur peut configurer son navigateur pour désactiver les cookies, ce qui pourrait altérer le fonctionnement de certaines fonctionnalités.

---

## Article 8 — Modification des CGU

L'Éditeur se réserve le droit de modifier les présentes CGU à tout moment. Les modifications sont opposables dès leur publication sur le Site. L'utilisateur est invité à consulter régulièrement les CGU.

---

## Article 9 — Loi applicable et règlement des litiges

### 9.1 Loi applicable

Les présentes CGU sont régies par le droit français et, pour les utilisateurs domiciliés en Algérie, subsidiairement par :

- La loi algérienne n° 18-05 du 10 mai 2018 relative au commerce électronique
- La loi algérienne n° 09-03 du 25 février 2009 relative à la protection du consommateur et à la répression des fraudes

### 9.2 Règlement des litiges

Tout litige relatif à l'interprétation ou à l'exécution des présentes CGU sera soumis aux juridictions compétentes de Lyon (France). Pour les utilisateurs algériens, un règlement à l'amiable sera privilégié avant toute action judiciaire.

---

## Article 10 — Contact

Pour toute question relative aux présentes CGU :

**${KAYZEN.name}**
${KAYZEN.address}
Email : ${KAYZEN.email}
Tél. : ${KAYZEN.phone}
`,
  },

  cgv: {
    title: 'Conditions Générales de Vente',
    icon: CreditCard,
    content: `
*Dernière mise à jour : ${DATE_VIGEUR}*

---

## Préambule

Les présentes Conditions Générales de Vente (CGV) régissent les relations contractuelles entre **${KAYZEN.name}** et les utilisateurs souhaitant bénéficier de services payants proposés sur **${SITE}** (options de mise en avant, services premium).

**Le dépôt d'annonces standard est entièrement gratuit et n'est pas soumis aux présentes CGV.**

---

## Article 1 — Services payants

### 1.1 Description

Le Site peut proposer des services optionnels payants, notamment :

- **Boost d'annonce** : augmentation de la visibilité d'une annonce pendant une durée déterminée
- **Annonce Premium** : mise en avant en tête de liste avec badge spécial
- **Pack Visibilité** : combinaison de services de promotion

### 1.2 Tarification

Les tarifs des services payants sont exprimés en Dinars Algériens (DZD) et en euros (EUR) toutes taxes comprises. Ils sont affichés au moment de la commande.

L'Éditeur se réserve le droit de modifier ses tarifs à tout moment, les modifications n'affectant pas les commandes en cours.

---

## Article 2 — Processus de commande

1. L'utilisateur sélectionne le service souhaité
2. Il consulte le récapitulatif de commande incluant le prix TTC
3. Il procède au paiement
4. Il reçoit une confirmation de commande par email

Toute commande vaut acceptation des présentes CGV.

---

## Article 3 — Paiement

### 3.1 Moyens de paiement

Les paiements sont sécurisés et peuvent être effectués par :
- Carte bancaire (Visa, Mastercard, CIB)
- Virement bancaire
- Paiement mobile (selon disponibilité)

### 3.2 Sécurité

Les données bancaires ne sont pas conservées par l'Éditeur. Les transactions sont sécurisées par chiffrement SSL/TLS.

---

## Article 4 — Droit de rétractation

Conformément à l'article L. 221-18 du Code de la consommation français et à la loi algérienne n° 09-03 du 25 février 2009, l'utilisateur particulier dispose d'un délai de **14 jours calendaires** à compter de la souscription pour exercer son droit de rétractation, sauf pour les services dont l'exécution a commencé avec l'accord exprès de l'utilisateur.

Pour exercer ce droit, contacter : ${KAYZEN.email}

---

## Article 5 — Responsabilité

L'Éditeur s'engage à délivrer les services commandés conformément aux caractéristiques annoncées. En cas de non-conformité, l'utilisateur dispose des voies de recours légales, notamment le remboursement ou le remplacement du service.

L'Éditeur ne garantit pas de résultats spécifiques en termes de nombre de contacts ou de ventes suite aux services de mise en avant.

---

## Article 6 — Données personnelles et facturation

Les données collectées lors d'une commande sont nécessaires à son traitement. Elles peuvent être transmises à des prestataires de paiement dans le strict cadre du traitement de la transaction.

---

## Article 7 — Litiges et médiation

En cas de litige, l'utilisateur peut recourir à la médiation de la consommation. En France : [www.economie.gouv.fr/mediation-conso](https://www.economie.gouv.fr/mediation-conso). En Algérie : direction de la protection du consommateur compétente.

---

## Article 8 — Contact et service après-vente

**${KAYZEN.name}**
${KAYZEN.address}
Email : ${KAYZEN.email}
Tél. : ${KAYZEN.phone}
Horaires : du lundi au vendredi, 9h00-18h00 (heure de Paris)
`,
  },

  confidentialite: {
    title: 'Politique de Confidentialité',
    icon: Shield,
    content: `
*Dernière mise à jour : ${DATE_VIGEUR}*

---

## 1. Introduction et engagement

**${KAYZEN.name}** (ci-après « nous » ou « l'Éditeur ») s'engage à protéger la vie privée des utilisateurs du site **${SITE}**. La présente Politique de Confidentialité est conforme aux obligations découlant de :

- La loi algérienne **n° 18-07 du 10 juin 2018** relative à la protection des personnes physiques dans le traitement des données à caractère personnel et au mouvement transfrontalier de ces données
- Le **Règlement Général sur la Protection des Données (RGPD)** — Règlement UE 2016/679 du 27 avril 2016
- La loi algérienne **n° 18-05 du 10 mai 2018** relative au commerce électronique

---

## 2. Responsable du traitement

**${KAYZEN.name}**
${KAYZEN.address}
SIREN : ${KAYZEN.siren}
Email DPO : ${DPO_EMAIL}
Tél. : ${KAYZEN.phone}

---

## 3. Données collectées

### 3.1 Données d'identification et de contact
- Nom, prénom
- Adresse email
- Numéro de téléphone
- Wilaya de résidence

### 3.2 Données de navigation
- Adresse IP (anonymisée après 90 jours)
- Données de connexion et logs d'accès
- Préférences de navigation (langue, thème)

### 3.3 Données liées aux annonces
- Contenu des annonces publiées (titre, description, photos, prix, localisation)
- Historique des annonces et messages échangés

### 3.4 Données de paiement (services payants uniquement)
- Informations de facturation (sans conservation des données bancaires complètes)

---

## 4. Finalités et bases légales

| Finalité | Base légale | Durée de conservation |
|----------|-------------|----------------------|
| Gestion du compte utilisateur | Exécution du contrat | Durée du compte + 3 ans |
| Publication et gestion des annonces | Exécution du contrat | 5 ans après la clôture |
| Communication et support | Intérêt légitime | 3 ans |
| Sécurité et prévention de la fraude | Obligation légale | 1 an |
| Amélioration du service (analytics) | Consentement | 13 mois maximum |
| Obligations comptables | Obligation légale | 10 ans (pièces comptables) |

---

## 5. Partage des données

Nous ne vendons jamais vos données personnelles. Nous pouvons partager vos données avec :

### 5.1 Prestataires techniques
- **Vercel Inc.** (hébergement) — USA — Clauses contractuelles types CE
- **Anthropic PBC** (intelligence artificielle) — USA — Clauses contractuelles types CE
- **Unsplash** (images) — Canada — Accord de traitement conforme RGPD

### 5.2 Obligations légales
En cas de réquisition judiciaire ou d'obligation légale en vertu du droit algérien ou français applicable.

---

## 6. Vos droits

En vertu de la loi algérienne n° 18-07 et du RGPD, vous disposez des droits suivants :

- **Droit d'accès** : obtenir une copie de vos données (art. 18 loi 18-07)
- **Droit de rectification** : corriger des données inexactes (art. 19 loi 18-07)
- **Droit à l'effacement** : demander la suppression de vos données (art. 20 loi 18-07)
- **Droit à la portabilité** : recevoir vos données dans un format structuré
- **Droit d'opposition** : vous opposer au traitement pour motifs légitimes
- **Droit de retirer le consentement** : à tout moment, sans effet rétroactif

**Pour exercer vos droits :** ${DPO_EMAIL}

Délai de réponse : 30 jours maximum (prorogeable à 90 jours en cas de complexité).

**Autorité de contrôle algérienne :** Autorité Nationale de Protection des Données Personnelles (ANDPD) — Ministère de la Numérisation et des Statistiques, Alger.

**Autorité de contrôle française :** Commission Nationale de l'Informatique et des Libertés (CNIL) — 3 Place de Fontenoy, 75007 Paris — [www.cnil.fr](https://www.cnil.fr)

---

## 7. Sécurité

Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données :

- Chiffrement des données en transit (TLS 1.3) et au repos (AES-256)
- Authentification à deux facteurs pour les accès administrateurs
- Audits de sécurité réguliers
- Formation des équipes à la protection des données

---

## 8. Cookies

### 8.1 Cookies techniques (obligatoires)
- Gestion de la session utilisateur
- Préférences de langue et de thème
- Panier et annonces en cours de rédaction

Ces cookies ne nécessitent pas de consentement (art. 5-2 de la directive ePrivacy).

### 8.2 Cookies analytiques (consentement requis)
Pour mesurer l'audience du Site et améliorer nos services.

### 8.3 Gestion des cookies
Vous pouvez gérer vos préférences de cookies via les paramètres de votre navigateur. La suppression des cookies techniques peut altérer le fonctionnement du Site.

---

## 9. Transferts hors Algérie

Conformément à l'article 35 de la loi n° 18-07, tout transfert de données vers un pays tiers est encadré par des garanties appropriées (clauses contractuelles types, décision d'adéquation). Les États-Unis et la France disposent de mécanismes approuvés pour ces transferts.

---

## 10. Modification de la politique

Nous nous réservons le droit de modifier la présente Politique. Toute modification substantielle sera notifiée par email aux utilisateurs disposant d'un compte. La date de dernière mise à jour figure en haut du document.

---

## 11. Contact DPO

**Délégué à la Protection des Données (DPO)**
${KAYZEN.name}
Email : ${DPO_EMAIL}
Courrier : ${KAYZEN.address}
`,
  },
};

// ─── Render ──────────────────────────────────────────────────

function renderMarkdown(content: string): React.ReactNode {
  const lines = content.trim().split('\n');
  const elements: React.ReactNode[] = [];
  let key = 0;

  for (const line of lines) {
    const k = key++;
    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={k} className="text-xl font-black text-foreground mt-10 mb-4 flex items-center gap-2">
          <span className="w-1 h-6 rounded-full bg-dz-green inline-block" />
          {line.replace('## ', '')}
        </h2>
      );
    } else if (line.startsWith('### ')) {
      elements.push(<h3 key={k} className="text-base font-bold text-foreground mt-6 mb-2">{line.replace('### ', '')}</h3>);
    } else if (line.startsWith('**') && line.endsWith('**')) {
      elements.push(<p key={k} className="font-bold text-foreground my-2">{line.replace(/\*\*/g, '')}</p>);
    } else if (line.startsWith('- ')) {
      elements.push(
        <li key={k} className="text-sm text-muted-foreground leading-relaxed ml-4 list-disc"
          dangerouslySetInnerHTML={{ __html: line.slice(2).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
        />
      );
    } else if (line.startsWith('| ') && line.includes('|')) {
      const cells = line.split('|').filter(c => c.trim() !== '');
      if (line.includes('---')) {
        // skip separator
      } else if (cells[0].trim().startsWith('Finalité') || cells[0].trim().startsWith('-')) {
        elements.push(
          <tr key={k} className="border-b border-border">
            {cells.map((c, i) => <td key={i} className={`px-3 py-2 text-sm ${i === 0 ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>{c.trim()}</td>)}
          </tr>
        );
      } else {
        elements.push(
          <table key={k} className="w-full border-collapse border border-border rounded-lg overflow-hidden my-4 text-sm">
            <thead className="bg-muted">
              <tr>{cells.map((c, i) => <th key={i} className="px-3 py-2 text-left font-bold text-foreground border-b border-border">{c.trim()}</th>)}</tr>
            </thead>
            <tbody id={`tb-${k}`}></tbody>
          </table>
        );
      }
    } else if (line.startsWith('---')) {
      elements.push(<hr key={k} className="border-border my-6" />);
    } else if (line.startsWith('*') && line.endsWith('*')) {
      elements.push(<p key={k} className="text-xs text-muted-foreground italic mb-4">{line.replace(/\*/g, '')}</p>);
    } else if (line.startsWith('1. ') || /^\d+\. /.test(line)) {
      elements.push(
        <li key={k} className="text-sm text-muted-foreground leading-relaxed ml-4 list-decimal"
          dangerouslySetInnerHTML={{ __html: line.replace(/^\d+\. /, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
        />
      );
    } else if (line.trim() !== '') {
      elements.push(
        <p key={k} className="text-sm text-muted-foreground leading-relaxed mb-3"
          dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>').replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-dz-green hover:underline" target="_blank" rel="noopener">$1</a>') }}
        />
      );
    }
  }
  return elements;
}

const LegalPage: React.FC = () => {
  const { slug }     = useParams<{ slug: string }>();
  const { language } = useLanguage();
  const page         = PAGES[slug || 'mentions'] || PAGES.mentions;
  const Icon         = page.icon;

  const navItems = [
    { slug:'mentions',        label:'Mentions légales' },
    { slug:'cgu',             label:'CGU' },
    { slug:'cgv',             label:'CGV' },
    { slug:'confidentialite', label:'Confidentialité' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-dz-green mb-6 transition-colors">
          <ChevronLeft size={16} /> Retour à l'accueil
        </Link>

        {/* Nav tabs */}
        <div className="flex flex-wrap gap-2 mb-8 p-1.5 bg-muted rounded-2xl w-fit">
          {navItems.map(item => (
            <Link key={item.slug} to={`/legal/${item.slug}`}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                slug === item.slug
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}>
              {item.label}
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="hidden lg:block">
            <div className="bg-card border border-border rounded-2xl p-5 sticky top-24">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
                <div className="w-10 h-10 rounded-xl bg-dz-green/10 flex items-center justify-center">
                  <Icon size={20} className="text-dz-green" />
                </div>
                <div>
                  <p className="font-black text-sm text-foreground">{page.title}</p>
                  <p className="text-xs text-muted-foreground">Le Fennec DZ</p>
                </div>
              </div>
              <div className="space-y-1">
                {navItems.map(item => (
                  <Link key={item.slug} to={`/legal/${item.slug}`}
                    className={`block px-3 py-2 rounded-xl text-sm transition-colors ${
                      slug === item.slug
                        ? 'bg-dz-green/10 text-dz-green font-semibold'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}>
                    {item.label}
                  </Link>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-border">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">Contact légal</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {KAYZEN.name}<br />
                  {KAYZEN.email}<br />
                  {KAYZEN.phone}
                </p>
              </div>
            </div>
          </aside>

          {/* Content */}
          <main className="lg:col-span-3">
            <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-card">
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border">
                <div className="w-12 h-12 rounded-2xl bg-dz-green/10 flex items-center justify-center">
                  <Icon size={24} className="text-dz-green" />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-foreground">{page.title}</h1>
                  <p className="text-sm text-muted-foreground mt-0.5">Le Fennec DZ Market — {KAYZEN.name}</p>
                </div>
              </div>
              <div className="prose-sm max-w-none">
                {renderMarkdown(page.content)}
              </div>
            </div>

            {/* Company info box */}
            <div className="mt-6 bg-dz-green/5 border border-dz-green/20 rounded-2xl p-5">
              <p className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                <Scale size={15} className="text-dz-green" /> Informations légales de l'éditeur
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
                {[
                  ['Société', KAYZEN.name],
                  ['SIREN', KAYZEN.siren],
                  ['RCS', KAYZEN.rcs],
                  ['TVA', KAYZEN.tva],
                  ['APE', KAYZEN.ape],
                  ['Adresse', KAYZEN.address],
                  ['Email', KAYZEN.email],
                  ['Tél.', KAYZEN.phone],
                ].map(([k, v]) => (
                  <div key={k} className="flex gap-2">
                    <span className="font-semibold text-foreground shrink-0">{k} :</span>
                    <span>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default LegalPage;
