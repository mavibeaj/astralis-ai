# Collaboration

| Agent | Responsibility | Branch |
|---|---|---|
| ChatGPT (CTO/architect) | Architecture, methodology approval (symbolic-0.2 weights), payment-provider research, SEO/launch, PR review and merges into the integration branch | `feature/cosmic-match-foundation` |
| Claude | Implementation, testing, astronomical/geographic validation | `claude/*` branches; one PR per block |
| Founder (Mario) | Merges to `main`, deployments, Cloudflare/Vercel settings, payments, paid services | — |

Loop: Claude updates `PROMPT_FOR_CHATGPT.md` and `AGENT_TASK_BOARD.md` with each delivery; ChatGPT answers with `PROMPT_FOR_CLAUDE.md`. Neither agent runs in the background: each iteration starts when the founder pastes the prompt.

Rules: no force-push, no merge to `main`, no deploy or live payments without founder approval. PRs target `feature/cosmic-match-foundation`, or the preceding branch when dependent (stated in the PR). Update PROJECT_STATUS, QA_REPORT and HANDOFF after each block. Report only executed checks.
