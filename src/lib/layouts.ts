import type { LayoutKey } from './types';

export type RoomType = 'living' | 'kitchen' | 'bedroom' | 'bath' | 'terrace' | 'foyer';
export type Edge = 'wall' | 'glass' | 'door' | 'rail' | 'none';
export interface Room {
  id: string;
  name: string;
  type: RoomType;
  x: number; z: number; w: number; d: number; // metres, origin top-left, z grows toward the entrance
  edges: { n: Edge; e: Edge; s: Edge; w: Edge };
  detail: string;
  finishes: string[];
}
export interface Layout { key: LayoutKey; label: string; width: number; depth: number; rooms: Room[] }

const F = {
  living: ['European oak chevron floor', 'Full-height sliding glazing', 'Concealed linear lighting'],
  kitchen: ['Gaggenau appliance suite', 'Calacatta Oro island', 'Bronze-framed cabinetry'],
  master: ['Walk-through dressing room', 'Silk wall panelling', 'Motorised blackout drapery'],
  bedroom: ['Built-in oak wardrobes', 'Wool-silk carpet inlay', 'En-suite access'],
  bath: ['Book-matched marble walls', 'Freestanding stone tub', 'Underfloor heating'],
  terrace: ['Travertine decking', 'Frameless glass balustrade', 'Outdoor kitchen provision'],
  foyer: ['Private lift lobby', 'Bronze entry door', 'Coat & luggage room'],
};
const e = (n: Edge, ea: Edge, s: Edge, w: Edge) => ({ n, e: ea, s, w });

export const LAYOUTS: Record<LayoutKey, Layout> = {
  one: {
    key: 'one', label: 'One bedroom', width: 9, depth: 9,
    rooms: [
      { id: 'terrace', name: 'Terrace', type: 'terrace', x: 0, z: 0, w: 9, d: 2, edges: e('rail', 'rail', 'none', 'rail'), detail: 'A full-width terrace with room to dine outdoors.', finishes: F.terrace },
      { id: 'living', name: 'Living room', type: 'living', x: 0, z: 2, w: 5, d: 4, edges: e('glass', 'none', 'door', 'wall'), detail: 'Opens fully to the terrace through sliding glass.', finishes: F.living },
      { id: 'kitchen', name: 'Kitchen & dining', type: 'kitchen', x: 5, z: 2, w: 4, d: 4, edges: e('glass', 'wall', 'door', 'none'), detail: 'An island kitchen that seats six.', finishes: F.kitchen },
      { id: 'bed1', name: 'Bedroom suite', type: 'bedroom', x: 0, z: 6, w: 5, d: 3, edges: e('none', 'door', 'wall', 'wall'), detail: 'A calm, king-size suite with fitted dressing wall.', finishes: F.master },
      { id: 'bath1', name: 'Bathroom', type: 'bath', x: 5, z: 6, w: 1.5, d: 3, edges: e('none', 'wall', 'wall', 'none'), detail: 'Marble bathroom with a freestanding tub.', finishes: F.bath },
      { id: 'foyer', name: 'Entrance', type: 'foyer', x: 6.5, z: 6, w: 2.5, d: 3, edges: e('none', 'wall', 'door', 'none'), detail: 'A private entrance hall with concealed storage.', finishes: F.foyer },
    ],
  },
  two: {
    key: 'two', label: 'Two bedroom', width: 12, depth: 9,
    rooms: [
      { id: 'terrace', name: 'Terrace', type: 'terrace', x: 0, z: 0, w: 12, d: 2, edges: e('rail', 'rail', 'none', 'rail'), detail: 'Twelve metres of terrace across the whole home.', finishes: F.terrace },
      { id: 'living', name: 'Living room', type: 'living', x: 0, z: 2, w: 5, d: 4.5, edges: e('glass', 'none', 'door', 'wall'), detail: 'A nine-metre living space shared with the dining area.', finishes: F.living },
      { id: 'kitchen', name: 'Kitchen & dining', type: 'kitchen', x: 5, z: 2, w: 3.5, d: 4.5, edges: e('glass', 'door', 'door', 'none'), detail: 'Fully integrated kitchen with a marble island.', finishes: F.kitchen },
      { id: 'bed1', name: 'Master suite', type: 'bedroom', x: 8.5, z: 2, w: 3.5, d: 4.5, edges: e('glass', 'wall', 'door', 'none'), detail: 'Wakes to the skyline, with direct terrace access.', finishes: F.master },
      { id: 'bed2', name: 'Bedroom two', type: 'bedroom', x: 0, z: 6.5, w: 4, d: 2.5, edges: e('none', 'wall', 'wall', 'wall'), detail: 'An en-suite guest bedroom.', finishes: F.bedroom },
      { id: 'bath2', name: 'Bathroom', type: 'bath', x: 4, z: 6.5, w: 2, d: 2.5, edges: e('none', 'wall', 'wall', 'none'), detail: 'Guest bathroom with a walk-in rain shower.', finishes: F.bath },
      { id: 'foyer', name: 'Entrance', type: 'foyer', x: 6, z: 6.5, w: 2.5, d: 2.5, edges: e('none', 'wall', 'door', 'none'), detail: 'Private entrance hall and powder room.', finishes: F.foyer },
      { id: 'bath1', name: 'Master bathroom', type: 'bath', x: 8.5, z: 6.5, w: 3.5, d: 2.5, edges: e('none', 'wall', 'wall', 'none'), detail: 'Twin vanities, stone tub and a steam shower.', finishes: F.bath },
    ],
  },
  three: {
    key: 'three', label: 'Three bedroom +', width: 14, depth: 10.4,
    rooms: [
      { id: 'terrace', name: 'Terrace', type: 'terrace', x: 0, z: 0, w: 14, d: 2.2, edges: e('rail', 'rail', 'none', 'rail'), detail: 'A wraparound terrace with a plunge pool option.', finishes: F.terrace },
      { id: 'living', name: 'Grand salon', type: 'living', x: 0, z: 2.2, w: 6, d: 5, edges: e('glass', 'none', 'door', 'wall'), detail: 'A double-aspect salon for entertaining.', finishes: F.living },
      { id: 'kitchen', name: 'Kitchen & dining', type: 'kitchen', x: 6, z: 2.2, w: 4, d: 5, edges: e('glass', 'door', 'door', 'none'), detail: 'Show kitchen with a separate chef’s kitchen behind.', finishes: F.kitchen },
      { id: 'bed1', name: 'Master suite', type: 'bedroom', x: 10, z: 2.2, w: 4, d: 5, edges: e('glass', 'wall', 'door', 'none'), detail: 'A master wing with its own terrace frontage.', finishes: F.master },
      { id: 'bed2', name: 'Bedroom two', type: 'bedroom', x: 0, z: 7.2, w: 4.2, d: 3.2, edges: e('none', 'door', 'wall', 'wall'), detail: 'En-suite bedroom with fitted wardrobes.', finishes: F.bedroom },
      { id: 'bed3', name: 'Bedroom three', type: 'bedroom', x: 4.2, z: 7.2, w: 2.8, d: 3.2, edges: e('none', 'wall', 'wall', 'none'), detail: 'En-suite bedroom or study.', finishes: F.bedroom },
      { id: 'bath2', name: 'Bathroom', type: 'bath', x: 8.6, z: 7.2, w: 1.4, d: 3.2, edges: e('none', 'wall', 'wall', 'none'), detail: 'Family bathroom in honed limestone.', finishes: F.bath },
      { id: 'foyer', name: 'Entrance', type: 'foyer', x: 7, z: 7.2, w: 1.6, d: 3.2, edges: e('none', 'door', 'door', 'none'), detail: 'Private lift lobby opening into the gallery hall.', finishes: F.foyer },
      { id: 'bath1', name: 'Master bathroom', type: 'bath', x: 10, z: 7.2, w: 4, d: 3.2, edges: e('none', 'wall', 'wall', 'none'), detail: 'Twin vanities, stone tub and a steam shower.', finishes: F.bath },
    ],
  },
};

export const roomAreaSqft = (r: Room) => Math.round(r.w * r.d * 10.764);
