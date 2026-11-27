# Founder beta: private test and comparison protocol

Prepared in advance. It is used only after `FOUNDER_BETA_READY.md` exists. No real birth data is requested or stored by the agents.

## Privacy
- All calculation runs **in the browser**. No account exists and no birth data is sent to any server.
- What the network does see: the static site files, and the geography shards for the typed place prefix (e.g. "Ch"). Cloudflare may log those requests.
- Do not paste real data into GitHub issues, PRs, chats with agents, screenshots or CI. Share feedback as text with no data, or with redacted screenshots.
- The simulated premium report stays in the browser's localStorage. Clear site data after the test.
- Both people must agree before their data is used.

## Steps
1. Open the preview URL listed in `FOUNDER_BETA_READY.md` on desktop and on mobile.
2. Enter your own data and your partner's: exact time if known, place from the catalog. Then:
   - Note the generation time.
   - Read chapters 1–8.
   - Open chapter 10 (technical) only afterwards.
3. Enter the same data on the reference platforms with matching settings:
   - Tropical zodiac.
   - Geocentric positions.
   - **Placidus** houses (Astralis uses whole-sign only above 66° latitude).
   - **Mean** lunar node.
   - Same birth time zone.
4. Fill in the comparison sheet below.

## A. Astronomical precision (per person)
| Item | Astralis | Platform 1 | Platform 2 | Difference | Acceptable? |
|---|---|---|---|---|---|
| Sun, Moon, Mercury … Pluto (sign + degree) | | | | | ≤ 1′ typical; > 0.1° = investigate |
| Ascendant / MC | | | | | ≤ 0.1° if same time/coords |
| House cusps (Placidus) | | | | | ≤ 0.2° |
| Mean node | | | | | ≤ 0.1° |
| Natal aspects (list) | | | | | Differences usually = orb conventions |
| Synastry aspects | | | | | Same as above |

If a difference appears, check first:
- **True vs mean node.**
- **Time zone and DST:** Astralis shows the UTC it used, in chapter 10.
- **Coordinates:** GeoNames point vs city centre.
- **Orbs.**

## B. Interpretation quality (score 1–5)
For each of the two individual readings, the joint story, and the affinities and differences, score:
1. Depth.
2. Specificity (would it fit anyone?).
3. Coherence.
4. Naturalness.
5. Usefulness.
6. Difference from generic horoscopes.

Then note:
- Which statements felt accurate.
- Which felt generic.
- What was missing.

## C. Commercial experience
- Design.
- Ease of use.
- Time to result.
- Value of the free reading.
- Perceived premium value at USD 9.99.
- Willingness to pay.
- Willingness to share.

## After the test
The feedback becomes prioritized tasks in `AGENT_TASK_BOARD.md`. Interpretations will **not** be adjusted to match expectations, and a positive test does not authorise sales.
