import type { Category } from '../types';

export const CATEGORIES: Category[] = [
  { id: 'greek', name: 'Yunan Mitolojisi', slug: 'yunan', description: 'Olympos tanrıları ve kahramanlık destanları.', icon: '🏛️' },
  { id: 'norse', name: 'İskandinav Mitolojisi', slug: 'iskandinav', description: 'Asgard, Vikingler ve Ragnarok.', icon: '🪓' },
  { id: 'turkic', name: 'Türk Mitolojisi', slug: 'turk', description: 'Tengri, Erlik Han ve Bozkurt efsaneleri.', icon: '🐺' },
  { id: 'egyptian', name: 'Mısır Mitolojisi', slug: 'misir', description: 'Piramitler, Firavunlar ve Nilin Tanrıları.', icon: '🐪' },
  { id: 'japanese', name: 'Japon Mitolojisi', slug: 'japon', description: 'Kami, Yokai ve Şinto efsaneleri.', icon: '🌸' }
];
