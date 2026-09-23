/**
 * Shared numeric conversions for the mixer's 0-100 level/fader domain.
 * Single source of truth so the meter, fader, and numeric dB read-outs
 * across ChannelStrip/MasterSection/StereoMeter never drift apart.
 */

/** Clamp a 0-100 level/fader value, e.g. before using it as a CSS percentage. */
export function clampPercent(value: number): number {
  return Math.min(100, Math.max(0, value));
}

/** Convert a 0-100 level to a "-∞"/"0.0"/"-N.N" dB display string (60 dB range). */
export function levelToDb(level: number): string {
  if (level <= 0) return "-∞";
  const db = (level / 100) * 60 - 60;
  if (db >= 0) return "0.0";
  return db.toFixed(1);
}
