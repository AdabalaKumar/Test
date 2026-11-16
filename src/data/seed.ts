import type { Community, PaymentStep, Project, Property, SiteContent } from '@/lib/types';

const img = (project: string, ...shots: string[]) => shots.map((s) => (s.startsWith('interior') ? `/images/${s}.jpg` : `/images/${project}-${s}.jpg`));

const offPlan: PaymentStep[] = [
  { label: 'Reservation', percent: 10, note: 'On signing the reservation agreement' },
  { label: 'During construction', percent: 50, note: 'Linked to verified construction milestones' },
  { label: 'On handover', percent: 40, note: 'On completion and key handover' },
];
const postHandover: PaymentStep[] = [
  { label: 'Down payment', percent: 20, note: 'On signing the sale & purchase agreement' },
  { label: 'On handover', percent: 30, note: 'Keys released immediately' },
  { label: 'Post-handover', percent: 50, note: 'Over 36 months, interest free' },
];
const ready: PaymentStep[] = [
  { label: 'Deposit', percent: 10, note: 'Held in escrow on signing the MOU' },
  { label: 'On transfer', percent: 90, note: 'Cash or mortgage at the Land Department' },
];

export const projects: Omit<Project, 'id'>[] = [
  {
    slug: 'aurelia-tower', name: 'The Aurelia Tower', tagline: 'A vertical estate above Downtown',
    description: 'Twenty-two storeys of hand-finished residences wrapped in bronze-tinted glass. Every home is a corner home, every terrace faces the skyline, and a private members’ floor crowns the building.',
    location: 'Downtown Dubai', community: 'downtown', status: 'Under Construction', completion: 'Q4 2027', startingPrice: 4250000,
    model: { kind: 'tower', variant: 'slab', floors: 22, accent: '#c9a96e' },
    images: img('aurelia-tower', 'dusk', 'day', 'aerial', 'close'),
    highlights: ['88 corner residences', 'Private members’ sky lounge', '25 m rooftop infinity pool', 'Valet & 24-hour concierge'],
    lat: 25.1972, lng: 55.2744, plot: { x: -5.5, z: -2 },
  },
  {
    slug: 'marina-helix', name: 'Marina Helix', tagline: 'Sculpted by the sea breeze',
    description: 'A twenty-six storey tower that turns a full quarter-rotation from podium to crown, giving each residence its own framing of the marina, the open sea and the city beyond.',
    location: 'Dubai Marina', community: 'marina', status: 'Launching', completion: 'Q2 2029', startingPrice: 2150000,
    model: { kind: 'tower', variant: 'twist', floors: 26, accent: '#d9c08e' },
    images: img('marina-helix', 'dusk', 'day', 'aerial', 'close'),
    highlights: ['104 sea-view residences', 'Private yacht berths', 'Spa by the water', 'Residents’ dining room'],
    lat: 25.0805, lng: 55.1403, plot: { x: 5.5, z: -3 },
  },
  {
    slug: 'palm-crest', name: 'Palm Crest Villas', tagline: 'Twelve beachfront villas. No more.',
    description: 'A private enclave of twelve signature villas on the western crescent. Travertine, smoked oak and floor-to-ceiling glass open directly on to a private stretch of beach.',
    location: 'Palm Jumeirah', community: 'palm', status: 'Ready', completion: 'Completed 2025', startingPrice: 38500000,
    model: { kind: 'villa', accent: '#c9a96e' },
    images: img('palm-crest', 'dusk', 'day', 'aerial', 'close'),
    highlights: ['12 beachfront villas', '30 m private beach each', 'Basement gallery garage', 'Fully furnished by request'],
    lat: 25.1124, lng: 55.139, plot: { x: 4.5, z: 4.5 },
  },
  {
    slug: 'sahara-terraces', name: 'Sahara Terraces', tagline: 'Garden living, stepped toward the sun',
    description: 'A low, terraced building of garden apartments and sky townhouses stepping back from the fairway. Every level gains a planted terrace; every home gains the morning light.',
    location: 'Dubai Hills', community: 'hills', status: 'Ready', completion: 'Completed 2026', startingPrice: 3650000,
    model: { kind: 'tower', variant: 'stepped', floors: 14, accent: '#b89a66' },
    images: img('sahara-terraces', 'day', 'dusk', 'aerial', 'close'),
    highlights: ['56 terrace residences', 'Fairway frontage', 'Lap pool & hammam', 'Children’s atelier'],
    lat: 25.1031, lng: 55.2468, plot: { x: -4.5, z: 4.5 },
  },
];

const towerAmenities = ['24-hour concierge', 'Valet parking', 'Rooftop infinity pool', 'Private cinema', 'Wellness spa & hammam', 'Technogym studio', 'Residents’ lounge', 'Smart-home automation', 'EV charging', 'Wine cellar'];
const villaAmenities = ['Private beach access', 'Infinity pool', 'Home cinema', 'Smart-home automation', 'Chef’s & show kitchens', 'Private lift', 'Gallery garage for 6', 'Staff quarters', 'Landscaped gardens', 'Gym & steam room'];

type Seed = Omit<Property, 'id'>;
export const properties: Seed[] = [
  {
    slug: 'sky-penthouse-aurelia', title: 'The Sky Penthouse', tagline: 'The entire 22nd floor, 96 metres above Downtown',
    description: 'A full-floor penthouse with a 360° wraparound terrace, a private plunge pool and a double-height salon facing the Burj. Finished in Calacatta Oro marble and hand-brushed bronze, with a dedicated lift lobby and a private butler’s entrance.',
    type: 'penthouse', status: 'available', price: 28500000, location: 'Downtown Dubai', community: 'downtown', projectSlug: 'aurelia-tower',
    bedrooms: 4, bathrooms: 5, area: 6240, featured: true, layout: 'three',
    images: img('aurelia-tower', 'dusk', 'interior-three-a', 'day', 'interior-three-b', 'aerial', 'close'),
    floorPlans: [{ name: 'Penthouse level', layout: 'three', area: 6240 }],
    amenities: ['Private plunge pool', 'Private lift lobby', ...towerAmenities],
    specs: { Floor: '22 (full floor)', View: 'Burj & fountain', Terrace: '1,860 sq ft', Parking: '4 bays', Ceilings: '3.6 m – 6.8 m', Furnishing: 'Bespoke, optional', Tenure: 'Freehold', Handover: 'Q4 2027' },
    paymentPlan: offPlan, lat: 25.1972, lng: 55.2744,
  },
  {
    slug: 'aurelia-residence-2br', title: 'Aurelia Residence — Two Bedroom', tagline: 'A corner home with a skyline terrace',
    description: 'A generous two-bedroom corner residence with a 9-metre living room, a fully integrated Gaggenau kitchen and a terrace deep enough to dine on. Both bedrooms are en-suite.',
    type: 'apartment', status: 'available', price: 4250000, location: 'Downtown Dubai', community: 'downtown', projectSlug: 'aurelia-tower',
    bedrooms: 2, bathrooms: 3, area: 1580, featured: false, layout: 'two',
    images: img('aurelia-tower', 'day', 'interior-two-a', 'dusk', 'interior-two-b', 'close'),
    floorPlans: [{ name: 'Type B — Corner', layout: 'two', area: 1580 }],
    amenities: towerAmenities,
    specs: { Floor: '6 – 18', View: 'Boulevard & skyline', Terrace: '210 sq ft', Parking: '2 bays', Ceilings: '3.2 m', Furnishing: 'Unfurnished', Tenure: 'Freehold', Handover: 'Q4 2027' },
    paymentPlan: offPlan, lat: 25.1972, lng: 55.2744,
  },
  {
    slug: 'aurelia-residence-3br', title: 'Aurelia Residence — Three Bedroom', tagline: 'Family scale, with a view of the fountain',
    description: 'Three en-suite bedrooms, a separate family room and a formal dining space, arranged around a terrace that runs the full width of the home.',
    type: 'apartment', status: 'reserved', price: 6900000, location: 'Downtown Dubai', community: 'downtown', projectSlug: 'aurelia-tower',
    bedrooms: 3, bathrooms: 4, area: 2340, featured: false, layout: 'three',
    images: img('aurelia-tower', 'close', 'interior-three-b', 'dusk', 'interior-three-a', 'day'),
    floorPlans: [{ name: 'Type C — Fountain', layout: 'three', area: 2340 }],
    amenities: towerAmenities,
    specs: { Floor: '10 – 20', View: 'Fountain & Burj', Terrace: '340 sq ft', Parking: '2 bays', Ceilings: '3.2 m', Furnishing: 'Unfurnished', Tenure: 'Freehold', Handover: 'Q4 2027' },
    paymentPlan: offPlan, lat: 25.1972, lng: 55.2744,
  },
  {
    slug: 'helix-sky-villa', title: 'Helix Sky Villa', tagline: 'A duplex villa at the crown of the marina',
    description: 'Two levels, five bedrooms and a private rooftop pool at the top of Marina Helix. The rotation of the tower gives the upper terrace an uninterrupted horizon from Bluewaters to the Palm.',
    type: 'penthouse', status: 'available', price: 41000000, location: 'Dubai Marina', community: 'marina', projectSlug: 'marina-helix',
    bedrooms: 5, bathrooms: 6, area: 8100, featured: true, layout: 'three',
    images: img('marina-helix', 'dusk', 'interior-three-a', 'aerial', 'interior-three-b', 'day', 'close'),
    floorPlans: [{ name: 'Lower level', layout: 'three', area: 4300 }, { name: 'Upper level', layout: 'two', area: 3800 }],
    amenities: ['Private rooftop pool', 'Yacht berth (25 m)', ...towerAmenities],
    specs: { Floor: '25 – 26 (duplex)', View: 'Open sea & marina', Terrace: '2,400 sq ft', Parking: '4 bays', Ceilings: '3.4 m – 7 m', Furnishing: 'Bespoke, optional', Tenure: 'Freehold', Handover: 'Q2 2029' },
    paymentPlan: postHandover, lat: 25.0805, lng: 55.1403,
  },
  {
    slug: 'helix-marina-suite', title: 'Helix Marina Suite', tagline: 'A one-bedroom pied-à-terre on the water',
    description: 'A beautifully proportioned one-bedroom suite with a marina-facing terrace, oak joinery throughout and a marble bathroom with a freestanding tub.',
    type: 'apartment', status: 'available', price: 2150000, location: 'Dubai Marina', community: 'marina', projectSlug: 'marina-helix',
    bedrooms: 1, bathrooms: 2, area: 940, featured: false, layout: 'one',
    images: img('marina-helix', 'day', 'interior-one-a', 'dusk', 'interior-one-b', 'close'),
    floorPlans: [{ name: 'Type A — Marina', layout: 'one', area: 940 }],
    amenities: towerAmenities,
    specs: { Floor: '4 – 16', View: 'Marina promenade', Terrace: '130 sq ft', Parking: '1 bay', Ceilings: '3.1 m', Furnishing: 'Unfurnished', Tenure: 'Freehold', Handover: 'Q2 2029' },
    paymentPlan: postHandover, lat: 25.0805, lng: 55.1403,
  },
  {
    slug: 'helix-residence-3br', title: 'Helix Residence — Three Bedroom', tagline: 'Sea on one side, city on the other',
    description: 'A dual-aspect three-bedroom residence. Sunrise over the city from the bedrooms, sunset over the Gulf from the living room.',
    type: 'apartment', status: 'sold', price: 7450000, location: 'Dubai Marina', community: 'marina', projectSlug: 'marina-helix',
    bedrooms: 3, bathrooms: 4, area: 2480, featured: false, layout: 'three',
    images: img('marina-helix', 'close', 'interior-three-b', 'day', 'interior-three-a'),
    floorPlans: [{ name: 'Type C — Dual aspect', layout: 'three', area: 2480 }],
    amenities: towerAmenities,
    specs: { Floor: '17 – 24', View: 'Sea & skyline', Terrace: '360 sq ft', Parking: '2 bays', Ceilings: '3.1 m', Furnishing: 'Unfurnished', Tenure: 'Freehold', Handover: 'Q2 2029' },
    paymentPlan: postHandover, lat: 25.0805, lng: 55.1403,
  },
  {
    slug: 'palm-crest-signature-villa', title: 'Palm Crest Signature Villa', tagline: 'Six bedrooms on thirty metres of private beach',
    description: 'The largest of the twelve. A cantilevered upper floor shades a 22-metre pool; below, the living spaces slide fully open to the garden and the sea. Includes a basement gallery garage, spa and cinema.',
    type: 'villa', status: 'available', price: 62000000, location: 'Palm Jumeirah', community: 'palm', projectSlug: 'palm-crest',
    bedrooms: 6, bathrooms: 7, area: 11200, featured: true, layout: 'three',
    images: img('palm-crest', 'dusk', 'interior-three-a', 'day', 'aerial', 'interior-three-b', 'close'),
    floorPlans: [{ name: 'Ground floor', layout: 'three', area: 5600 }, { name: 'First floor', layout: 'two', area: 4200 }],
    amenities: villaAmenities,
    specs: { Plot: '16,400 sq ft', View: 'Open sea & skyline', Pool: '22 m infinity', Parking: '6 (gallery garage)', Levels: 'B + G + 1 + Roof', Furnishing: 'Fully furnished', Tenure: 'Freehold', Handover: 'Immediate' },
    paymentPlan: ready, lat: 25.1124, lng: 55.139,
  },
  {
    slug: 'palm-crest-garden-villa', title: 'Palm Crest Garden Villa', tagline: 'A beachfront home wrapped in gardens',
    description: 'Five bedrooms arranged around a planted courtyard, with a shaded pool terrace and direct beach access through a private garden gate.',
    type: 'villa', status: 'sold', price: 38500000, location: 'Palm Jumeirah', community: 'palm', projectSlug: 'palm-crest',
    bedrooms: 5, bathrooms: 6, area: 8650, featured: false, layout: 'three',
    images: img('palm-crest', 'day', 'interior-three-b', 'dusk', 'close'),
    floorPlans: [{ name: 'Ground floor', layout: 'three', area: 4500 }, { name: 'First floor', layout: 'two', area: 4150 }],
    amenities: villaAmenities,
    specs: { Plot: '12,900 sq ft', View: 'Garden & sea', Pool: '16 m', Parking: '4', Levels: 'G + 1 + Roof', Furnishing: 'Unfurnished', Tenure: 'Freehold', Handover: 'Immediate' },
    paymentPlan: ready, lat: 25.1124, lng: 55.139,
  },
  {
    slug: 'sahara-sky-townhouse', title: 'Sahara Sky Townhouse', tagline: 'A house in the sky, with its own garden',
    description: 'A four-bedroom duplex townhouse on the upper terraces, with a private planted garden, an outdoor kitchen and uninterrupted fairway views.',
    type: 'townhouse', status: 'available', price: 9800000, location: 'Dubai Hills', community: 'hills', projectSlug: 'sahara-terraces',
    bedrooms: 4, bathrooms: 4, area: 3900, featured: true, layout: 'three',
    images: img('sahara-terraces', 'day', 'interior-three-a', 'dusk', 'interior-three-b', 'aerial'),
    floorPlans: [{ name: 'Living level', layout: 'three', area: 2100 }, { name: 'Bedroom level', layout: 'two', area: 1800 }],
    amenities: ['Private terrace garden', 'Outdoor kitchen', ...towerAmenities.slice(0, 8)],
    specs: { Floor: '11 – 12 (duplex)', View: 'Fairway & skyline', Terrace: '1,100 sq ft', Parking: '3 bays', Ceilings: '3.3 m', Furnishing: 'Unfurnished', Tenure: 'Freehold', Handover: 'Immediate' },
    paymentPlan: ready, lat: 25.1031, lng: 55.2468,
  },
  {
    slug: 'sahara-garden-apartment', title: 'Sahara Garden Apartment', tagline: 'Two bedrooms opening on to the fairway',
    description: 'A ground-terrace apartment with a private garden, two en-suite bedrooms and a living room that opens fully to the outdoors.',
    type: 'apartment', status: 'available', price: 3650000, location: 'Dubai Hills', community: 'hills', projectSlug: 'sahara-terraces',
    bedrooms: 2, bathrooms: 3, area: 1720, featured: false, layout: 'two',
    images: img('sahara-terraces', 'dusk', 'interior-two-b', 'day', 'interior-two-a', 'close'),
    floorPlans: [{ name: 'Type B — Garden', layout: 'two', area: 1720 }],
    amenities: towerAmenities.slice(0, 8),
    specs: { Floor: '1 – 4', View: 'Fairway', Terrace: '420 sq ft', Parking: '2 bays', Ceilings: '3.2 m', Furnishing: 'Unfurnished', Tenure: 'Freehold', Handover: 'Immediate' },
    paymentPlan: ready, lat: 25.1031, lng: 55.2468,
  },
];

export const communities: Community[] = [
  {
    slug: 'downtown', name: 'Downtown Dubai', blurb: 'The cultural centre of the city',
    description: 'Opera, galleries and the boulevard at your door. Our Downtown residences sit two minutes’ walk from the fountain and fifteen from DIFC.',
    image: '/images/aurelia-tower-aerial.jpg',
    stats: [{ label: 'To DIFC', value: '8 min' }, { label: 'To DXB', value: '15 min' }, { label: 'Residences', value: '88' }],
    lifestyle: ['Dubai Opera', 'Michelin-starred dining', 'Boulevard cafés', 'Art galleries'], lat: 25.1972, lng: 55.2744,
  },
  {
    slug: 'marina', name: 'Dubai Marina', blurb: 'Waterfront living, yacht at the door',
    description: 'A seven-kilometre promenade, the beach at JBR and berths for vessels up to 50 metres. Marina Helix stands at the mouth of the harbour.',
    image: '/images/marina-helix-aerial.jpg',
    stats: [{ label: 'To the beach', value: '4 min' }, { label: 'Berths', value: '24' }, { label: 'Residences', value: '104' }],
    lifestyle: ['Yacht club', 'Beach clubs', 'Marina promenade', 'Bluewaters Island'], lat: 25.0805, lng: 55.1403,
  },
  {
    slug: 'palm', name: 'Palm Jumeirah', blurb: 'Beachfront privacy on the crescent',
    description: 'The most recognisable address in the Gulf. Palm Crest occupies a quiet stretch of the western crescent with sunset views across open water.',
    image: '/images/palm-crest-aerial.jpg',
    stats: [{ label: 'Private beach', value: '30 m' }, { label: 'To Marina', value: '12 min' }, { label: 'Villas', value: '12' }],
    lifestyle: ['Private beach', 'Five-star resorts', 'Water sports', 'Sunset dining'], lat: 25.1124, lng: 55.139,
  },
  {
    slug: 'hills', name: 'Dubai Hills', blurb: 'Green, quiet, and close to everything',
    description: 'An 18-hole championship course, 180 km of cycling trails and some of the city’s best schools. Sahara Terraces fronts the 7th fairway.',
    image: '/images/sahara-terraces-aerial.jpg',
    stats: [{ label: 'Parkland', value: '54 km²' }, { label: 'To Downtown', value: '14 min' }, { label: 'Residences', value: '56' }],
    lifestyle: ['Championship golf', 'International schools', 'Cycling trails', 'Dubai Hills Mall'], lat: 25.1031, lng: 55.2468,
  },
];

export const defaultContent: SiteContent = {
  'hero.eyebrow': 'Aurelia Estates — Dubai',
  'hero.headline': 'Architecture for a life less ordinary',
  'hero.sub': 'Private residences, penthouses and beachfront villas in Dubai’s most coveted addresses — explored in real-time 3D before a single key is turned.',
  'stats.1.value': 'AED 14.2B', 'stats.1.label': 'Portfolio value',
  'stats.2.value': '2,480', 'stats.2.label': 'Homes delivered',
  'stats.3.value': '18', 'stats.3.label': 'Years of craft',
  'stats.4.value': '31', 'stats.4.label': 'Design awards',
  'about.headline': 'We build fewer homes, so that each one can be extraordinary.',
  'about.body': 'Founded in Dubai in 2008, Aurelia Estates is a privately held developer of residential architecture. We work with a small circle of architects, landscape designers and craftspeople, and we stay with every building long after handover.',
  'contact.phone': '+971 4 555 0142',
  'contact.email': 'residences@aurelia-estates.example',
  'contact.address': 'Aurelia Gallery, Level 42, Boulevard Plaza, Downtown Dubai, UAE',
  'contact.whatsapp': '971500000000',
  'contact.hours': 'Daily, 9:00 – 20:00 GST',
};
