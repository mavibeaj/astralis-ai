export const SIGNS: string[];
export const SIGN_GLYPHS: string[];
export const BODY_GLYPHS: Record<string, string>;
export function formatPosition(lon: number, signNames?: string[]): string;
export function screenAngle(lon: number, left: number): number;
export function polar(cx: number, cy: number, r: number, angleDeg: number): [number, number];
export type Placed = { key: string; lon: number; display: number; glyph: string; r: number; angle: number; trueAngle: number };
export function spread<T extends { key: string; lon: number }>(points: T[], minSep?: number): (T & { display: number })[];
export type WheelAspect = { a: string; b: string; aLon: number; bLon: number; aspect: string; deviation: number; tone: 'supportive' | 'challenging'; aAngle: number; bAngle: number };
export function aspectsBetween(a: { key: string; lon: number }[], b: { key: string; lon: number }[], sameChart?: boolean): Omit<WheelAspect, 'aAngle' | 'bAngle'>[];
export function wheelModel(inner: any, outer?: any, opts?: { size?: number }): {
  size: number; cx: number; cy: number; left: number; orientation: 'ascendant' | 'aries';
  ring: { zodiacOuter: number; zodiacInner: number; outerBodies: number; innerBodies: number; aspect: number };
  signs: { name: string; glyph: string; start: number; mid: number; startAngle: number }[];
  houses: { system: 'placidus' | 'whole-sign'; cusps: { house: number; lon: number; angle: number }[] } | null;
  bodiesInner: Placed[]; bodiesOuter: Placed[]; aspects: WheelAspect[]; axes: { asc: number; mc: number } | null;
};
