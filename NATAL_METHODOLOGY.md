# Natal and Cosmic Story methodology: candidate for CTO review

Code: `src/lib/natal-interpretation/`. Versions: `natal-kb-0.1` (knowledge base), `natal-evidence-0.1` (Layer A) and `cosmic-story-0.1` (Layer B).

## Layers
- **Astronomy** (unchanged): Astronomy Engine positions, ASC/MC, Placidus or whole-sign houses, mean node.
- **Layer A, evidence** (`evidence.mjs`): signs, degrees, houses, natal aspects, element and modality balance, lacking elements, stelliums, house emphasis, uncertainty. Every fact has a stable id (`placement:Venus`, `aspect:Moon-Sun:square`, `element:water`…). It is deterministic and contains no text.
- **Layer B, narrative** (`narrative.mjs`): deterministic templates from `knowledge.mjs`. Every section lists the evidence ids it uses, and scores are never touched.
- **Future LLM** (`llm-adapter.mjs`, disabled): receives anonymous evidence only (no names, dates, places, coordinates or degrees). It must cite allowed ids. Responses are rejected for fate, infidelity, breakups, health, pregnancy, death, numeric scores, or romance in a friendship reading.

## Rules (natal-evidence-0.1)
- **Aspects:** conjunction, sextile, square, trine and opposition.
  - Orbs (conjunction-opposition / trine-square / sextile): luminaries 8/7/5, personal planets 7/6/4, Jupiter and Saturn 6/5/3, angles 6/5/3, outer planets 5/4/3.
  - Outer–outer aspects are excluded because they are generational. ASC–MC is excluded.
  - Tone: trine and sextile are harmonious; square and opposition are tense. A conjunction is tense when it involves Mars, Saturn, Uranus or Pluto (except Mars–Venus).
  - Priority: personal points first, then tighter orbs.
- **Element/modality weights:** Sun, Moon and ASC 3; Mercury, Venus and Mars 2; Jupiter, Saturn and MC 1; outer planets 0. An element is "lacking" when no personal point is in it and its weight is ≤ 1.
- **Unknown birth time:** no ASC, MC or houses.
  - The Moon's sign is used only if it is the same at 00:00 and 23:59 (it moves < 30°/day). Its degree is never used.
  - Any planet that changes sign that day is not interpreted.
  - Natal and cross aspects count only if they hold at both ends of the day.
- **Cross aspects (synastry):** same orbs. Library readings exist for 20 body pairs. Other pairs fall back to a generic reading built from the two domains. Each pair appears once, as either an affinity or a tension.
- **Daily-life areas (12):**
  1. A cross aspect from that area's pairs, used in at most one area.
  2. Otherwise, a comparison of the two persons' signs for that body by element (same, complementary or different), explicitly labelled as "not confirmed by an aspect".
  3. Otherwise, "a topic to discuss, not a conclusion".
  - Intimacy is omitted for friendship.
- **Couple title:** taken from the pair of dominant elements (10 combinations).

## Editorial (measured, fictional Chiclayo/Tokyo pair)
| Edition | Person A | Person B | Couple | Total |
|---|---|---|---|---|
| Free (ES) | 316 | 308 | 802 | 1,426 |
| Premium (ES) | 850 | 872 | 1,558 | 3,280 |

Language rules:
- **Spanish:** gender-neutral; adjectives attach to feminine nouns ("una energía…").
- **English:** singular "they".
- **Friendship:** neutral house wording; romantic library texts are filtered out.

## Open questions for the CTO
1. Orbs and tone rules above, especially hard conjunctions and the exclusion of outer–outer aspects.
2. Element weights and the "lacking" threshold.
3. Whether a Moon with a stable sign (unknown time) may feed cross comparisons by sign. Currently it is used for the individual reading and the Moon-vs-Moon comparison, but never for aspects.
4. Expanding the cross-pair library: Sun–Mars, Mercury–Venus, Venus–Neptune, Moon–Pluto, Sun–Uranus, Node contacts, MC contacts.
5. Additional natal pair readings, and sign-in-house combinations for premium.
