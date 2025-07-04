
import React from 'react';
import UnifiedBookingForm from './UnifiedBookingForm';

interface EWasteBookingProps {
  onBack: () => void;
  onAccountDetails?: () => void;
}

const EWasteBooking = ({ onBack, onAccountDetails }: EWasteBookingProps) => {
  return <UnifiedBookingForm onBack={onBack} onAccountDetails={onAccountDetails} defaultTab="ewaste" />;
};

export default EWasteBooking;
