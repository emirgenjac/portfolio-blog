import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import API from '../api/axios';
import { writeCachedPosts } from '../api/blogCache';
import SearchPalette from './SearchPalette';

jest.mock('../api/axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
}));

function renderPalette({ open = true, onOpen = jest.fn(), onClose = jest.fn() } = {}) {
  return render(
    <MemoryRouter>
      <SearchPalette open={open} onOpen={onOpen} onClose={onClose} />
    </MemoryRouter>
  );
}

beforeEach(() => {
  API.get.mockReset();
  window.localStorage.clear();
});

test('closed palette is not in the document', () => {
  renderPalette({ open: false });
  expect(screen.queryByRole('dialog', { name: 'Search' })).not.toBeInTheDocument();
});

test('opens from Ctrl+K and Escape closes', () => {
  const onOpen = jest.fn();
  const onClose = jest.fn();
  const { rerender } = renderPalette({ open: false, onOpen, onClose });

  fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
  expect(onOpen).toHaveBeenCalled();

  rerender(
    <MemoryRouter>
      <SearchPalette open onOpen={onOpen} onClose={onClose} />
    </MemoryRouter>
  );
  fireEvent.keyDown(window, { key: 'Escape' });
  expect(onClose).toHaveBeenCalled();
});

test('renders snippet as text so markup cannot inject', async () => {
  API.get.mockResolvedValue({
    data: [{
      kind: 'post',
      id: 1,
      title: 'Safe title',
      snippet: '<img alt="xss" src="x" />',
      href: '/blog/1',
    }],
  });

  renderPalette();
  fireEvent.change(screen.getByLabelText('Search posts and projects'), {
    target: { value: 'jwt' },
  });

  expect(await screen.findByText('<img alt="xss" src="x" />')).toBeInTheDocument();
  expect(screen.queryByRole('img')).not.toBeInTheDocument();
  expect(API.get).toHaveBeenCalledWith('/search', { params: { q: 'jwt' } });
});

test('empty results show example guidance', async () => {
  API.get.mockResolvedValue({ data: [] });

  renderPalette();
  fireEvent.change(screen.getByLabelText('Search posts and projects'), {
    target: { value: 'zzzz-no-hit' },
  });

  expect(await screen.findByText(/No matching work/)).toBeInTheDocument();
});

test('example chip fills the query', () => {
  renderPalette();
  fireEvent.click(screen.getByRole('button', { name: 'JWT' }));
  expect(screen.getByLabelText('Search posts and projects')).toHaveValue('JWT');
});

test('about hit points at the making-of blog post', async () => {
  API.get.mockResolvedValue({
    data: [{
      kind: 'about',
      id: 1,
      title: 'About this site',
      snippet: 'Made with Spring Boot and React',
      href: '/blog/9',
    }],
  });

  renderPalette();
  fireEvent.change(screen.getByLabelText('Search posts and projects'), {
    target: { value: 'made' },
  });

  const link = await screen.findByRole('link', { name: /About this site/ });
  expect(link).toHaveAttribute('href', '/blog/9');
});

test('falls back to cached results when the API is down', async () => {
  writeCachedPosts([{
    id: 9,
    title: 'Kako sam pravio ovaj sajt (i šta sam stvarno naučio)',
    tagline: 'Portfolio blog',
    content: 'Ovaj sajt uses HttpOnly JWT cookies.',
  }]);
  API.get.mockRejectedValue({ request: {} });

  renderPalette();
  fireEvent.change(screen.getByLabelText('Search posts and projects'), {
    target: { value: 'jwt' },
  });

  expect(await screen.findByText('Server asleep — showing cached results.')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /Kako sam pravio ovaj sajt/ })).toHaveAttribute('href', '/blog/9');
});
