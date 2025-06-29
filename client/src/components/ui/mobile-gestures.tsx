import * as React from "react";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { cn } from "@/lib/utils";

// Swipe to dismiss component
interface SwipeToDismissProps {
  children: React.ReactNode;
  onDismiss: () => void;
  threshold?: number;
  className?: string;
  direction?: "horizontal" | "vertical";
}

export function SwipeToDismiss({
  children,
  onDismiss,
  threshold = 100,
  className,
  direction = "horizontal",
}: SwipeToDismissProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const opacity = useTransform(
    direction === "horizontal" ? x : y,
    [-threshold, 0, threshold],
    [0.5, 1, 0.5],
  );

  const handleDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    const offset = direction === "horizontal" ? info.offset.x : info.offset.y;
    const velocity =
      direction === "horizontal" ? info.velocity.x : info.velocity.y;

    if (Math.abs(offset) > threshold || Math.abs(velocity) > 500) {
      onDismiss();
    } else {
      // Snap back
      if (direction === "horizontal") {
        x.set(0);
      } else {
        y.set(0);
      }
    }
  };

  return (
    <motion.div
      className={cn("touch-pan-y", className)}
      style={{
        x: direction === "horizontal" ? x : 0,
        y: direction === "vertical" ? y : 0,
        opacity,
      }}
      drag={direction}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.2}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 0.95 }}
    >
      {children}
    </motion.div>
  );
}

// Pull to refresh component
interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  refreshThreshold?: number;
  className?: string;
}

export function PullToRefresh({
  children,
  onRefresh,
  refreshThreshold = 80,
  className,
}: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const y = useMotionValue(0);
  const opacity = useTransform(y, [0, refreshThreshold], [0, 1]);
  const scale = useTransform(y, [0, refreshThreshold], [0.8, 1]);

  const handleDragEnd = async (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    if (info.offset.y > refreshThreshold && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        y.set(0);
      }
    } else {
      y.set(0);
    }
  };

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Refresh indicator */}
      <motion.div
        className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full flex items-center justify-center p-4"
        style={{ opacity, scale }}
      >
        <div className="w-8 h-8 border-2 border-current border-t-transparent rounded-full animate-spin" />
      </motion.div>

      <motion.div
        style={{ y }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        className="touch-pan-x"
      >
        {children}
      </motion.div>
    </div>
  );
}

// Enhanced touch ripple effect
interface TouchRippleProps {
  children: React.ReactNode;
  className?: string;
  color?: string;
  duration?: number;
}

export function TouchRipple({
  children,
  className,
  color = "rgba(255, 255, 255, 0.3)",
  duration = 600,
}: TouchRippleProps) {
  const [ripples, setRipples] = React.useState<
    Array<{
      id: number;
      x: number;
      y: number;
      size: number;
    }>
  >([]);

  const addRipple = (event: React.TouchEvent | React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.type.includes("touch")
      ? (event as React.TouchEvent).touches[0].clientX - rect.left
      : (event as React.MouseEvent).clientX - rect.left;
    const y = event.type.includes("touch")
      ? (event as React.TouchEvent).touches[0].clientY - rect.top
      : (event as React.MouseEvent).clientY - rect.top;

    const size = Math.max(rect.width, rect.height) * 2;
    const id = Date.now();

    setRipples((prev) => [...prev, { id, x, y, size }]);

    setTimeout(() => {
      setRipples((prev) => prev.filter((ripple) => ripple.id !== id));
    }, duration);
  };

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      onMouseDown={addRipple}
      onTouchStart={addRipple}
    >
      {children}

      {/* Ripple effects */}
      {ripples.map((ripple) => (
        <motion.div
          key={ripple.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: ripple.x - ripple.size / 2,
            top: ripple.y - ripple.size / 2,
            width: ripple.size,
            height: ripple.size,
            backgroundColor: color,
          }}
          initial={{ scale: 0, opacity: 0.8 }}
          animate={{ scale: 1, opacity: 0 }}
          transition={{ duration: duration / 1000, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

// Long press gesture hook
export function useLongPress(
  onLongPress: () => void,
  delay: number = 500,
  onStart?: () => void,
  onCancel?: () => void,
) {
  const [isLongPressing, setIsLongPressing] = React.useState(false);
  const timeoutRef = React.useRef<NodeJS.Timeout>();
  const isLongPressRef = React.useRef(false);

  const start = React.useCallback(() => {
    onStart?.();
    setIsLongPressing(true);
    isLongPressRef.current = false;

    timeoutRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      onLongPress();
      setIsLongPressing(false);
    }, delay);
  }, [onLongPress, delay, onStart]);

  const cancel = React.useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (!isLongPressRef.current) {
      onCancel?.();
    }

    setIsLongPressing(false);
  }, [onCancel]);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    isLongPressing,
    handlers: {
      onMouseDown: start,
      onMouseUp: cancel,
      onMouseLeave: cancel,
      onTouchStart: start,
      onTouchEnd: cancel,
      onTouchCancel: cancel,
    },
  };
}

// Enhanced touch-friendly button
interface TouchButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  rippleColor?: string;
  children: React.ReactNode;
}

export function TouchButton({
  variant = "primary",
  size = "md",
  rippleColor,
  children,
  className,
  ...props
}: TouchButtonProps) {
  const sizeClasses = {
    sm: "min-h-[44px] px-4 py-2 text-sm",
    md: "min-h-[48px] px-6 py-3 text-base",
    lg: "min-h-[56px] px-8 py-4 text-lg",
  };

  const variantClasses = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    secondary: "bg-zinc-800 hover:bg-zinc-700 text-white",
    ghost: "hover:bg-zinc-800 text-zinc-300 hover:text-white",
  };

  return (
    <TouchRipple color={rippleColor}>
      <motion.button
        className={cn(
          "rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-black touch-manipulation active:scale-95",
          sizeClasses[size],
          variantClasses[variant],
          className,
        )}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        {...props}
      >
        {children}
      </motion.button>
    </TouchRipple>
  );
}

// Drawer component for mobile
interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  position?: "bottom" | "top" | "left" | "right";
  className?: string;
}

export function Drawer({
  isOpen,
  onClose,
  children,
  position = "bottom",
  className,
}: DrawerProps) {
  const [isDragging, setIsDragging] = React.useState(false);

  const getInitialPosition = () => {
    switch (position) {
      case "bottom":
        return { y: "100%" };
      case "top":
        return { y: "-100%" };
      case "left":
        return { x: "-100%" };
      case "right":
        return { x: "100%" };
    }
  };

  const getVisiblePosition = () => {
    switch (position) {
      case "bottom":
      case "top":
        return { y: 0 };
      case "left":
      case "right":
        return { x: 0 };
    }
  };

  const getDragConstraints = () => {
    switch (position) {
      case "bottom":
        return { top: 0, bottom: 0 };
      case "top":
        return { top: 0, bottom: 0 };
      case "left":
        return { left: 0, right: 0 };
      case "right":
        return { left: 0, right: 0 };
    }
  };

  const shouldClose = (info: PanInfo) => {
    const threshold = 50;
    switch (position) {
      case "bottom":
        return info.offset.y > threshold;
      case "top":
        return info.offset.y < -threshold;
      case "left":
        return info.offset.x < -threshold;
      case "right":
        return info.offset.x > threshold;
    }
  };

  return (
    <>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />
      )}

      <motion.div
        className={cn(
          "fixed z-50 bg-zinc-900 border-zinc-800",
          position === "bottom" &&
            "bottom-0 left-0 right-0 border-t rounded-t-xl",
          position === "top" && "top-0 left-0 right-0 border-b rounded-b-xl",
          position === "left" && "left-0 top-0 bottom-0 border-r rounded-r-xl",
          position === "right" &&
            "right-0 top-0 bottom-0 border-l rounded-l-xl",
          className,
        )}
        initial={getInitialPosition()}
        animate={isOpen ? getVisiblePosition() : getInitialPosition()}
        exit={getInitialPosition()}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
        }}
        drag={position === "bottom" || position === "top" ? "y" : "x"}
        dragConstraints={getDragConstraints()}
        dragElastic={0.2}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={(_, info) => {
          setIsDragging(false);
          if (shouldClose(info)) {
            onClose();
          }
        }}
      >
        {/* Drag indicator */}
        {(position === "bottom" || position === "top") && (
          <div className="flex justify-center p-2">
            <div className="w-10 h-1 bg-zinc-600 rounded-full" />
          </div>
        )}

        {children}
      </motion.div>
    </>
  );
}
