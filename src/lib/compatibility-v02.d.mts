export const VERSION: string;
export const WEIGHTS: Readonly<Record<string, number>>;
export type Person = { chart: { longitudes: Record<string, number>; angles?: { ascendant: number; midheaven: number } | null; nodes?: { north: number } }; unknownTime?: boolean };
export type Evidence = { kind: 'aspect' | 'overlay'; contribution: number; tone: 'supportive' | 'challenging'; [k: string]: unknown };
export type V02Result = { version: string; experimental: true; index: number | null; weightCoverage: number; dimensions: Record<string, { score: number | null; coverage: number; rawSum: number; supportive: number; challenging: number; evidence: Evidence[] }>; overlays: { aInB: { body: string; house: number }[] | null; bInA: { body: string; house: number }[] | null }; houseSystem: 'whole-sign'; dataCoverage: { timeKnown: [boolean, boolean]; angles: [boolean, boolean]; points: [number, number] }; disclaimer: string };
export function pointsOf(p: Person): Record<string, number>;
export function compatibilityV02(a: Person, b: Person): V02Result;
