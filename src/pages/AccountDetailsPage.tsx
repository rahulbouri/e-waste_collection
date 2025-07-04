import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import AccountDetails from '@/components/AccountDetails';

interface AccountDetailsPageProps {
  onBack: () => void;
}

const AccountDetailsPage = ({ onBack }: AccountDetailsPageProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBack}
              className="hover:bg-gray-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
          
          <div className="text-left mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Account Details</h1>
          </div>
          
          <AccountDetails onBack={onBack} />
        </div>
      </div>
    </div>
  );
};

export default AccountDetailsPage;
