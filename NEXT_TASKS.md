# Next tasks (prioritized)

1. **Push `claude/stabilization` and open PR → `feature/cosmic-match-foundation`**; confirm Foundation CI turns green (blocked: this session had read-only GitHub access).
2. Run full `scripts/build-geography.py` (world) in CI; record file count, total size and largest shard. If shards > ~1 MB, switch to 3-char prefix shards or drop alias lists from rows (store aliases once per entry).
3. Add rural Peru regression cases (village-level geonameids) once the full PE catalog output is available.
4. Fix picker desync on "Try with fictional data" (lift country state or reset picker via `key`).
5. Upgrade GitHub Actions to Node-24-native versions (deprecation warnings on checkout/setup-node/upload-artifact v4).
6. Block 4: weighted synastry evidence per dimension as `symbolic-0.2` behind a version flag, with regression tests that keep `symbolic-0.1` reproducible.
7. Block 5: UX redesign + SVG natal/synastry wheels from computed data; Playwright screenshots.
8. Block 9: checkout simulation (order → mock confirmation → report → retrieval), no card data.
9. True node; Chiron only with a licence-compatible ephemeris (Swiss Ephemeris is AGPL/commercial — not usable in a closed SaaS without a licence).
