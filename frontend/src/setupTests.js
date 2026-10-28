import '@testing-library/jest-dom';

import { TextDecoder, TextEncoder } from 'util';

if (!global.TextEncoder) {
  global.TextEncoder = TextEncoder;
}
if (!global.TextDecoder) {
  global.TextDecoder = TextDecoder;
}

if (!window.matchMedia) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query) => ({
      matches: false,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

afterEach(() => {
  window.localStorage.removeItem("theme");
  document.documentElement.removeAttribute("data-theme");
  document.documentElement.style.colorScheme = "";
  document.documentElement.classList.remove("theme-changing");
});
