export interface CommitmentDraftInput {
  title?: string;
  description?: string;
  frequency?: string;
  startDate?: string;
  amount?: string | number;
}

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export function validateCommitmentDraft(input: CommitmentDraftInput): ValidationResult {
  const errors: Record<string, string> = {};
  const title = (input.title ?? '').trim();
  const frequency = input.frequency ?? '';
  const startDate = input.startDate ?? '';
  const amount = input.amount;

  if (!title) { errors.title = 'Title is required.'; }
  else if (title.length < 3) { errors.title = 'Title must be at least 3 characters.'; }
  else if (title.length > 100) { errors.title = 'Title must be less than 100 characters.'; }

  if (!['daily', 'weekly', 'monthly'].includes(frequency)) { errors.frequency = 'Frequency is required.'; }

  if (!startDate) { errors.startDate = 'Start date is required.'; }
  else if (isNaN(Date.parse(startDate))) { errors.startDate = 'Start date must be valid.'; }

  if (amount !== undefined || amount !== '') {
    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) { errors.amount = 'Amount must be positive.'; }
  }

  if (input.description && input.description.length > 500) { errors.description = 'Description must be under 500 characters.'; }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
