
import React from 'react';
import UnifiedBookingForm from './UnifiedBookingForm';

interface BiomedicalBookingProps {
  onBack: () => void;
  onAccountDetails?: () => void;
}

const BiomedicalBooking = ({ onBack, onAccountDetails }: BiomedicalBookingProps) => {
  return <UnifiedBookingForm onBack={onBack} onAccountDetails={onAccountDetails} defaultTab="biomedical" />;
};

export default BiomedicalBooking;
