/**
 * usePeakHold - Hook for tracking peak levels with decay
 */

import { useEffect, useRef, useState } from "react";

interface PeakHoldOptions {
  /** Hold time before decay starts (ms) */
  holdTime?: number;
  /** Time to decay from peak to 0 (ms) */
  releaseTime?: number;
}

interface PeakHoldState {
  peakL: number;
  peakR: number;
}

export function usePeakHold(
  levelL: number,
  levelR: number,
  options: PeakHoldOptions = {}
): PeakHoldState {
  const { holdTime = 500, releaseTime = 1500 } = options;

  const [peaks, setPeaks] = useState<PeakHoldState>({ peakL: 0, peakR: 0 });
  const peakTimesRef = useRef({ peakLTime: 0, peakRTime: 0 });
  const animationRef = useRef<number | undefined>(undefined);

  // Update peaks when level changes
  useEffect(() => {
    const now = Date.now();

    if (levelL > peaks.peakL) {
      peakTimesRef.current.peakLTime = now;
      setPeaks((prev) => ({ ...prev, peakL: levelL }));
    }

    if (levelR > peaks.peakR) {
      peakTimesRef.current.peakRTime = now;
      setPeaks((prev) => ({ ...prev, peakR: levelR }));
    }
  }, [levelL, levelR, peaks.peakL, peaks.peakR]);

  // Animation loop for decay
  useEffect(() => {
    const animate = () => {
      const now = Date.now();
      const { peakLTime, peakRTime } = peakTimesRef.current;

      setPeaks((prev) => {
        let newPeakL = prev.peakL;
        let newPeakR = prev.peakR;

        // Decay left peak
        if (now - peakLTime > holdTime && prev.peakL > 0) {
          const decayRate = 100 / releaseTime;
          newPeakL = Math.max(0, prev.peakL - decayRate * 16); // ~60fps
        }

        // Decay right peak
        if (now - peakRTime > holdTime && prev.peakR > 0) {
          const decayRate = 100 / releaseTime;
          newPeakR = Math.max(0, prev.peakR - decayRate * 16);
        }

        if (newPeakL !== prev.peakL || newPeakR !== prev.peakR) {
          return { peakL: newPeakL, peakR: newPeakR };
        }
        return prev;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [holdTime, releaseTime]);

  return peaks;
}

export default usePeakHold;
