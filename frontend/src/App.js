import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import NavBar from "./components/NavBar";
import "./styles/App.css";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from './context/AuthContext';
import { ModalProvider } from './context/ModalContext';
import { ThemeProvider } from './context/ThemeContext';
import ApiLoading from './components/ApiLoading';

const Blog = lazy(() => import('./pages/Blog'));
const PostDetail = lazy(() => import('./pages/PostDetail'));
const CreatePost = lazy(() => import('./pages/CreatePost'));
const EditPost = lazy(() => import('./pages/EditPost'));
const LoginPage = lazy(() => import('./pages/LoginPage'));

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ModalProvider>
          <NavBar />
          <main className="content">
            <Suspense fallback={<ApiLoading />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:id" element={<PostDetail />} />
                <Route path="/blog/admin/posts" element={<ProtectedRoute><CreatePost /></ProtectedRoute>} />
                <Route path="/blog/admin/posts/:id/edit" element={<ProtectedRoute><EditPost /></ProtectedRoute>} />
                <Route path="/auth/login" element={<LoginPage />} />
              </Routes>
            </Suspense>
          </main>
        </ModalProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
