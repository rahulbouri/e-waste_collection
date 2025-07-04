
import React from 'react';
import { Recycle } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Recycle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">EcoCollect</h3>
                <p className="text-sm text-gray-400">Society Aid</p>
              </div>
            </div>
            <p className="text-gray-400 mb-4 max-w-md">
              Making waste disposal convenient, safe, and environmentally responsible 
              for residential societies across Bangalore.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-gray-400">
              <li>E-Waste Collection</li>
              <li>Biomedical Waste</li>
              <li>Society Pickups</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-gray-400">
              <li>Bangalore, Karnataka</li>
              <li>support@ecocollect.in</li>
              <li>+91 9876543210</li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
