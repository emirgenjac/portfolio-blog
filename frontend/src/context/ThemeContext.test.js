import { fireEvent, render, screen } from '@testing-library/react';
import { THEME_STORAGE_KEY, ThemeProvider, useTheme } from './ThemeContext';

function Probe() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button type="button" onClick={toggleTheme}>
      {theme}
    </button>
  );
}

function renderTheme(ui = <Probe />) {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
}

beforeEach(() => {
  window.localStorage.removeItem(THEME_STORAGE_KEY);
  document.documentElement.removeAttribute('data-theme');
  document.documentElement.style.colorScheme = '';
  document.documentElement.classList.remove('theme-changing');
  window.matchMedia = jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    addListener: jest.fn(),
    removeListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }));
});

test('defaults to light and persists a toggle to dark', () => {
  renderTheme();

  const button = screen.getByRole('button', { name: 'light' });
  expect(document.documentElement.dataset.theme).toBe('light');

  fireEvent.click(button);

  expect(screen.getByRole('button', { name: 'dark' })).toBeInTheDocument();
  expect(document.documentElement.dataset.theme).toBe('dark');
  expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
});

test('restores a stored dark preference', () => {
  window.localStorage.setItem(THEME_STORAGE_KEY, 'dark');

  renderTheme();

  expect(screen.getByRole('button', { name: 'dark' })).toBeInTheDocument();
  expect(document.documentElement.dataset.theme).toBe('dark');
});
