import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar as CalendarIcon, Upload, Recycle, Syringe } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import SuccessModal from './SuccessModal';
import ProcessSteps from './ProcessSteps';
import QuickInfo from './QuickInfo';
import ConfirmationModal from './ConfirmationModal';
import LoginPrompt from './LoginPrompt';
import UserInfoCard from './UserInfoCard';
import LoginModal from './LoginModal';
import AccountModal from './AccountModal';

interface FormData {
  wasteTypes: string[];
  quantity: string;
  additionalNotes: string;
  images: File[];
  date?: Date;
}

interface FormErrors {
  quantity?: string;
  date?: string;
}

interface UnifiedBookingFormProps {
  onBack: () => void;
  onAccountDetails?: () => void;
  defaultTab?: 'ewaste' | 'biomedical';
}

const UnifiedBookingForm = ({ onBack, onAccountDetails, defaultTab = 'ewaste' }: UnifiedBookingFormProps) => {
  const { isAuthenticated, user } = useAuth();
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [formData, setFormData] = useState<FormData>({
    wasteTypes: [],
    quantity: '',
    additionalNotes: '',
    images: [],
    date: new Date()
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [isBookingLoading, setIsBookingLoading] = useState(false);

  // If user is not authenticated, show login prompt
  if (!isAuthenticated) {
    return <LoginPrompt onLogin={() => setLoginModalOpen(true)} />;
  }

  const ewasteOptions = [
    'Computers & Laptops',
    'Mobile Phones',
    'Home Appliances',
    'Batteries',
    'Cables & Chargers',
    'Other Electronics'
  ];

  const biomedicalOptions = [
    'Sharps (Needles, Syringes)',
    'Expired Medications',
    'Contaminated Bandages',
    'Medical Gloves',
    'Test Strips',
    'Other Medical Waste'
  ];

  const quantityOptions = [
    '1-5 kg',
    '5-10 kg',
    '10-25 kg',
    '25-50 kg',
    '50+ kg'
  ];

  const wasteOptions = activeTab === 'ewaste' ? ewasteOptions : biomedicalOptions;

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.quantity) {
      newErrors.quantity = 'Please select quantity of waste';
    }
    if (!formData.date) {
      newErrors.date = 'Pickup date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setConfirmationModalOpen(true);
    }
  };

  const handleConfirmBooking = async () => {
    if (isBookingLoading) return; // Prevent multiple clicks
    
    setIsBookingLoading(true);
    try {
      // Convert images to base64 strings
      const imagePromises = formData.images.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      });

      const imageBase64Strings = await Promise.all(imagePromises);

      // Prepare booking data
      const bookingData = {
        waste_category: activeTab,
        waste_types: formData.wasteTypes,
        quantity: formData.quantity,
        pickup_date: formData.date ? format(formData.date, 'yyyy-MM-dd') : '',
        additional_notes: formData.additionalNotes,
        images: imageBase64Strings.length > 0 ? imageBase64Strings : undefined
      };

      const response = await apiClient.createBooking(bookingData);
      
      if (response.error) {
        alert(`Booking creation failed: ${response.error}`);
        return;
      }

      setConfirmationModalOpen(false);
      setSuccessModalOpen(true);
    } catch (error) {
      alert(`Error creating booking: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsBookingLoading(false);
    }
  };

  const handleSuccessModalClose = () => {
    setSuccessModalOpen(false);
    setFormData({
      wasteTypes: [],
      quantity: '',
      additionalNotes: '',
      images: [],
      date: new Date()
    });
    setErrors({});
    // Redirect to main page
    onBack();
  };

  const handleWasteTypeToggle = (wasteType: string) => {
    setFormData(prev => ({
      ...prev,
      wasteTypes: prev.wasteTypes.includes(wasteType)
        ? prev.wasteTypes.filter(type => type !== wasteType)
        : [...prev.wasteTypes, wasteType]
    }));
  };

  const handleQuantitySelect = (quantity: string) => {
    setFormData(prev => ({ ...prev, quantity }));
    if (errors.quantity) {
      setErrors(prev => ({ ...prev, quantity: undefined }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...Array.from(e.target.files!)]
      }));
    }
  };

  const handleTabChange = (value: string) => {
    if (value === 'ewaste' || value === 'biomedical') {
      setActiveTab(value);
    }
  };

  const currentColor = activeTab === 'ewaste' ? 'blue' : 'green';

  const combinedFormData = {
    ...formData,
    name: user?.name || '',
    email: '',
    phone: user?.phone || '',
    address: user?.address || '',
    pincode: user?.pincode || '',
    societyName: user?.address || ''
  };

  const handleEditDetails = () => {
    if (onAccountDetails) {
      onAccountDetails();
    }
  };

  return (
    <>
      <div className="min-h-screen bg-neutral-50">
        <div className="container mx-auto px-4 py-8">
          <Button variant="ghost" onClick={onBack} className="mb-4 hover:bg-gray-100">
            ← Back
          </Button>
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Schedule Your Waste Pickup</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Schedule a convenient pickup time for your waste. Our team will 
              handle everything safely and responsibly.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="bg-white border-0 shadow-sm">
                <CardContent className="p-8">
                  <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full mb-6">
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                      <TabsTrigger value="ewaste" className="flex items-center gap-2">
                        <Recycle className="w-4 h-4" />
                        E-Waste
                      </TabsTrigger>
                      <TabsTrigger value="biomedical" className="flex items-center gap-2">
                        <Syringe className="w-4 h-4" />
                        Biomedical
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>

                  {/* User Info Card moved below tabs */}
                  <UserInfoCard onEdit={handleEditDetails} />

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <Label htmlFor="date" className="block text-sm font-medium text-gray-700">
                        Preferred Pickup Date <span className="text-red-500">*</span>
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal mt-1 hover:bg-gray-100",
                              !formData.date && "text-muted-foreground",
                              errors.date && "border-red-500 focus-visible:ring-red-500"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.date ? format(formData.date, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="center" side="bottom">
                          <CalendarComponent
                            mode="single"
                            selected={formData.date}
                            onSelect={(date) => {
                              setFormData(prev => ({ ...prev, date }));
                              if (errors.date) setErrors(prev => ({ ...prev, date: undefined }));
                            }}
                            disabled={(date) => date < new Date()}
                            initialFocus
                            className="p-3 pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                      {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
                    </div>

                    <div>
                      <Label className="block text-sm font-medium text-gray-700 mb-3">
                        Quantity of Waste <span className="text-red-500">*</span>
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {quantityOptions.map((option) => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => handleQuantitySelect(option)}
                            className={cn(
                              "px-3 py-2 rounded-full text-sm font-medium border transition-colors",
                              formData.quantity === option
                                ? currentColor === 'blue' 
                                  ? "bg-blue-100 text-blue-700 border-blue-300" 
                                  : "bg-green-100 text-green-700 border-green-300"
                                : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                            )}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                      {errors.quantity && <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>}
                    </div>

                    <div>
                      <Label className="block text-sm font-medium text-gray-700 mb-3">
                        Type of {activeTab === 'ewaste' ? 'E-Waste' : 'Biomedical Waste'}
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {wasteOptions.map((option) => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => handleWasteTypeToggle(option)}
                            className={cn(
                              "px-3 py-2 rounded-full text-sm font-medium border transition-colors",
                              formData.wasteTypes.includes(option)
                                ? currentColor === 'blue' 
                                  ? "bg-blue-100 text-blue-700 border-blue-300" 
                                  : "bg-green-100 text-green-700 border-green-300"
                                : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                            )}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                        Additional Notes
                      </Label>
                      <Textarea
                        id="notes"
                        value={formData.additionalNotes}
                        onChange={(e) => setFormData(prev => ({ ...prev, additionalNotes: e.target.value }))}
                        placeholder="Any special instructions or additional information..."
                        className="mt-1"
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label className="block text-sm font-medium text-gray-700 mb-2">
                        Attach Images
                      </Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 mb-2">Upload images of your waste items</p>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="image-upload"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById('image-upload')?.click()}
                        >
                          Choose Files
                        </Button>
                        {formData.images.length > 0 && (
                          <p className="text-sm text-gray-600 mt-2">
                            {formData.images.length} file(s) selected
                          </p>
                        )}
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className={cn(
                        "w-full text-white",
                        currentColor === 'blue' 
                          ? "bg-blue-600 hover:bg-blue-700" 
                          : "bg-green-600 hover:bg-green-700"
                      )}
                    >
                      Schedule Pickup
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1 space-y-8">
              <QuickInfo />
              <ProcessSteps type={activeTab as 'ewaste' | 'biomedical'} showLines={false} />
            </div>
          </div>
        </div>

        <ConfirmationModal 
          isOpen={confirmationModalOpen} 
          onClose={() => setConfirmationModalOpen(false)}
          onConfirm={handleConfirmBooking}
          data={combinedFormData}
          type={activeTab as 'ewaste' | 'biomedical'}
          isLoading={isBookingLoading}
        />

        <SuccessModal 
          isOpen={successModalOpen} 
          onClose={handleSuccessModalClose}
          type={activeTab as 'ewaste' | 'biomedical'}
        />
      </div>

      <LoginModal 
        isOpen={loginModalOpen} 
        onClose={() => setLoginModalOpen(false)} 
      />
      
      <AccountModal 
        isOpen={accountModalOpen} 
        onClose={() => setAccountModalOpen(false)} 
      />
    </>
  );
};

export default UnifiedBookingForm;
