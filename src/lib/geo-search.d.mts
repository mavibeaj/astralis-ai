export type CatalogCountry = { code: string; name: string; buckets: number; split: Set<string> };
export type PlaceResult = { id: string; name: string; region: string; district: string; zone: string; population: number; latitude: number; longitude: number; country: string };
export function normalize(s: string): string;
export function keyFor(q: string, split: Set<string>): string;
export function h32(s: string): number;
export function parseManifest(json: unknown): CatalogCountry[];
export function shardPath(country: CatalogCountry, q: string): { key: string; path: string; needsMore: boolean };
export function searchPlaces(country: CatalogCountry, query: string, load: (path: string) => Promise<any>, limit?: number): Promise<{ status: 'short' | 'ready' | 'empty' | 'more'; rows: PlaceResult[] }>;
export function cachedLoader(fetchImpl?: typeof fetch): (path: string) => Promise<any>;
