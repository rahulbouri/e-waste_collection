import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const UserProfileInfo: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  const getProviderIcon = (provider?: string) => {
    switch (provider) {
      case 'google':
        return (
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
        );
      case 'email':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  const getProviderName = (provider?: string) => {
    switch (provider) {
      case 'google':
        return 'Google';
      case 'email':
        return 'Email OTP';
      default:
        return 'Email OTP';
    }
  };

  return (
    <div className="flex items-center space-x-3 p-4 bg-white rounded-lg border">
      <Avatar className="h-12 w-12">
        <AvatarImage src={user.profile_picture} alt={user.name} />
        <AvatarFallback className="bg-primary/10 text-primary">
          {user.name.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <h3 className="text-sm font-medium text-gray-900 truncate">
            {user.name}
          </h3>
          <Badge variant="secondary" className="text-xs">
            <span className="flex items-center space-x-1">
              {getProviderIcon(user.oauth_provider)}
              <span>{getProviderName(user.oauth_provider)}</span>
            </span>
          </Badge>
        </div>
        <p className="text-sm text-gray-500 truncate">{user.email}</p>
        {user.phone && (
          <p className="text-xs text-gray-400 truncate">{user.phone}</p>
        )}
      </div>
    </div>
  );
};

export default UserProfileInfo; 