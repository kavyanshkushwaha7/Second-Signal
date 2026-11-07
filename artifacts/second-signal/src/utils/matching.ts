/**
 * MOCK AI MATCHING — local keyword + synonym heuristic.
 * No language model is connected. Replace `findMatches` / `improveDescription`
 * with calls to a real matching API later; signatures are kept async-ready.
 */
import type { Listing, User } from '@/types';

const SYNONYMS: Record<string, string[]> = {
  calculator: ['calc', 'casio', 'scientific', 'fx', 'graphing'],
  bicycle: ['bike', 'cycle', 'gear', 'ride'],
  book: ['books', 'textbook', 'notes', 'novel', 'guide', 'reference'],
  table: ['desk', 'study', 'furniture'],
  laptop: ['notebook', 'stand', 'riser'],
  drawing: ['drafter', 'compass', 'engineering', 'graphics', 'set square'],
  keyboard: ['keys', 'mechanical', 'typing'],
  mouse: ['wireless', 'pointer'],
  headphones: ['earphones', 'headset', 'audio'],
  camera: ['dslr', 'mirrorless', 'lens', 'photography'],
  racket: ['badminton', 'tennis', 'shuttle', 'sports'],
  football: ['ball', 'sports', 'soccer'],
  kettle: ['hostel', 'bucket', 'lamp', 'essentials'],
  lights: ['decor', 'decoration', 'lantern', 'fest', 'event', 'bunting'],
};

const STOP = new Set(['i', 'a', 'an', 'the', 'for', 'need', 'my', 'to', 'of', 'and', 'with', 'in', 'on', 'want', 'looking', 'someone', 'have', 'two', 'weeks', 'week', 'upcoming', 'semester', 'please', 'any']);

const tokenize = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter((t) => t.length > 1 && !STOP.has(t));

function expand(tokens: string[]) {
  const out = new Map<string, string>();
  tokens.forEach((t) => {
    out.set(t, t);
    Object.entries(SYNONYMS).forEach(([root, syns]) => {
      const fam = [root, ...syns];
      if (fam.some((f) => f === t || t.startsWith(f) || f.startsWith(t))) fam.forEach((f) => out.has(f) || out.set(f, t));
    });
  });
  return out;
}

export interface MatchResult {
  listing: Listing;
  owner?: User;
  score: number;
  explanation: string;
  matchedTerms: string[];
  inferredCategory?: string;
}

export function inferCategory(text: string): string | undefined {
  const t = text.toLowerCase();
  if (/calc|kit|compass|drafter|pen|stationer/.test(t)) return 'Stationery & Tools';
  if (/book|notes|guide|novel/.test(t)) return 'Books & Notes';
  if (/bike|cycle/.test(t)) return 'Bikes & Transport';
  if (/table|chair|desk|shelf/.test(t)) return 'Furniture';
  if (/racket|ball|sport|bat|yoga/.test(t)) return 'Sports';
  if (/camera|lens|tripod/.test(t)) return 'Photography';
  if (/laptop|keyboard|mouse|headphone|charger|monitor|electronic/.test(t)) return 'Electronics';
  if (/kettle|bucket|mattress|hostel|lamp/.test(t)) return 'Hostel Essentials';
  if (/decor|light|lantern|event|fest/.test(t)) return 'Event Supplies';
  return undefined;
}

export function findMatches(query: string, listings: Listing[], users: User[], excludeOwner?: string, campus?: string): MatchResult[] {
  const tokens = tokenize(query);
  if (!tokens.length) return [];
  const expanded = expand(tokens);
  const cat = inferCategory(query);
  const wantsShort = /week|day|borrow|temporar|few/.test(query.toLowerCase());
  return listings
    .filter((l) => l.ownerId !== excludeOwner && l.availability !== 'Unavailable')
    .map((l) => {
      const hay = `${l.title} ${l.description} ${l.category}`.toLowerCase();
      const titleHay = l.title.toLowerCase();
      const matched = new Set<string>();
      let s = 0;
      expanded.forEach((_src, term) => {
        if (titleHay.includes(term)) { s += 22; matched.add(term); }
        else if (hay.includes(term)) { s += 9; matched.add(term); }
      });
      if (cat && l.category === cat) s += 14;
      if (wantsShort && l.type === 'borrow') s += 10;
      if (campus && l.campus === campus) s += 6;
      if (l.availability === 'Available') s += 4;
      const score = Math.min(97, Math.round(s * 1.1));
      const reasons: string[] = [];
      if (matched.size) reasons.push(`mentions ${[...matched].slice(0, 3).map((m) => `"${m}"`).join(', ')}`);
      if (cat && l.category === cat) reasons.push(`sits in ${cat}`);
      if (wantsShort && l.type === 'borrow') reasons.push('is offered to borrow, fitting a short-term need');
      if (campus && l.campus === campus) reasons.push('is on your campus');
      return {
        listing: l, owner: users.find((u) => u.id === l.ownerId), score, matchedTerms: [...matched], inferredCategory: cat,
        explanation: reasons.length ? `This listing ${reasons.join(', ')}.` : 'Loosely related by category.',
      };
    })
    .filter((m) => m.matchedTerms.length > 0 && m.score >= 20)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);
}

export function improveDescription(title: string, desc: string, condition: string, category: string): string {
  const base = desc.trim() || `${title} in ${condition.toLowerCase()} condition.`;
  const lines = [base.endsWith('.') ? base : `${base}.`];
  lines.push(`Condition: ${condition}. Category: ${category || inferCategory(title) || 'General'}.`);
  lines.push('Happy to meet on campus for a quick check before handover. Message me with any questions.');
  return lines.join(' ');
}
