// Pure validation; no geolocation, persistence or astronomical claims.
export function validateBirth(input, today) {
  if (!input || typeof input !== 'object') return 'date';
  if (typeof input.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(input.date)) return 'date';
  const d = new Date(input.date + 'T00:00:00Z');
  if (!Number.isFinite(d.getTime()) || d.toISOString().slice(0,10) !== input.date || input.date < '1900-01-01' || input.date > today) return 'date';
  if (typeof input.place !== 'string' || input.place.trim().length < 2 || input.place.length > 150) return 'place';
  if (typeof input.unknownTime !== 'boolean') return 'time';
  if (!input.unknownTime && (typeof input.time !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(input.time))) return 'time';
  return null;
}
