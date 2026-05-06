---
target_project: <!-- absolute path to target project, e.g. /path/to/event-hub -->
dev_server_url: <!-- e.g. http://localhost:3001 -->
description: >
  Task file template for the Figma → Vue markup workflow.
  Copy this file to .agent/tasks/<task-name>.md, fill in all sections,
  then run: /markup-task <task-name>
---

# Frontend Markup Task
<!--
  How to use:
  1. Copy this file: cp .agent/tasks/_template.md .agent/tasks/<task-name>.md
  2. Fill in the sections below.
  3. Run: /markup-task <task-name>
  The agent reads this file and executes the workflow defined in
  .agent/workflows/markup-task.md → .agent/roles/orchestrator.md
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

## 1.1 Config

dev_server_url: <!-- URL where the dev server is running, e.g. http://localhost:5173 -->

---

## 2. Figma Links

| Breakpoint | Viewport | Figma URL |
|------------|----------|-----------|
| xs         | 360px    | <!-- https://www.figma.com/design/... --> |
| sm         | 768px    | <!-- https://www.figma.com/design/... --> |
| md         | 1024px   | <!-- https://www.figma.com/design/... --> |
| lg         | 1440px   | <!-- https://www.figma.com/design/... --> |

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
- <!-- example: markup/components/FeatureName/MyComp.vue -->

**Pages:**
- <!-- example: markup/pages/feature/demo.vue -->

---

## 5. UI Library
<!--
  Choose the UI library for markup generation:
    none      → plain semantic HTML + Tailwind
               tokens: Tailwind default scale
-->
none
