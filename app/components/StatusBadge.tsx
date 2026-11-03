// app/components/StatusBadge.tsx
'use client';

interface StatusBadgeProps {
  isOnline: boolean;
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function StatusBadge({ 
  isOnline, 
  className = '', 
  showLabel = false,
  size = 'md' 
}: StatusBadgeProps) {
  
  const getSizeClasses = (size: string): string => {
    switch (size) {
      case 'sm':
        return 'w-2.5 h-2.5';
      case 'md':
        return 'w-3.5 h-3.5';
      case 'lg':
        return 'w-5 h-5';
      default:
        return 'w-3.5 h-3.5';
    }
  };
  
  console.log(isOnline);
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <div 
        className={`
          ${getSizeClasses(size)} 
          rounded-full 
          ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}
          ring-2 ring-white 
          shadow-sm
          transition-all duration-300
        `}
        title={isOnline ? 'Online' : 'Offline'}
      />
      {showLabel && (
        <span className={`text-xs font-medium ${
          isOnline ? 'text-green-600' : 'text-gray-500'
        }`}>
          {isOnline ? 'Online' : 'Offline'}
        </span>
      )}
    </div>
  );
}