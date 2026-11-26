# Handoff — Claude → ChatGPT / founder

Branch `claude/stabilization` from `feature/cosmic-match-foundation` @ abcd934. Not pushed: the session had read-only GitHub access. Delivered as a git bundle; apply with:

    git fetch astralis-claude.bundle claude/stabilization:claude/stabilization
    git push origin claude/stabilization   # then open PR → feature/cosmic-match-foundation

Commits: 69ebda2 lockfile · 1140979 CI fix · 7ae6783 geography fixture · 0dd99ac catalog tests · d52d821 ephemeris reference tests · f4bef7b 1900+ births · 23ca543 Placidus + mean node · (this commit) docs.

Verify after push: Foundation CI `build` job (live PE import + catalog test + browser smoke) must pass. Review points: TD-02 licence posture, TD-03 pre-1970 flag wording, shard-size risk (QA_REPORT). Local reproduction: `python3 scripts/build-geography-fixture.py && npm run build && CHROMIUM_PATH=$(which chromium) node tests/browser-smoke.mjs`.

Risks: CI fix unverified on Actions; rural Peru coverage unverified; full world catalog size unknown.
