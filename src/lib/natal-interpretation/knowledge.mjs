// Astralis natal knowledge base — original, versioned, bilingual.
// Symbolic astrology vocabulary only: no psychological diagnosis, no predictions.
// Spanish phrasing deliberately attaches adjectives to feminine nouns ("una energía…",
// "una forma…") so sentences never assume a person's gender.
export const KB_VERSION = 'natal-kb-0.2';

export const SIGN_NAMES = {
  es: ['Aries', 'Tauro', 'Géminis', 'Cáncer', 'Leo', 'Virgo', 'Libra', 'Escorpio', 'Sagitario', 'Capricornio', 'Acuario', 'Piscis'],
  en: ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'],
};
export const ELEMENTS = ['fire', 'earth', 'air', 'water'];
export const MODALITIES = ['cardinal', 'fixed', 'mutable'];
export const signElement = i => ELEMENTS[i % 4];
export const signModality = i => MODALITIES[i % 3];

// Per sign: style (feminine-noun adjectives), gift, need, shadow (soft), love (how affection looks).
export const SIGNS = [
  {es: {style: 'directa, valiente y espontánea', gift: 'la iniciativa y el coraje para empezar', need: 'sentir libertad para actuar y ver movimiento', shadow: 'la impaciencia o responder antes de escuchar del todo', love: 'con entusiasmo, franqueza y ganas de compartir aventuras'},
   en: {style: 'direct, courageous and spontaneous', gift: 'initiative and the courage to begin', need: 'feeling free to act and seeing things move', shadow: 'impatience or responding before fully listening', love: 'with enthusiasm, frankness and a wish to share adventures'}},
  {es: {style: 'serena, constante y sensorial', gift: 'la paciencia y la capacidad de sostener lo que importa', need: 'estabilidad, ritmo propio y señales concretas de cuidado', shadow: 'resistirse al cambio cuando llega de forma repentina', love: 'con gestos concretos, presencia constante y detalles que se sienten'}},
  {es: {style: 'curiosa, ágil y conversadora', gift: 'la flexibilidad mental y el gusto por aprender', need: 'estímulo, variedad y conversaciones que fluyan', shadow: 'dispersarse o cambiar de tema antes de cerrar lo emocional', love: 'con conversación, humor y curiosidad por el mundo del otro'}},
  {es: {style: 'protectora, sensible y cercana', gift: 'la capacidad de cuidar y crear sensación de hogar', need: 'un lugar seguro y compañía emocional', shadow: 'protegerse en silencio', love: 'cuidando, recordando lo importante y creando intimidad cotidiana'}},
  {es: {style: 'cálida, expresiva y generosa', gift: 'la calidez y la capacidad de inspirar a otros', need: 'reconocimiento, aprecio y libertad para expresarse', shadow: 'sentir el desinterés ajeno como algo personal', love: 'con gestos visibles, generosidad y ganas de celebrar al otro'}},
  {es: {style: 'atenta, práctica y cuidadosa', gift: 'la atención al detalle y la vocación de ser útil', need: 'orden, claridad y sentir que su aporte sirve', shadow: 'exigirse de más o mostrar cariño corrigiendo', love: 'ayudando, resolviendo y cuidando los detalles prácticos'}},
  {es: {style: 'amable, diplomática y armoniosa', gift: 'la capacidad de escuchar ambos lados y crear acuerdos', need: 'reciprocidad, belleza y relaciones equilibradas', shadow: 'postergar decisiones para evitar incomodar', love: 'con atención, cortesía y búsqueda de equilibrio entre ambos'}},
  {es: {style: 'profunda, intensa y reservada', gift: 'la lealtad y la capacidad de ir al fondo de las cosas', need: 'confianza, honestidad y vínculos con sentido', shadow: 'reservarse lo que siente hasta que la confianza está consolidada', love: 'con entrega, lealtad y deseo de conocer de verdad al otro'}},
  {es: {style: 'optimista, abierta y aventurera', gift: 'la visión amplia y la capacidad de encontrar sentido', need: 'espacio para explorar, aprender y crecer', shadow: 'prometer más de lo que el momento permite', love: 'compartiendo planes, ideas y experiencias nuevas'}},
  {es: {style: 'responsable, constante y realista', gift: 'la perseverancia y la capacidad de construir a largo plazo', need: 'metas claras, respeto y sentir que avanza', shadow: 'mostrarse reservada cuando en realidad le importa mucho', love: 'con compromiso, hechos sostenidos y apoyo en los proyectos'}},
  {es: {style: 'original, independiente y libre', gift: 'la mirada innovadora y la capacidad de ver otras posibilidades', need: 'autenticidad, amistad y espacio personal', shadow: 'tomar distancia emocional cuando algo se vuelve intenso', love: 'con complicidad, respeto por la libertad y amistad dentro del vínculo'}},
  {es: {style: 'empática, imaginativa y receptiva', gift: 'la sensibilidad y la capacidad de comprender sin palabras', need: 'conexión emocional, inspiración y momentos de calma', shadow: 'absorber el ánimo de otros o idealizar a quien quiere', love: 'con ternura, empatía y una conexión casi intuitiva'}},
];
// English for signs 1–11 (index 0 has both inline above).
const SIGNS_EN = [null,
  {style: 'calm, steady and sensory', gift: 'patience and the ability to sustain what matters', need: 'stability, an own rhythm and concrete signs of care', shadow: 'resisting change when it arrives suddenly', love: 'with concrete gestures, steady presence and tangible details'},
  {style: 'curious, quick and conversational', gift: 'mental flexibility and a love of learning', need: 'stimulation, variety and flowing conversation', shadow: 'scattering attention or changing topic before closing what is emotional', love: 'with conversation, humour and curiosity about the other person\'s world'},
  {style: 'protective, sensitive and close', gift: 'the ability to care and create a sense of home', need: 'feeling safe and emotionally accompanied', shadow: 'withdrawing in silence', love: 'by caring, remembering what matters and building everyday intimacy'},
  {style: 'warm, expressive and generous', gift: 'warmth and the ability to inspire others', need: 'feeling seen, appreciated and free to express themselves', shadow: 'taking other people\'s disinterest personally', love: 'with visible gestures, generosity and a wish to celebrate the other'},
  {style: 'attentive, practical and careful', gift: 'attention to detail and a wish to be useful', need: 'order, clarity and feeling that their contribution helps', shadow: 'being overly demanding of themselves or showing care by correcting', love: 'by helping, solving and caring for practical details'},
  {style: 'kind, diplomatic and harmonious', gift: 'listening to both sides and building agreements', need: 'reciprocity, beauty and balanced relationships', shadow: 'postponing decisions to avoid discomfort', love: 'with attention, courtesy and a search for balance between both'},
  {style: 'deep, intense and private', gift: 'loyalty and the ability to get to the heart of things', need: 'trust, honesty and meaningful bonds', shadow: 'holding feelings back until trust feels completely secure', love: 'with devotion, loyalty and a wish to truly know the other'},
  {style: 'optimistic, open and adventurous', gift: 'a broad vision and the ability to find meaning', need: 'room to explore, learn and grow', shadow: 'promising more than the moment allows', love: 'by sharing plans, ideas and new experiences'},
  {style: 'responsible, steady and realistic', gift: 'perseverance and the ability to build for the long term', need: 'clear goals, respect and a sense of progress', shadow: 'appearing reserved when something matters a lot', love: 'with commitment, sustained actions and support for projects'},
  {style: 'original, independent and free', gift: 'an innovative outlook and seeing other possibilities', need: 'authenticity, friendship and personal space', shadow: 'stepping back emotionally when things become intense', love: 'with complicity, respect for freedom and friendship within the bond'},
  {style: 'empathetic, imaginative and receptive', gift: 'sensitivity and understanding without words', need: 'emotional connection, inspiration and quiet moments', shadow: 'absorbing others\' moods or idealising loved ones', love: 'with tenderness, empathy and an almost intuitive connection'},
];
SIGNS.forEach((s, i) => {if (i > 0) s.en = SIGNS_EN[i];});

export const ELEMENT_TEXT = {
  fire: {es: {name: 'fuego', gift: 'entusiasmo, iniciativa y calidez', lack: 'darse permiso para actuar sin esperar la certeza total', theme: 'la aventura'}, en: {name: 'fire', gift: 'enthusiasm, initiative and warmth', lack: 'allowing oneself to act without waiting for total certainty', theme: 'adventure'}},
  earth: {es: {name: 'tierra', gift: 'constancia, realismo y sentido práctico', lack: 'aterrizar ideas y emociones en rutinas concretas', theme: 'la estabilidad'}, en: {name: 'earth', gift: 'steadiness, realism and practicality', lack: 'grounding ideas and feelings in concrete routines', theme: 'stability'}},
  air: {es: {name: 'aire', gift: 'curiosidad, conversación y perspectiva', lack: 'poner en palabras lo que siente para tomar distancia y comprenderlo', theme: 'la curiosidad'}, en: {name: 'air', gift: 'curiosity, conversation and perspective', lack: 'putting feelings into words to gain perspective', theme: 'curiosity'}},
  water: {es: {name: 'agua', gift: 'sensibilidad, empatía e intuición', lack: 'reconocer y nombrar las emociones antes de que se acumulen', theme: 'la sensibilidad'}, en: {name: 'water', gift: 'sensitivity, empathy and intuition', lack: 'recognising and naming emotions before they build up', theme: 'sensitivity'}},
};
export const MODALITY_TEXT = {
  cardinal: {es: 'una tendencia a iniciar, proponer y poner las cosas en marcha', en: 'a tendency to initiate, propose and set things in motion'},
  fixed: {es: 'una tendencia a sostener, profundizar y mantener lo que se empieza', en: 'a tendency to sustain, deepen and keep what has been started'},
  mutable: {es: 'una tendencia a adaptarse, explorar alternativas y cambiar de enfoque', en: 'a tendency to adapt, explore alternatives and change approach'},
};

export const BODY_NAMES = {
  es: {Sun: 'Sol', Moon: 'Luna', Mercury: 'Mercurio', Venus: 'Venus', Mars: 'Marte', Jupiter: 'Júpiter', Saturn: 'Saturno', Uranus: 'Urano', Neptune: 'Neptuno', Pluto: 'Plutón', Ascendant: 'Ascendente', Midheaven: 'Medio Cielo', NorthNode: 'Nodo Norte'},
  en: {Sun: 'Sun', Moon: 'Moon', Mercury: 'Mercury', Venus: 'Venus', Mars: 'Mars', Jupiter: 'Jupiter', Saturn: 'Saturn', Uranus: 'Uranus', Neptune: 'Neptune', Pluto: 'Pluto', Ascendant: 'Ascendant', Midheaven: 'Midheaven', NorthNode: 'North Node'},
};
// What each point symbolises (short noun phrase used inside sentences).
export const DOMAINS = {
  es: {Sun: 'identidad', Moon: 'mundo emocional', Mercury: 'mente', Venus: 'manera de querer', Mars: 'impulso', Jupiter: 'afán de crecer', Saturn: 'sentido de responsabilidad', Uranus: 'necesidad de libertad', Neptune: 'imaginación', Pluto: 'intensidad', Ascendant: 'forma de presentarse', Midheaven: 'vocación', NorthNode: 'camino de crecimiento'},
  en: {Sun: 'identity', Moon: 'emotional world', Mercury: 'mind', Venus: 'way of loving', Mars: 'drive', Jupiter: 'wish to grow', Saturn: 'sense of responsibility', Uranus: 'need for freedom', Neptune: 'imagination', Pluto: 'intensity', Ascendant: 'way of presenting themselves', Midheaven: 'vocation', NorthNode: 'path of growth'},
};
export const HOUSES = {
  es: ['la identidad y la forma de empezar', 'los recursos, los valores y la seguridad material', 'la comunicación, el aprendizaje y el entorno cercano', 'el hogar, la familia y las raíces', 'la creatividad, el juego y el romance', 'la rutina, el trabajo diario y el bienestar', 'la pareja y las relaciones de igual a igual', 'la intimidad, la confianza y los recursos compartidos', 'los viajes, los estudios y la búsqueda de sentido', 'la vocación, la reputación y las metas públicas', 'las amistades, los grupos y los proyectos de futuro', 'el mundo interior, el descanso y la reflexión'],
  en: ['identity and ways of beginning', 'resources, values and material security', 'communication, learning and close surroundings', 'home, family and roots', 'creativity, play and romance', 'routine, daily work and wellbeing', 'partnership and one-to-one relationships', 'intimacy, trust and shared resources', 'travel, study and the search for meaning', 'vocation, reputation and public goals', 'friendships, groups and future projects', 'the inner world, rest and reflection'],
};

// Neutral house wording for friendship readings (houses 5 and 8 otherwise mention romance/intimacy).
export const HOUSES_FRIENDSHIP = {
  es: HOUSES.es.map((h, i) => i === 4 ? 'la creatividad, el juego y la alegría' : i === 7 ? 'la confianza profunda y los recursos compartidos' : h),
  en: HOUSES.en.map((h, i) => i === 4 ? 'creativity, play and joy' : i === 7 ? 'deep trust and shared resources' : h),
};
export const ASPECT_NAMES = {es: {conjunction: 'conjunción', sextile: 'sextil', square: 'cuadratura', trine: 'trígono', opposition: 'oposición'}, en: {conjunction: 'conjunction', sextile: 'sextile', square: 'square', trine: 'trine', opposition: 'opposition'}};
export const ASPECT_TONE = {conjunction: 'blend', sextile: 'harmonious', trine: 'harmonious', square: 'tense', opposition: 'tense'};
// Natal aspect nature sentences: {a} and {b} are domains.
export const NATAL_NATURE = {
  es: {conjunction: 'su {a} y su {b} actúan muy unidos, como una sola fuerza', sextile: 'su {a} y su {b} se apoyan cuando encuentran espacio para colaborar', trine: 'su {a} y su {b} fluyen con naturalidad', square: 'su {a} y su {b} pueden tirar en direcciones distintas; esa fricción también puede impulsarle', opposition: 'su {a} y su {b} buscan un equilibrio entre dos polos'},
  en: {conjunction: 'their {a} and {b} work closely together, almost as one force', sextile: 'their {a} and {b} support each other when given room to cooperate', trine: 'their {a} and {b} flow naturally', square: 'their {a} and {b} may pull in different directions; that friction can also drive them forward', opposition: 'their {a} and {b} seek a balance between two poles'},
};
// Specific natal pair readings (third person, gender-neutral), keyed "A|B" (sorted). easy = trine/sextile/soft conjunction, hard = square/opposition/hard conjunction.
export const NATAL_PAIRS = {
  'Moon|Sun': {es: {easy: 'lo que quiere y lo que necesita emocionalmente suelen ir en la misma dirección, lo que puede dar una sensación interna de coherencia', hard: 'lo que quiere lograr y lo que necesita para sentirse bien no siempre coinciden; escuchar ambas voces puede ser una fuente de madurez'}, en: {easy: 'what they want and what they need emotionally tend to point the same way, which can give an inner sense of coherence', hard: 'what they want to achieve and what they need to feel well do not always match; listening to both voices can be a source of maturity'}},
  'Moon|Venus': {es: {easy: 'la ternura y el afecto se expresan con facilidad; hay un talento simbólico para crear ambientes cálidos', hard: 'lo que necesita emocionalmente y lo que le atrae pueden pedir cosas distintas, y conviene aclararlo consigo antes que con otros'}, en: {easy: 'tenderness and affection come easily; there is a symbolic talent for creating warm environments', hard: 'what they need emotionally and what attracts them may ask for different things, worth clarifying inwardly first'}},
  'Mars|Venus': {es: {easy: 'el deseo y el afecto conversan bien: puede combinar cariño y decisión', hard: 'entre lo que desea y lo que valora puede haber una tensión creativa que aporta magnetismo, aunque a veces genere impaciencia'}, en: {easy: 'desire and affection talk well together: they can combine tenderness and decisiveness', hard: 'between what they desire and what they value there can be a creative tension that adds magnetism, though sometimes impatience'}},
  'Mercury|Saturn': {es: {easy: 'su pensamiento tiende a ser ordenado y fiable; sus palabras suelen tener peso y cumplirse', hard: 'puede exigirse mucho al expresarse o dudar de sus ideas antes de compartirlas; su voz merece espacio'}, en: {easy: 'their thinking tends to be orderly and reliable; their words carry weight and follow through', hard: 'they may demand a lot of themselves when speaking or doubt ideas before sharing them; their voice deserves room'}},
  'Moon|Saturn': {es: {easy: 'hay una capacidad simbólica para sostener las emociones con serenidad y responsabilidad', hard: 'puede costarle mostrar vulnerabilidad o pedir apoyo; aprender a recibir cuidado es parte de su crecimiento'}, en: {easy: 'there is a symbolic capacity to hold emotions with calm and responsibility', hard: 'showing vulnerability or asking for support may not come easily; learning to receive care is part of their growth'}},
  'Saturn|Sun': {es: {easy: 'la disciplina y la identidad trabajan juntas: puede construir con constancia lo que se propone', hard: 'puede sentir una presión interna por estar a la altura; reconocer sus avances ayuda a aliviarla'}, en: {easy: 'discipline and identity work together: they can steadily build what they set out to do', hard: 'they may feel inner pressure to measure up; acknowledging progress helps ease it'}},
  'Saturn|Venus': {es: {easy: 'el afecto se vive con seriedad y lealtad; los vínculos tienden a construirse con el tiempo', hard: 'puede haber prudencia al mostrar cuánto le importa alguien; la confianza se construye paso a paso'}, en: {easy: 'affection is lived with seriousness and loyalty; bonds tend to grow over time', hard: 'there may be caution about showing how much someone matters; trust builds step by step'}},
  'Mars|Saturn': {es: {easy: 'su energía se canaliza con estrategia y resistencia', hard: 'puede alternar entre contenerse y reaccionar con fuerza; dar salida regular a la energía ayuda'}, en: {easy: 'their energy is channelled with strategy and endurance', hard: 'they may alternate between holding back and reacting strongly; regular outlets for energy help'}},
  'Moon|Pluto': {es: {easy: 'sus emociones tienen profundidad y capacidad de renovarse', hard: 'las emociones pueden vivirse con mucha intensidad; nombrarlas a tiempo evita que se acumulen'}, en: {easy: 'their emotions have depth and a capacity for renewal', hard: 'emotions may be felt very intensely; naming them early keeps them from building up'}},
  'Neptune|Venus': {es: {easy: 'el amor se vive con sensibilidad artística e idealismo inspirador', hard: 'puede idealizar a quien quiere; mirar también los hechos protege su sensibilidad'}, en: {easy: 'love is lived with artistic sensitivity and inspiring idealism', hard: 'they may idealise loved ones; also looking at facts protects their sensitivity'}},
  'Jupiter|Sun': {es: {easy: 'hay una confianza y un optimismo simbólicos que le ayudan a crecer y a contagiar ánimo', hard: 'el entusiasmo puede llevarle a abarcar demasiado; elegir prioridades multiplica sus logros'}, en: {easy: 'there is symbolic confidence and optimism that help them grow and lift others', hard: 'enthusiasm may lead them to take on too much; choosing priorities multiplies results'}},
  'Moon|Uranus': {es: {easy: 'necesita libertad emocional y la vive con originalidad', hard: 'su ánimo puede cambiar rápido y pedir espacio de repente; anticiparlo con palabras ayuda a que otros le comprendan'}, en: {easy: 'they need emotional freedom and live it with originality', hard: 'their mood may shift quickly and need sudden space; saying so helps others understand'}},
  'Jupiter|Mercury': {es: {easy: 'su mente disfruta de las ideas amplias y de compartir lo que aprende', hard: 'puede saltar a conclusiones generales; revisar los detalles fortalece sus ideas'}, en: {easy: 'their mind enjoys big ideas and sharing what it learns', hard: 'they may jump to broad conclusions; checking details strengthens their ideas'}},
  'Mars|Sun': {es: {easy: 'la voluntad y la acción van juntas: cuando decide algo, suele ponerse en marcha', hard: 'la energía puede salir con fuerza o impaciencia; elegir sus batallas le da ventaja'}, en: {easy: 'will and action go together: when they decide something, they tend to move', hard: 'energy may come out forcefully or impatiently; choosing battles gives them an edge'}},
  'Mercury|Moon': {es: {easy: 'puede poner en palabras lo que siente con relativa facilidad', hard: 'a veces la cabeza y el corazón hablan idiomas distintos; darse tiempo antes de responder ayuda'}, en: {easy: 'they can put feelings into words fairly easily', hard: 'sometimes head and heart speak different languages; taking time before replying helps'}},
};

// Cross-chart (synastry) pair library. Tone: easy | hard. Fields support chapters 4–5.
// {A} and {B} are replaced by names. romantic:true pairs are rephrased for friendship.
export const CROSS_PAIRS = {
  'Moon|Sun': {area: 'emotional', es: {
    title: ['Lo que uno muestra, el otro lo siente', 'Identidad y necesidades en diálogo'],
    easy: {story: 'la forma de ser de {X} y el mundo emocional de {Y} tienden a entenderse: lo que {X} expresa puede hacer sentir a {Y} en casa', daily: 'en momentos sencillos, como compartir el día, puede aparecer una sensación de comodidad mutua', benefit: 'una base de familiaridad que ayuda a sentirse acompañados', tip: 'nombren en voz alta qué les hace sentir cómodos juntos para cuidarlo a propósito'},
    hard: {story: 'lo que {X} necesita para brillar y lo que {Y} necesita para tener seguridad emocional pueden no coincidir siempre', daily: 'puede pasar que uno quiera avanzar y el otro necesite primero sentirse acompañado', misunderstanding: 'que la búsqueda de logros se lea como desinterés, o que la necesidad emocional se lea como freno', needX: '{X} puede necesitar comprender que el ritmo emocional de {Y} no es un juicio', needY: '{Y} puede necesitar comprender que el impulso de {X} también es una forma de construir', action: 'antes de una decisión importante, pregúntense qué necesita cada uno para sentirse bien con ella'}},
    en: {title: ['What one shows, the other feels', 'Identity and needs in dialogue'],
    easy: {story: '{X}\'s way of being and {Y}\'s emotional world tend to understand each other: what {X} expresses can make {Y} feel at home', daily: 'in simple moments, like sharing the day, a mutual sense of comfort may appear', benefit: 'a base of familiarity that helps both feel accompanied', tip: 'say out loud what makes you comfortable together so you can care for it on purpose'},
    hard: {story: 'what {X} needs to shine and what {Y} needs to feel emotionally safe may not always match', daily: 'one may want to move forward while the other first needs to feel accompanied', misunderstanding: 'ambition read as indifference, or emotional needs read as holding back', needX: '{X} may need to understand that {Y}\'s emotional pace is not a judgement', needY: '{Y} may need to understand that {X}\'s drive is also a way of building', action: 'before an important decision, ask what each of you needs to feel good about it'}}},
  'Moon|Moon': {area: 'emotional', es: {
    title: ['Dos ritmos emocionales', 'Una forma parecida de sentir'],
    easy: {story: 'sus mundos emocionales tienen un ritmo compatible: lo que tranquiliza a uno puede tranquilizar al otro', daily: 'puede resultarles natural acompañarse en días difíciles sin necesidad de muchas explicaciones', benefit: 'sensación de comprensión mutua y descanso emocional', tip: 'creen un ritual sencillo para cuidarse cuando alguno tenga un mal día'},
    hard: {story: 'cada uno procesa las emociones de una manera distinta, y lo que calma a uno puede no calmar al otro', daily: 'en un momento de estrés, uno puede buscar cercanía y el otro distancia', misunderstanding: 'que la forma de reaccionar del otro se interprete como falta de cariño', needX: '{X} puede necesitar aceptar que {Y} se recupera de otra manera', needY: '{Y} puede necesitar decir explícitamente qué tipo de apoyo le sirve', action: 'pregúntense: «¿qué necesitas de mí cuando estás mal?» y anoten las respuestas'}},
    en: {title: ['Two emotional rhythms', 'A similar way of feeling'],
    easy: {story: 'your emotional worlds share a compatible rhythm: what soothes one can soothe the other', daily: 'it may feel natural to support each other on hard days without much explanation', benefit: 'a sense of mutual understanding and emotional rest', tip: 'create a simple ritual for caring for each other when one of you has a bad day'},
    hard: {story: 'each of you processes emotions differently, and what calms one may not calm the other', daily: 'under stress, one may seek closeness and the other distance', misunderstanding: 'the other\'s reaction read as a lack of affection', needX: '{X} may need to accept that {Y} recovers differently', needY: '{Y} may need to say explicitly what kind of support helps', action: 'ask each other: "what do you need from me when you are struggling?" and write the answers down'}}},
  'Mars|Venus': {area: 'attraction', romantic: true, es: {
    title: ['Una chispa entre ternura y deseo', 'Magnetismo con fricción'],
    easy: {story: 'la forma de querer de uno y la iniciativa del otro se encuentran con naturalidad, lo que suele interpretarse como atracción y complicidad', daily: 'puede notarse en las ganas de proponer planes y en la facilidad para coquetear o reconciliarse', benefit: 'energía y alegría en la relación', tip: 'reserven tiempo para planes nuevos que mantengan viva la complicidad'},
    hard: {story: 'hay magnetismo, pero el ritmo del deseo y la forma de mostrar afecto pueden no ir sincronizados', daily: 'uno puede querer avanzar rápido mientras el otro necesita más delicadeza', misunderstanding: 'que la iniciativa se viva como presión o la calma como desinterés', needX: '{X} puede necesitar escuchar el ritmo de {Y} sin tomarlo como rechazo', needY: '{Y} puede necesitar expresar claramente lo que le resulta agradable', action: 'hablen abiertamente de ritmos y preferencias, sin suponer que el otro ya lo sabe'}},
    en: {title: ['A spark between tenderness and desire', 'Magnetism with friction'],
    easy: {story: 'one person\'s way of loving and the other\'s initiative meet naturally, often read as attraction and complicity', daily: 'it may show in the wish to propose plans and the ease of flirting or making up', benefit: 'energy and joy in the relationship', tip: 'set aside time for new plans that keep complicity alive'},
    hard: {story: 'there is magnetism, but the pace of desire and the way affection is shown may not be in sync', daily: 'one may want to move fast while the other needs more gentleness', misunderstanding: 'initiative felt as pressure, or calm felt as disinterest', needX: '{X} may need to listen to {Y}\'s pace without taking it as rejection', needY: '{Y} may need to say clearly what feels good', action: 'talk openly about pace and preferences rather than assuming the other already knows'}}},
  'Mercury|Mercury': {area: 'communication', es: {
    title: ['Conversaciones que fluyen', 'Dos maneras de pensar'],
    easy: {story: 'sus formas de pensar se entienden: pueden seguir el hilo del otro con facilidad', daily: 'las conversaciones largas, los chistes internos y los planes pueden surgir sin esfuerzo', benefit: 'facilidad para resolver problemas hablando', tip: 'aprovechen esa fluidez para hablar también de lo emocional, no solo de lo práctico'},
    hard: {story: 'cada uno piensa y se expresa de manera diferente: uno puede ir al grano y el otro necesitar más contexto', daily: 'algunas conversaciones pueden sentirse como si hablaran idiomas cercanos pero distintos', misunderstanding: 'que una diferencia de estilo se interprete como falta de interés o de respeto', needX: '{X} puede necesitar más paciencia con el estilo de {Y}', needY: '{Y} puede necesitar comprobar qué quiso decir {X} antes de reaccionar', action: 'usen la regla de repetir con sus palabras lo que entendieron antes de responder'}},
    en: {title: ['Conversations that flow', 'Two ways of thinking'],
    easy: {story: 'your ways of thinking understand each other: you can easily follow each other\'s thread', daily: 'long talks, inside jokes and plans may arise effortlessly', benefit: 'ease in solving problems by talking', tip: 'use that ease to talk about feelings too, not only practical matters'},
    hard: {story: 'you think and express yourselves differently: one may go straight to the point, the other need more context', daily: 'some conversations may feel like speaking close but different languages', misunderstanding: 'a difference in style read as lack of interest or respect', needX: '{X} may need more patience with {Y}\'s style', needY: '{Y} may need to check what {X} meant before reacting', action: 'try repeating in your own words what you understood before replying'}}},
  'Mercury|Moon': {area: 'communication', es: {
    title: ['Palabras que llegan al corazón', 'Entre lo que se dice y lo que se siente'],
    easy: {story: 'las palabras de uno suelen encontrar eco en el mundo emocional del otro', daily: 'puede ser fácil hablar de cómo se sienten sin que la conversación se vuelva pesada', benefit: 'sentirse escuchados y comprendidos', tip: 'reserven conversaciones tranquilas para hablar de lo que les importa'},
    hard: {story: 'lo que uno dice con lógica puede recibirse de forma emocional por el otro', daily: 'un comentario práctico puede sentirse frío, o una reacción emocional parecer exagerada', misunderstanding: 'que el tono importe más que el contenido', needX: '{X} puede necesitar cuidar el tono cuando hable de temas sensibles', needY: '{Y} puede necesitar separar la intención del mensaje de su forma', action: 'cuando algo duela, digan «lo que escuché fue…» y verifiquen la intención'}},
    en: {title: ['Words that reach the heart', 'Between what is said and what is felt'],
    easy: {story: 'one person\'s words tend to resonate with the other\'s emotional world', daily: 'talking about feelings may be easy without the conversation becoming heavy', benefit: 'making room for mutual understanding', tip: 'make time for calm conversations about what matters'},
    hard: {story: 'what one says logically may be received emotionally by the other', daily: 'a practical comment may feel cold, or an emotional reaction seem excessive', misunderstanding: 'tone mattering more than content', needX: '{X} may need to watch the tone on sensitive topics', needY: '{Y} may need to separate intention from wording', action: 'when something hurts, say "what I heard was…" and check the intention'}}},
  'Moon|Venus': {area: 'affection', es: {
    title: ['Ternura que se reconoce', 'Dos lenguajes de cariño'],
    easy: {story: 'la forma de dar cariño de uno coincide con lo que el otro necesita recibir', daily: 'los detalles cotidianos pueden sentirse acertados y fáciles de valorar', benefit: 'cultivar gestos de aprecio recíproco', tip: 'sigan nombrando los gestos que les hacen sentir queridos'},
    hard: {story: 'ambos pueden querer de verdad, pero expresar y recibir el cariño de maneras diferentes', daily: 'un gesto pensado con cariño puede pasar desapercibido para el otro', misunderstanding: 'creer que el otro no se esfuerza cuando solo usa otro lenguaje', needX: '{X} puede necesitar preguntarle a {Y} cómo prefiere recibir cariño', needY: '{Y} puede necesitar reconocer los gestos de {X} aunque no sean los que esperaba', action: 'hagan una lista breve de tres gestos que cada uno valora y compártanla'}},
    en: {title: ['Tenderness that is recognised', 'Two love languages'],
    easy: {story: 'one person\'s way of giving affection matches what the other needs to receive', daily: 'everyday details may feel right and easy to appreciate', benefit: 'affection that feels reciprocal', tip: 'keep naming the gestures that make you feel loved'},
    hard: {story: 'both may care deeply, yet express and receive affection differently', daily: 'a caring gesture may go unnoticed by the other', misunderstanding: 'thinking the other does not try when they simply use another language', needX: '{X} may need to ask how {Y} prefers to receive affection', needY: '{Y} may need to recognise {X}\'s gestures even if unexpected', action: 'each write a short list of three gestures you value and share it'}}},
  'Venus|Venus': {area: 'values', es: {
    title: ['Gustos y valores compartidos', 'Dos formas de disfrutar'],
    easy: {story: 'comparten una sensibilidad parecida sobre lo que es bello, agradable o valioso', daily: 'elegir planes, música o lugares puede resultar sencillo', benefit: 'disfrute compartido y facilidad para acordar', tip: 'cultiven actividades que ambos disfrutan como un espacio propio'},
    hard: {story: 'sus gustos y prioridades pueden ser distintos', daily: 'decidir un plan o cómo gastar el tiempo libre puede requerir negociar', misunderstanding: 'que una diferencia de gustos se tome como rechazo personal', needX: '{X} puede necesitar abrirse a lo que disfruta {Y}', needY: '{Y} puede necesitar compartir por qué algo le importa', action: 'alternen la elección de planes y descubran algo nuevo del mundo del otro'}},
    en: {title: ['Shared tastes and values', 'Two ways of enjoying'],
    easy: {story: 'you share a similar sense of what is beautiful, pleasant or valuable', daily: 'choosing plans, music or places may be easy', benefit: 'shared enjoyment and easy agreement', tip: 'cultivate activities you both enjoy as your own space'},
    hard: {story: 'your tastes and priorities may differ', daily: 'deciding a plan or how to spend free time may need negotiation', misunderstanding: 'a difference of taste taken as personal rejection', needX: '{X} may need to open up to what {Y} enjoys', needY: '{Y} may need to share why something matters', action: 'take turns choosing plans and discover something new in each other\'s world'}}},
  'Mars|Mars': {area: 'conflict', es: {
    title: ['Dos energías en movimiento', 'Cuando ambos quieren tomar la iniciativa'],
    easy: {story: 'sus formas de actuar se complementan: pueden emprender cosas juntos con buen ritmo', daily: 'proyectos, deportes o mudanzas pueden fluir como trabajo en equipo', benefit: 'capacidad de hacer equipo y avanzar', tip: 'elijan un proyecto compartido con un objetivo concreto'},
    hard: {story: 'ambos tienen formas de actuar fuertes que pueden chocar cuando quieren cosas distintas', daily: 'en desacuerdos, la discusión puede escalar rápido', misunderstanding: 'que la firmeza del otro se tome como ataque', needX: '{X} puede necesitar pausar antes de responder en caliente', needY: '{Y} puede necesitar decir qué le molesta antes de que crezca', action: 'acuerden una señal para pausar una discusión y retomarla con calma'}},
    en: {title: ['Two energies in motion', 'When both want to lead'],
    easy: {story: 'your ways of acting complement each other: you can take things on together at a good pace', daily: 'projects, sports or moves may flow as teamwork', benefit: 'teamwork and momentum', tip: 'choose a shared project with a concrete goal'},
    hard: {story: 'both have strong ways of acting that can clash when you want different things', daily: 'in disagreements, arguments may escalate quickly', misunderstanding: 'the other\'s firmness taken as an attack', needX: '{X} may need to pause before replying in the heat of the moment', needY: '{Y} may need to say what bothers them before it grows', action: 'agree on a signal to pause an argument and resume it calmly'}}},
  'Saturn|Sun': {area: 'commitment', es: {
    title: ['Estructura y compromiso', 'Entre el apoyo y la exigencia'],
    easy: {story: 'uno puede aportar estructura y constancia a los objetivos del otro', daily: 'pueden ayudarse a cumplir metas y organizar responsabilidades', benefit: 'sensación de solidez y de construir a largo plazo', tip: 'definan juntos una meta concreta y revisen avances'},
    hard: {story: 'el sentido de responsabilidad de uno puede sentirse como exigencia para la identidad del otro', daily: 'puede aparecer la sensación de examen o de tener que rendir cuentas', misunderstanding: 'que el cuidado práctico se lea como crítica', needX: '{X} puede necesitar decir cuándo siente presión', needY: '{Y} puede necesitar acompañar sin corregir', action: 'acompañen cada sugerencia con un reconocimiento concreto'}},
    en: {title: ['Structure and commitment', 'Between support and demand'],
    easy: {story: 'one can bring structure and constancy to the other\'s goals', daily: 'you can help each other meet goals and organise responsibilities', benefit: 'a sense of solidity and building long term', tip: 'define a concrete shared goal and review progress'},
    hard: {story: 'one\'s sense of responsibility may feel like pressure on the other\'s identity', daily: 'there may be a feeling of being evaluated or having to report back', misunderstanding: 'practical care read as criticism', needX: '{X} may need to say when they feel pressured', needY: '{Y} may need to support without correcting', action: 'pair every suggestion with a concrete acknowledgement'}}},
  'Moon|Saturn': {area: 'trust', es: {
    title: ['Cuidar con responsabilidad', 'Seguridad que se construye'],
    easy: {story: 'uno puede ofrecer estabilidad y el otro sentirse emocionalmente sostenido', daily: 'en momentos difíciles, la presencia constante de uno puede dar calma', benefit: 'confianza y lealtad a largo plazo', tip: 'agradezcan explícitamente la constancia que se ofrecen'},
    hard: {story: 'la prudencia de uno puede sentirse distante para las necesidades emocionales del otro', daily: 'uno puede necesitar cercanía cuando el otro responde con soluciones o silencio', misunderstanding: 'que la contención se lea como frialdad', needX: '{X} puede necesitar mostrar el afecto, no solo la responsabilidad', needY: '{Y} puede necesitar reconocer el cuidado detrás de la seriedad', action: 'pregunten «¿quieres que te escuche o que te ayude a resolver?»'}},
    en: {title: ['Caring with responsibility', 'Security that is built'],
    easy: {story: 'one can offer stability and the other feel emotionally held', daily: 'in hard moments, one\'s steady presence may bring calm', benefit: 'cultivating trust and consistency over time', tip: 'thank each other explicitly for that constancy'},
    hard: {story: 'one\'s caution may feel distant to the other\'s emotional needs', daily: 'one may need closeness while the other responds with solutions or silence', misunderstanding: 'restraint read as coldness', needX: '{X} may need to show affection, not only responsibility', needY: '{Y} may need to recognise the care behind the seriousness', action: 'ask "do you want me to listen or to help you solve it?"'}}},
  'Saturn|Venus': {area: 'commitment', es: {
    title: ['Un cariño que busca durar', 'Afecto y prudencia'],
    easy: {story: 'el afecto puede tomar forma de compromiso: uno valora y el otro sostiene', daily: 'pueden construir costumbres y acuerdos que les den seguridad', benefit: 'estabilidad afectiva', tip: 'conversen sobre qué significa compromiso para cada uno'},
    hard: {story: 'la forma de querer de uno puede encontrarse con la prudencia del otro', daily: 'uno puede querer más expresividad y el otro avanzar con cautela', misunderstanding: 'que la prudencia se interprete como poco interés', needX: '{X} puede necesitar paciencia con los tiempos de {Y}', needY: '{Y} puede necesitar mostrar con gestos concretos que el vínculo le importa', action: 'hablen de expectativas de tiempo y de compromiso sin presionarse'}},
    en: {title: ['Affection that seeks to last', 'Love and caution'],
    easy: {story: 'affection can take the form of commitment: one values, the other sustains', daily: 'you can build habits and agreements that give security', benefit: 'emotional stability', tip: 'talk about what commitment means to each of you'},
    hard: {story: 'one\'s way of loving may meet the other\'s caution', daily: 'one may want more expressiveness while the other moves carefully', misunderstanding: 'caution interpreted as little interest', needX: '{X} may need patience with {Y}\'s timing', needY: '{Y} may need to show with concrete gestures that the bond matters', action: 'talk about expectations of time and commitment without pressure'}}},
  'Jupiter|Sun': {area: 'growth', es: {
    title: ['Se impulsan a crecer', 'Optimismo compartido'],
    easy: {story: 'uno puede animar y ampliar los horizontes del otro', daily: 'pueden motivarse a aprender, viajar o intentar cosas nuevas', benefit: 'explorar la confianza y el aprendizaje compartido', tip: 'planeen una experiencia nueva que ninguno haya vivido'},
    hard: {story: 'el entusiasmo de uno puede sentirse excesivo para el otro', daily: 'pueden surgir planes grandes que luego cuesta concretar', misunderstanding: 'que el optimismo se lea como falta de realismo', needX: '{X} puede necesitar aterrizar los planes', needY: '{Y} puede necesitar valorar la visión de {X}', action: 'conviertan cada gran idea en un primer paso concreto'}},
    en: {title: ['You push each other to grow', 'Shared optimism'],
    easy: {story: 'one can encourage and broaden the other\'s horizons', daily: 'you may motivate each other to learn, travel or try new things', benefit: 'confidence and mutual growth', tip: 'plan a new experience neither of you has had'},
    hard: {story: 'one\'s enthusiasm may feel excessive to the other', daily: 'big plans may arise that are hard to carry out', misunderstanding: 'optimism read as lack of realism', needX: '{X} may need to ground plans', needY: '{Y} may need to value {X}\'s vision', action: 'turn each big idea into a concrete first step'}}},
  'Sun|Sun': {area: 'identity', es: {
    title: ['Dos identidades que se reconocen', 'Dos centros de gravedad'],
    easy: {story: 'sus formas de ser tienden a reconocerse y respetarse', daily: 'pueden apoyar los proyectos del otro sin sentirse amenazados', benefit: 'respeto mutuo por la individualidad', tip: 'celebren los logros individuales del otro'},
    hard: {story: 'cada uno tiene un centro propio fuerte, y a veces ambos quieren protagonismo', daily: 'decidir quién lidera puede generar roces', misunderstanding: 'que la autoafirmación del otro se lea como competencia', needX: '{X} puede necesitar ceder protagonismo a veces', needY: '{Y} puede necesitar reconocer el valor de {X} en voz alta', action: 'repártanse áreas donde cada uno lidera'}},
    en: {title: ['Two identities that recognise each other', 'Two centres of gravity'],
    easy: {story: 'your ways of being tend to recognise and respect each other', daily: 'you can support each other\'s projects without feeling threatened', benefit: 'mutual respect for individuality', tip: 'celebrate each other\'s individual achievements'},
    hard: {story: 'each has a strong centre, and sometimes both want the spotlight', daily: 'deciding who leads may cause friction', misunderstanding: 'the other\'s self-assertion read as competition', needX: '{X} may need to share the spotlight sometimes', needY: '{Y} may need to acknowledge {X}\'s value out loud', action: 'divide areas where each of you leads'}}},
  'Ascendant|Venus': {area: 'attraction', es: {
    title: ['Agrado a primera vista', 'Lo que se ve y lo que se valora'],
    easy: {story: 'la forma de presentarse de uno suele resultar agradable para la sensibilidad del otro', daily: 'puede haber una sensación de agrado espontáneo al estar juntos', benefit: 'calidez en el trato cotidiano', tip: 'díganse lo que aprecian del otro con frecuencia'},
    hard: {story: 'la forma de presentarse de uno no siempre coincide con lo que el otro valora', daily: 'puede haber primeras impresiones que no reflejan lo que cada uno siente', misunderstanding: 'juzgar por el estilo en lugar de por la intención', needX: '{X} puede necesitar mostrar más de lo que hay detrás de su estilo', needY: '{Y} puede necesitar mirar más allá de la primera impresión', action: 'compartan algo de ustedes que normalmente no muestran'}},
    en: {title: ['Liking at first sight', 'What is seen and what is valued'],
    easy: {story: 'one\'s way of presenting tends to please the other\'s sensibility', daily: 'there may be a spontaneous sense of liking when together', benefit: 'warmth in everyday interaction', tip: 'tell each other often what you appreciate'},
    hard: {story: 'one\'s way of presenting may not match what the other values', daily: 'first impressions may not reflect what each feels', misunderstanding: 'judging style instead of intention', needX: '{X} may need to show more of what lies behind their style', needY: '{Y} may need to look beyond first impressions', action: 'share something about yourselves you do not usually show'}}},
};
// Which body's owner is {X} in each library entry (the other is {Y}). Same-body pairs: person A is {X}.
const X_BODY = {'Moon|Sun': 'Sun', 'Mars|Venus': 'Mars', 'Mercury|Moon': 'Mercury', 'Moon|Venus': 'Venus', 'Saturn|Sun': 'Sun', 'Moon|Saturn': 'Saturn', 'Saturn|Venus': 'Venus', 'Jupiter|Sun': 'Jupiter', 'Ascendant|Venus': 'Ascendant'};
for (const [k, v] of Object.entries(CROSS_PAIRS)) v.x = X_BODY[k] ?? null;
// Dedicated bilingual readings; no aliases between distinct contacts.
Object.assign(CROSS_PAIRS, {
  "Jupiter|Moon": {
    "x": "Jupiter",
    "area": "emotional",
    "es": {
      "title": [
        "Entusiasmo que deja espacio a sentir",
        "Optimismo y necesidades emocionales"
      ],
      "easy": {
        "story": "{X} podría aportar perspectiva cuando {Y} necesita apoyo",
        "daily": "al compartir una preocupación, podrían explorar alternativas sin apresurar la conversación",
        "benefit": "acompañarse sin minimizar lo que sienten",
        "tip": "pregunten si necesitan escucha o ideas"
      },
      "hard": {
        "story": "el entusiasmo de {X} podría no coincidir con el ritmo emocional de {Y}",
        "daily": "una preocupación podría recibir soluciones antes de ser escuchada",
        "misunderstanding": "confundir una invitación a mirar adelante con falta de atención",
        "needX": "escuchar antes de ofrecer soluciones",
        "needY": "explicar qué apoyo necesita",
        "action": "acuerden cuándo escuchar y cuándo sugerir"
      }
    },
    "en": {
      "title": [
        "Optimism with room for feelings",
        "Optimism and emotional needs"
      ],
      "easy": {
        "story": "{X} might offer perspective when {Y} needs support",
        "daily": "when sharing a concern, they could explore options without rushing the conversation",
        "benefit": "support without minimizing feelings",
        "tip": "ask whether listening or ideas would help"
      },
      "hard": {
        "story": "{X}'s optimism might not match {Y}'s emotional pace",
        "daily": "a concern might receive solutions before being heard",
        "misunderstanding": "mistaking encouragement for inattention",
        "needX": "listen before offering solutions",
        "needY": "say what support would help",
        "action": "agree when to listen and when to suggest"
      }
    }
  },
  "Jupiter|Venus": {
    "x": "Jupiter",
    "area": "growth",
    "es": {
      "title": [
        "Compartir nuevos descubrimientos",
        "Generosidad y preferencias"
      ],
      "easy": {
        "story": "{X} podría estimular a {Y} a explorar nuevos gustos y experiencias",
        "daily": "al elegir un paseo, pueden combinar algo familiar con algo nuevo",
        "benefit": "curiosidad compartida",
        "tip": "alternen quién propone una actividad"
      },
      "hard": {
        "story": "las propuestas de {X} podrían exceder las preferencias o recursos de {Y}",
        "daily": "un plan ambicioso podría necesitar ajustes",
        "misunderstanding": "confundir moderación con falta de entusiasmo",
        "needX": "consultar preferencias antes de ampliar un plan",
        "needY": "expresar límites sin descalificar la idea",
        "action": "acuerden un plan y un presupuesto cómodos"
      }
    },
    "en": {
      "title": [
        "Discovering new things together",
        "Generosity and preferences"
      ],
      "easy": {
        "story": "{X} might encourage {Y} to explore new tastes and experiences",
        "daily": "when choosing an outing, they could combine something familiar with something new",
        "benefit": "shared curiosity",
        "tip": "take turns proposing an activity"
      },
      "hard": {
        "story": "{X}'s suggestions might exceed {Y}'s preferences or resources",
        "daily": "an ambitious plan might need adjustments",
        "misunderstanding": "mistaking moderation for lack of enthusiasm",
        "needX": "check preferences before expanding a plan",
        "needY": "express limits without dismissing the idea",
        "action": "agree on a comfortable plan and budget"
      }
    }
  },
  "Ascendant|Moon": {
    "x": "Ascendant",
    "area": "emotional",
    "es": {
      "title": [
        "Presencia que invita a conversar",
        "Primera impresión y sensibilidad"
      ],
      "easy": {
        "story": "la manera de presentarse de {X} podría facilitar que {Y} exprese lo que siente",
        "daily": "al reencontrarse después de un día difícil, un saludo atento podría abrir una conversación",
        "benefit": "comodidad para compartir experiencias",
        "tip": "pregunten cómo llega cada persona al encuentro"
      },
      "hard": {
        "story": "la expresión exterior de {X} podría no reflejar lo que {Y} necesita en ese momento",
        "daily": "una respuesta breve podría parecer distante",
        "misunderstanding": "confundir un gesto visible con una intención",
        "needX": "preguntar en lugar de interpretar el silencio",
        "needY": "explicar qué gesto sería útil",
        "action": "acuerden una señal para pedir tiempo o compañía"
      }
    },
    "en": {
      "title": [
        "A presence that invites conversation",
        "First impressions and sensitivity"
      ],
      "easy": {
        "story": "{X}'s way of presenting themselves might help {Y} share feelings",
        "daily": "meeting after a difficult day, an attentive greeting could open a conversation",
        "benefit": "comfort sharing experiences",
        "tip": "ask how each person is arriving at the meeting"
      },
      "hard": {
        "story": "{X}'s outward expression might not match what {Y} needs at that moment",
        "daily": "a brief response might seem distant",
        "misunderstanding": "mistaking a visible gesture for an intention",
        "needX": "ask instead of interpreting silence",
        "needY": "explain which gesture would help",
        "action": "agree on a signal for time or company"
      }
    }
  },
  "Ascendant|Sun": {
    "x": "Ascendant",
    "area": "stability",
    "es": {
      "title": [
        "Reconocer estilos y propósitos",
        "Imagen exterior e identidad"
      ],
      "easy": {
        "story": "la presencia de {X} podría facilitar que {Y} exprese sus prioridades",
        "daily": "al presentar un proyecto, pueden explorar cómo comunicarlo a otras personas",
        "benefit": "respeto por maneras distintas de mostrarse",
        "tip": "compartan algo que les importa y cómo prefieren expresarlo"
      },
      "hard": {
        "story": "la imagen de {X} podría contrastar con las prioridades de {Y}",
        "daily": "al organizar una reunión, pueden preferir estilos diferentes",
        "misunderstanding": "confundir estilo social con valores personales",
        "needX": "dar espacio a las prioridades ajenas",
        "needY": "explicar sus objetivos sin juzgar las formas",
        "action": "distingan qué quieren lograr de cómo presentarlo"
      }
    },
    "en": {
      "title": [
        "Recognizing styles and purpose",
        "Outward style and identity"
      ],
      "easy": {
        "story": "{X}'s presence might help {Y} express their priorities",
        "daily": "when introducing a project, they could explore how to communicate it to others",
        "benefit": "respect for different ways of showing up",
        "tip": "share something that matters and how you prefer to express it"
      },
      "hard": {
        "story": "{X}'s outward style might contrast with {Y}'s priorities",
        "daily": "when organizing a gathering, they might prefer different styles",
        "misunderstanding": "mistaking social style for personal values",
        "needX": "make space for the other's priorities",
        "needY": "explain goals without judging presentation",
        "action": "separate what you want to achieve from how you present it"
      }
    }
  },
  "Sun|Venus": {
    "x": "Sun",
    "area": "affection",
    "es": {
      "title": [
        "Apreciar lo que importa",
        "Identidad y formas de valorar"
      ],
      "easy": {
        "story": "las prioridades de {X} podrían encontrar reconocimiento en los gestos de {Y}",
        "daily": "al celebrar un logro, pueden descubrir qué tipo de reconocimiento resulta significativo",
        "benefit": "apreciación de intereses individuales",
        "tip": "pregunten qué gestos les hacen sentir que su esfuerzo importa"
      },
      "hard": {
        "story": "las prioridades de {X} podrían diferir de lo que {Y} considera una muestra de aprecio",
        "daily": "un regalo o un plan podría no expresar el mensaje esperado",
        "misunderstanding": "confundir una diferencia de gustos con desinterés",
        "needX": "reconocer el gesto sin renunciar a sus preferencias",
        "needY": "preguntar qué forma de reconocimiento resulta útil",
        "action": "compartan ejemplos de gestos apreciados"
      }
    },
    "en": {
      "title": [
        "Appreciating what matters",
        "Identity and ways of valuing"
      ],
      "easy": {
        "story": "{X}'s priorities might find recognition in {Y}'s gestures",
        "daily": "when celebrating an achievement, they could discover which recognition feels meaningful",
        "benefit": "appreciation of individual interests",
        "tip": "ask which gestures make your efforts feel valued"
      },
      "hard": {
        "story": "{X}'s priorities might differ from what {Y} sees as appreciation",
        "daily": "a gift or a plan might not convey the intended message",
        "misunderstanding": "mistaking different tastes for indifference",
        "needX": "recognize the gesture without abandoning preferences",
        "needY": "ask which recognition would help",
        "action": "share examples of appreciated gestures"
      }
    }
  },
  "Ascendant|Mars": {
    "x": "Mars",
    "area": "conflict",
    "es": {
      "title": [
        "Iniciativa que encuentra respuesta",
        "Acción y presencia"
      ],
      "easy": {
        "story": "la iniciativa de {X} podría combinarse con la manera de actuar en público de {Y}",
        "daily": "al organizar una salida, pueden acordar quién propone y quién coordina",
        "benefit": "colaboración con espacio para ambos",
        "tip": "alternen el liderazgo en actividades sencillas"
      },
      "hard": {
        "story": "la rapidez de {X} podría contrastar con la forma en que {Y} prefiere participar",
        "daily": "un cambio de plan podría requerir una pausa",
        "misunderstanding": "confundir una propuesta con una exigencia",
        "needX": "consultar antes de actuar",
        "needY": "expresar su ritmo y sus límites",
        "action": "acuerden qué decisiones requieren consenso"
      }
    },
    "en": {
      "title": [
        "Initiative that finds a response",
        "Action and presence"
      ],
      "easy": {
        "story": "{X}'s initiative might complement {Y}'s outward approach",
        "daily": "when organizing an outing, they could agree who proposes and who coordinates",
        "benefit": "collaboration with room for both",
        "tip": "alternate leadership in simple activities"
      },
      "hard": {
        "story": "{X}'s pace might contrast with how {Y} prefers to participate",
        "daily": "a change of plans might require a pause",
        "misunderstanding": "mistaking a suggestion for a demand",
        "needX": "check before acting",
        "needY": "express pace and limits",
        "action": "agree which decisions need consensus"
      }
    }
  },
  "Mars|Sun": {
    "x": "Sun",
    "area": "conflict",
    "es": {
      "title": [
        "De la idea a la acción",
        "Dirección y ritmo"
      ],
      "easy": {
        "story": "{X} podría aportar dirección mientras {Y} propone un primer paso",
        "daily": "al planear un proyecto, pueden distinguir el objetivo de las tareas",
        "benefit": "iniciativa coordinada",
        "tip": "acuerden una meta y una acción pequeña"
      },
      "hard": {
        "story": "las prioridades de {X} podrían chocar con el ritmo de acción de {Y}",
        "daily": "una decisión podría requerir más reflexión antes de actuar",
        "misunderstanding": "confundir una pausa con desinterés o una propuesta con presión",
        "needX": "explicar qué necesita decidir",
        "needY": "consultar antes de acelerar",
        "action": "definan un momento para decidir juntos"
      }
    },
    "en": {
      "title": [
        "From idea to action",
        "Direction and pace"
      ],
      "easy": {
        "story": "{X} might provide direction while {Y} proposes a first step",
        "daily": "when planning a project, they can distinguish the goal from the tasks",
        "benefit": "coordinated initiative",
        "tip": "agree on a goal and one small action"
      },
      "hard": {
        "story": "{X}'s priorities might clash with {Y}'s pace of action",
        "daily": "a decision might need more reflection before action",
        "misunderstanding": "mistaking a pause for indifference or a proposal for pressure",
        "needX": "explain what needs deciding",
        "needY": "check before speeding up",
        "action": "set a time to decide together"
      }
    }
  },
  "Mercury|Venus": {
    "x": "Mercury",
    "area": "communication",
    "es": {
      "title": [
        "Palabras que expresan aprecio",
        "Ideas y formas de cuidar"
      ],
      "easy": {
        "story": "{X} podría encontrar palabras para reconocer lo que {Y} valora",
        "daily": "al comentar una experiencia, pueden conectar ideas con preferencias",
        "benefit": "conversaciones atentas",
        "tip": "describan un gesto que apreciaron"
      },
      "hard": {
        "story": "el estilo verbal de {X} podría diferir de la sensibilidad de {Y}",
        "daily": "una crítica práctica podría recibirse como una valoración personal",
        "misunderstanding": "confundir desacuerdo con falta de aprecio",
        "needX": "separar observaciones de juicios",
        "needY": "explicar cómo recibió el mensaje",
        "action": "reformulen una frase difícil sin perder su sentido"
      }
    },
    "en": {
      "title": [
        "Words that express appreciation",
        "Ideas and ways of caring"
      ],
      "easy": {
        "story": "{X} might find words to acknowledge what {Y} values",
        "daily": "when discussing an experience, they could connect ideas with preferences",
        "benefit": "thoughtful conversations",
        "tip": "describe a gesture you appreciated"
      },
      "hard": {
        "story": "{X}'s verbal style might differ from {Y}'s sensitivity",
        "daily": "practical feedback might be received as a personal judgment",
        "misunderstanding": "mistaking disagreement for lack of appreciation",
        "needX": "separate observations from judgments",
        "needY": "explain how the message landed",
        "action": "rephrase a difficult sentence without losing its meaning"
      }
    }
  },
  "Neptune|Venus": {
    "x": "Venus",
    "area": "affection",
    "es": {
      "title": [
        "Imaginación y gestos de cuidado",
        "Expectativas e idealización"
      ],
      "easy": {
        "story": "los valores de {X} podrían encontrar inspiración en la imaginación de {Y}",
        "daily": "pueden explorar música, arte o planes creativos",
        "benefit": "sensibilidad compartida",
        "tip": "elijan una actividad creativa y comenten qué disfrutaron"
      },
      "hard": {
        "story": "las preferencias de {X} podrían no coincidir con las imágenes que construye {Y}",
        "daily": "una expectativa no expresada podría provocar confusión",
        "misunderstanding": "confundir una ilusión con un acuerdo",
        "needX": "expresar preferencias concretas",
        "needY": "distinguir lo imaginado de lo acordado",
        "action": "verifiquen expectativas antes de hacer planes"
      }
    },
    "en": {
      "title": [
        "Imagination and caring gestures",
        "Expectations and idealization"
      ],
      "easy": {
        "story": "{X}'s values might find inspiration in {Y}'s imagination",
        "daily": "they might explore music, art or creative plans",
        "benefit": "shared sensitivity",
        "tip": "choose a creative activity and discuss what you enjoyed"
      },
      "hard": {
        "story": "{X}'s preferences might differ from the images {Y} builds",
        "daily": "an unspoken expectation might create confusion",
        "misunderstanding": "mistaking an imagined possibility for an agreement",
        "needX": "express concrete preferences",
        "needY": "distinguish imagination from agreement",
        "action": "check expectations before making plans"
      }
    }
  },
  "Moon|Pluto": {
    "x": "Moon",
    "area": "emotional",
    "es": {
      "title": [
        "Conversaciones con profundidad",
        "Intensidad y espacio emocional"
      ],
      "easy": {
        "story": "{X} podría encontrar espacio para explorar emociones junto a la intensidad simbólica de {Y}",
        "daily": "una conversación importante podría invitar a escuchar con paciencia",
        "benefit": "reflexión emocional",
        "tip": "pregunten cuánto quieren compartir en ese momento"
      },
      "hard": {
        "story": "las necesidades emocionales de {X} podrían requerir un ritmo distinto de la intensidad de {Y}",
        "daily": "un tema delicado podría necesitar una pausa",
        "misunderstanding": "confundir profundidad con obligación de revelar algo",
        "needX": "marcar cuánto quiere compartir",
        "needY": "respetar los límites de la conversación",
        "action": "acuerden que cualquier persona puede detener un tema"
      }
    },
    "en": {
      "title": [
        "Conversations with depth",
        "Intensity and emotional space"
      ],
      "easy": {
        "story": "{X} might find room to explore feelings alongside {Y}'s symbolic intensity",
        "daily": "an important conversation could invite patient listening",
        "benefit": "emotional reflection",
        "tip": "ask how much you want to share right now"
      },
      "hard": {
        "story": "{X}'s emotional needs might require a different pace from {Y}'s intensity",
        "daily": "a delicate subject might need a pause",
        "misunderstanding": "mistaking depth for an obligation to disclose",
        "needX": "state how much they wish to share",
        "needY": "respect conversational boundaries",
        "action": "agree either person can pause a topic"
      }
    }
  },
  "Sun|Uranus": {
    "x": "Sun",
    "area": "independence",
    "es": {
      "title": [
        "Identidad y nuevas posibilidades",
        "Autonomía y continuidad"
      ],
      "easy": {
        "story": "{Y} podría invitar a {X} a considerar caminos alternativos para sus proyectos",
        "daily": "al revisar una rutina, pueden probar una opción nueva",
        "benefit": "flexibilidad sin perder dirección",
        "tip": "elijan un cambio reversible para experimentar"
      },
      "hard": {
        "story": "la búsqueda de continuidad de {X} podría contrastar con la apertura al cambio de {Y}",
        "daily": "un cambio inesperado podría necesitar conversación previa",
        "misunderstanding": "confundir autonomía con falta de consideración",
        "needX": "explicar qué desea conservar",
        "needY": "avisar antes de alterar acuerdos",
        "action": "distingan decisiones individuales de compromisos compartidos"
      }
    },
    "en": {
      "title": [
        "Identity and new possibilities",
        "Autonomy and continuity"
      ],
      "easy": {
        "story": "{Y} might invite {X} to consider alternative paths for their projects",
        "daily": "when reviewing a routine, they could try a new option",
        "benefit": "flexibility without losing direction",
        "tip": "choose a reversible change to try"
      },
      "hard": {
        "story": "{X}'s search for continuity might contrast with {Y}'s openness to change",
        "daily": "an unexpected change might need prior discussion",
        "misunderstanding": "mistaking autonomy for lack of consideration",
        "needX": "explain what they want to preserve",
        "needY": "give notice before changing agreements",
        "action": "distinguish individual decisions from shared commitments"
      }
    }
  },
  "Mars|Moon": {
    "x": "Moon",
    "area": "emotional",
    "es": {
      "title": [
        "Cuidado en movimiento",
        "Sentir y actuar a ritmos distintos"
      ],
      "easy": {
        "story": "{Y} podría convertir las necesidades expresadas por {X} en gestos concretos de apoyo",
        "daily": "en un día difícil, podrían organizar una ayuda práctica",
        "benefit": "apoyo respetuoso",
        "tip": "pregunten qué acción sería bienvenida"
      },
      "hard": {
        "story": "{Y} podría querer actuar antes de que {X} termine de expresar sus emociones",
        "daily": "un desacuerdo podría necesitar una pausa antes de buscar soluciones",
        "misunderstanding": "confundir urgencia con ayuda",
        "needX": "expresar si necesita tiempo",
        "needY": "consultar antes de intervenir",
        "action": "acuerden escuchar primero y actuar después"
      }
    },
    "en": {
      "title": [
        "Care in motion",
        "Feeling and acting at different speeds"
      ],
      "easy": {
        "story": "{Y} might turn needs expressed by {X} into concrete gestures of support",
        "daily": "on a difficult day, they could organize practical help",
        "benefit": "respectful support",
        "tip": "ask what action would be welcome"
      },
      "hard": {
        "story": "{Y} might want to act before {X} finishes expressing feelings",
        "daily": "a disagreement might need a pause before solutions",
        "misunderstanding": "mistaking urgency for help",
        "needX": "say if they need time",
        "needY": "check before intervening",
        "action": "agree to listen first and act second"
      }
    }
  },
  "Mars|Mercury": {
    "x": "Mercury",
    "area": "communication",
    "es": {
      "title": [
        "Ideas que se ponen en marcha",
        "Conversación y velocidad"
      ],
      "easy": {
        "story": "{X} podría ordenar ideas mientras {Y} explora cómo ejecutarlas",
        "daily": "al resolver una tarea, pueden repartir planificación y ejecución",
        "benefit": "decisiones conversadas",
        "tip": "resuman la propuesta antes de actuar"
      },
      "hard": {
        "story": "la rapidez de {Y} podría dificultar que {X} termine de explicar una idea",
        "daily": "en una discusión podrían interrumpirse sin querer",
        "misunderstanding": "confundir una objeción con un ataque",
        "needX": "formular una petición concreta",
        "needY": "dejar terminar antes de responder",
        "action": "usen turnos breves para explicar sus puntos"
      }
    },
    "en": {
      "title": [
        "Ideas put into action",
        "Conversation and speed"
      ],
      "easy": {
        "story": "{X} might organize ideas while {Y} explores how to act on them",
        "daily": "when solving a task, they can divide planning and execution",
        "benefit": "discussed decisions",
        "tip": "summarize the proposal before acting"
      },
      "hard": {
        "story": "{Y}'s speed might make it harder for {X} to finish explaining an idea",
        "daily": "in a discussion, interruptions could happen unintentionally",
        "misunderstanding": "mistaking an objection for an attack",
        "needX": "make a concrete request",
        "needY": "let the other finish before responding",
        "action": "use short turns to explain your views"
      }
    }
  },
  "Pluto|Venus": {
    "x": "Venus",
    "area": "affection",
    "es": {
      "title": [
        "Valorar con profundidad",
        "Aprecio y límites"
      ],
      "easy": {
        "story": "{X} podría explorar qué valora junto a la intensidad simbólica de {Y}",
        "daily": "al compartir una experiencia significativa, pueden hablar de lo que quieren cuidar",
        "benefit": "claridad sobre valores",
        "tip": "elijan un valor que quieran cultivar"
      },
      "hard": {
        "story": "las preferencias de {X} podrían requerir límites frente a la intensidad de {Y}",
        "daily": "una conversación muy personal podría necesitar consentimiento explícito",
        "misunderstanding": "confundir cercanía con acceso ilimitado",
        "needX": "decir qué desea mantener en privado",
        "needY": "respetar una negativa sin insistir",
        "action": "pregunten antes de profundizar en temas privados"
      }
    },
    "en": {
      "title": [
        "Valuing with depth",
        "Appreciation and boundaries"
      ],
      "easy": {
        "story": "{X} might explore what they value alongside {Y}'s symbolic intensity",
        "daily": "when sharing a meaningful experience, they can discuss what they want to care for",
        "benefit": "clarity about values",
        "tip": "choose one value to cultivate"
      },
      "hard": {
        "story": "{X}'s preferences might need boundaries alongside {Y}'s intensity",
        "daily": "a personal conversation might require explicit consent",
        "misunderstanding": "mistaking closeness for unlimited access",
        "needX": "say what they want to keep private",
        "needY": "respect a refusal without pressing",
        "action": "ask before exploring private topics"
      }
    }
  },
  "Neptune|Sun": {
    "x": "Sun",
    "area": "growth",
    "es": {
      "title": [
        "Propósito e imaginación",
        "Visión y claridad"
      ],
      "easy": {
        "story": "{Y} podría aportar imaginación a los proyectos que importan a {X}",
        "daily": "al diseñar un plan creativo, pueden combinar visión y pasos concretos",
        "benefit": "exploración creativa",
        "tip": "anoten una idea y una acción posible"
      },
      "hard": {
        "story": "la visión de {Y} podría no coincidir con los objetivos concretos de {X}",
        "daily": "un proyecto podría necesitar definiciones antes de comprometer recursos",
        "misunderstanding": "confundir una posibilidad con una promesa",
        "needX": "expresar prioridades verificables",
        "needY": "aclarar qué es una idea y qué es un acuerdo",
        "action": "escriban juntos el próximo paso"
      }
    },
    "en": {
      "title": [
        "Purpose and imagination",
        "Vision and clarity"
      ],
      "easy": {
        "story": "{Y} might bring imagination to projects that matter to {X}",
        "daily": "when designing a creative plan, they can combine vision and concrete steps",
        "benefit": "creative exploration",
        "tip": "write down one idea and one possible action"
      },
      "hard": {
        "story": "{Y}'s vision might not match {X}'s concrete goals",
        "daily": "a project might need definitions before committing resources",
        "misunderstanding": "mistaking a possibility for a promise",
        "needX": "express verifiable priorities",
        "needY": "clarify what is an idea and what is an agreement",
        "action": "write the next step together"
      }
    }
  },
  "Moon|Neptune": {
    "x": "Moon",
    "area": "emotional",
    "es": {
      "title": [
        "Imaginación y escucha",
        "Sensibilidad sin suposiciones"
      ],
      "easy": {
        "story": "{Y} podría aportar una perspectiva imaginativa al mundo emocional de {X}",
        "daily": "al compartir una historia, pueden preguntar qué significado tiene para cada persona",
        "benefit": "escucha curiosa",
        "tip": "pregunten antes de interpretar emociones"
      },
      "hard": {
        "story": "{Y} podría imaginar lo que siente {X} sin conocerlo",
        "daily": "un silencio podría admitir varias explicaciones",
        "misunderstanding": "confundir intuición con certeza",
        "needX": "nombrar lo que siente si quiere compartirlo",
        "needY": "verificar interpretaciones mediante preguntas",
        "action": "cambien las suposiciones por preguntas abiertas"
      }
    },
    "en": {
      "title": [
        "Imagination and listening",
        "Sensitivity without assumptions"
      ],
      "easy": {
        "story": "{Y} might bring an imaginative perspective to {X}'s emotional world",
        "daily": "when sharing a story, they can ask what it means to each person",
        "benefit": "curious listening",
        "tip": "ask before interpreting feelings"
      },
      "hard": {
        "story": "{Y} might imagine what {X} feels without knowing",
        "daily": "silence might have several explanations",
        "misunderstanding": "mistaking intuition for certainty",
        "needX": "name feelings if they wish to share",
        "needY": "check interpretations through questions",
        "action": "replace assumptions with open questions"
      }
    }
  },
  "Mercury|Saturn": {
    "x": "Mercury",
    "area": "communication",
    "es": {
      "title": [
        "Ideas con estructura",
        "Expresión y exigencia"
      ],
      "easy": {
        "story": "{Y} podría ayudar a {X} a organizar una idea compleja",
        "daily": "al preparar un proyecto, pueden revisar detalles y prioridades",
        "benefit": "claridad y planificación",
        "tip": "distingan una lluvia de ideas de una revisión"
      },
      "hard": {
        "story": "el énfasis de {Y} en los detalles podría contrastar con el ritmo de pensamiento de {X}",
        "daily": "una corrección temprana podría interrumpir una explicación",
        "misunderstanding": "confundir revisión con descalificación",
        "needX": "explicar cuándo quiere comentarios",
        "needY": "preguntar antes de corregir",
        "action": "acuerden una fase para proponer y otra para revisar"
      }
    },
    "en": {
      "title": [
        "Ideas with structure",
        "Expression and expectations"
      ],
      "easy": {
        "story": "{Y} might help {X} organize a complex idea",
        "daily": "when preparing a project, they can review details and priorities",
        "benefit": "clarity and planning",
        "tip": "separate brainstorming from review"
      },
      "hard": {
        "story": "{Y}'s emphasis on details might contrast with {X}'s thinking pace",
        "daily": "early correction could interrupt an explanation",
        "misunderstanding": "mistaking review for dismissal",
        "needX": "say when feedback is wanted",
        "needY": "ask before correcting",
        "action": "agree on a proposing phase and a reviewing phase"
      }
    }
  },
  "Mars|Saturn": {
    "x": "Mars",
    "area": "stability",
    "es": {
      "title": [
        "Energía con dirección",
        "Iniciativa y prudencia"
      ],
      "easy": {
        "story": "{X} podría aportar movimiento mientras {Y} ayuda a ordenar los pasos",
        "daily": "al iniciar una tarea larga, pueden repartir acción y seguimiento",
        "benefit": "constancia compartida",
        "tip": "acuerden un objetivo pequeño con fecha de revisión"
      },
      "hard": {
        "story": "la iniciativa de {X} podría encontrar límites en la prudencia de {Y}",
        "daily": "un plan urgente podría requerir revisar recursos",
        "misunderstanding": "confundir cautela con rechazo o rapidez con imprudencia",
        "needX": "explicar la urgencia",
        "needY": "explicar la razón de un límite",
        "action": "acuerden qué puede comenzar hoy y qué necesita revisión"
      }
    },
    "en": {
      "title": [
        "Energy with direction",
        "Initiative and caution"
      ],
      "easy": {
        "story": "{X} might bring momentum while {Y} helps organize the steps",
        "daily": "when starting a long task, they can divide action and follow-up",
        "benefit": "shared consistency",
        "tip": "agree on a small goal and review date"
      },
      "hard": {
        "story": "{X}'s initiative might meet limits in {Y}'s caution",
        "daily": "an urgent plan might need a resource review",
        "misunderstanding": "mistaking caution for rejection or speed for recklessness",
        "needX": "explain the urgency",
        "needY": "explain the reason for a limit",
        "action": "agree what can start today and what needs review"
      }
    }
  }
});
// Domain phrases with Spanish article, for generic cross readings.
export const DOMAINS_ART = {
  es: {Sun: 'la identidad', Moon: 'el mundo emocional', Mercury: 'la forma de pensar', Venus: 'la forma de querer', Mars: 'el impulso', Jupiter: 'el afán de crecer', Saturn: 'el sentido de responsabilidad', Uranus: 'la necesidad de libertad', Neptune: 'la imaginación', Pluto: 'la intensidad', Ascendant: 'la forma de presentarse', Midheaven: 'las aspiraciones'},
  en: {Sun: 'identity', Moon: 'emotional world', Mercury: 'way of thinking', Venus: 'way of loving', Mars: 'drive', Jupiter: 'wish to grow', Saturn: 'sense of responsibility', Uranus: 'need for freedom', Neptune: 'imagination', Pluto: 'intensity', Ascendant: 'way of presenting themselves', Midheaven: 'aspirations'},
};

// Friendship rewording for romantic pairs.
export const FRIENDSHIP_OVERRIDE = {
  es: {title: ['Energía y gustos que se activan', 'Ritmos distintos de acción'], easy: {story: 'los gustos de uno y la energía del otro se encuentran con naturalidad, lo que suele sentirse como diversión compartida', daily: 'puede notarse en las ganas de proponer planes juntos', benefit: 'complicidad y alegría en la amistad', tip: 'reserven tiempo para planes nuevos que ambos disfruten'}, hard: {story: 'la forma de disfrutar de uno y el ritmo de acción del otro pueden no ir sincronizados', daily: 'uno puede querer actuar rápido mientras el otro prefiere disfrutar con calma', misunderstanding: 'que la iniciativa se viva como presión o la calma como desinterés', needX: '{X} puede necesitar respetar el ritmo de {Y}', needY: '{Y} puede necesitar decir qué planes le motivan', action: 'alternen planes activos y tranquilos'}},
  en: {title: ['Energy and tastes that spark', 'Different rhythms of action'], easy: {story: 'one person\'s tastes and the other\'s energy meet naturally, often felt as shared fun', daily: 'it may show in the wish to propose plans together', benefit: 'complicity and joy in the friendship', tip: 'set aside time for new plans you both enjoy'}, hard: {story: 'one person\'s way of enjoying and the other\'s pace of action may not be in sync', daily: 'one may want to act fast while the other prefers to enjoy calmly', misunderstanding: 'initiative felt as pressure, or calm as disinterest', needX: '{X} may need to respect {Y}\'s pace', needY: '{Y} may need to say what plans motivate them', action: 'alternate active and calm plans'}},
};

// Twelve everyday areas → evidence pairs and fallback individual comparison.
export const DAILY_AREAS = [
  {key: 'emotional', pairs: ['Moon|Sun', 'Moon|Moon', 'Moon|Venus'], compare: 'Moon', es: 'Conexión emocional', en: 'Emotional connection'},
  {key: 'communication', pairs: ['Mercury|Mercury', 'Mercury|Moon', 'Mercury|Sun'], compare: 'Mercury', es: 'Comunicación', en: 'Communication'},
  {key: 'affection', pairs: ['Moon|Venus', 'Venus|Venus', 'Sun|Venus'], compare: 'Venus', es: 'Afectividad', en: 'Affection'},
  {key: 'intimacy', romantic: true, pairs: ['Mars|Venus', 'Ascendant|Venus', 'Ascendant|Mars'], compare: 'Mars', es: 'Química simbólica', en: 'Symbolic chemistry'},
  {key: 'trust', pairs: ['Moon|Saturn', 'Saturn|Venus'], compare: null, es: 'Confianza y límites', en: 'Trust and boundaries'},
  {key: 'conflict', pairs: ['Mars|Mars', 'Mars|Sun', 'Mars|Moon'], compare: 'Mars', es: 'Gestión de desacuerdos', en: 'Handling disagreements'},
  {key: 'living', pairs: ['Moon|Moon', 'Moon|Saturn'], compare: 'Moon', es: 'Convivencia', en: 'Living together'},
  {key: 'values', pairs: ['Venus|Venus', 'Saturn|Venus'], compare: 'Venus', es: 'Seguridad material y valores', en: 'Material security and values'},
  {key: 'family', pairs: ['Moon|Moon', 'Moon|Saturn'], compare: null, es: 'Expectativas familiares', en: 'Family expectations'},
  {key: 'independence', pairs: ['Moon|Uranus', 'Sun|Uranus', 'Uranus|Venus'], compare: null, es: 'Independencia y espacio personal', en: 'Independence and personal space'},
  {key: 'commitment', pairs: ['Saturn|Sun', 'Saturn|Venus'], compare: null, es: 'Compromiso', en: 'Commitment'},
  {key: 'growth', pairs: ['Jupiter|Sun', 'Jupiter|Moon', 'Jupiter|Venus'], compare: 'Sun', es: 'Crecimiento mutuo', en: 'Mutual growth'},
];

// Element-pair titles (unordered). Example style requested by product.
export const COUPLE_TITLES = {
  'fire|fire': {es: 'Dos fuegos que se avivan', en: 'Two fires that kindle each other'},
  'earth|earth': {es: 'Una conexión que se construye paso a paso', en: 'A connection built step by step'},
  'air|air': {es: 'Un encuentro de mentes curiosas', en: 'A meeting of curious minds'},
  'water|water': {es: 'Dos mundos que se sienten sin palabras', en: 'Two worlds that feel without words'},
  'earth|fire': {es: 'La conexión entre estabilidad y espontaneidad', en: 'The connection between stability and spontaneity'},
  'air|fire': {es: 'Entre la chispa y la conversación', en: 'Between spark and conversation'},
  'fire|water': {es: 'Entre la sensibilidad y la aventura', en: 'Between sensitivity and adventure'},
  'air|earth': {es: 'Ideas que buscan tierra firme', en: 'Ideas looking for solid ground'},
  'earth|water': {es: 'Un refugio entre sensibilidad y constancia', en: 'A refuge of sensitivity and steadiness'},
  'air|water': {es: 'Un encuentro entre profundidad y curiosidad', en: 'An encounter between depth and curiosity'},
};

// Words the narrative must never produce (tested).
export const FORBIDDEN = [/infidel/i, /ruptura|breakup|break up/i, /predestin|destined|soulmate|alma gemela/i, /enfermedad|illness|disease/i, /embaraz|pregnan/i, /muerte|death|die\b/i, /divorc/i, /garantiza|guarantee/i, /siempre (serán|estarán)|will always be/i];
export const ROMANTIC_WORDS = /romance|romántic|romantic|deseo|desire|coquete|flirt|atracción|attraction|intimidad|intimacy|pareja ideal/i;
