import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
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
      <ThemeProvider>
        <MemoryRouter initialEntries={[path]}>
          <NavBar />
        </MemoryRouter>
      </ThemeProvider>
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

test('toggles the phone menu from the hamburger button', () => {
  renderNavBar({ isAuthenticated: false, path: '/' });

  const toggle = screen.getByRole('button', { name: 'Open menu' });
  expect(toggle).toHaveAttribute('aria-expanded', 'false');

  fireEvent.click(toggle);

  expect(toggle).toHaveAttribute('aria-expanded', 'true');
  expect(toggle).toHaveAttribute('aria-label', 'Close menu');
  expect(screen.getByRole('button', { name: 'Dismiss menu' })).toBeInTheDocument();
});

test('theme switch is compact and toggles dark mode', () => {
  renderNavBar({ isAuthenticated: false, path: '/' });

  const themeSwitch = screen.getByRole('switch', { name: 'Switch to dark mode' });
  expect(themeSwitch).toHaveAttribute('aria-checked', 'false');
  expect(document.documentElement.dataset.theme).toBe('light');

  fireEvent.click(themeSwitch);

  expect(screen.getByRole('switch', { name: 'Switch to light mode' })).toHaveAttribute('aria-checked', 'true');
  expect(document.documentElement.dataset.theme).toBe('dark');
  expect(window.localStorage.getItem('theme')).toBe('dark');
});
