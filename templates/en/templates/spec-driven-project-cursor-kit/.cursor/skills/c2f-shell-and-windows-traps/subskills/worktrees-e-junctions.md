# Trap 18 — Remove a worktree with junctions (full recipe)

Subskill of `c2f-shell-and-windows-traps`. Read it before removing a Windows worktree that has junctions (`vendor`, `node_modules` or links into the main tree). The critical rules are also in Trap 18 of the parent skill.

On Windows, do the whole inspection and removal in a single Command Prompt (CMD) session. Run the blocks step by step, replacing the example paths with verified absolute paths.

1. In the main tree, confirm the registered worktree and protect the main tree and the pipeline sources. Confirm that the path and its parent folders are real, that every commit of the worktree is integrated into `main`, and that no work is pending, including ignored files that must be kept.

   ```bat
   cd /d "C:\Projetos\repo"
   git worktree list --porcelain
   git -C "C:\Projetos\repo-lote" status --short --untracked-files=all --ignored=matching
   git -C "C:\Projetos\repo-lote" merge-base --is-ancestor HEAD main
   echo %ERRORLEVEL%
   ```

   The last command must return 0. Stop if there is unique work, an uncertain destination or a protected path.

2. Inventory the links and the real folders, one level at a time. Repeat the commands in every real folder, including project subfolders and real installs of `vendor` and `node_modules`. Inspect those names from their parent before entering them. Also check the other worktrees and the targets shown by `dir /AL`. If another tree depends on the target worktree, suspend the removal until the reference is resolved and the targets are verified.

   ```bat
   if exist "C:\Projetos\repo-lote\" (echo PATH-OK) else (echo PATH-MISSING)
   dir /AL "C:\Projetos\repo-lote"
   echo %ERRORLEVEL%
   dir /A:D-L "C:\Projetos\repo-lote"
   dir /AL "C:\Projetos\repo-lote\projeto"
   dir /AL "C:\Projetos\repo"
   ```

   Never use `/S` for the enumeration. Record the content and the target of `vendor` and `node_modules` in the trees that will remain, to compare after the removal.

   **A query error is not zero links (FB-007).** Read the answer of each `dir /AL` before counting:

   | Answer | Meaning | Action |
   | --- | --- | --- |
   | A list with `<JUNCTION>` or `<SYMLINKD>` | there are links | record the path and target of each one |
   | `File Not Found` / `Arquivo não encontrado` (ERRORLEVEL 1), with `PATH-OK` for the same folder | zero links there | move to the next folder |
   | `The filename, directory name, or volume label syntax is incorrect`, `The system cannot find the path specified`, `Access is denied` or `PATH-MISSING` | the query failed | stop; fix the path or the quoting and repeat |

   Never count the lines of an error output as zero links. The inventory only counts for a path validated in the same step.

   Do not build this inventory from Git Bash with `cmd //c "dir /AL /S /B \"C:\...\""`. The escaped quotes reach CMD broken, CMD answers with a syntax error, and that looks like "0 junctions" (measured in BATCH-093 across 7 audits). Open a real CMD. If you need a second reading, `Get-ChildItem -LiteralPath "<folder>" -Force -Attributes ReparsePoint` in PowerShell is only a cross-check: the removal stays in the CMD session.

3. Remove each entry identified as `<JUNCTION>` by its literal path, one at a time and without `/S`. If there is another kind of reparse point or a removal fails, stop and keep the tree.

   ```bat
   rmdir "C:\Projetos\repo-lote\vendor"
   rmdir "C:\Projetos\repo-lote\projeto\node_modules"
   ```

4. Repeat `dir /AL` in every real folder you inventoried. Only continue once the absence of links is confirmed through the table in step 2: a path or access error is not absence.

5. Run `git worktree remove` with the verified path. If Git refuses the removal, keep the tree and investigate. After success, check `git worktree prune --dry-run --verbose` and run `git worktree prune` if the preview lists only disposable metadata.

   ```bat
   git worktree remove "C:\Projetos\repo-lote"
   git worktree prune --dry-run --verbose
   git worktree prune
   ```

6. Confirm the target is gone from `git worktree list --porcelain`. In every remaining tree, compare the content of `vendor` and `node_modules` with the earlier inventory and check that the kept junctions resolve to the expected targets.

   ```bat
   git worktree list --porcelain
   dir "C:\Projetos\repo\vendor"
   dir "C:\Projetos\repo\node_modules"
   ```

**Commands forbidden in this cleanup:** `rmdir /S`, `Remove-Item -Recurse`, `rm -rf`, and enumerating in PowerShell followed by deleting in CMD. Never use `git worktree remove --force` to override unintegrated work.

When you need a junction for shared dependencies, point it at the main tree. See the maintenance routine in `mdd-memory-gardening`.
