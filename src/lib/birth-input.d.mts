export type BirthInput = { date: string; time: string; unknownTime: boolean; place: string; zone: string };
export function validateBirth(input: unknown, today: string): 'date' | 'place' | 'time' | null;
