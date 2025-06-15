import React from "react";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular" | "rounded";
  width?: string | number;
  height?: string | number;
  animation?: "pulse" | "wave" | "none";
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = "",
  variant = "text",
  width,
  height,
  animation = "pulse",
}) => {
  const baseClasses = "bg-gray-200 dark:bg-gray-700";
  
  const variantClasses = {
    text: "rounded",
    circular: "rounded-full",
    rectangular: "rounded-none",
    rounded: "rounded-lg",
  };

  const animationClasses = {
    pulse: "animate-pulse",
    wave: "animate-pulse", // Could be enhanced with wave animation
    none: "",
  };

  const style: React.CSSProperties = {
    width: width || (variant === "text" ? "100%" : undefined),
    height: height || (variant === "text" ? "1em" : undefined),
  };

  return (
    <div
      className={`
        ${baseClasses} 
        ${variantClasses[variant]} 
        ${animationClasses[animation]} 
        ${className}
      `}
      style={style}
    />
  );
};

// Predefined skeleton components for common use cases
export const TextSkeleton: React.FC<{ lines?: number; className?: string }> = ({
  lines = 1,
  className = "",
}) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, index) => (
      <Skeleton
        key={index}
        variant="text"
        height="1rem"
        width={index === lines - 1 ? "75%" : "100%"}
      />
    ))}
  </div>
);

export const AvatarSkeleton: React.FC<{ size?: "sm" | "md" | "lg"; className?: string }> = ({
  size = "md",
  className = "",
}) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  return (
    <Skeleton
      variant="circular"
      className={`${sizeClasses[size]} ${className}`}
    />
  );
};

export const CardSkeleton: React.FC<{ className?: string }> = ({
  className = "",
}) => (
  <div className={`p-4 space-y-3 ${className}`}>
    <div className="flex items-center space-x-3">
      <AvatarSkeleton size="sm" />
      <div className="flex-1 space-y-2">
        <Skeleton height="1rem" width="60%" />
        <Skeleton height="0.75rem" width="40%" />
      </div>
    </div>
    <TextSkeleton lines={2} />
  </div>
);

export const MessageSkeleton: React.FC<{ 
  role?: "user" | "assistant"; 
  className?: string;
}> = ({
  role = "assistant",
  className = "",
}) => (
  <div className={`flex gap-4 ${role === "user" ? "justify-end" : "justify-start"} ${className}`}>
    {role === "assistant" && <AvatarSkeleton size="sm" />}
    
    <div className={`max-w-[85%] ${role === "user" ? "order-last" : ""}`}>
      <div className={`
        p-4 rounded-xl space-y-2
        ${role === "user" 
          ? "bg-primary-100 dark:bg-primary-900/40 ml-auto" 
          : "bg-gray-100 dark:bg-gray-800"
        }
      `}>
        <TextSkeleton lines={Math.floor(Math.random() * 3) + 1} />
      </div>
    </div>

    {role === "user" && <AvatarSkeleton size="sm" />}
  </div>
);

export const ChatListSkeleton: React.FC<{ count?: number; className?: string }> = ({
  count = 5,
  className = "",
}) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 space-y-2">
        <div className="flex items-center justify-between">
          <Skeleton height="1rem" width="70%" />
          <Skeleton height="0.75rem" width="20%" />
        </div>
        <Skeleton height="0.75rem" width="50%" />
      </div>
    ))}
  </div>
);