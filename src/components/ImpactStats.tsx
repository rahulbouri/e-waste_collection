
import React from 'react';
import { Building, Truck, Users, Award } from 'lucide-react';

const ImpactStats = () => {
  const stats = [
    {
      icon: Building,
      number: '500+',
      label: 'Societies Served',
    },
    {
      icon: Truck,
      number: '10,000+',
      label: 'Pickups Completed',
    },
    {
      icon: Users,
      number: '25,000+',
      label: 'Happy Customers',
    },
    {
      icon: Award,
      number: '8+',
      label: 'Years Experience',
    },
  ];

  return (
    <div className="bg-neutral-50 rounded-xl p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Our Impact</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div key={index} className="stat-card">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <IconComponent className="w-6 h-6 text-primary" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{stat.number}</div>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ImpactStats;
