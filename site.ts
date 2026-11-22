export type Service = {
  title: string;
  slug: string;
  eyebrow: string;
  description: string;
  image: string;
  accent: string;
};

export const company = {
  name: 'GLANVIA Gebäudereinigung',
  owner: 'Hamoud Alahmad',
  address: 'Hirschbergstraße 40, 71634 Ludwigsburg, Deutschland',
  phone: '+49 163 7845182',
  phoneHref: 'tel:+491637845182',
  email: 'info@glanvia.de',
  emailHref: 'mailto:info@glanvia.de',
  website: 'https://glanvia.de',
  vatId: 'DE466493667',
  whatsapp: 'https://wa.me/491637845182',
};

export const socialLinks = [
  { label: 'Facebook', href: 'https://www.facebook.com/share/1YXQVdGPKM/' },
  { label: 'Instagram', href: 'https://www.instagram.com/glanvia.de?jplx=ZTdueG1zMXpxM3Vq' },
  { label: 'TikTok', href: 'https://www.tiktok.com/@glanvia.de?_r=1&_t=ZG-9BcHK7ZoEF7' },
];

const image = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=2000&q=90`;

export const services: Service[] = [
  {
    title: 'Büroreinigung',
    slug: 'bueroreinigung',
    eyebrow: 'Gewerbe',
    description: 'Strukturierte Sauberkeit für konzentriertes Arbeiten und einen professionellen ersten Eindruck.',
    image: image('photo-1497366811353-6870744d04b2'),
    accent: 'bg-blue-50 text-blue-700',
  },
  {
    title: 'Glasreinigung',
    slug: 'glasreinigung',
    eyebrow: 'Fassade & Fenster',
    description: 'Streifenfreie Glasflächen und klare Aussichten – sorgfältig bis ins Detail.',
    image: image('photo-1600210492486-724fe5c67fb0'),
    accent: 'bg-cyan-50 text-cyan-700',
  },
  {
    title: 'Treppenhausreinigung',
    slug: 'treppenhausreinigung',
    eyebrow: 'Immobilien',
    description: 'Gepflegte Eingangsbereiche und Treppenhäuser, die den Wert Ihrer Immobilie unterstreichen.',
    image: image('photo-1600585154340-be6161a56a0c'),
    accent: 'bg-slate-100 text-slate-700',
  },
  {
    title: 'Grundreinigung',
    slug: 'grundreinigung',
    eyebrow: 'Intensiv',
    description: 'Wenn es mehr sein darf: intensive Reinigung für Räume, die eine echte Auffrischung brauchen.',
    image: image('photo-1600607687939-ce8a6c25118c'),
    accent: 'bg-amber-50 text-amber-700',
  },
  {
    title: 'Baureinigung',
    slug: 'baureinigung',
    eyebrow: 'Bau & Übergabe',
    description: 'Saubere Übergaben nach Renovierung und Bau – gründlich, termintreu und zuverlässig.',
    image: image('photo-1600566753376-12c8ab7fb75b'),
    accent: 'bg-orange-50 text-orange-700',
  },
  {
    title: 'Schulreinigung',
    slug: 'schulreinigung',
    eyebrow: 'Bildung',
    description: 'Hygienische und einladende Lernumgebungen für Schulen, Kitas und Bildungsräume.',
    image: image('photo-1580582932707-520aed937b7b'),
    accent: 'bg-emerald-50 text-emerald-700',
  },
  {
    title: 'Gebäudereinigung',
    slug: 'gebaeudereinigung',
    eyebrow: 'Komplettservice',
    description: 'Ganzheitliche Reinigungskonzepte für gepflegte Gebäude und planbare Abläufe.',
    image: image('photo-1497366216548-37526070297c'),
    accent: 'bg-blue-50 text-blue-700',
  },
  {
    title: 'Privathaushalte',
    slug: 'privathaushalte',
    eyebrow: 'Zuhause',
    description: 'Mehr Zeit für das Wesentliche: zuverlässige Reinigung für Ihr Zuhause.',
    image: image('photo-1600210492486-724fe5c67fb0'),
    accent: 'bg-rose-50 text-rose-700',
  },
];

export const navItems = [
  { label: 'Startseite', path: '/' },
  { label: 'Leistungen', path: '/leistungen' },
  { label: 'Privatkunden', path: '/privatkunden' },
  { label: 'Gewerbekunden', path: '/gewerbekunden' },
  { label: 'Über uns', path: '/ueber-uns' },
  { label: 'Kontakt', path: '/kontakt' },
];

export const qualityPoints = [
  'Persönliche Betreuung durch den Inhaber',
  'Direkte Qualitätskontrolle',
  'Faire Preise durch effiziente Unternehmensstruktur',
];
