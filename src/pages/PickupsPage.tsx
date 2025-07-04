
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft } from 'lucide-react';
import ScheduledPickups from '@/components/ScheduledPickups';
import PastPickups from '@/components/PastPickups';

interface PickupsPageProps {
  onBack: () => void;
  defaultTab?: 'scheduled' | 'past';
}

const PickupsPage = ({ onBack, defaultTab = 'scheduled' }: PickupsPageProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBack}
              className="hover:bg-gray-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
          
          <div className="text-left mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Your Pickups</h1>
          </div>
          
          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 h-12 bg-gray-100 rounded-lg p-1">
              <TabsTrigger 
                value="scheduled" 
                className="text-base py-3 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-gray-900"
              >
                In Progress
              </TabsTrigger>
              <TabsTrigger 
                value="past" 
                className="text-base py-3 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-gray-900"
              >
                Past Pickups
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="scheduled">
              <ScheduledPickups />
            </TabsContent>
            
            <TabsContent value="past">
              <PastPickups />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default PickupsPage;
