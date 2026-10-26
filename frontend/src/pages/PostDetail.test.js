jest.mock('../assets/eeeeee.png', () => 'author.png');
jest.mock('../assets/github.svg', () => 'github.svg');
jest.mock('../assets/linkedin-svgrepo-com (1).svg', () => 'linkedin.svg');
jest.mock('../assets/arrow-left.svg', () => 'arrow.svg');

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import PostDetail from './PostDetail';
import API from '../api/axios';
import { removeCachedPost } from '../api/blogCache';

const mockShowAlert = jest.fn(() => Promise.resolve());
const mockShowConfirm = jest.fn(() => Promise.resolve(true));

jest.mock('../api/axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    delete: jest.fn(),
  },
  prefetchCsrf: jest.fn(() => Promise.resolve()),
}));

jest.mock('../api/blogCache', () => ({
  readCachedPost: jest.fn(() => null),
  writeCachedPost: jest.fn(),
  removeCachedPost: jest.fn(),
}));

jest.mock('../seo/useDocumentMeta', () => ({
  useDocumentMeta: jest.fn(),
}));

jest.mock('../context/ModalContext', () => ({
  useModal: () => ({
    showAlert: (...args) => mockShowAlert(...args),
    showConfirm: (...args) => mockShowConfirm(...args),
  }),
}));

const post = {
  id: 1,
  title: 'HttpOnly cookies',
  tagline: 'Why localStorage lost',
  content: 'Body',
  coverImageUrl: 'cover.png',
  createdAt: '2026-01-01T12:00:00',
};

function renderPostDetail() {
  return render(
    <AuthContext.Provider value={{ isAuthenticated: true, loading: false, login: jest.fn(), logout: jest.fn() }}>
      <MemoryRouter initialEntries={['/blog/1']}>
        <Routes>
          <Route path="/blog/:id" element={<PostDetail />} />
          <Route path="/blog" element={<div>Blog list</div>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

beforeEach(() => {
  API.get.mockReset();
  API.delete.mockReset();
  mockShowAlert.mockClear();
  mockShowConfirm.mockClear();
  mockShowAlert.mockResolvedValue(undefined);
  mockShowConfirm.mockResolvedValue(true);
  API.get.mockResolvedValue({ data: post });
  API.delete.mockResolvedValue({ status: 200 });
});

test('delete asks for confirm then calls DELETE', async () => {
  renderPostDetail();

  expect(await screen.findByRole('button', { name: 'DELETE' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'DELETE' }));

  await waitFor(() => {
    expect(mockShowConfirm).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Delete post?',
      variant: 'danger',
    }));
  });
  await waitFor(() => {
    expect(API.delete).toHaveBeenCalledWith('/blog/admin/posts/1');
  });
  expect(removeCachedPost).toHaveBeenCalledWith('1');
});

test('delete does not call the API when confirm is cancelled', async () => {
  mockShowConfirm.mockResolvedValue(false);

  renderPostDetail();

  expect(await screen.findByRole('button', { name: 'DELETE' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'DELETE' }));

  await waitFor(() => {
    expect(mockShowConfirm).toHaveBeenCalled();
  });
  expect(API.delete).not.toHaveBeenCalled();
});
