import type {NatalChart} from './match-preview.mjs';
type StoryItem={topic:string;text:string;evidence:string;advice:string};
export function relationshipStory(charts:NatalChart[]|null,locale?:'es'|'en',relationship?:'partner'|'crush'|'friendship',partial?:boolean):{intro:string;strengths:StoryItem[];challenges:StoryItem[];advice:string};