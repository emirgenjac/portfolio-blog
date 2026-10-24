import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import ProtectedRoute from './ProtectedRoute';

const mockShowAlert = jest.fn(() => Promise.resolve());

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
    showAlert: (...args) => mockShowAlert(...args),
    showConfirm: jest.fn(() => Promise.resolve(true)),
  }),
}));

function renderProtected({ isAuthenticated, loading = false }) {
  return render(
    <AuthContext.Provider value={{ isAuthenticated, loading, login: jest.fn(), logout: jest.fn() }}>
      <MemoryRouter initialEntries={['/blog/admin/posts']}>
        <Routes>
          <Route path="/auth/login" element={<div>Login Page</div>} />
          <Route
            path="/blog/admin/posts"
            element={(
              <ProtectedRoute>
                <div>Create Post Page</div>
              </ProtectedRoute>
            )}
          />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

beforeEach(() => {
  mockShowAlert.mockClear();
  mockShowAlert.mockImplementation(() => Promise.resolve());
});

test('redirects unauthenticated users to login after alert', async () => {
  renderProtected({ isAuthenticated: false });

  expect(await screen.findByText('Login Page')).toBeInTheDocument();
  expect(screen.queryByText('Create Post Page')).not.toBeInTheDocument();
  expect(mockShowAlert).toHaveBeenCalledWith(expect.objectContaining({
    title: 'Login required',
    variant: 'error',
  }));
});

test('renders children when authenticated', async () => {
  renderProtected({ isAuthenticated: true });

  expect(await screen.findByText('Create Post Page')).toBeInTheDocument();
  expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
  expect(mockShowAlert).not.toHaveBeenCalled();
});

test('shows a loading status while auth is loading', async () => {
  renderProtected({ isAuthenticated: false, loading: true });

  expect(screen.getByRole('status')).toHaveTextContent('Loading');
  await waitFor(() => {
    expect(screen.queryByText('Create Post Page')).not.toBeInTheDocument();
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
  });
  expect(mockShowAlert).not.toHaveBeenCalled();
});
