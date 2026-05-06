---
category: Documentation
---

# Agent Infra Update Checklist

Use this checklist for any modifications to the core Agent architecture (adding, modifying, or deleting files within the `.agent/` directory, including `skills`, `checklists`, `workflows`, and `memories`).

## 1. Safety & Impact Check (Pre-flight)
- [ ] **Reference Check (Pre-flight Search):** Before deleting or renaming a file, you must perform a global search (using `grep`/`ripgrep`) inside the `.agent/` directory to verify if the file is embedded or referenced (e.g., `See Also`, relative links) by other files.
- [ ] **Impact Assessment:** Will adding or removing this skill/checklist alter the Agent's default behavioral flow? (e.g., deleting an important checklist might inadvertently cause the Agent to bypass a critical QA gate).

## 2. Integrity Validation (Post-flight)
- [ ] **Cross-Reference Integrity:** 
  After completing the modifications, you must run the Agent integrity validation tool:
  ```bash
  cd .agent/scripts && npm run agent:check-refs
  ```
  _Ensure 100% resolution with no Broken References_ (0 errors).
- [ ] **Junk File Check:** Verify that no empty directories, draft files, or debug artifacts (e.g., `resource-graph.json`) are left behind. Delete them or add them to `.gitignore`.

## 3. Git & Manifest Sync
- [ ] **Index/Manifest Auto-sync:** 
  Verify that the pre-commit hook successfully triggers the `generate-agent-index.mjs` script when committing. Confirm that `.agent/manifest.json` and `.agent/README.md` have been updated accordingly.
- [ ] **Conventional Commit Formatting:** 
  Ensure adherence to Conventional Commits. Tasks modifying the Agent infrastructure typically use the `chore(agent)`, `refactor(agent)`, or `refactor(docs)` type.

## 4. Documentation & Retro
- [ ] **Update Workflows (If applicable):** If the operational methodology has changed, check the files within `.agent/workflows/` to see if any workflow steps are impacted.
- [ ] **Self-Review:** Did the changes accidentally break Markdown syntax (e.g., malformed tables, broken links)? Does the new folder structure align with the core philosophy (`Skills` -> How-to, `Checklists` -> Quality Standard)?
