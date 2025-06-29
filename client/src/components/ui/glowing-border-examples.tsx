import { GlowingBorder } from "./glowing-border";

/**
 * Example usage of GlowingBorder component for different scenarios
 *
 * This file demonstrates how to use the glowing border animations
 * throughout the application. Copy these patterns for consistent usage.
 */

// Always glowing card (good for highlighting important features)
export const AlwaysGlowingCard = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <GlowingBorder variant="always" color="green">
    <div className="p-6 bg-zinc-900 rounded-lg border border-zinc-700">
      {children}
    </div>
  </GlowingBorder>
);

// Hover-only glowing card (good for interactive elements)
export const HoverGlowingCard = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <GlowingBorder variant="hover" color="white">
    <div className="p-6 bg-zinc-900 rounded-lg border border-zinc-700 cursor-pointer">
      {children}
    </div>
  </GlowingBorder>
);

// Randomly animated cards (good for feature grids)
export const RandomGlowingCard = ({
  children,
  randomIndex = 1,
}: {
  children: React.ReactNode;
  randomIndex?: 1 | 2 | 3 | 4 | 5 | 6;
}) => (
  <GlowingBorder variant={`random-${randomIndex}`} color="blue">
    <div className="p-6 bg-zinc-900 rounded-lg border border-zinc-700">
      {children}
    </div>
  </GlowingBorder>
);

// Pulsing card (good for call-to-action elements)
export const PulsingGlowCard = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <GlowingBorder variant="pulse" color="purple">
    <div className="p-6 bg-zinc-900 rounded-lg border border-zinc-700">
      {children}
    </div>
  </GlowingBorder>
);

// Button with glowing border
export const GlowingButton = ({
  children,
  onClick,
  disabled = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) => (
  <GlowingBorder variant="hover" color="white" disabled={disabled}>
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg border border-zinc-600 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {children}
    </button>
  </GlowingBorder>
);

// Full usage example showing different variants
export const GlowingBorderShowcase = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-8">
    <AlwaysGlowingCard>
      <h3 className="text-white font-bold mb-2">Always Glowing</h3>
      <p className="text-gray-300">
        This card always has a glowing border animation.
      </p>
    </AlwaysGlowingCard>

    <HoverGlowingCard>
      <h3 className="text-white font-bold mb-2">Hover Glowing</h3>
      <p className="text-gray-300">
        This card glows only when you hover over it.
      </p>
    </HoverGlowingCard>

    <RandomGlowingCard randomIndex={3}>
      <h3 className="text-white font-bold mb-2">Random Animation</h3>
      <p className="text-gray-300">
        This card starts animating after a random delay.
      </p>
    </RandomGlowingCard>

    <PulsingGlowCard>
      <h3 className="text-white font-bold mb-2">Pulsing Glow</h3>
      <p className="text-gray-300">
        This card has a subtle pulsing glow effect.
      </p>
    </PulsingGlowCard>

    <div className="flex justify-center items-center">
      <GlowingButton onClick={() => alert("Glowing button clicked!")}>
        Glowing Button
      </GlowingButton>
    </div>

    <GlowingBorder variant="always" color="green">
      <div className="p-4 bg-gradient-to-br from-green-900/20 to-emerald-900/20 rounded-lg border border-green-500/30">
        <h3 className="text-green-400 font-bold mb-2">Custom Styled</h3>
        <p className="text-green-300">Custom styling with green theme.</p>
      </div>
    </GlowingBorder>
  </div>
);
