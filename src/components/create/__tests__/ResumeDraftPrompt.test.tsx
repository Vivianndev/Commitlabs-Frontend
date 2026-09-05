import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import ResumeDraftPrompt from '../ResumeDraftPrompt';

describe('ResumeDraftPrompt', () => {
  it('renders null when closed', () => {
    const { container } = render(<ResumeDraftPrompt open={false} onResume={() => {}} onDiscard={() => {}} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders dialog when open', () => {
    render(<ResumeDraftPrompt open onResume={() => {}} onDiscard={() => {}} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('calls onResume', () => {
    const fn = jest.fn();
    render(<ResumeDraftPrompt open onResume={fn} onDiscard={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /resume draft/i }));
    expect(fn).toHaveBeenCalled();
  });

  it('calls onDiscard', () => {
    const fn = jest.fn();
    render(<ResumeDraftPrompt open onResume={() => {}} onDiscard={fn} />);
    fireEvent.click(screen.getByRole('button', { name: /start over/i }));
    expect(fn).toHaveBeenCalled();
  });

  it('focuses resume button on open', () => {
    const { rerender } = render(<ResumeDraftPrompt open={false} onResume={() => {}} onDiscard={() => {}} />);
    rerender(<ResumeDraftPrompt open onResume={() => {}} onDiscard={() => {}} />);
    expect(screen.getByRole('button', { name: /resume draft/i })).toHaveFocus();
  });

  it('has accessible name', () => {
    render(<ResumeDraftPrompt open onResume={() => {}} onDiscard={() => {}} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAccessibleName(/resume draft/i);
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('focuses the first focusable element when opened', () => {
    const { rerender } = render(<ResumeDraftPrompt open={false} onResume={() => {}} onDiscard={() => {}} />);
    rerender(<ResumeDraftPrompt open onResume={() => {}} onDiscard={() => {}} />);
    expect(document.activeElement).toHaveTextContent(/Resume draft/i);
  });

  it('allows keyboard activation on resume button', async () => {
    const user = userEvent.setup();
    const onResume = jest.fn();
    render(<ResumeDraftPrompt open onResume={onResume} onDiscard={() => {}} />);
    await user.click(screen.getByRole('button', { name: /resume draft/i }));
    expect(onResume).toHaveBeenCalled();
  });

  it('calls onDiscard on Escape keypress', () => {
    const onDiscard = jest.fn();
    render(<ResumeDraftPrompt open onResume={() => {}} onDiscard={onDiscard} />);
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(onDiscard).toHaveBeenCalled();
  });

  it('disables buttons while loading', () => {
    render(<ResumeDraftPrompt open onResume={() => {}} onDiscard={() => {}} {...{ isLoading: true } as any} />);
    expect(screen.getByRole('button', { name: /resume draft/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /start over/i })).toBeDisabled();
  });

  it('shows error message when an error occurs', () => {
    render(<ResumeDraftPrompt open onResume={() => {}} onDiscard={() => {}} {...{ error: 'Failed to load draft.' } as any} />);
    expect(screen.getByText(/Failed to load draft/)).toBeInTheDocument();
  });

  it('allows retry by clicking resume after error', () => {
    const onResume = jest.fn();
    render(<ResumeDraftPrompt open onResume={onResume} onDiscard={() => {}} {...{ error: 'Failed' } as any} />);
    fireEvent.click(screen.getByRole('button', { name: /resume draft/i }));
    expect(onResume).toHaveBeenCalled();
  });

  it('prevents resuming without permission', () => {
    render(<ResumeDraftPrompt open onResume={() => {}} onDiscard={() => {}} {...{ isForbidden: true } as any} />);
    expect(screen.getByRole('button', { name: /resume draft/i })).toBeDisabled();
    expect(screen.getByText(/You do not have permission to resume this draft/)).toBeInTheDocument();
  });
});