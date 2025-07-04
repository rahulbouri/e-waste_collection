import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Mail, User, MapPin, Phone } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import { cn } from '@/lib/utils';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNewUser?: () => void; // Callback for new user redirect
}

type Step = 'email' | 'otp';

const LoginModal = ({ isOpen, onClose, onNewUser }: LoginModalProps) => {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  useEffect(() => {
    if (isOpen) {
      setEmail('');
      setOtp('');
      setStep('email');
      setError('');
      setLoading(false);
    }
  }, [isOpen]);

  const validateBangalorePincode = (pincode: string): boolean => {
    return /^560\d{3}$/.test(pincode);
  };

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateIndianPhone = (phone: string): boolean => {
    return /^\d{10}$/.test(phone);
  };

  const formatPhoneNumber = (phone: string): string => {
    return '+91 ' + phone;
  };

  const handleSendOTP = async () => {
    if (!email || !validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await apiClient.sendOTP(email);
      
      if (response.error) {
        setError(response.error);
        return;
      }

      setStep('otp');
    } catch (error) {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await apiClient.verifyOTP(email, otp);
      
      if (response.error) {
        setError(response.error);
        return;
      }

      // Call the login function to update authentication state
      if (response.data && response.data.user) {
        const userData = {
          id: response.data.user.id?.toString() || '1',
          name: response.data.user.name || '',
          email: email,
          phone: response.data.user.phone || '',
          address: response.data.user.address || '',
          pincode: response.data.user.pincode || '',
          city: response.data.user.city || '',
          state: response.data.user.state || ''
        };

        await login(userData);

        if (response.data?.is_new_user) {
          // For new users, redirect to account details
          if (onNewUser) {
            onNewUser();
          } else {
            localStorage.setItem('redirectToAccountDetails', 'true');
            window.location.reload();
          }
        } else {
          // For existing users, just close the modal
          onClose?.();
        }
      }
    } catch (error) {
      setError('Failed to verify OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  const handlePhoneChange = (value: string) => {
    // Only allow numbers, max 10 digits
    const cleaned = value.replace(/\D/g, '').slice(0, 10);
    setEmail(cleaned);
    
    if (error) setError('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md mx-4 sm:mx-auto w-[calc(100vw-2rem)] sm:w-full rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-center">
            {step === 'email' && 'Login to Continue'}
            {step === 'otp' && 'Verify OTP'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {step === 'email' && (
            <>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-primary" />
                </div>
                <p className="text-gray-600">Enter your email address to continue</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@gmail.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  className={cn(error && "border-red-500 focus-visible:ring-red-500")}
                />
                {error && <p className="text-red-500 text-sm">{error}</p>}
              </div>

              <Button 
                onClick={handleSendOTP} 
                disabled={loading}
                className="w-full bg-gray-700 hover:bg-gray-800"
              >
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </Button>
            </>
          )}

          {step === 'otp' && (
            <>
              <div className="text-center">
                <p className="text-gray-600">Enter the 6-digit OTP sent to</p>
                <p className="font-medium">{email}</p>
              </div>
              
              <div className="space-y-2">
                <Label>Enter OTP</Label>
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={(value) => {
                      setOtp(value);
                      if (error) setError('');
                    }}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
              </div>

              <div className="space-y-3">
                <Button 
                  onClick={handleVerifyOTP} 
                  disabled={loading}
                  className="w-full bg-gray-700 hover:bg-gray-800"
                >
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => setStep('email')} 
                  disabled={loading}
                  className="w-full hover:bg-gray-100"
                >
                  Change Email
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;
