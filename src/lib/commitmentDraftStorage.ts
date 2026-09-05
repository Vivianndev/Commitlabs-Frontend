export type CommitmentFrequency = 'daily' | 'weekly' | 'monthly';
export interface CommitmentDraft {
  title?: string;
  description?: string;
  frequency?: CommitmentFrequency | '';
  amount?: number;
  startDate?: string;
  lastUpdated: number;
}
const K = 'commitment-draft-v1';
function ok() {
  try {
    localStorage.setItem('t', '1');
    localStorage.removeItem('t');
    return true;
  } catch {
    return false;
  }
}
export function saveDraft(d: CommitmentDraft) {
  if (!ok()) return;
  try {
    localStorage.setItem(K, JSON.stringify(d));
  } catch {
    // ignore
  }
}
export function loadDraft(): CommitmentDraft | null {
  if (!ok()) return null;
  try {
    const r = localStorage.getItem(K);
    if (!r) return null;
    const p = JSON.parse(r);
    if (!p || typeof p !== 'object' || typeof p.lastUpdated !== 'number') return null;
    if (!p.title && !p.description && !p.frequency && !p.startDate && p.amount === undefined) return null;
    return p as CommitmentDraft;
  } catch {
    return null;
  }
}
export function clearDraft() {
  if (!ok()) return;
  try {
    localStorage.removeItem(K);
  } catch {
    // ignore
  }
}
export function hasDraft() {
  return loadDraft() !== null;
}
