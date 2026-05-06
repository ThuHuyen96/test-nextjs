---
target_project: <!-- absolute path to target project, e.g. /path/to/event-hub -->
dev_server_url: <!-- e.g. http://localhost:3001 -->
description: >
  Task file template for the Figma → Vue markup workflow.
  Copy this file to .agent/tasks/<task-name>.md, fill in all sections,
  then run: run-task <task-name>
---

# Frontend Markup Task
<!--
  How to use:
  1. Copy this file: cp .agent/tasks/_template.md .agent/tasks/<task-name>.md
  2. Fill in the sections below.
  3. Run: /markup-task <task-name>
  The agent reads this file and executes the workflow defined in
  .agent/commands/markup-task.md → .agent/roles/orchestrator.md
-->

---

## 1. User Description
<!--
  Brief description: layout, components, copy, behavior, style notes.
  If Figma links are provided below → this section is supplemental context only.
  Figma always takes priority over prose.
-->

<!-- Fill in here -->


---

## 1.1 Config & Git

ticket_id:     PROJ-123
ticket_type:   feature
ticket_title:  test
target_branch: feature/test-new-feature
mr_repo:       origin
verify_commit: yes
dev_server_url: https://localhost:3001

---

## 2. Figma Links

| Breakpoint | Viewport | Figma URL |
|------------|----------|-----------|
| xs         | 360px    | https://www.figma.com/design/BSBwAVVY1xB2o87rowCrfq/%ED%94%8C%EB%A0%88%EC%9D%B4%ED%81%AC%EC%83%B5?node-id=3342-212764&m=dev |
| sm         | 768px    |  |
| md         | 1024px   | https://www.figma.com/design/BSBwAVVY1xB2o87rowCrfq/%ED%94%8C%EB%A0%88%EC%9D%B4%ED%81%AC%EC%83%B5?node-id=3324-366882&m=dev |
| lg         | 1440px   |  |

---

## 3. Reference Components
<!--
  Existing components or patterns in the repo to reference for style.
  Example: markup/components/common/Card.vue
-->

<!-- Fill in or leave blank -->


---

## 4. Output Paths

**Components:**
- entities/test/MyComp.vue

**Pages:**
- <!-- example: markup/pages/feature/demo.vue -->

---

## 5. UI Library
<!--
  Choose the UI library for markup generation:
    none      → plain semantic HTML + Tailwind, no stove-ui
               tokens: Tailwind default scale
-->
none
