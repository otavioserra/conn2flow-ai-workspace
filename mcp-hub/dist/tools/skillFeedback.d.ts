/**
 * Skill-feedback tools (ARCH-018 Phase 2). All rules live in the Python `mdd feedback`
 * CLI; this adapter only maps MCP arguments to explicit argv (never a shell).
 */
export interface SubmitSkillFeedbackArgs {
    persona: string;
    skill: string;
    kind: string;
    severity: string;
    summary: string;
    evidence: string;
    proposal?: string;
    repo?: string;
    req?: string;
    batch?: string;
    scope?: string;
    matrix?: string;
    repo_path?: string;
    github?: boolean;
    github_repo?: string;
}
export interface ListSkillFeedbackArgs {
    status?: string;
    verdict?: string;
    skill?: string;
    repo?: string;
    severity?: string;
    include_github?: boolean;
    matrix?: string;
}
export interface FeedbackOptions {
    workspaceRoot?: string;
    command?: string[];
}
/** Resolve the mdd executable: MDD_CLI (path or JSON argv) > matrix .venv-mdd > PATH. */
export declare function resolveMddCommand(workspaceRoot?: string): string[];
export declare function submitSkillFeedback(args: SubmitSkillFeedbackArgs, options?: FeedbackOptions): Promise<unknown>;
export declare function listSkillFeedback(args?: ListSkillFeedbackArgs, options?: FeedbackOptions): Promise<unknown>;
