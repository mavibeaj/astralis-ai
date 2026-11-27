export type Reflection = {key:string;score:number;label:string;question:string};
export function interpretDimensions(dimensions:Record<string,{score:number|null;coverage:number}>,locale?:'en'|'es'):{version:string;strength:Reflection|null;challenge:Reflection|null;questions:string[];disclaimer:string};
