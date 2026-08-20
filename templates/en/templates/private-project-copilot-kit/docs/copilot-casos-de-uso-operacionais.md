# Operational workflow use cases

## Quick mental map

- A prompt starts a reusable flow.
- An agent defines the execution posture.
- A skill loads a recurring runbook.
- A hook injects a small deterministic reminder.
- A handoff switches stage with human approval in the middle.
- A subagent serves short, focused delegation.

If you mix these pieces without a simple criterion, the result becomes scattered context. The purpose of this kit is precisely to avoid that.

## When to use each entry point

### 1. New request in the private project

Use `/private-project-kickoff` when you have a new request or when it is still unclear whether the change belongs to the private layer, the core, or both.

Provide, whenever possible:

- current behavior
- expected behavior
- the most concrete file, module, route, screen, or error available
- whether you suspect a private override or a generic rule

Example:

```md
/private-project-kickoff
Fix the callback flow of the social-connections module. Today authorization returns to the wrong screen. I suspect this change stays only in the private layer. Reread the module and the matching hook first.
```

### 2. Resume after a pause

Use `/continue-private-work` when the task was already in progress and you want to recover the context without restarting the whole investigation.

The most important data here is not repeating the entire task. The most important data is saying what changed since the last round.

Example:

```md
/continue-private-work
I manually changed the main PHP and the module JSON. Reread those files before continuing. Now I need to close the callback part and revalidate.
```

### 3. Review before closing the task

Use `/review-private-work` when the implementation already exists and what you want now is a findings-first review focused on bugs, regression, missing validation, and wrong scope.

Example:

```md
/review-private-work
Review the current changes in the gateways module. I want focus on regression, missing gestor interface integration, and missing validation.
```

### 4. Small change already anchored

If you already know exactly the file and the behavior, you do not need to turn everything into ceremony. You can request the change directly as long as you provide the correct anchor.

Example:

```md
Adjust the gateways module so it cannot mark more than one gateway as default. Validate in the smallest scope possible.
```

### 5. Decision between private and core

When your main doubt is scope, the correct flow is still kickoff. The coordinator was designed to call the private context skill and decide whether the change should stay only in the private layer, move up to the core, or be split.

It is not worth asking for implementation first when the division between private and core is still unclear. That usually creates a diff in the wrong place.

### 6. Local validation, Docker, logs, JWT, Phinx

When the dominant stage of the task is environment or operational validation, explicitly request use of the `local-validation` skill.

Example:

```md
Use the local-validation skill to validate this adjustment in the local environment. I want JWT token generation, a Phinx migration, and log reading if something fails.
```

### 7. Short research inside the same task

Use a subagent when you want to delegate a short search, a file map, or a localized review without switching the main flow.

Typical cases:

- list likely files before implementation
- look for equivalent patterns in similar modules
- review regression risks in a small area

### 8. SDD repository instead of a private project

When the task is inside a repository with a Spec-Driven Development flow, do not use this private kit as the main flow. There the work unit is a batch anchored in spec and incremental validation.

Practical rule:

- private project: start with the scope between private and core
- SDD project: start with the spec, current batch, and validation checklist

### 9. SDD scope inside a private project

Some workstreams in this repository may operate with local SDD artifacts inside `project/`, such as `00-START-HERE.md`, `01-WORKFLOW.md`, `implementation/BATCH-INDEX.md`, and `validation/VALIDATION-CHECKLIST.md`.

In those cases:

- keep entering through `/private-project-kickoff`
- ask explicitly for the local artifacts to be reread
- treat `human-requests/` only as non-normative human intake
- if the input comes only as the `human-requests/` folder, use `CURRENT.md`, then `README.md`, then the most recent `.md` file
- treat `antigo/` only as historical material
- keep the spec, batches, reviews, and validation coherent

The goal here is not to convert the entire repository to SDD. The goal is to respect the flow where it already exists.

## How to think about prompt, agent, skill, and hook

### Prompt

Use it when you want a reusable entry point for humans.

Signs it should become a prompt:

- you repeat the same type of task opening
- quality improves when the order of information stays similar

### Agent

Use it when the main difference is the expected behavior of the agent, not the initial text.

Signs it should become an agent:

- one task always needs to coordinate, another always needs to implement, another always needs to review
- you want clear handoffs between stages

### Skill

Use it when there is a recurring runbook that the agent needs to load at the right moment.

Signs it should become a skill:

- the task requires a repeatable technical checklist
- without that runbook the agent forgets a structural step
- the same error comes back in several similar requests

### Hook

Use it when the desired behavior is small, automatic, and predictable.

Good hook job:

- remind validation when a certain path is touched
- remind rereading sensitive files at session start

Bad hook job:

- decide architecture
- investigate business logic
- replace prompt, skill, or agent

## Frequent practical cases

### Private bug in an existing module

Recommended entry: `/private-project-kickoff`.

Goal: decide scope and implement with short validation.

### Generic adjustment that will probably move to the core

Recommended entry: `/private-project-kickoff`, explicitly saying there is a chance that part of it will move to the core.

Goal: separate what is reusable from what is project-specific.

### You changed files manually in the middle of execution

Recommended entry: `/continue-private-work`.

Goal: force rereading the human-made diff before continuing.

### You want only a technical review

Recommended entry: `/review-private-work`.

Goal: findings first, summary second.

### You want to create a new gestor module

Recommended entry: `/private-project-kickoff` or a direct request anchored in a reference module.

Goal: avoid the agent delivering only isolated functions and forgetting the module bootstrap.

If the change is structural, explicitly request use of the `gestor-module-integration` skill.

### You want to turn a recurring error into infrastructure

Recommended entry: a direct request to create a skill, instruction, prompt, or operational doc.

Practical rule:

- recurring process error -> skill or instruction
- recurring human input -> prompt
- small session reminder -> hook

## What to ask the agent in each phase

### To start well

```md
Read the anchor file first and the closest equivalent that is already working. I want to decide the smallest possible diff before editing.
```

### To continue without losing the thread

```md
Reread these files before continuing. I manually changed the business rule and I do not want you to start from the previous state.
```

### To review well

```md
Perform a findings-first review. Prioritize bugs, regression, integration risk, and missing validation. Only summarize afterward.
```

### To force short validation

```md
After the first substantive edit, validate in the smallest possible scope before continuing.
```

## Anti-patterns

- Asking to copy an entire module without saying which part is structural and which part is only business logic.
- Asking for a private-layer change without saying there is a chance the core will be touched.
- Changing files manually and not warning that they need to be reread.
- Using a hook to replace reasoning.
- Asking for review when what you really want is additional implementation.

## Final rule

The kit does not exist to increase ceremony. It exists to reduce ambiguity. If the task is small, anchor it well and go straight to it. If the task mixes scope, implementation, and review, use prompts, agents, and skills to separate the stages.