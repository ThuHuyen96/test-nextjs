# 📓 Level 6 Harness — Engineer Notes

> ADR: Decision to bootstrap Level 6 Agentic Engineering with an automated multi-agent platform.

## Context
Manual code review is a bottleneck. To scale, we need an automated feedback loop where:
- A Planner agent breaks down tasks into actionable plans
- A Developer agent implements the code
- A QA Reviewer agent reviews output independently
- The system auto-retries on failure or escalates to human

## Decision
Bootstrap Level 6 with **CrewAI-based Agent Platform** (`/.agent-crew/`) orchestrating Planner → Developer → QA Reviewer.

## Previous Approach (Deprecated)
The CLI-based `debate.sh` script (Claude DEV ↔ Codex QA) was the initial prototype. It has been replaced by the programmatic multi-agent platform for better reliability, security (3-layer model), and observability.

## Resources
- Platform: `.agent-crew/` (Python, CrewAI, LiteLLM)
- Run: `cd .agent-crew && .venv/bin/python -m src.main feature "..."`
- Security: `src/security.py` (hardened tools + anti-injection prompts)

---

## Level 7 Roadmap Ideas

> Capture ideas here as they emerge from running the harness.

- [ ] Replace manual trigger with event-driven triggers (ticket webhook)
- [ ] Add Langfuse production observability
- [ ] Persistent context store across agent runs
- [ ] Auto-generate MRs from agent output
- [ ] Dashboard for agent run history and pass/fail rates

---

*Last updated: 2026-04-02*
*Expires: 2026-10-02*
