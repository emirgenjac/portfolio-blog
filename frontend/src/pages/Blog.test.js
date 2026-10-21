import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Blog from './Blog';
import API from '../api/axios';

jest.mock('../api/axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
}));

function renderBlog() {
  return render(
    <MemoryRouter>
      <Blog />
    </MemoryRouter>
  );
}

beforeEach(() => {
  API.get.mockReset();
});

test('shows a loading status while posts are fetching', async () => {
  let resolveGet;
  API.get.mockReturnValue(new Promise((resolve) => {
    resolveGet = resolve;
  }));

  renderBlog();

  expect(screen.getByRole('status')).toHaveTextContent('Loading');
  expect(screen.queryByText('No posts yet.')).not.toBeInTheDocument();

  resolveGet({ data: [] });
  await waitFor(() => {
    expect(screen.getByText('No posts yet.')).toBeInTheDocument();
  });
});

test('lists posts after a successful fetch', async () => {
  API.get.mockResolvedValue({
    data: [{
      id: 1,
      title: 'HttpOnly cookies',
      tagline: 'Why localStorage lost',
      coverImageUrl: 'cover.png',
    }],
  });

  renderBlog();

  expect(await screen.findByText('HttpOnly cookies')).toBeInTheDocument();
  expect(screen.getByText('Why localStorage lost')).toBeInTheDocument();
});
