import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Practice from "./pages/Practice.jsx";

function App() {
  return (
    <Router>
      <div>
        <Navbar />
        <main className="min-h-screen flex justify-center items-center">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/practice" element={<Practice />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;