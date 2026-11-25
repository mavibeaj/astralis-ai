import type { BirthInput } from './birth-input.mjs';
export type MatchResult = { status: 'ok'; engineVersion: string; result: { index: number | null; dimensions: Record<string,{score:number|null;coverage:number}> }; limitations:string[] } | {status:'partial';engineVersion:string;indexRange:[number,number]|null;dimensions:Record<string,[number,number]|null>;sampleCount:number;limitations:string[]} | {status:'invalid'|'invalid-time-zone-or-date'|'ambiguous'|'nonexistent'};
export function matchPreview(a:BirthInput,b:BirthInput,cutoff:string):MatchResult;
