---
description: Performs a findings-first review of the current batch in an SDD repository. Use when the implementation already exists and the focus is now to locate bugs, regressions, spec drift, batch drift, and missing validation.
disable-model-invocation: true
allowed-tools: Read Grep Glob Bash(git diff *) Bash(git status *)
argument-hint: "[optional-focus]"
---

# Review current batch

Review the current batch in findings-first mode.

## Default focus

1. functional bug
2. regression
3. spec drift
4. batch drift
5. missing validation

## Expected format

1. findings first, from most severe to least severe
2. questions or assumptions next
3. summary only at the end

## Additional focus for this round

$ARGUMENTS