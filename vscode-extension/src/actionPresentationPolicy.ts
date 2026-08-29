export type PresentationOverride = 'auto' | 'quick' | 'form';
export type PresentationMode = 'direct' | 'quick' | 'form';
export type PresentationImpact = 'read-only' | 'local' | 'mutating' | 'remote' | 'destructive';

export interface PresentationPolicyInput {
  fieldCount: number;
  hasDependentFields?: boolean;
  impact: PresentationImpact;
  override?: PresentationOverride;
}

export function selectPresentation(input: PresentationPolicyInput): PresentationMode {
  if (input.override === 'quick') return input.fieldCount === 0 ? 'direct' : 'quick';
  if (input.override === 'form') return 'form';

  if (input.impact === 'remote' || input.impact === 'destructive') {
    return 'form';
  }
  if (input.fieldCount <= 0) return 'direct';
  if (input.fieldCount === 1) return 'quick';
  if (input.fieldCount === 2) return input.hasDependentFields ? 'quick' : 'form';
  return 'form';
}
