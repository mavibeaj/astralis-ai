# Integration plan for PRs #3–#12 (prepared 27 Nov 2026 by Claude; ChatGPT reviews and authorizes)

No merge to `main` is proposed. No destructive operation is needed. The data below comes from the GitHub compare API after the history cleanup. Agent clones are shallow, so local `git` counts can mislead.

## The stack is linear and conflict-free
| PR | Head → base | Ahead / behind | Files | Mergeable |
|---|---|---|---|---|
| #1 | feature/cosmic-match-foundation → main | 106 / 0 | 74 | yes (**do not merge**: main is the founder's decision) |
| #3 | claude/geo-p0-fix → feature/cosmic-match-foundation | 6 / 0 | 24 | yes |
| #4 | claude/synastry-0.2 → feature/cosmic-match-foundation | 1 / 0 | 7 | yes (**duplicate**: already contained in #5) |
| #5 | claude/product-experience → claude/geo-p0-fix | 5 / 0 | 13 | yes |
| #6 | claude/checkout-sim → claude/product-experience | 3 / 0 | 8 | yes |
| #7 | chatgpt/story-first → claude/checkout-sim | 6 / 0 | 6 | yes |
| #8 | claude/cosmic-story-v2 → chatgpt/story-first | 3 / 0 | 28 | yes |
| #9 | claude/beta-readiness → claude/cosmic-story-v2 | 13 / 0 | 38 | yes |
| #10 | claude/block3 → claude/beta-readiness | 8 / 0 | 37 | yes |
| #11 | chatgpt/kb-block3 → claude/block3 | 3 / 0 | 3 | yes |
| #12 | claude/block4 → chatgpt/kb-block3 | 5+ / 0 | 13+ | yes |

**Real dependencies:** each PR depends only on its base. Every head contains every PR below it. `claude/synastry-0.2` (#4) is already inside #5, and `chatgpt/kb-expansion` (no PR) is inside #9.
**Obsolete branches** (fully contained, can be deleted after integration, on the founder's approval): `claude/stabilization` (merged as #2), `chatgpt/kb-expansion`, `claude/synastry-0.2` (after #5).
**Duplicated changes:** none beyond the containments above. Conflicts: none (every PR is 0 behind its base).

## Recommended sequence (into `feature/cosmic-match-foundation`, merge commits, no squash so SHAs and authorship stay traceable)
1. ChatGPT reviews #12 → approves #11 + #12 together (the C-06 test failure on #11 is fixed by #12).
2. Merge #3 into `feature/…`. Then retarget #5 to `feature/…` and merge. Close #4 as "included in #5".
3. Retarget and merge #6, #7, #8, #9, #10, #11, #12 in that order. After each merge, retarget the next PR to `feature/…` and wait for its CI.
   - Shortcut with the same result: retarget #12 to `feature/…` and merge it alone (it contains #3–#11). Then close #3–#11 as "included via #12". Faster and cheaper in CI minutes, but less granular history in GitHub's PR list.
4. Run Foundation CI + `verify-preview` on the integration branch head. Its Cloudflare preview is the "commit evaluated" for FOUNDER_BETA_READY.

## Required CI per merge
- Foundation CI (single job: unit tests, typecheck, GeoNames-subset build + gate, desktop/mobile journey with Lima and Chiclayo, axe WCAG 2.1 A/AA).
- Geography world import when geography scripts change.
- Preview verify (label `verify-preview`) only on the final integration head.

## Implications of the history cleanup
- Every SHA before 27 Nov 23:00 UTC changed (map kept privately by the founder). Old links in chats or docs to commit SHAs no longer resolve to branch history.
- Collaborators must re-clone. A push from an old clone would bring back the removed commits.
- `refs/pull/2/head` (closed) still points to old history until GitHub Support purges it.
- Cloudflare previews of old SHAs keep working (they contain only the built site, which never included the fixtures).
