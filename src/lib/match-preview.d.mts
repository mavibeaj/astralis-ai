import type { BirthInput } from './birth-input.mjs';
export type MatchResult = { status: 'ok'; engineVersion: string; result: { index: number | null; dimensions: Record<string,{score:number|null;coverage:number}> }; limitations:string[] } | {status:'invalid'|'unknown-time-unsupported'|'invalid-time-zone-or-date'|'ambiguous'|'nonexistent'};
export function matchPreview(a:BirthInput,b:BirthInput,cutoff:string):MatchResult;
