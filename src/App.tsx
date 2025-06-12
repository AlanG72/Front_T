import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AuthGuard from './components/AuthGuard';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Pages
import Home from './pages/Authentication/Home';
import Register from './pages/Authentication/Register';
import Login from './pages/Authentication/Login';
import Profile from './pages/Profile/Profile';
import ForgotPassword from './pages/Profile/ForgotPassword';
import ConfirmAccount from './pages/Profile/ConfirmAccount';
import ActivityHistory from './pages/Profile/ActivityHistory';
import ChangePassword from './pages/Profile/ChangePassword';
import Products from './pages/Subastador/Producto/Products';
import Payments from './pages/Postor/Pago/Payments';
import PaymentHistory from './pages/Postor/Pago/PaymentHistory';
import Auctions from './pages/Subastador/Subasta/Auctions';
import AuctionDetail from './pages/Subastador/Subasta/AuctionDetail';
import Reports from './pages/Soporte/Reports';
import Claims from './pages/Soporte/Claims';
import BiddingHistory from './pages/Subastador/Subasta/BiddingHistory';
import AuctionHistory from './pages/Subastador/Subasta/AuctionHistory';
import ResetPassword from './pages/Profile/ResetPassword';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/confirm/:token" element={<ConfirmAccount />} />

              {/* Nueva ruta para restablecer la contraseña */}
              <Route path="/recuperar" element={<ResetPassword />} />


              {/* Protected routes */}
              <Route 
                path="/profile" 
                element={
                  <AuthGuard>
                    <Profile />
                  </AuthGuard>
                } 
              />
              <Route 
                path="/activity-history" 
                element={
                  <AuthGuard>
                    <ActivityHistory />
                  </AuthGuard>
                } 
              />
              <Route 
                path="/bidding-history" 
                element={
                  <AuthGuard>
                    <BiddingHistory />
                  </AuthGuard>
                } 
              />
              <Route 
                path="/auction-history" 
                element={
                  <AuthGuard>
                    <AuctionHistory />
                  </AuthGuard>
                } 
              />
              <Route 
                path="/change-password" 
                element={
                  <AuthGuard>
                    <ChangePassword />
                  </AuthGuard>
                } 
              />
              <Route 
                path="/products" 
                element={
                  <AuthGuard>
                    <Products />
                  </AuthGuard>
                } 
              />
              <Route 
                path="/payments" 
                element={
                  <AuthGuard>
                    <Payments />
                  </AuthGuard>
                } 
              />
              <Route 
                path="/payment-history" 
                element={
                  <AuthGuard>
                    <PaymentHistory />
                  </AuthGuard>
                } 
              />
              <Route 
                path="/auctions" 
                element={
                  <AuthGuard>
                    <Auctions />
                  </AuthGuard>
                } 
              />
              <Route 
                path="/auctions/:id" 
                element={
                  <AuthGuard>
                    <AuctionDetail />
                  </AuthGuard>
                } 
              />
              <Route 
                path="/reports" 
                element={
                  <AuthGuard>
                    <Reports />
                  </AuthGuard>
                } 
              />
              <Route 
                path="/claims" 
                element={
                  <AuthGuard>
                    <Claims />
                  </AuthGuard>
                } 
              />
              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/\" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;