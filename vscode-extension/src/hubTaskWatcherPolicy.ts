export interface HubTaskPayload {
  taskId?: string;
  reqId?: string;
  repo?: string;
  mode?: string;
  status?: string;
  prompt?: string;
  createdAt?: string;
}

export interface HubCompletionPayload {
  receiptId?: string;
  batchId?: string;
  taskId?: string;
  reqId?: string;
  role?: string;
  status?: string;
  timestamp?: string;
}

export interface TaskEvaluationResult {
  shouldHandle: boolean;
  reqId?: string;
  status?: string;
}

export interface CompletionEvaluationResult {
  shouldHandle: boolean;
  batchId?: string;
  role?: string;
  status?: string;
}

export function evaluateTaskEvent(
  watcherEnabled: boolean,
  task: HubTaskPayload | null | undefined
): TaskEvaluationResult {
  if (!watcherEnabled || !task) {
    return { shouldHandle: false };
  }
  if (task.status === 'dispatched') {
    return {
      shouldHandle: true,
      reqId: task.reqId,
      status: task.status
    };
  }
  return {
    shouldHandle: false,
    status: task.status
  };
}

export function evaluateCompletionEvent(
  watcherEnabled: boolean,
  completion: HubCompletionPayload | null | undefined
): CompletionEvaluationResult {
  if (!watcherEnabled || !completion) {
    return { shouldHandle: false };
  }
  if (completion.status === 'success' && completion.role === 'executor') {
    return {
      shouldHandle: true,
      batchId: completion.batchId,
      role: completion.role,
      status: completion.status
    };
  }
  return {
    shouldHandle: false,
    role: completion.role,
    status: completion.status
  };
}

export function parseHubPayload<T>(rawContent: string): T | undefined {
  try {
    return JSON.parse(rawContent) as T;
  } catch {
    return undefined;
  }
}
