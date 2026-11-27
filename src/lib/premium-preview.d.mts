import type {MatchResult} from './match-preview.mjs';
export type PremiumPreview = {version:string;kind:'deterministic-preview';locale:'en'|'es';relationship:'partner'|'crush'|'friendship';index:number;summary:string;themes:{key:string;label:string;score:number;reflection:string;activity:string}[];strength:string|null;challenge:string|null;limitations:string};
export function buildPremiumPreview(result:MatchResult,locale:'en'|'es',relationship:'partner'|'crush'|'friendship'):PremiumPreview;
