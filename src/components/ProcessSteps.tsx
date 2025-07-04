
import React from 'react';
import { CheckCircle, Clock, Truck, FileCheck } from 'lucide-react';

interface ProcessStepsProps {
  type: 'ewaste' | 'biomedical';
  showLines?: boolean;
}

const ProcessSteps = ({ type, showLines = true }: ProcessStepsProps) => {
  const steps = [
    {
      icon: FileCheck,
      title: 'Book Online',
      description: 'Fill out our simple booking form with your details and preferred pickup time.',
      color: type === 'ewaste' ? 'blue' : 'green'
    },
    {
      icon: Clock,
      title: 'Confirmation',
      description: 'We confirm your booking and send you pickup details within 2 hours.',
      color: type === 'ewaste' ? 'blue' : 'green'
    },
    {
      icon: Truck,
      title: 'Pickup',
      description: 'Our certified team arrives at your location for safe waste collection.',
      color: type === 'ewaste' ? 'blue' : 'green'
    },
    {
      icon: CheckCircle,
      title: 'Disposal',
      description: 'We ensure proper disposal and provide you with completion certificate.',
      color: type === 'ewaste' ? 'blue' : 'green'
    }
  ];

  return (
    <div className="bg-white rounded-xl p-8">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900">Our Process</h3>
        <p className="text-gray-600 mt-2">Simple steps for responsible waste disposal</p>
      </div>
      
      <div className="space-y-6">
        {steps.map((step, index) => {
          const IconComponent = step.icon;
          const colorClasses = {
            blue: 'bg-blue-100 text-blue-600',
            green: 'bg-green-100 text-green-600'
          };
          
          return (
            <div key={index} className="relative">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${colorClasses[step.color as keyof typeof colorClasses]}`}>
                  <IconComponent className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">{step.title}</h4>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>
              </div>
              {showLines && index < steps.length - 1 && (
                <div className="absolute left-6 top-12 w-px h-6 bg-gray-200"></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProcessSteps;
