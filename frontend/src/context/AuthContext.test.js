import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext, AuthProvider } from './AuthContext';
import API, { prefetchCsrf } from '../api/axios';

jest.mock('../api/axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
  },
  prefetchCsrf: jest.fn(() => Promise.resolve()),
}));

function Probe() {
  const { loading, isAuthenticated } = useContext(AuthContext);
  return (
    <div>
      <span>{loading ? 'loading' : 'ready'}</span>
      <span>{isAuthenticated ? 'authed' : 'guest'}</span>
    </div>
  );
}

function renderAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider>
        <Probe />
      </AuthProvider>
    </MemoryRouter>
  );
}

beforeEach(() => {
  API.get.mockReset();
  API.post.mockReset();
  prefetchCsrf.mockReset();
  prefetchCsrf.mockResolvedValue(undefined);
});

test('does not call /auth/me on the homepage', async () => {
  API.get.mockResolvedValue({ status: 200, data: {} });

  renderAt('/');

  expect(await screen.findByText('ready')).toBeInTheDocument();
  expect(API.get).not.toHaveBeenCalled();
  expect(prefetchCsrf).not.toHaveBeenCalled();
  expect(screen.getByText('guest')).toBeInTheDocument();
});

test('checks /auth/me on blog routes', async () => {
  API.get.mockResolvedValue({ status: 200, data: { email: 'admin@example.com' } });

  renderAt('/blog');

  expect(await screen.findByText('authed')).toBeInTheDocument();
  expect(API.get).toHaveBeenCalledWith('/auth/me');
  expect(prefetchCsrf).toHaveBeenCalled();
});
