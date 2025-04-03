import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Encrypt from './pages/Encrypt';
import Decrypt from './pages/Decrypt';
import AuthWrapper from './components/AuthWrapper';

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/auth" element={<AuthWrapper />} />
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="encrypt" element={<Encrypt />} />
          <Route path="decrypt" element={<Decrypt />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;