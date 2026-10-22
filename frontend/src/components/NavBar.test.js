import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import NavBar from './NavBar';

jest.mock('../api/axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  },
  prefetchCsrf: jest.fn(() => Promise.resolve()),
}));

jest.mock('../context/ModalContext', () => ({
  useModal: () => ({
    showAlert: jest.fn(() => Promise.resolve()),
    showConfirm: jest.fn(() => Promise.resolve(true)),
  }),
}));

function renderNavBar({ isAuthenticated, loading = false, path = '/blog' }) {
  return render(
    <AuthContext.Provider value={{ isAuthenticated, loading, login: jest.fn(), logout: jest.fn() }}>
      <MemoryRouter initialEntries={[path]}>
        <NavBar />
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

test('hides Create link when not authenticated on blog', () => {
  renderNavBar({ isAuthenticated: false });

  expect(screen.queryByRole('link', { name: 'Create' })).not.toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Login' })).toBeInTheDocument();
});

test('shows Create link when authenticated on blog', () => {
  renderNavBar({ isAuthenticated: true });

  expect(screen.getByRole('link', { name: 'Create' })).toHaveAttribute('href', '/blog/admin/posts');
  expect(screen.getByRole('button', { name: 'Logout' })).toBeInTheDocument();
  expect(screen.queryByRole('link', { name: 'Login' })).not.toBeInTheDocument();
});

test('hides Create link on home even when authenticated', () => {
  renderNavBar({ isAuthenticated: true, path: '/' });

  expect(screen.queryByRole('link', { name: 'Create' })).not.toBeInTheDocument();
});
