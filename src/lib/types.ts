export type PropertyStatus = 'available' | 'reserved' | 'sold';
export type PropertyType = 'apartment' | 'penthouse' | 'villa' | 'townhouse';
export type ModelKind = 'tower' | 'villa';
export type TowerVariant = 'slab' | 'twist' | 'stepped';
export type LayoutKey = 'one' | 'two' | 'three';

export interface ModelConfig {
  kind: ModelKind;
  variant?: TowerVariant;
  floors?: number;
  accent?: string;
}

export interface PaymentStep { label: string; percent: number; note: string }
export interface FloorPlan { name: string; layout: LayoutKey; area: number; image?: string }

export interface Property {
  id: number;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  type: PropertyType;
  status: PropertyStatus;
  price: number; // AED
  location: string;
  community: string;
  projectSlug: string;
  bedrooms: number;
  bathrooms: number;
  area: number; // sq ft
  featured: boolean;
  images: string[];
  modelUrl?: string | null;
  layout: LayoutKey;
  floorPlans: FloorPlan[];
  amenities: string[];
  specs: Record<string, string>;
  paymentPlan: PaymentStep[];
  lat: number;
  lng: number;
  createdAt?: string;
}

export interface Project {
  id: number;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  location: string;
  community: string;
  status: 'Launching' | 'Under Construction' | 'Ready';
  completion: string;
  startingPrice: number;
  model: ModelConfig;
  images: string[];
  highlights: string[];
  lat: number;
  lng: number;
  plot: { x: number; z: number };
}

export interface Unit {
  id: number;
  projectSlug: string;
  floor: number; // 0-based
  position: number; // 0..3
  number: string;
  bedrooms: number;
  area: number;
  price: number;
  view: string;
  status: PropertyStatus;
}

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'viewing' | 'won' | 'lost';
export interface Enquiry {
  id: number;
  type: 'enquiry' | 'viewing' | 'contact' | 'callback';
  name: string;
  email: string;
  phone: string;
  message: string;
  propertyId: number | null;
  propertyTitle?: string | null;
  userId: number | null;
  preferredDate: string | null;
  status: LeadStatus;
  notes: string;
  createdAt: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'admin';
  createdAt: string;
}

export interface Community {
  slug: string;
  name: string;
  blurb: string;
  description: string;
  image: string;
  stats: { label: string; value: string }[];
  lifestyle: string[];
  lat: number;
  lng: number;
}

export type SiteContent = Record<string, string>;
