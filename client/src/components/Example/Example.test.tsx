import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Example from './Example';

describe('Example Component', () => {
  it('renders the component', () => {
    render(<Example />);
    expect(screen.getByText('This is an example component')).toBeInTheDocument();
  });

  it('starts with counter at 0', () => {
    render(<Example />);
    expect(screen.getByText('Counter: 0')).toBeInTheDocument();
  });

  it('increments counter on button click', () => {
    render(<Example />);
    
    const button = screen.getByRole('button', { name: /increment/i });
    
    fireEvent.click(button);
    expect(screen.getByText('Counter: 1')).toBeInTheDocument();
    
    fireEvent.click(button);
    expect(screen.getByText('Counter: 2')).toBeInTheDocument();
  });
});
