import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ResumeDraftPrompt from '../ResumeDraftPrompt';
describe('ResumeDraftPrompt', () => {
  it('renders null when closed', () => {
    const { container } = render(<ResumeDraftPrompt open={false} onResume={() => {}} onDiscard={() => {}} />);
    expect(container).toBeEmptyDOMElement();
  });
  it('renders dialog when open', () => {
    render(<ResumeDraftPrompt open={true} onResume={() => {}} onDiscard={() => {}} />);
    expect(screen.getByRole('dialog')).toBeInDocument();
  });
  it('calls onResume', () => {
    const fn = jest.fn();
    render(<ResumeDraftPrompt open={true} onResume={fn} onDiscard={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /resume draft/i }));
    expect(fn).toHaveBeenCalled();
  });
  it('calls onDiscard', () => {
    const fn = jest.fn();
    render(<ResumeDraftPrompt open={true} onResume={() => {}} onDiscard={fn} />);
    fireEvent.click(screen.getByRole('button', { name: /start over/i }));
    expect(fn).toHaveBeenCalled();
  });
  it('focuses resume button on open', () => {
    const { rerender } = render(<ResumeDraftPrompt open={false} onResume={() => {}} onDiscard={() => {}} />);
    rerender(<ResumeDraftPrompt open={true} onResume={() => {}} onDiscard={() => {}} />);
    expect(screen.getByRole('button', { name: /resume draft/i })).toHaveFocus();
  });
});