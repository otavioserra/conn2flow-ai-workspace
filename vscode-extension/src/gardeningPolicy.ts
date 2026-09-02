export const MEMORY_GARDENING_LIMITS = Object.freeze({
  warningBytes: 50 * 1024,
  warningLines: 200,
  criticalBytes: 75 * 1024,
  criticalLines: 300,
  targetBytes: 25 * 1024,
  recentTasksMin: 20,
  recentTasksMax: 25
});

export type MemoryThresholdStatus = 'healthy' | 'warning' | 'critical';

export function classifyMemoryHealth(sizeBytes: number, lineCount: number): MemoryThresholdStatus {
  if (
    sizeBytes >= MEMORY_GARDENING_LIMITS.criticalBytes ||
    lineCount >= MEMORY_GARDENING_LIMITS.criticalLines
  ) {
    return 'critical';
  }

  if (
    sizeBytes >= MEMORY_GARDENING_LIMITS.warningBytes ||
    lineCount >= MEMORY_GARDENING_LIMITS.warningLines
  ) {
    return 'warning';
  }

  return 'healthy';
}
