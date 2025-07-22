import React from 'react';
import { User, Bot, Star, Heart, Sparkles } from 'lucide-react';

interface AvatarProps {
  type?: 'user' | 'ai' | 'reviewer';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  name?: string;
  image?: string;
  status?: 'online' | 'offline' | 'busy' | 'away';
  showStatus?: boolean;
  className?: string;
  onClick?: () => void;
}

export default function Avatar({ 
  type = 'user',
  size = 'md',
  name,
  image,
  status = 'online',
  showStatus = false,
  className = '',
  onClick
}: AvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  };

  const statusSizes = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
    xl: 'w-5 h-5'
  };

  const getTypeGradient = () => {
    switch (type) {
      case 'ai':
        return 'from-blue-500 to-purple-600';
      case 'reviewer':
        return 'from-green-500 to-emerald-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getTypeIcon = () => {
    switch (type) {
      case 'ai':
        return <Bot className={iconSizes[size]} />;
      case 'reviewer':
        return <Star className={iconSizes[size]} />;
      default:
        return <User className={iconSizes[size]} />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'online':
        return 'bg-green-400';
      case 'busy':
        return 'bg-red-400';
      case 'away':
        return 'bg-yellow-400';
      default:
        return 'bg-gray-400';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={`relative inline-flex ${className}`}>
      <div
        className={`
          ${sizeClasses[size]} 
          rounded-full 
          flex 
          items-center 
          justify-center 
          text-white 
          font-medium 
          transition-all 
          duration-200
          ${onClick ? 'cursor-pointer hover:scale-105 hover:shadow-lg' : ''}
          ${image ? 'overflow-hidden' : `bg-gradient-to-r ${getTypeGradient()}`}
        `}
        onClick={onClick}
      >
        {image ? (
          <img
            src={image}
            alt={name || 'Avatar'}
            className="w-full h-full object-cover"
          />
        ) : name ? (
          <span className={`${size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-lg' : size === 'xl' ? 'text-xl' : 'text-sm'}`}>
            {getInitials(name)}
          </span>
        ) : (
          getTypeIcon()
        )}
      </div>

      {/* Status indicator */}
      {showStatus && (
        <div
          className={`
            absolute 
            -bottom-0.5 
            -right-0.5 
            ${statusSizes[size]} 
            ${getStatusColor()} 
            rounded-full 
            border-2 
            border-white
            ${status === 'online' ? 'animate-pulse' : ''}
          `}
        />
      )}

      {/* Special effects for AI avatar */}
      {type === 'ai' && onClick && (
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 opacity-0 hover:opacity-20 transition-opacity duration-200" />
      )}
    </div>
  );
}

// Preset avatar configurations
export const AvatarPresets = {
  Alex: {
    type: 'ai' as const,
    name: 'Alex',
    status: 'online' as const
  },
  Belle: {
    type: 'ai' as const,
    name: 'Belle',
    status: 'online' as const
  },
  Reviewer: {
    type: 'reviewer' as const,
    name: 'User',
    status: 'online' as const
  }
};

// Avatar group component for showing multiple avatars
interface AvatarGroupProps {
  avatars: Array<{
    id: string;
    name?: string;
    image?: string;
    type?: 'user' | 'ai' | 'reviewer';
  }>;
  max?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function AvatarGroup({ avatars, max = 3, size = 'md', className = '' }: AvatarGroupProps) {
  const displayAvatars = avatars.slice(0, max);
  const remainingCount = avatars.length - max;

  return (
    <div className={`flex -space-x-2 ${className}`}>
      {displayAvatars.map((avatar, index) => (
        <div key={avatar.id} className="relative" style={{ zIndex: displayAvatars.length - index }}>
          <Avatar
            type={avatar.type}
            name={avatar.name}
            image={avatar.image}
            size={size}
            className="border-2 border-white"
          />
        </div>
      ))}
      
      {remainingCount > 0 && (
        <div
          className={`
            ${size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-16 h-16' : size === 'xl' ? 'w-20 h-20' : 'w-12 h-12'}
            rounded-full
            bg-gray-100
            border-2
            border-white
            flex
            items-center
            justify-center
            text-gray-600
            font-medium
            ${size === 'sm' ? 'text-xs' : 'text-sm'}
          `}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
}