// Computes next Tuesday at 17:00 BRT, returning UTC ISO string.
export function getNextTuesdayCutoffUtcIso(nowUtc: Date): string {
  const offsetHours = 3;
  const nowBrt = new Date(nowUtc.getTime() - offsetHours * 60 * 60 * 1000);
  const dayOfWeek = nowBrt.getDay();
  const tuesday = 2;

  let daysToAdd = (tuesday - dayOfWeek + 7) % 7;
  const cutoffBrt = new Date(nowBrt);

  if (daysToAdd === 0) {
    const isAfterCutoff =
      nowBrt.getHours() > 17 || (nowBrt.getHours() === 17 && nowBrt.getMinutes() > 0);
    if (isAfterCutoff) {
      daysToAdd = 7;
    }
  }

  cutoffBrt.setDate(cutoffBrt.getDate() + daysToAdd);
  cutoffBrt.setHours(17, 0, 0, 0);

  const cutoffUtc = new Date(cutoffBrt.getTime() + offsetHours * 60 * 60 * 1000);
  return cutoffUtc.toISOString();
}
