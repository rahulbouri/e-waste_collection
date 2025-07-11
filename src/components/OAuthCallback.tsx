import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';

const OAuthCallback: React.FC = () => {
  const { handleOAuthRedirect, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('OAuth callback: Starting authentication check...');
        // Handle OAuth redirect
        await handleOAuthRedirect();
        
        // Check if authentication was successful
        if (isAuthenticated) {
          // Get the intended redirect URL from query params
          const redirectUrl = searchParams.get('redirect') || '/';
          console.log('OAuth callback: Authentication successful, redirecting to:', redirectUrl);
          // Redirect to home or intended page
          navigate(redirectUrl, { replace: true });
        } else {
          console.error('OAuth callback: Authentication failed');
          setError('Authentication failed. Please try again.');
        }
      } catch (error) {
        console.error('OAuth callback error:', error);
        setError('Authentication failed. Please try again.');
      }
    };

    if (!isLoading) {
      handleCallback();
    }
  }, [handleOAuthRedirect, isAuthenticated, isLoading, navigate, searchParams]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Completing authentication...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">Authentication Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
};

export default OAuthCallback; 