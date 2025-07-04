
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowLeft, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import AccountDetails from './AccountDetails';
import ScheduledPickups from './ScheduledPickups';
import PastPickups from './PastPickups';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultView?: 'profile' | 'ongoing' | 'history';
}

const AccountModal = ({ isOpen, onClose, defaultView = 'profile' }: AccountModalProps) => {
  const { logout } = useAuth();
  const [activeView, setActiveView] = useState<'profile' | 'ongoing' | 'history'>(defaultView);

  useEffect(() => {
    setActiveView(defaultView);
  }, [defaultView]);

  const handleLogout = () => {
    logout();
    onClose();
  };

  const getTitle = () => {
    switch (activeView) {
      case 'profile':
        return 'Account Details';
      case 'ongoing':
        return 'Scheduled Pickups';
      case 'history':
        return 'Past Pickups';
      default:
        return 'My Account';
    }
  };

  const renderContent = () => {
    switch (activeView) {
      case 'profile':
        return <AccountDetails />;
      case 'ongoing':
        return <ScheduledPickups />;
      case 'history':
        return <PastPickups />;
      default:
        return <AccountDetails />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto mx-4 sm:mx-auto w-[calc(100vw-2rem)] sm:w-full rounded-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {activeView !== 'profile' && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setActiveView('profile')}
                  className="p-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              )}
              {getTitle()}
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-red-600 hover:text-red-700">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {renderContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AccountModal;
