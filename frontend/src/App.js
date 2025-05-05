import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Home from './pages/Home';
import Blog from './pages/Blog';
import NavBar from "./components/NavBar";
import "./styles/App.css";


function App() {


  return (
    <>
      <NavBar />
        <main className="content">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/blog/posts" element={<Blog />} />
      </Routes>
        </main>
    </>
  );
}

export default App;
