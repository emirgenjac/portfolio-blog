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
  window.localStorage.clear();
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

test('shows cached posts immediately while a refresh is in flight', () => {
  window.localStorage.setItem('pb.blog.list', JSON.stringify({
    savedAt: Date.now(),
    data: [{
      id: 2,
      title: 'Cached post',
      tagline: 'From last visit',
      coverImageUrl: 'cached.png',
    }],
  }));
  API.get.mockReturnValue(new Promise(() => {}));

  renderBlog();

  expect(screen.getByText('Cached post')).toBeInTheDocument();
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
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
