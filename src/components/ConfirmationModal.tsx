import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Phone, Mail } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  data: any;
  type: 'ewaste' | 'biomedical';
  isLoading?: boolean;
}

const ConfirmationModal = ({ isOpen, onClose, onConfirm, data, type, isLoading = false }: ConfirmationModalProps) => {
  const isEWaste = type === 'ewaste';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto mx-4 sm:mx-auto w-[calc(100vw-2rem)] sm:w-full p-8 rounded-xl">
        <DialogHeader className="text-left">
          <DialogTitle>
            Confirm Booking Details
          </DialogTitle>
          <DialogDescription>
            Please review your booking details before confirming
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Service Type */}
          <div>
            <h3 className="font-semibold mb-2">Service Type</h3>
            <Badge variant="secondary" className={`${isEWaste ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
              {isEWaste ? 'E-Waste Collection' : 'Biomedical Waste Collection'}
            </Badge>
          </div>

          {/* Waste Types */}
          <div>
            <h3 className="font-semibold mb-2">Selected Items</h3>
            <div className="flex flex-wrap gap-2">
              {data.wasteTypes?.map((type: string, index: number) => (
                <Badge key={index} variant="outline">
                  {type}
                </Badge>
              ))}
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="font-semibold mb-3">Contact Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-500" />
                <span>{data.name} - {data.phone}</span>
              </div>
              {data.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span>{data.email}</span>
                </div>
              )}
            </div>
          </div>

          {/* Address */}
          <div>
            <h3 className="font-semibold mb-3">Pickup Address</h3>
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
              <div>
                <p className="font-medium">{data.societyName}</p>
                <p>{data.address}</p>
                <p>Pincode: {data.pincode}</p>
              </div>
            </div>
          </div>

          {/* Images (E-Waste only) */}
          {isEWaste && data.images?.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Uploaded Images</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {data.images.map((image: File, index: number) => (
                  <img
                    key={index}
                    src={URL.createObjectURL(image)}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-20 object-cover rounded-lg"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Additional Info */}
          {data.additionalInfo && (
            <div>
              <h3 className="font-semibold mb-2">Additional Information</h3>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                {data.additionalInfo}
              </p>
            </div>
          )}

          {/* Service Fee (Biomedical only) */}
          {!isEWaste && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Service Fee:</span>
                <span className="text-2xl font-bold text-green-600">₹299</span>
              </div>
              <p className="text-sm text-green-700 mt-1">
                Includes pickup, safe disposal, and documentation
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1" disabled={isLoading}>
              Edit Details
            </Button>
            <Button 
              onClick={onConfirm} 
              disabled={isLoading}
              className={`flex-1 ${isEWaste ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'} text-white disabled:opacity-50`}
            >
              {isLoading ? 'Creating Booking...' : (isEWaste ? 'Confirm Booking' : 'Proceed to Payment')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmationModal;
