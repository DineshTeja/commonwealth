"use client";

import clsx from "clsx";
import { useEffect, useState } from "react";

interface MeteorsProps {
  number?: number;
}
export const Meteors = ({ number = 20 }: MeteorsProps) => {
  const [meteorStyles, setMeteorStyles] = useState<Array<React.CSSProperties>>(
    [],
  );

  useEffect(() => {
    const styles = [...new Array(number)].map(() => ({
      top: `${Math.random() * 100}vh`,  // Ensures vertical positioning within the viewport
      left: `${Math.random() * 100}vw`, // Ensures horizontal positioning within the viewport
      animationDelay: `${Math.random() * 1 + 0.2}s`,
      animationDuration: `${Math.floor(Math.random() * 8 + 2)}s`,
    }));
    setMeteorStyles(styles);
  }, [number]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...meteorStyles].map((style, idx) => (
        <span
          key={idx}
          className={clsx(
            "absolute h-0.5 w-0.5 rotate-[215deg] animate-meteor rounded-[9999px] bg-purple-800 shadow-[0_0_0_1px_#ffffff10]",
          )}
          style={style}
        >
          <div className="absolute top-1/2 -z-10 h-[1px] w-[50px] -translate-y-1/2 bg-gradient-to-r from-purple-800 to-transparent" />
        </span>
      ))}
    </div>
  );
};

export default Meteors;
