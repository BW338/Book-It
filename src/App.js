import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './components/Register';
import BusinessDashboard from './components/BusinessDashboard';
import Almanaque from './components/Almanaque';  // Importar la nueva pantalla

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/dashboard" element={<BusinessDashboard />} />
        <Route path="/almanaque/:spaceName" element={<Almanaque />} />  {/* Nueva ruta */}
      </Routes>
    </Router>
  );
}

export default App;
