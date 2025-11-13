    import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
    import Home from './pages/Home';
    import Blog from './pages/Blog';
    import NavBar from "./components/NavBar";
    import "./styles/App.css";
    import PostDetail from "./pages/PostDetail";
    import CreatePost from "./pages/CreatePost";
    import EditPost from "./pages/EditPost";
    import LoginPage from "./pages/LoginPage";


    function App() {


      return (
        <>
          <NavBar />
            <main className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:id" element={<PostDetail />} />
              <Route path={"/blog/admin/posts"} element={<CreatePost />} />
              <Route path="/blog/admin/posts/:id/edit" element={<EditPost />} />
              <Route path="/auth/login" element={<LoginPage />} />
          </Routes>
            </main>
        </>
      );
    }

    export default App;
