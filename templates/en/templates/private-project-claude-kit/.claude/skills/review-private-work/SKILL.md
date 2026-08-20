---
description: Performs findings-first review in a Conn2Flow private project. Use when the implementation already exists and the focus is now on finding bugs, regressions, scope drift, and missing validation.
disable-model-invocation: true
allowed-tools: Read Grep Glob Bash(git diff *) Bash(git status *)
argument-hint: "[optional-focus]"
---

# Private project review

Review the current diff in findings-first mode.

## Default focus

1. functional bugs
2. regression
3. wrong scope between private and core
4. drift against batches, local specs, or validation
5. missing relevant tests or validation

## Expected format

1. List findings first, from most severe to least severe.
2. Say when there are no findings.
3. Keep any summary or changelog secondary.

## Additional focus for this round

$ARGUMENTS