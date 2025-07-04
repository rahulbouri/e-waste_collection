
import React from 'react';
import { Building, Shield, Award, Recycle } from 'lucide-react';

const TrustedPartners = () => {
  const partners = [
    {
      name: 'Waste Management Corp',
      description: 'Processing Partner'
    },
    {
      name: 'Green Recycling Ltd',
      description: 'E-Waste Specialist'
    },
    {
      name: 'BioSafe Solutions',
      description: 'Biomedical Expert'
    },
    {
      name: 'EcoLogistics',
      description: 'Transportation'
    }
  ];

  const certifications = [
    {
      name: 'Pollution Control Board',
      description: 'Authorized by State Pollution Control Board for waste handling',
      icon: Shield,
      color: 'blue'
    },
    {
      name: 'ISO 14001',
      description: 'Environmental management system certification',
      icon: Award,
      color: 'green'
    },
    {
      name: 'Biomedical License',
      description: 'Licensed for biomedical waste collection and transport',
      icon: Building,
      color: 'red'
    }
  ];

  const features = [
    'Certified',
    'Secure', 
    'Sustainable'
  ];

  return (
    <div className="bg-white">
      {/* Hero Features */}
      <div className="text-center mb-8">
        <div className="flex justify-center items-center gap-6 mb-6">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2">
              <Recycle className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-gray-700">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Trusted Partners</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          We work with certified waste management companies, recycling facilities, and logistics partners 
          to ensure your waste is handled responsibly from pickup to final processing.
        </p>
      </div>

      {/* Partners Grid - Mobile: 1 column, Desktop: 4 columns */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
        {partners.map((partner, index) => (
          <div key={index} className="text-center p-6 bg-white border border-gray-200 rounded-lg">
            <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
              <Building className="w-6 h-6 text-gray-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">{partner.name}</h4>
            <p className="text-sm text-gray-600">{partner.description}</p>
          </div>
        ))}
      </div>

      {/* Certifications Section */}
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900">Certifications & Compliance</h3>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8">
        {certifications.map((cert, index) => {
          const IconComponent = cert.icon;
          const colorClasses = {
            blue: 'bg-blue-100 text-blue-600',
            green: 'bg-green-100 text-green-600', 
            red: 'bg-red-100 text-red-600'
          };
          
          return (
            <div key={index} className="text-center p-6">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${colorClasses[cert.color as keyof typeof colorClasses]}`}>
                <IconComponent className="w-8 h-8" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">{cert.name}</h4>
              <p className="text-sm text-gray-600">{cert.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TrustedPartners;
