---
id: "HUMAN-REVIEWS"
title: "Human homologation inbox"
status: "template"
date: "YYYY-MM-DD"
author: "executor"
target_repo: "PROJECT-ID"
summary_short: "Official inbox for independent reviews awaiting an identified human signature."
summary_medium: "Keep ten active reviews and preserve dual archives.\nTechnical recommendations do not replace human homologation."
---

# Human Reviews

Official human homologation inbox. Keep at most ten active rev-XXX.md records. Each review has scalar YAML frontmatter, executive summary, security/variables/regression audit, test evidence, RECOMMEND-APPROVAL or RECOMMEND-REVISION and an unsigned human approval field. Only an identified human signs homologation. Archive oldest homologated records into archive/original/ and traceable summaries into archive/compacted/; repair links and rebuild indexes. Pending records must not be discarded.
