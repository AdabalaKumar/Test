export type Lang = 'en' | 'ar' | 'fr';
export const LANGS: { code: Lang; label: string; dir: 'ltr' | 'rtl' }[] = [
  { code: 'en', label: 'English', dir: 'ltr' },
  { code: 'ar', label: 'العربية', dir: 'rtl' },
  { code: 'fr', label: 'Français', dir: 'ltr' },
];

const en = {
  'nav.home': 'Home', 'nav.properties': 'Properties', 'nav.projects': 'Projects', 'nav.tours': '3D Tours', 'nav.communities': 'Communities',
  'nav.about': 'About', 'nav.contact': 'Contact', 'nav.login': 'Sign in', 'nav.account': 'My account', 'nav.admin': 'Admin', 'nav.enquire': 'Enquire',
  'cta.search': 'Search properties', 'cta.explore3d': 'Explore 3D experience', 'cta.viewAll': 'View all properties', 'cta.details': 'View residence',
  'cta.enquire': 'Enquire now', 'cta.schedule': 'Schedule a viewing', 'cta.whatsapp': 'WhatsApp us', 'cta.compare': 'Compare', 'cta.send': 'Send enquiry',
  'cta.discover': 'Discover', 'cta.tour': 'Take the 3D tour',
  'label.beds': 'Beds', 'label.baths': 'Baths', 'label.area': 'sq ft', 'label.from': 'From', 'label.price': 'Price', 'label.location': 'Location',
  'label.type': 'Type', 'label.status': 'Status', 'label.any': 'Any', 'label.sort': 'Sort', 'label.results': 'residences', 'label.saved': 'Saved',
  'status.available': 'Available', 'status.reserved': 'Reserved', 'status.sold': 'Sold',
  'type.apartment': 'Apartment', 'type.penthouse': 'Penthouse', 'type.villa': 'Villa', 'type.townhouse': 'Townhouse',
  'home.featured': 'Featured residences', 'home.featured.title': 'A private collection', 'home.projects': 'Our developments', 'home.projects.title': 'Four addresses. Each one singular.',
  'home.experience': 'The 3D experience', 'home.experience.title': 'Walk through it before it exists', 'home.masterplan': 'Master plan', 'home.masterplan.title': 'One city, four ways to live in it',
  'home.communities': 'Communities', 'home.communities.title': 'Where you will live', 'home.mortgage': 'Mortgage calculator', 'home.mortgage.title': 'Plan your purchase',
  'home.cta.title': 'Begin with a private viewing', 'home.cta.sub': 'Our residence advisors are available every day, in eleven languages.',
  'viewer.exterior': 'Exterior', 'viewer.interior': 'Interior', 'viewer.day': 'Day', 'viewer.night': 'Night', 'viewer.availability': 'Availability',
  'viewer.floor': 'Floor', 'viewer.allFloors': 'All floors', 'viewer.drag': 'Drag to rotate · Ctrl + scroll to zoom · Click a residence', 'viewer.tour': 'Guided tour',
  'footer.tagline': 'Architecture for a life less ordinary.', 'footer.rights': 'All rights reserved.',
  'form.name': 'Full name', 'form.email': 'Email', 'form.phone': 'Phone', 'form.message': 'Message', 'form.date': 'Preferred date & time', 'form.thanks': 'Thank you. An advisor will contact you within one business day.',
};
export type Key = keyof typeof en;

const ar: Partial<Record<Key, string>> = {
  'nav.home': 'الرئيسية', 'nav.properties': 'العقارات', 'nav.projects': 'المشاريع', 'nav.tours': 'جولات ثلاثية الأبعاد', 'nav.communities': 'المجتمعات',
  'nav.about': 'من نحن', 'nav.contact': 'اتصل بنا', 'nav.login': 'تسجيل الدخول', 'nav.account': 'حسابي', 'nav.admin': 'الإدارة', 'nav.enquire': 'استفسر',
  'cta.search': 'ابحث عن عقار', 'cta.explore3d': 'استكشف التجربة ثلاثية الأبعاد', 'cta.viewAll': 'عرض جميع العقارات', 'cta.details': 'عرض العقار',
  'cta.enquire': 'استفسر الآن', 'cta.schedule': 'احجز معاينة', 'cta.whatsapp': 'راسلنا على واتساب', 'cta.compare': 'قارن', 'cta.send': 'إرسال الاستفسار',
  'cta.discover': 'اكتشف', 'cta.tour': 'ابدأ الجولة ثلاثية الأبعاد',
  'label.beds': 'غرف نوم', 'label.baths': 'حمامات', 'label.area': 'قدم²', 'label.from': 'ابتداءً من', 'label.price': 'السعر', 'label.location': 'الموقع',
  'label.type': 'النوع', 'label.status': 'الحالة', 'label.any': 'الكل', 'label.sort': 'ترتيب', 'label.results': 'عقار', 'label.saved': 'المحفوظات',
  'status.available': 'متاح', 'status.reserved': 'محجوز', 'status.sold': 'مباع',
  'type.apartment': 'شقة', 'type.penthouse': 'بنتهاوس', 'type.villa': 'فيلا', 'type.townhouse': 'تاون هاوس',
  'home.featured': 'عقارات مميزة', 'home.featured.title': 'مجموعة خاصة', 'home.projects': 'مشاريعنا', 'home.projects.title': 'أربعة عناوين. كل منها فريد.',
  'home.experience': 'التجربة ثلاثية الأبعاد', 'home.experience.title': 'تجوّل فيه قبل أن يُبنى', 'home.masterplan': 'المخطط العام', 'home.masterplan.title': 'مدينة واحدة، وأربع طرق للعيش فيها',
  'home.communities': 'المجتمعات', 'home.communities.title': 'أين ستعيش', 'home.mortgage': 'حاسبة التمويل العقاري', 'home.mortgage.title': 'خطّط لشرائك',
  'home.cta.title': 'ابدأ بمعاينة خاصة', 'home.cta.sub': 'مستشارونا متاحون يوميًا بإحدى عشرة لغة.',
  'viewer.exterior': 'الخارج', 'viewer.interior': 'الداخل', 'viewer.day': 'نهار', 'viewer.night': 'ليل', 'viewer.availability': 'التوفر',
  'viewer.floor': 'الطابق', 'viewer.allFloors': 'كل الطوابق', 'viewer.drag': 'اسحب للتدوير · Ctrl + تمرير للتكبير · انقر على وحدة', 'viewer.tour': 'جولة إرشادية',
  'footer.tagline': 'عمارة لحياة غير اعتيادية.', 'footer.rights': 'جميع الحقوق محفوظة.',
  'form.name': 'الاسم الكامل', 'form.email': 'البريد الإلكتروني', 'form.phone': 'الهاتف', 'form.message': 'الرسالة', 'form.date': 'التاريخ والوقت المفضلان', 'form.thanks': 'شكرًا لك. سيتواصل معك أحد مستشارينا خلال يوم عمل واحد.',
};
const fr: Partial<Record<Key, string>> = {
  'nav.home': 'Accueil', 'nav.properties': 'Propriétés', 'nav.projects': 'Projets', 'nav.tours': 'Visites 3D', 'nav.communities': 'Quartiers',
  'nav.about': 'À propos', 'nav.contact': 'Contact', 'nav.login': 'Connexion', 'nav.account': 'Mon compte', 'nav.admin': 'Admin', 'nav.enquire': 'Nous écrire',
  'cta.search': 'Rechercher un bien', 'cta.explore3d': 'Découvrir l’expérience 3D', 'cta.viewAll': 'Voir toutes les propriétés', 'cta.details': 'Voir la résidence',
  'cta.enquire': 'Demander des informations', 'cta.schedule': 'Planifier une visite', 'cta.whatsapp': 'Écrire sur WhatsApp', 'cta.compare': 'Comparer', 'cta.send': 'Envoyer',
  'cta.discover': 'Découvrir', 'cta.tour': 'Lancer la visite 3D',
  'label.beds': 'Chambres', 'label.baths': 'Sdb', 'label.area': 'pi²', 'label.from': 'À partir de', 'label.price': 'Prix', 'label.location': 'Lieu',
  'label.type': 'Type', 'label.status': 'Statut', 'label.any': 'Tous', 'label.sort': 'Trier', 'label.results': 'résidences', 'label.saved': 'Favoris',
  'status.available': 'Disponible', 'status.reserved': 'Réservé', 'status.sold': 'Vendu',
  'type.apartment': 'Appartement', 'type.penthouse': 'Penthouse', 'type.villa': 'Villa', 'type.townhouse': 'Maison de ville',
  'home.featured': 'Résidences d’exception', 'home.featured.title': 'Une collection privée', 'home.projects': 'Nos réalisations', 'home.projects.title': 'Quatre adresses. Chacune singulière.',
  'home.experience': 'L’expérience 3D', 'home.experience.title': 'Parcourez-la avant qu’elle n’existe', 'home.masterplan': 'Plan directeur', 'home.masterplan.title': 'Une ville, quatre façons d’y vivre',
  'home.communities': 'Quartiers', 'home.communities.title': 'Là où vous vivrez', 'home.mortgage': 'Simulateur de prêt', 'home.mortgage.title': 'Préparez votre acquisition',
  'home.cta.title': 'Commencez par une visite privée', 'home.cta.sub': 'Nos conseillers sont disponibles chaque jour, en onze langues.',
  'viewer.exterior': 'Extérieur', 'viewer.interior': 'Intérieur', 'viewer.day': 'Jour', 'viewer.night': 'Nuit', 'viewer.availability': 'Disponibilité',
  'viewer.floor': 'Étage', 'viewer.allFloors': 'Tous les étages', 'viewer.drag': 'Glisser pour pivoter · Ctrl + molette pour zoomer · Cliquer sur un lot', 'viewer.tour': 'Visite guidée',
  'footer.tagline': 'Une architecture pour une vie hors du commun.', 'footer.rights': 'Tous droits réservés.',
  'form.name': 'Nom complet', 'form.email': 'E-mail', 'form.phone': 'Téléphone', 'form.message': 'Message', 'form.date': 'Date et heure souhaitées', 'form.thanks': 'Merci. Un conseiller vous contactera sous un jour ouvré.',
};
const DICT: Record<Lang, Partial<Record<Key, string>>> = { en, ar, fr };
export const translate = (lang: Lang, key: Key) => DICT[lang][key] ?? en[key];

export type Currency = 'AED' | 'USD' | 'EUR' | 'GBP';
/** Indicative rates against AED. Replace with a live feed before quoting prices contractually. */
export const RATES: Record<Currency, number> = { AED: 1, USD: 0.2723, EUR: 0.2506, GBP: 0.2144 };
export const CURRENCIES = Object.keys(RATES) as Currency[];

const SYMBOL: Record<Currency, string> = { AED: 'AED ', USD: '$', EUR: '€', GBP: '£' };
const trim = (n: number) => n.toFixed(1).replace(/\.0$/, '');

/** Formatted by hand rather than with Intl so server and browser output are identical (no hydration drift). */
export function formatMoney(aed: number, currency: Currency, _lang: Lang = 'en', compact = false) {
  const value = aed * RATES[currency];
  if (compact) {
    if (value >= 1e9) return `${SYMBOL[currency]}${trim(value / 1e9)}B`;
    if (value >= 1e6) return `${SYMBOL[currency]}${trim(value / 1e6)}M`;
    if (value >= 1e3) return `${SYMBOL[currency]}${Math.round(value / 1e3)}K`;
  }
  return `${SYMBOL[currency]}${Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}
export const formatNumber = (n: number) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
