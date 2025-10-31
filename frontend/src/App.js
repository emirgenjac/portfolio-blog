import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Home from './pages/Home';
import Blog from './pages/Blog';
import NavBar from "./components/NavBar";
import "./styles/App.css";
import PostDetail from "./pages/PostDetail";


function App() {


  return (
    <>
      <NavBar />
        <main className="content">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:id" element={<PostDetail />} />
      </Routes>
        </main>
    </>
  );
}

export default App;
