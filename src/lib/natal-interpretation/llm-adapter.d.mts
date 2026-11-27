export const LLM_ENABLED: false;
export const STORY_CHAPTERS: string[];
export function buildStoryRequest(a: any, b: any, o: { lang: 'es' | 'en'; relationship: string }): any;
export function validateStoryResponse(raw: string, request: any, names?: [string, string]): { key: string; paragraphs: { text: string; evidence: string[] }[] }[];
