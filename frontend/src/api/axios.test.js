jest.mock('axios', () => {
  const instances = [];
  const mock = {
    create() {
      const instance = {
        interceptors: {
          request: {
            handlers: [],
            use(fulfilled) {
              this.handlers.push({ fulfilled });
              return this.handlers.length - 1;
            },
          },
          response: {
            handlers: [],
            use(fulfilled, rejected) {
              this.handlers.push({ fulfilled, rejected });
              return this.handlers.length - 1;
            },
          },
        },
        get: jest.fn(),
        post: jest.fn(),
        request: jest.fn(),
      };
      instances.push(instance);
      return instance;
    },
    __instances: instances,
  };
  mock.default = mock;
  return mock;
});

import axios from 'axios';
import './axios';

function apiInstance() {
  return axios.__instances[0];
}

async function runCsrfInterceptor(config) {
  return apiInstance().interceptors.request.handlers[0].fulfilled(config);
}

beforeEach(() => {
  document.cookie.split(';').forEach((part) => {
    const name = part.split('=')[0].trim();
    if (name) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    }
  });
});

test('copies XSRF-TOKEN cookie onto mutation requests', async () => {
  document.cookie = 'XSRF-TOKEN=csrf-from-cookie';

  const config = await runCsrfInterceptor({
    method: 'post',
    url: '/auth/login',
    headers: {},
  });

  expect(config.headers['X-XSRF-TOKEN']).toBe('csrf-from-cookie');
});

test('does not attach CSRF on GET', async () => {
  document.cookie = 'XSRF-TOKEN=csrf-from-cookie';

  const config = await runCsrfInterceptor({
    method: 'get',
    url: '/blog',
    headers: {},
  });

  expect(config.headers['X-XSRF-TOKEN']).toBeUndefined();
});
