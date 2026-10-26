import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AuthContext } from '../context/AuthContext';
import LoginForm from './LoginForm';
import API from '../api/axios';

const mockShowAlert = jest.fn(() => Promise.resolve());
const mockLogin = jest.fn();

jest.mock('../api/axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
  },
  prefetchCsrf: jest.fn(() => Promise.resolve()),
}));

jest.mock('../context/ModalContext', () => ({
  useModal: () => ({
    showAlert: (...args) => mockShowAlert(...args),
    showConfirm: jest.fn(() => Promise.resolve(true)),
  }),
}));

function renderLoginForm() {
  return render(
    <AuthContext.Provider value={{ isAuthenticated: false, loading: false, login: mockLogin, logout: jest.fn() }}>
      <LoginForm />
    </AuthContext.Provider>
  );
}

function fillAndSubmit() {
  fireEvent.change(document.querySelector('input[type="email"]'), { target: { value: 'admin@example.com' } });
  fireEvent.change(document.querySelector('input[type="password"]'), { target: { value: 'secret123' } });
  fireEvent.click(screen.getByRole('button', { name: 'Login' }));
}

beforeEach(() => {
  API.post.mockReset();
  mockShowAlert.mockClear();
  mockLogin.mockClear();
  mockShowAlert.mockResolvedValue(undefined);
});

test('shows invalid credentials on 401', async () => {
  API.post.mockRejectedValue({ response: { status: 401 } });

  renderLoginForm();
  fillAndSubmit();

  await waitFor(() => {
    expect(mockShowAlert).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Login failed',
      message: 'Invalid credentials. Please try again.',
      variant: 'error',
    }));
  });
  expect(mockLogin).not.toHaveBeenCalled();
});

test('shows too many attempts on 429', async () => {
  API.post.mockRejectedValue({
    response: {
      status: 429,
      data: { message: 'Too many login attempts. Please try again later.' },
    },
  });

  renderLoginForm();
  fillAndSubmit();

  await waitFor(() => {
    expect(mockShowAlert).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Too many attempts',
      message: 'Too many login attempts. Please try again later.',
      variant: 'error',
    }));
  });
  expect(mockLogin).not.toHaveBeenCalled();
});
