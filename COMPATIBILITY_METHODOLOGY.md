# Symbolic compatibility v0.1

Weights: emotional 25, communication 20, attraction 20, stability 20, growth 15. These are unvalidated design hypotheses. Define aspect/orb rules, deduplicate pairs, document directional contributions, normalize available evidence and disclose missing data. Never interpret a score as a real probability or use scores to manipulate purchases. Engine implementation pending.

# symbolic-0.2 — CANDIDATE (experimental, not default)

Implementation: `src/lib/compatibility-v02.mjs`. Enabled only via `matchPreview(..., {candidate:true})`; the UI shows it side by side with 0.1 when the URL has `?scoring=0.2`. symbolic-0.1 stays the official index and is frozen by golden tests.

**Approved general weights:** emotional 25 · communication 20 · attraction 20 · stability 20 · growth 15.

**Points:** Sun–Pluto, Ascendant, Midheaven (only with known time + coordinates), mean North Node. Unknown time removes Moon, ASC, MC and house overlays *into* that chart (no sampling).

**Aspects:** conjunction, sextile, square, trine, opposition. Orb by the wider class of the pair: luminaries 8/6/4, personal 6/5/3, social 5/4/3, angles 5/4/3, outer 4/3/2 (conj-opp / trine-square / sextile). Node: conjunction/opposition only, 3°, always growth-positive.
Contribution = polarity × tightness × pair weight; tightness = cos(π/2 · deviation/orb).
Polarity: trine +1, sextile +0.6, conjunction +0.5 (−0.3 if Saturn, Uranus or Pluto), square −0.7, opposition −0.5.

**Pair → dimension (each directional contact counted once, in one dimension only):**
- Emotional: Moon–Moon 1, Sun–Moon 1, Moon–Venus 0.8, Moon–ASC 0.6, Moon–Pluto 0.4, Moon–Neptune 0.3
- Communication: Mercury–Mercury 1, Mercury–Moon 0.8, Sun–Mercury 0.7, Mercury–ASC 0.5, Mercury–Jupiter 0.4, Mercury–Uranus 0.3
- Attraction: Venus–Mars 1, Venus–Venus 0.7, Sun–Venus 0.7, Mars–Mars 0.6, Venus–ASC 0.6, Mars–ASC 0.5, Venus–Pluto 0.4, Mars–Pluto 0.3
- Stability: Sun/Moon/Venus–Saturn 0.8, Sun–Sun 0.6, Saturn–ASC 0.5, Saturn–MC 0.4, Sun–MC 0.4
- Growth: Jupiter–Sun 0.8, Jupiter–Moon 0.7, Jupiter–Venus 0.6, Jupiter–Jupiter 0.4, Node–Sun/Moon 0.4, Node–Venus/ASC 0.3

**House overlays (whole-sign, both directions, Sun/Moon/Mercury/Venus/Mars):** 3rd communication +0.12 · 4th emotional +0.15 · 5th attraction +0.15 · 7th stability +0.15 · 9th growth +0.12 · 10th stability +0.10 · 12th emotional −0.08.

**Dimension score:** 50 + 50·tanh(Σ contributions / 1.6), null when no pair is computable. **Index:** weighted mean of available dimensions. Every contribution is returned as evidence (pair, aspect, deviation, orb, weight, contribution, tone), plus coverage, supportive and challenging sums.

**Guaranteed by tests:** symmetry (300 random pairs, with unknown times), determinism, no double counting, evidence sums = dimension sum, bounds, unknown-time handling, golden regression for 0.1 (49) and 0.2 (54) on fictional charts.

**Open for CTO review:** pair weights and the 1.6 saturation constant; whether conjunctions with Saturn/Uranus/Pluto should be −0.3 or split into supportive/challenging; overlay values; Placidus vs whole-sign for overlays (whole-sign chosen: always defined, avoids >66° gaps); whether to show 0.2 to users before calibration against a corpus of fictional reference couples.

## CTO decision 2026-11-27 (T-04)
Candidate only: retain pair weights, whole-sign overlays and saturation 1.6 as baseline hypotheses, not validated defaults. Keep 0.1 reproducible. Before promotion: compare score distributions on fixed synthetic corpus with time-known/missing strata, report coverage including overlays separately, test sensitivity to ±1 hour, ±1 degree and parameter changes. No aspects must be labelled insufficient evidence rather than neutral compatibility; disclose that 50 is a mathematical midpoint. Conjunctions require mixed-tone interpretation; nodal opposition must not automatically imply benefit. Test friendship separately; romantic attraction must not be presented as friendship assessment. Avoid calibrating to desired commercial scores. Freeze weights only after review; no promotion authorized.
