
import React from 'react';
import { Button } from '@/components/ui/button';
import { Recycle, Menu, X, User } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LoginModal from './LoginModal';
import AccountSidebar from './AccountSidebar';

interface HeaderProps {
  activeSection: string;
  onSectionChange: (section: 'home' | 'ewaste' | 'biomedical' | 'about' | 'education') => void;
  onAccountNavigation?: (view: 'profile' | 'ongoing' | 'history') => void;
}

const Header = ({ activeSection, onSectionChange, onAccountNavigation }: HeaderProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNavClick = (action: string) => {
    if (action === 'learn') {
      scrollToSection('education-section');
    } else if (action === 'about') {
      scrollToSection('about-section');
    } else if (action === 'schedule-pickup') {
      onSectionChange('ewaste');
    } else if (action === 'login') {
      setIsLoginModalOpen(true);
    }
    setIsMobileMenuOpen(false);
  };

  const handleLogin = () => {
    setIsLoginModalOpen(true);
  };

  const handleAccountNavigation = (view: 'profile' | 'ongoing' | 'history') => {
    if (onAccountNavigation) {
      onAccountNavigation(view);
    }
  };

  const menuItems = [
    { id: 'learn', label: 'Learn' },
    { id: 'about', label: 'About' },
  ];

  return (
    <>
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div 
              className="flex items-center gap-3 cursor-pointer" 
              onClick={() => onSectionChange('home')}
            >
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Recycle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">EcoCollect</h1>
                <p className="text-xs text-gray-500">Society Aid</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection('education-section');
                }}
                className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-md transition-colors"
              >
                Learn
              </a>
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection('about-section');
                }}
                className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-md transition-colors"
              >
                About
              </a>
              
              {/* Schedule Pickup CTA - only show when authenticated */}
              {isAuthenticated && (
                <Button 
                  onClick={() => onSectionChange('ewaste')}
                  className="bg-gray-700 hover:bg-gray-800 text-white px-6 py-2"
                >
                  Schedule Pickup
                </Button>
              )}
              
              {isAuthenticated ? (
                <AccountSidebar 
                  onAccountDetails={() => handleAccountNavigation('profile')}
                  onScheduledPickups={() => handleAccountNavigation('ongoing')}
                  onPastPickups={() => handleAccountNavigation('history')}
                >
                  <Button variant="ghost" size="sm" className="p-2 hover:bg-gray-100 rounded-full">
                    <User className="w-5 h-5 text-gray-700" />
                  </Button>
                </AccountSidebar>
              ) : (
                <Button 
                  onClick={handleLogin}
                  variant="outline"
                  className="text-gray-700 border-gray-300 hover:bg-gray-100"
                >
                  Login
                </Button>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-600" />
              ) : (
                <Menu className="w-6 h-6 text-gray-600" />
              )}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-neutral-200">
              <nav className="flex flex-col space-y-2 pt-4">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className="px-4 py-3 rounded-lg text-left font-medium transition-all duration-200 text-gray-600 hover:text-primary hover:bg-gray-100"
                  >
                    {item.label}
                  </button>
                ))}
                
                {isAuthenticated ? (
                  <>
                    <Button 
                      className="mt-2 bg-gray-700 hover:bg-gray-800 text-white"
                      onClick={() => handleNavClick('schedule-pickup')}
                    >
                      Schedule Pickup
                    </Button>
                    <AccountSidebar
                      onAccountDetails={() => handleAccountNavigation('profile')}
                      onScheduledPickups={() => handleAccountNavigation('ongoing')}
                      onPastPickups={() => handleAccountNavigation('history')}
                    >
                      <Button variant="outline" className="mt-2 w-full">
                        <User className="w-4 h-4 mr-2" />
                        My Account
                      </Button>
                    </AccountSidebar>
                  </>
                ) : (
                  <Button 
                    className="mt-2 bg-gray-700 hover:bg-gray-800 text-white"
                    onClick={() => handleNavClick('login')}
                  >
                    Login
                  </Button>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>

      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />
    </>
  );
};

export default Header;
