// importaciones necesarias
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Menu, X, User, LogOut, Gavel, Package, CreditCard,
  BarChart2, AlertCircle, History, Clock, Users
} from 'lucide-react';

const Navbar: React.FC = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);
  const handleLogout = () => {
    logout();
    closeMenu();
  };
  const isActive = (path: string) => location.pathname === path;

  const NavLink = (to: string, label: string, Icon?: React.ElementType) => (
    <Link
      to={to}
      onClick={closeMenu}
      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${
        isActive(to)
          ? 'text-primary-700 bg-primary-50'
          : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
      }`}
    >
      {Icon && <Icon size={16} />}
      {label}
    </Link>
  );

  const renderLinksForRole = () => {
    if (!user) return null;

    switch (user.userType) {
      case 'bidder':
        return (
          <>
            {NavLink('/auctions', 'Auctions', Gavel)}
            {NavLink('/bids-history', 'Bid History', History)}
            {NavLink('/payments', 'Payments', CreditCard)}
            {NavLink('/purchases-history', 'Purchase History', Clock)}
            {NavLink('/claims', 'Claims', AlertCircle)}
            {NavLink('/claim-prize', 'Claim Prize', AlertCircle)}
          </>
        );
      case 'auctioneer':
        return (
          <>
            {NavLink('/products', 'Products', Package)}
            {NavLink('/auctions', 'Auctions', Gavel)}
            {NavLink('/bids-history', 'Bid History', History)}
            {NavLink('/payments-history', 'Payment History', Clock)}
            {NavLink('/claims', 'Claims', AlertCircle)}
            {NavLink('/claim-prize', 'Claim Prize', AlertCircle)}
          </>
        );
      case 'support':
        return (
          <>
            {NavLink('/claims', 'Claims', AlertCircle)}
            {NavLink('/reports', 'Reports', BarChart2)}
          </>
        );
      case 'admin':
        return (
          <>
            {NavLink('/users', 'Users', Users)}
            {NavLink('/products', 'Products', Package)}
            {NavLink('/auctions', 'Auctions', Gavel)}
            {NavLink('/payments', 'Payments', CreditCard)}
            {NavLink('/claims', 'Claims', AlertCircle)}
            {NavLink('/reports', 'Reports', BarChart2)}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <Gavel className="h-6 w-6 text-primary-600 mr-2" />
              <span className="text-primary-600 font-bold text-xl">BidHub</span>
            </Link>
          </div>

          {/* Desktop */}
          <div className="hidden sm:flex sm:items-center">
            <div className="ml-10 flex items-center space-x-4">
              {NavLink('/', 'Home')}
              {!isAuthenticated ? (
                <>
                  {NavLink('/register', 'Register')}
                  {NavLink('/login', 'Login')}
                </>
              ) : (
                <>
                  {renderLinksForRole()}
                  {NavLink('/profile', 'Profile', User)}
                  <button
                    onClick={handleLogout}
                    className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 transition-colors flex items-center gap-1"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Mobile toggle */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={toggleMenu}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="sm:hidden bg-white border-t animate-slide-down">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {NavLink('/', 'Home')}
            {!isAuthenticated ? (
              <>
                {NavLink('/register', 'Register')}
                {NavLink('/login', 'Login')}
              </>
            ) : (
              <>
                {renderLinksForRole()}
                {NavLink('/profile', 'Profile', User)}
                <button
                  onClick={handleLogout}
                  className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 flex items-center gap-2"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
