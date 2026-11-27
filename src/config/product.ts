// Prices are integer USD cents; commercial hypotheses, not live checkout offers.
export const brand = { name: 'Astralis AI', internalConcept: 'Cosmic Match', trademarkCleared: false, tagline: { en: 'Every connection has a story. Discover yours.', es: 'Cada conexión tiene una historia. Descubre la tuya.' } } as const;
export const catalog = [
  { id: 'match-free', name: 'Cosmic Match Free', priceCents: 0, interval: null, phase: 'mvp' },
  { id: 'identity', name: 'Cosmic Identity', priceCents: 499, interval: null, phase: 'p1' },
  { id: 'match-premium', name: 'Cosmic Match Premium', priceCents: 999, interval: null, phase: 'mvp' },
  { id: 'couple', name: 'Cosmic Couple', priceCents: 1499, interval: null, phase: 'p1' },
  { id: 'plus', name: 'Cosmic Plus', priceCents: 599, interval: 'month', phase: 'p2' },
] as const;
export const commercialPolicy = { currency: 'USD', paymentsEnabled: false, minimumAge: 18, locales: ['en', 'es'] } as const;
export const compatibilityWeights = { emotional: 25, communication: 20, attraction: 20, stability: 20, growth: 15 } as const;
