import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Recycle, Syringe, Leaf, Users, Shield, CheckCircle, Award } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import EWasteBooking from '@/components/EWasteBooking';
import BiomedicalBooking from '@/components/BiomedicalBooking';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TrustedPartners from '@/components/TrustedPartners';
import LoginModal from '@/components/LoginModal';
import AccountDetailsPage from '@/pages/AccountDetailsPage';
import PickupsPage from '@/pages/PickupsPage';

const Index = () => {
  const [activeSection, setActiveSection] = useState<'home' | 'ewaste' | 'biomedical' | 'about' | 'education' | 'account-details' | 'pickups'>('home');
  const [activeInfoTab, setActiveInfoTab] = useState('ewaste');
  const [pickupsTab, setPickupsTab] = useState<'scheduled' | 'past'>('scheduled');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [pendingNewUserRedirect, setPendingNewUserRedirect] = useState(false);
  const { isAuthenticated } = useAuth();

  const handleSelectService = (section: 'ewaste' | 'biomedical') => {
    if (isAuthenticated) {
      setActiveSection(section);
    } else {
      setIsLoginModalOpen(true);
    }
  };

  const handleAccountNavigation = useCallback((section: string) => {
    if (section === 'profile') {
      setActiveSection('account-details');
    } else if (section === 'ongoing') {
      setActiveSection('pickups');
      setPickupsTab('scheduled');
    } else if (section === 'history') {
      setActiveSection('pickups');
      setPickupsTab('past');
    } else {
      setActiveSection(section);
    }
  }, []);

  const handleNewUser = useCallback(() => {
    setIsLoginModalOpen(false);
    setPendingNewUserRedirect(true);
    localStorage.setItem('redirectToAccountDetails', 'true');
  }, []);

  // Check for redirect flag on mount
  useEffect(() => {
    const redirectFlag = localStorage.getItem('redirectToAccountDetails');
    if (redirectFlag === 'true') {
      setActiveSection('account-details');
      localStorage.removeItem('redirectToAccountDetails');
    }
  }, []);

  // Run only on mount
  useEffect(() => {
    if (!isLoginModalOpen && pendingNewUserRedirect) {
      setActiveSection('account-details');
      setPendingNewUserRedirect(false);
    }
  }, [isLoginModalOpen, pendingNewUserRedirect]);

  const renderContent = () => {
    switch (activeSection) {
      case 'ewaste':
        return <EWasteBooking onBack={() => setActiveSection('home')} />;
      case 'biomedical':
        return <BiomedicalBooking onBack={() => setActiveSection('home')} />;
      case 'account-details':
        return <AccountDetailsPage onBack={() => setActiveSection('home')} />;
      case 'pickups':
        return <PickupsPage onBack={() => setActiveSection('home')} defaultTab={pickupsTab} />;
      default:
        return <HomeSection onSelectService={handleSelectService} activeInfoTab={activeInfoTab} setActiveInfoTab={setActiveInfoTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header 
        activeSection={activeSection} 
        onSectionChange={setActiveSection}
        onAccountNavigation={handleAccountNavigation}
      />
      {renderContent()}
      <Footer />
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)}
        onNewUser={handleNewUser}
      />
    </div>
  );
};

const HomeSection = ({ 
  onSelectService, 
  activeInfoTab, 
  setActiveInfoTab 
}: { 
  onSelectService: (section: 'ewaste' | 'biomedical') => void;
  activeInfoTab: string;
  setActiveInfoTab: (tab: string) => void;
}) => {
  return (
    <div className="container mx-auto px-4 py-12 space-y-16">
      {/* Hero Section */}
      <div className="text-center space-y-6 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
          Responsible Waste
          <span className="block text-primary">Collection Service</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Safe, convenient, and eco-friendly waste collection for your society. Choose 
          your waste type and book a pickup in minutes.
        </p>
        <div className="flex items-center justify-center gap-2 text-primary">
          <Award className="w-4 h-4" />
          <span className="text-sm font-medium">Certified • Secure • Sustainable</span>
        </div>
      </div>

      {/* Service Selection Cards */}
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <Card className="service-card group cursor-pointer hover:border-blue-300" onClick={() => onSelectService('ewaste')}>
          <CardContent className="p-8 text-center space-y-6">
            <div className="w-16 h-16 mx-auto bg-blue-100 rounded-lg flex items-center justify-center">
              <Recycle className="w-8 h-8 text-blue-600" />
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-gray-900">E-Waste Collection</h3>
              <p className="text-gray-600">
                Phones, laptops, batteries, cables and other electronic items. 
                Free pickup service for your society.
              </p>
            </div>
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              Schedule E-Waste Pickup
            </Button>
          </CardContent>
        </Card>

        <Card className="service-card group cursor-pointer hover:border-green-300" onClick={() => onSelectService('biomedical')}>
          <CardContent className="p-8 text-center space-y-6">
            <div className="w-16 h-16 mx-auto bg-green-100 rounded-lg flex items-center justify-center">
              <Syringe className="w-8 h-8 text-green-600" />
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-gray-900">Biomedical Waste</h3>
              <p className="text-gray-600">
                Syringes, needles, expired medications and medical supplies. 
                Safe disposal with proper documentation.
              </p>
            </div>
            <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
              Schedule Biomedical Pickup
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 mx-auto bg-primary/10 rounded-lg flex items-center justify-center">
            <Leaf className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-semibold text-gray-900">Eco-Friendly</h3>
          <p className="text-sm text-gray-600">Sustainable disposal methods that protect our environment</p>
        </div>
        <div className="text-center space-y-4">
          <div className="w-12 h-12 mx-auto bg-primary/10 rounded-lg flex items-center justify-center">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-semibold text-gray-900">Community Focused</h3>
          <p className="text-sm text-gray-600">Serving residential societies and apartment complexes</p>
        </div>
        <div className="text-center space-y-4">
          <div className="w-12 h-12 mx-auto bg-primary/10 rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-semibold text-gray-900">Safe & Secure</h3>
          <p className="text-sm text-gray-600">Trained professionals with proper safety equipment</p>
        </div>
      </div>

      {/* Info Section */}
      <div id="education-section" className="pt-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Learn About Responsible Waste Disposal</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Understanding proper waste disposal is crucial for environmental protection and 
            community health. Learn about the different types of waste and why proper handling matters.
          </p>
        </div>

        <Tabs value={activeInfoTab} onValueChange={setActiveInfoTab} className="w-full max-w-6xl mx-auto">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8 h-12 bg-muted">
            <TabsTrigger 
              value="ewaste" 
              className="text-base py-3 data-[state=active]:bg-blue-500 data-[state=active]:text-white"
            >
              E-Waste
            </TabsTrigger>
            <TabsTrigger 
              value="biomedical" 
              className="text-base py-3 data-[state=active]:bg-green-500 data-[state=active]:text-white"
            >
              Biomedical Waste
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="ewaste" className="space-y-8">
            <div className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-blue-50 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Recycle className="w-4 h-4 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">What is E-Waste?</h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Electronic waste (e-waste) refers to discarded electrical or electronic devices. 
                    These items contain valuable materials that can be recycled and hazardous substances 
                    that need proper handling.
                  </p>
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">Common E-Waste Items:</h4>
                    <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                      <li>Mobile phones and tablets</li>
                      <li>Computers and laptops</li>
                      <li>TVs and monitors</li>
                      <li>Kitchen appliances</li>
                      <li>Batteries and chargers</li>
                      <li>Printers and scanners</li>
                    </ul>
                  </div>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Shield className="w-4 h-4 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Why Proper Disposal Matters</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">The Problem</h4>
                      <p className="text-sm text-gray-600">
                        Most of our waste ends up in landfills or gets informally handled, risking toxic exposure and pollution.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">The Better Way</h4>
                      <p className="text-sm text-gray-600">
                        We collect your waste responsibly and send it where it's meant to go—for recycling, recovery or safe disposal.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border-2 border-blue-200 rounded-xl p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Did You Know?</h3>
                <div className="grid md:grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">15kg</div>
                    <p className="text-sm text-gray-700">average e-waste generated per household annually</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">80%</div>
                    <p className="text-sm text-gray-700">of society residents are unaware of proper e-waste disposal</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">500+</div>
                    <p className="text-sm text-gray-700">families can be served by one organized collection drive</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="biomedical" className="space-y-8">
            <div className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-green-50 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Syringe className="w-4 h-4 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">What is Biomedical Waste?</h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Biomedical waste from households includes any waste that contains potentially 
                    infectious material or medical supplies used for personal care and treatment.
                  </p>
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">Items We Collect:</h4>
                    <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                      <li>Used syringes and needles (diabetes care)</li>
                      <li>Expired medications</li>
                      <li>Blood glucose test strips</li>
                      <li>Used medical gloves and masks</li>
                      <li>Bandages and gauze</li>
                      <li>Home medical equipment</li>
                    </ul>
                  </div>
                </div>
                
                <div className="bg-green-50 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <Shield className="w-4 h-4 text-red-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Why Proper Disposal Matters</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">The Problem</h4>
                      <p className="text-sm text-gray-600">
                        Most of our waste ends up in landfills or gets informally handled, risking toxic exposure and pollution.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">The Better Way</h4>
                      <p className="text-sm text-gray-600">
                        We collect your waste responsibly and send it where it's meant to go—for recycling, recovery or safe disposal.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border-2 border-green-200 rounded-xl p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Did You Know?</h3>
                <div className="grid md:grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">1 in 4</div>
                    <p className="text-sm text-gray-700">households have diabetic family members generating medical waste</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">200+</div>
                    <p className="text-sm text-gray-700">syringes used annually by an average diabetic household</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">90%</div>
                    <p className="text-sm text-gray-700">of families dispose medical waste incorrectly at home</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* About Section */}
      <div id="about-section" className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">About EcoCollect</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              We're committed to making waste disposal convenient, safe, and environmentally 
              responsible for residential societies across Bangalore.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-start mb-16 max-w-6xl mx-auto">
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-900">Our Mission</h3>
              <p className="text-gray-600">
                EcoCollect was founded with a simple yet powerful mission: to bridge the gap 
                between residential communities and proper waste management services. We 
                believe that every household should have access to safe, convenient, and 
                environmentally responsible waste disposal options.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mt-1">
                    <Users className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Community First</h4>
                    <p className="text-sm text-gray-600">We prioritize the health and convenience of residential communities</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mt-1">
                    <Shield className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Safety & Compliance</h4>
                    <p className="text-sm text-gray-600">All operations follow strict safety protocols and regulatory standards</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mt-1">
                    <Leaf className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Environmental Impact</h4>
                    <p className="text-sm text-gray-600">Committed to reducing environmental footprint through proper recycling</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-neutral-50 rounded-xl p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Why Choose EcoCollect?</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span className="text-gray-700">Licensed waste handlers</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span className="text-gray-700">Convenient doorstep collection</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span className="text-gray-700">Environmentally responsible disposal</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span className="text-gray-700">Proper documentation and compliance</span>
                </div>
              </div>
            </div>
          </div>

          <TrustedPartners />
        </div>
      </div>
    </div>
  );
};

export default Index;
