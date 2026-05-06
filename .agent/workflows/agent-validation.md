---
description: Run QA validation and release pipeline to certify agent infrastructure quality (rules, skills, workflows).
---

# Agent Validation & Release (Level 6)

## Quick Reference

```bash
cd .agent/scripts

# 0. Review Pending Changes (smart skip — chỉ review skills đã thay đổi)
npm run agent:review           # Chỉ review skills có thay đổi (DEFAULT, tiết kiệm token)
npm run agent:review -- --force  # Force review tất cả skills

npm run agent:index            # Regenerate manifest.json + README.md
npm run agent:benchmark        # Static Benchmark
# Run Scenario Dry-Run (Review / Auto-Refine)
npm run agent:audit            # AI review
```

## Phase 0: Review Pending Changes

Trước khi bắt đầu quy trình validation, bắt buộc thực hiện review các tài nguyên đã được thêm mới hoặc chỉnh sửa (skills, workflows, scripts, v.v.).

### Smart Skip (Token-Efficient)
Mặc định, `agent:review` sử dụng **git diff** để detect skills nào thực sự có thay đổi kể từ lần review cuối (`reviewedAt` trong `review-data.json`). Skills không thay đổi sẽ được **skip** để tiết kiệm Opus token.

| Flag | Hành vi |
|------|---------|
| _(không flag)_ | Chỉ review skills có file thay đổi (default) |
| `--force` | Force review **tất cả** skills, bỏ qua cache |
| `--skill=<id>` | Review 1 skill cụ thể |

**Cơ chế detect thay đổi:**
1. `git diff HEAD` — uncommitted changes trong skill directory
2. `git diff --cached HEAD` — staged changes
3. `git ls-files --others` — untracked files mới
4. `git log --since=<reviewedAt>` — commits mới sau lần review cuối
5. Nếu skill chưa từng review → **luôn review**

- Đảm bảo mọi thay đổi đúng với yêu cầu thiết kế và quy chuẩn.

## Phase 1: Static Benchmark

Sau khi review xong, the agent evaluates the skill source code across D1–D13 dimensions using `npm run agent:benchmark`.

| Dimension | What it measures | PASS condition |
|---|---|---|
| **D1** Always-Apply Size | Character count of alwaysApply rules | ≤ 4000 chars |
| **D2** Hardcoded Values | Project/env/model specificity in rules | 0 hits |
| **D3** Skill Coverage | % skills registered in manifest.json | ≥ 95% |
| **D4** Ref Integrity | Valid @skill: and @workflow: cross-references | ≥ 75% |
| **D5** AI Neutrality | Provider-agnosticism in AI skills | ≥ 70/100 |
| **D6** Template Compliance | Frontmatter (name, description) + H1 heading | ≥ 95% |
| **D7** Metadata Completeness | metadata.json with version field | ≥ 90% |
| **D8** Documentation Depth | SKILL.md body ≥ 200 chars | ≥ 90% |
| **D9** Frontmatter Quality | Name format, description quality, trigger hint | ≥ 90% |
| **D10** Token Budget | Body ≤ 500 lines, ≤ 3500 words | ≥ 90% |
| **D11** Content Quality | Concrete examples + positive framing | ≥ 80% |
| **D12** Progressive Disclosure | Reference depth ≤ 1 level | 100% |
| **D13** Distribution Contract | Every skill in a dist channel or excluded; deps reachable | 100% |

### Fixing Static Failures
- **D2 hits**: Replace hardcoded values with discovery instructions.
- **D4 broken refs**: Update or remove stale `@skill:` / `@workflow:` references.
- **D6 failures**: Add missing `name:` / `description:` frontmatter fields + H1 heading.
- **D7 failures**: Add `metadata.json` with `version` field.
- **D9 failures**: Ensure description contains "Use when/for..." trigger hint.
- **D10 failures**: Move verbose content to `references/` sub-files.

## Phase 2: Scenario Coverage Simulation (Dry Run)

Once the static benchmark passes, perform a real-world simulation to validate that the agent genuinely understands and correctly applies the skill:

1. **Simulate a realistic mock user request** specifically testing this skill.
2. Observe if the agent produces correct architecture, files, and syntax.
3. If the agent deviates or fails, it triggers **Auto-Refinement**, automatically patching knowledge gaps in `SKILL.md`, adding explicit `NEVER`/`ALWAYS` rules, and re-running the test. 

## Phase 2.5: GPT-5.4 Cross Check

Sau khi Scenario Simulation pass, thực hiện **cross-model verification** bằng OpenAI Codex CLI (GPT-5.4) để phát hiện blind spots mà primary agent có thể bỏ sót.

### Mục đích
- Loại bỏ **single-model bias** — mỗi LLM có xu hướng bỏ qua lỗi khác nhau.
- Đảm bảo skill/workflow **readable và actionable** cho nhiều model, không chỉ model chính.
- Phát hiện **ambiguity, missing context, hoặc implicit assumptions** mà model chính đã dung dưỡng.

### Quy trình

1. **Mở terminal**, chạy Codex CLI:
   ```bash
   codex
   ```
2. **Gửi prompt cross-check** cho từng skill cần validate:
   ```
   Review file .agent/skills/<skill-name>/SKILL.md for:
   1. Ambiguous instructions that could be misinterpreted
   2. Missing context or implicit assumptions
   3. Contradictions between rules
   4. Token efficiency — verbose sections that could be condensed
   5. Whether a developer unfamiliar with the project could follow this
   Report issues as a numbered list with severity (critical/warning/info).
   ```
3. **So sánh kết quả** với review từ primary agent (Phase 0):
   - Nếu GPT-5.4 phát hiện issue **critical** mà primary agent bỏ sót → **bắt buộc fix** trước khi release.
   - Nếu chỉ **warning/info** → đánh giá và fix nếu hợp lý.
4. **Log kết quả** cross-check vào `review-data.json` với field `crossCheckModel: "gpt-5.4"`.

### Pass Criteria
- Không còn issue **critical** từ cross-check.
- Mọi **warning** đã được review và có justification nếu không fix.

## Phase 3: Release Pipeline

Once both Static Benchmark and Scenario Simulation pass successfully, proceed to release:

1. `npm run agent:audit` — System safety & syntax review.
2. Manually commit the changes and optionally tag the release.
