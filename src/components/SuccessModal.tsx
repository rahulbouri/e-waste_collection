
import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, MessageCircle, Calendar } from 'lucide-react';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'ewaste' | 'biomedical';
}

const SuccessModal = ({ isOpen, onClose, type }: SuccessModalProps) => {
  const isEWaste = type === 'ewaste';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-4 sm:mx-auto w-[calc(100vw-2rem)] sm:w-full text-center rounded-xl">
        <div className="space-y-6 py-4">
          {/* Success Icon */}
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>

          {/* Success Message */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">
              {isEWaste ? 'Booking Confirmed!' : 'Payment Successful!'}
            </h2>
            <p className="text-gray-600">
              {isEWaste 
                ? 'Your e-waste pickup has been scheduled successfully.'
                : 'Your biomedical waste pickup has been scheduled and paid for.'
              }
            </p>
          </div>

          {/* Next Steps */}
          <div className={`${isEWaste ? 'bg-blue-50' : 'bg-green-50'} p-4 rounded-lg space-y-3`}>
            <h3 className={`font-semibold ${isEWaste ? 'text-blue-900' : 'text-green-900'} flex items-center gap-2`}>
              <MessageCircle className="w-4 h-4" />
              What happens next?
            </h3>
            <ul className={`text-left text-sm ${isEWaste ? 'text-blue-800' : 'text-green-800'} space-y-2`}>
              <li className="flex items-start gap-2">
                <span className={`${isEWaste ? 'text-blue-500' : 'text-green-500'} mt-1`}>•</span>
                <span>Our team will contact you on WhatsApp within 2 hours</span>
              </li>
              <li className="flex items-start gap-2">
                <span className={`${isEWaste ? 'text-blue-500' : 'text-green-500'} mt-1`}>•</span>
                <span>Pickup will be scheduled within 24-48 hours</span>
              </li>
              <li className="flex items-start gap-2">
                <span className={`${isEWaste ? 'text-blue-500' : 'text-green-500'} mt-1`}>•</span>
                <span>
                  {isEWaste 
                    ? 'You will receive a pickup confirmation SMS'
                    : 'Disposal documentation will be sent via email'
                  }
                </span>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="text-sm text-gray-600">
            <p>Need help? Contact us at</p>
            <p className="font-semibold text-primary">+91 98765 43210</p>
          </div>

          {/* Close Button */}
          <Button 
            onClick={onClose} 
            className={`w-full ${isEWaste ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'} text-white`}
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SuccessModal;
