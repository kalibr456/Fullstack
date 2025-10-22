import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Sections from "./pages/Sections";
import Diary from "./pages/Diary";
import Register from "./pages/Register";
import About from "./pages/About";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sections" element={<Sections />} />
        <Route path="/diary" element={<Diary />} />
        <Route path="/Register" element={<Register />} />
        <Route path="/About" element= {<About /> } />
      </Routes>
    </Router>
  );
}

export default App;


