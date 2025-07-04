import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Package, FileText, Image, Scale } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';

const mockScheduledPickups = [
  {
    id: 'mock-1',
    waste_category: 'ewaste',
    waste_types: ['Mobile Phones', 'Batteries', 'Cables'],
    quantity: '10-25 kg',
    status: 'pending',
    pickup_date: new Date().toISOString(),
    address: { address: '123 Main St, Bangalore', pincode: '560001' },
    additional_notes: 'Please call before arriving. Items are in the security office.',
    images_count: 0,
  },
];

const ScheduledPickups = () => {
  const { user, isAuthenticated } = useAuth();
  const [scheduledPickups, setScheduledPickups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setScheduledPickups(mockScheduledPickups);
      setLoading(false);
      setError(null);
      return;
    }
    const fetchScheduledPickups = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.getUserBookings({ status: 'pending' });
        if (response.error) {
          if (response.error.includes('401') || response.error.includes('500') || response.error.includes('Network error')) {
            setError(response.error);
          } else {
            setScheduledPickups([]);
          }
        } else {
          setScheduledPickups(response.data?.bookings || []);
        }
      } catch (err) {
        setError('Failed to fetch scheduled pickups');
      } finally {
        setLoading(false);
      }
    };
    fetchScheduledPickups();
  }, [user, isAuthenticated]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <Package className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-pulse" />
        <p className="text-gray-600">Loading scheduled pickups...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Error: {error}</p>
      </div>
    );
  }

  if (scheduledPickups.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No scheduled pickups</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {scheduledPickups.map((booking) => (
        <Card key={booking.id}>
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold text-lg">{booking.waste_category === 'ewaste' ? 'E-Waste' : 'Biomedical'} Pickup</h3>
                <Badge className="mt-2 bg-blue-100 text-blue-800">
                  {booking.status}
                </Badge>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>Pickup Date: {new Date(booking.pickup_date).toLocaleDateString()}</span>
              </div>
              {booking.address && (
              <div className="flex items-start gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4 mt-0.5" />
                <div>
                    <p>{booking.address.address}</p>
                    <p>PIN: {booking.address.pincode}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Scale className="w-4 h-4" />
                <span>Quantity: {booking.quantity}</span>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Waste Items:</p>
                <div className="flex flex-wrap gap-2">
                  {booking.waste_types?.map((item, index) => (
                    <Badge key={index} className="text-xs px-2 py-1 bg-gray-100 text-gray-800">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
              {booking.additional_notes && (
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <FileText className="w-4 h-4 mt-0.5" />
                  <div>
                    <p className="font-medium">Additional Notes:</p>
                    <p>{booking.additional_notes}</p>
                  </div>
                </div>
              )}
              {booking.images_count > 0 && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Image className="w-4 h-4" />
                  <span>{booking.images_count} image(s) attached</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ScheduledPickups;
