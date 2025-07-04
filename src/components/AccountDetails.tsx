import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Phone, MapPin, Mail } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/api';

interface AccountDetailsProps {
  onBack?: () => void;
}

const AccountDetails = ({ onBack }: AccountDetailsProps) => {
  const { user, updateUser, checkAuth } = useAuth();
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    phone: user?.phone?.replace('+91 ', '') || '',
    address: user?.address || '',
    pincode: user?.pincode || '',
    mapsLink: user?.mapsLink || ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const validateBangalorePincode = (pincode: string): boolean => {
    return /^560\d{3}$/.test(pincode);
  };

  const validatePhone = (phone: string): boolean => {
    return /^\d{10}$/.test(phone);
  };

  const handleInputChange = (field: string, value: string) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
    
    // Check if there are changes
    const originalValues = {
      name: user?.name || '',
      phone: user?.phone?.replace('+91 ', '') || '',
      address: user?.address || '',
      pincode: user?.pincode || '',
      mapsLink: user?.mapsLink || ''
    };
    
    const newForm = { ...editForm, [field]: value };
    const hasChanges = Object.keys(newForm).some(key => 
      newForm[key as keyof typeof newForm] !== originalValues[key as keyof typeof originalValues]
    );
    
    setHasChanges(hasChanges);
    
    // Clear errors
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSave = async () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!editForm.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!editForm.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!validatePhone(editForm.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }
    if (!editForm.address.trim()) {
      newErrors.address = 'Address is required';
    }
    if (!editForm.pincode.trim()) {
      newErrors.pincode = 'PIN code is required';
    } else if (!validateBangalorePincode(editForm.pincode)) {
      newErrors.pincode = 'We currently serve only Bangalore. Please enter a valid Bangalore PIN code (560xxx)';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setIsSaving(true);
    setSuccess(false);
    setErrors({});
    try {
      // Update profile (name, phone)
      const profileRes = await apiClient.updateProfile({
        name: editForm.name,
        phone: '+91 ' + editForm.phone
      });
      if (profileRes.error) {
        setErrors({ general: profileRes.error });
        setIsSaving(false);
        return;
      }
      // Add address
      const addressRes = await apiClient.addAddress({
        address: editForm.address,
        pincode: editForm.pincode,
        maps_link: editForm.mapsLink
      });
      if (addressRes.error) {
        setErrors({ general: addressRes.error });
        setIsSaving(false);
        return;
      }
      // Set new address as current
      const addressId = addressRes.data?.address?.id;
      if (addressId) {
        const setCurrentRes = await apiClient.setCurrentAddress(addressId);
        if (setCurrentRes.error) {
          setErrors({ general: setCurrentRes.error });
          setIsSaving(false);
          return;
        }
      }
      // Refresh user context
      await checkAuth();
      updateUser({
        name: editForm.name,
        phone: '+91 ' + editForm.phone,
        address: editForm.address,
        pincode: editForm.pincode,
        mapsLink: editForm.mapsLink
      });
      setSuccess(true);
      setHasChanges(false);
      
      // Redirect to main page after 2 seconds
      setTimeout(() => {
        if (onBack) {
          onBack();
        }
      }, 2000);
    } catch (err: any) {
      setErrors({ general: err.message || 'Failed to update details' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Personal Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {errors.general && <p className="text-red-500 text-sm">{errors.general}</p>}
        {success && <p className="text-green-600 text-sm">Account details updated successfully!</p>}
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            value={editForm.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className={cn(errors.name && "border-red-500 focus-visible:ring-red-500")}
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">{user?.email}</span>
          </div>
          <p className="text-xs text-gray-500">Email address cannot be changed</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded-l-md border border-r-0">+91</span>
            <Input
              id="phone"
              value={editForm.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="Enter 10-digit phone number"
              maxLength={10}
              className={cn(
                "rounded-l-none",
                errors.phone && "border-red-500 focus-visible:ring-red-500"
              )}
              disabled={isSaving}
            />
          </div>
          {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            placeholder="Enter your complete address"
            value={editForm.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            className={cn(errors.address && "border-red-500 focus-visible:ring-red-500")}
            disabled={isSaving}
          />
          {errors.address && <p className="text-red-500 text-sm">{errors.address}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="mapsLink">Google Maps Link (Optional)</Label>
          <Input
            id="mapsLink"
            placeholder="https://maps.google.com/..."
            value={editForm.mapsLink}
            onChange={(e) => handleInputChange('mapsLink', e.target.value)}
            disabled={isSaving}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="pincode">PIN Code</Label>
          <Input
            id="pincode"
            value={editForm.pincode}
            onChange={(e) => handleInputChange('pincode', e.target.value)}
            className={cn(errors.pincode && "border-red-500 focus-visible:ring-red-500")}
            disabled={isSaving}
          />
          {errors.pincode && <p className="text-red-500 text-sm">{errors.pincode}</p>}
        </div>

        <Button 
          onClick={handleSave} 
          disabled={!hasChanges || isSaving}
          className="w-full bg-gray-700 hover:bg-gray-800 disabled:bg-gray-300"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AccountDetails;
