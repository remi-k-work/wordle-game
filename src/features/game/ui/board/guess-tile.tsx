// react
import { useEffect } from "react";

// services, features, and other libraries
import { cn } from "@/lib/utils";
import { useAnimate } from "motion/react";

// types
import type { Tile } from "@/features/game/domain";

// constants
import { COLOR_MAP } from "@/features/game/domain";
import { motionTokens } from "@/lib/motion-tokens";

interface GuessTileProps {
  tile: Tile;
  bounceAnim?: boolean;
  isSonarReveal?: boolean;
}

export function GuessTile({ tile: { tileKey, color }, bounceAnim = false, isSonarReveal = false }: GuessTileProps) {
  const [scope, animate] = useAnimate();

  useEffect(() => {
    if (!isSonarReveal || !scope.current) return;

    const node = scope.current;
    let isMounted = true;

    const playSequence = async () => {
      // Step 1: Dramatic Ping
      await animate(
        node,
        { scale: [1, 1.15, 1], boxShadow: ["none", "0 0 24px var(--color-accent)", "none"], borderColor: ["", "var(--color-accent)", ""] },
        { duration: motionTokens.duration.slow, ease: motionTokens.easing.sharp }
      );

      if (!isMounted) return;

      // Step 2: Infinite subtle pulse
      animate(
        node,
        { boxShadow: ["none", "0 0 12px var(--color-accent)", "none"] },
        { duration: motionTokens.duration.crawl * 2, repeat: Infinity, ease: "easeInOut" }
      );
    };

    playSequence();

    return () => {
      isMounted = false;

      // Clean up inline styles when the user types over the tile
      node.style.transform = node.style.boxShadow = node.style.borderColor = "";
    };
  }, [isSonarReveal, animate, scope]);

  return (
    <div ref={scope} className={cn("@container grid place-items-center border-2", color && COLOR_MAP[color], bounceAnim && "animate-bounce")}>
      <span className="text-[50cqi] leading-0 font-semibold sm:text-[40cqi]">{tileKey}</span>
    </div>
  );
}

export function GuessTileSkeleton() {
  return (
    <div className="@container grid place-items-center border-2">
      <span className="text-[50cqi] leading-0 font-semibold sm:text-[40cqi]">&nbsp;</span>
    </div>
  );
}
