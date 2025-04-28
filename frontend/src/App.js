import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Home from './pages/Home';
import Blog from './pages/Blog';
import NavBar from "./components/NavBar";
import "./styles/App.css";


function App() {
  return (
    <Router>
      <NavBar />
        <main className="content">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/blog" element={<Blog />} />
      </Routes>
        </main>
    </Router>
  );
}

export default App;
