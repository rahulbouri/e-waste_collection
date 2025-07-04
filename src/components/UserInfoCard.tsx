
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Phone, MapPin, Edit3 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface UserInfoCardProps {
  onEdit: () => void;
}

const UserInfoCard = ({ onEdit }: UserInfoCardProps) => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <Card className="mb-6 bg-gray-50 border-gray-200">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <User className="w-4 h-4" />
              Your Details
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <User className="w-3 h-3 text-gray-500" />
                <span>{user.name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-3 h-3 text-gray-500" />
                <span>{user.phone?.startsWith('+91 ') ? user.phone : `+91 ${user.phone}`}</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="w-3 h-3 text-gray-500 mt-0.5" />
                <div>
                  <p>{user.address}</p>
                  <p className="text-gray-600">PIN: {user.pincode}</p>
                </div>
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={onEdit} className="hover:bg-gray-100">
            <Edit3 className="w-3 h-3 mr-1" />
            Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserInfoCard;
