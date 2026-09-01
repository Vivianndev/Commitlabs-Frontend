import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Page from '../page';
import { loadDraft, saveDraft, clearDraft } from '@/lib/commitmentDraftStorage';
jest.mock('@/lib/commitmentDraftStorage');
const mockLoad = loadDraft as jest.Mock;
const mockSave = saveDraft as jest.Mock;
const mockClear = clearDraft as jest.Mock;
let mockFetch = jest.fn();
beforeEach(() => {
  jSt.clearAllMocks();
  mockLoad.mockReturnValue(null);
  mockSave.mockImplementation(() => {});
  mockClear.mockImplementation(() => {});
  mockFetch.mockReset();
  (global as any).fetch = mockFetch;
});
const fillTitle = () => {
  fireEvent.change(screen.getLabelText('Title'), { target: { value: 'Read daily' } });
  fireEvent.change(screen.getLabelText('Description'), { target: { value: 'Read 30min' } });
  fireEvent.click(screen.getByRole('button', { name: /next/i }));
};
const complete = () => {
  render(<Page />);
  fillTitle();
  fireEvent.change(screen.getLabelText('Start date'), { target: { value: '2025-03-01' } });
  fireEvent.change(screen.getLabelText('Frequency'), { target: { value: 'daily' } });
  fireEvent.click(screen.getByRole('button', { name: /create commitment/i }));
};
describe('Create page', () => {
  it('shows resume prompt when draft exists', () => {
    mockLoad.mockReturnValue({ title: 'T', description: 'D', frequency: 'daily', startDate: '2025-01-01', lastUpdated: 1 });
    render(<Page />);
    expect(screen.getByRole('button', { name: /resume draft/i })).toBeInDocument();
  });
  it('no prompt when no draft', () => {
    render(<Page />);
    expect(screen.queryByRole('button', { name: /resume draft/i })).notToBeInDocument();
  });
  it('resume populates form', () => {
    mockLoad.mockReturnValue({ title: 'Run', description: '5km', frequency: 'daily', startDate: '2025-01-01', lastUpdated: 1 });
    render(<Page />);
    fireEvent.click(screen.getByRole('button', { name: /resume draft/i }));
    expect(screen.getLabelText('Title')).toHaveValue('Run');
  });
  it('start over clears draft', () => {
    mockLoad.mockReturnValue({ title: 'Old', description: '', frequency: 'daily', startDate: '2025-01-01', lastUpdated: 1 });
    render(<Page />);
    fireEvent.click(screen.getByRole('button', { name: /start over/i }));
    expect(mockClear).toHaveBeenCalled();
  });
  it('validates required title', () => {
    render(<Page />);
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    expect(screen.getByRole('alert')).toHaveTextContent('Title is required.');
  });
  it('saves draft on next valid', () => {
    render(<Page />);
    fireEvent.change(screen.getLabelText('Title'), { target: { value: 'Valid title' } });
    fireEvent.change(screen.getLabelText('Description'), { target: { value: 'desc' } });
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    expect(mockSave).toHaveBeenCalledWith(expect.objectContaining({ title: 'Valid title' }));
  });
  it('shows loading and success', async () => {
    mockFetch.mockImplementationOnce(() => new Promise(r => setTimeout(() => r({ ok: true }), 10)));
    complete();
    expect(screen.getByRole('button', { name: /creating\\.\\.\\./i })).toBeDisabled();
    await screen.findByRole('status');
    expect(screen.getText(/commitment was created successfully/i)).toBeInDocument();
    expect(mockClear).toHaveBeenCalled();
  });
  it('shows error and retry', async () => {
    mockFetch.mockRejectedOnce(new Error('net')).mockResolvedOnce({ ok: true });
    complete();
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/failed to create commitment/i);
    fireEvent.click(screen.getByRole('button', { name: /create commitment/i }));
    await screen.findByRole('status');
  });
  it('shows permission error', async () => {
    mockFetch.mockResolvedOnce({ ok: false, status: 403 });
    complete();
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/permission/i);
  });
});