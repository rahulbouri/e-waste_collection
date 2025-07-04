
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Recycle } from 'lucide-react';

interface LoginPromptProps {
  onLogin: () => void;
}

const LoginPrompt = ({ onLogin }: LoginPromptProps) => {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <div className="container mx-auto px-4">
        <Card className="max-w-lg mx-auto bg-white border-0 shadow-sm">
          <CardContent className="p-12 text-center space-y-6">
            {/* Illustration */}
            <div className="w-24 h-24 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
              <div className="relative">
                <Recycle className="w-8 h-8 text-primary" />
                <Lock className="w-4 h-4 text-primary absolute -bottom-1 -right-1 bg-white rounded-full p-0.5" />
              </div>
            </div>

            {/* Content */}
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-gray-900">Login to Continue</h2>
              <p className="text-gray-600">
                Please login to your account to schedule a waste pickup. 
                It helps us serve you better and track your requests.
              </p>
            </div>

            {/* CTA */}
            <div className="space-y-3 pt-4">
              <Button onClick={onLogin} className="w-full bg-primary hover:bg-primary/90">
                Login to Schedule Pickup
              </Button>
              <p className="text-sm text-gray-500">
                New user? You can register during the login process
              </p>
            </div>

            {/* Benefits */}
            <div className="pt-6 border-t border-gray-100">
              <h3 className="font-medium text-gray-900 mb-3">Why login?</h3>
              <div className="space-y-2 text-sm text-gray-600 text-left">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2"></div>
                  <span>Track your pickup requests in real-time</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2"></div>
                  <span>Save your address for faster booking</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2"></div>
                  <span>Get updates via SMS and WhatsApp</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPrompt;
