import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Login from './components/Login';
import Dashboard from './components/Dashboard';
import SchedulePickup from './components/SchedulePickup';
import BioWasteCollection from './components/BioWasteCollection';
import AddressForm from './components/AddressForm';
import Navbar from './components/Navbar';

const App: React.FC = () => {
  return (
    <div className="App">
      <Navbar />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/schedule-pickup" element={<SchedulePickup />} />
        <Route path="/biowaste-collection" element={<BioWasteCollection />} />
        <Route path="/address-form" element={<AddressForm />} />
      </Routes>
      <ToastContainer position="top-right" autoClose={5000} />
    </div>
  );
};

export default App; 