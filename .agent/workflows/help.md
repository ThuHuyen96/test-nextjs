---
description: Quick reference of all available workflows and commands.
---
# Help

## Workflows

- `/feat`: Build a new feature or execute a technical task end-to-end.
- `/figma-diff`: Export Figma nodes and generate highlighted HTML diff report.
- `/agent-validation`: Run QA validation and release pipeline to certify agent infrastructure quality.

## Scripts

```bash
cd .agent/scripts

npm run agent:index        # Regenerate manifest.json + README.md
npm run agent:benchmark    # Run D1-D13 quality checks
npm run agent:audit        # Claude Code AI review
npm run sync               # Sync to all platforms
```
