import { fireEvent, render, screen } from '@testing-library/react';
import PostForm from './PostForm';

test('does not submit when required fields are empty', () => {
  const onSubmit = jest.fn();

  render(<PostForm onSubmit={onSubmit} submitText="Publish" />);
  fireEvent.click(screen.getByRole('button', { name: 'Publish' }));

  expect(onSubmit).not.toHaveBeenCalled();
  expect(screen.getByText('Title is required.')).toBeInTheDocument();
  expect(screen.getByText('Tagline is required.')).toBeInTheDocument();
  expect(screen.getByText('Cover image URL is required.')).toBeInTheDocument();
  expect(screen.getByText('Content is required.')).toBeInTheDocument();
});

test('submits trimmed field values when valid', () => {
  const onSubmit = jest.fn();

  render(<PostForm onSubmit={onSubmit} submitText="Publish" />);

  const inputs = document.querySelectorAll('input');
  fireEvent.change(inputs[0], { target: { value: 'HttpOnly cookies' } });
  fireEvent.change(inputs[1], { target: { value: 'Why localStorage lost' } });
  fireEvent.change(inputs[2], { target: { value: 'https://example.com/cover.jpg' } });
  fireEvent.change(document.querySelector('textarea'), { target: { value: 'Body' } });
  fireEvent.click(screen.getByRole('button', { name: 'Publish' }));

  expect(onSubmit).toHaveBeenCalledTimes(1);
  expect(onSubmit).toHaveBeenCalledWith({
    title: 'HttpOnly cookies',
    tagline: 'Why localStorage lost',
    coverImageUrl: 'https://example.com/cover.jpg',
    content: 'Body',
  });
});
