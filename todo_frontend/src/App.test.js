import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

test('renders header and add form', () => {
  render(<App />);
  expect(screen.getByText(/Simple Todos/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/Add a new task/i)).toBeInTheDocument();
});

test('allows adding a todo', () => {
  render(<App />);
  const input = screen.getByPlaceholderText(/Add a new task/i);
  const addBtn = screen.getByRole('button', { name: /Add/i });
  fireEvent.change(input, { target: { value: 'Buy milk' } });
  fireEvent.click(addBtn);
  expect(screen.getByText('Buy milk')).toBeInTheDocument();
});
