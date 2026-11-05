---
name: review-current-batch
description: "READ BEFORE submitting a batch for human approval or opening a pull request. Requires review of functional defects, regressions, specification drift and missing validation."
user-invocable: true
---

# Current batch review

# ⚡ MANDATORY TRIGGER
- **TRIGGER**: Perform rigorous findings-first review of the code batch implemented before final validation or delivery to the User.
- **SKIP ONLY IF**: During the initial draft phase while the code is still actively entering.
- **CONSEQUENCE OF IGNORING**: Submission of lots with obvious bugs, violation of style conventions and accumulation of technical debt.

---

Review the current batch in endings-first mode.

## Default focus

1. functional bug
2. regression
3. spec drift
4. batch drift
5. validation missing

## Expected format

1. endings first, from the most severe to the least severe
2. Questions or premises below
3. summary only last

## Additional focus of this round

$ARGUMENTS
