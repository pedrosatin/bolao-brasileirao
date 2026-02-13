const BRASILIA_OFFSET_MS = 3 * 60 * 60 * 1000;

function toBrasiliaTime(date: Date): Date {
  return new Date(date.getTime() - BRASILIA_OFFSET_MS);
}

function toUtcFromBrasilia(date: Date): Date {
  return new Date(date.getTime() + BRASILIA_OFFSET_MS);
}

// Computes next Tuesday at 17:00 BRT, returning UTC ISO string.
export function getNextTuesdayCutoffUtcIso(nowUtc: Date): string {
  const nowBrt = toBrasiliaTime(nowUtc);
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

  const cutoffUtc = toUtcFromBrasilia(cutoffBrt);
  return cutoffUtc.toISOString();
}

export function hasMatchStartedInBrasilia(utcDate: string, referenceDate: Date = new Date()): boolean {
  if (!utcDate) {
    return true;
  }

  const matchDate = new Date(utcDate);
  if (Number.isNaN(matchDate.getTime())) {
    return true;
  }

  // Both dates are in UTC; compare directly
  return referenceDate.getTime() >= matchDate.getTime();
}
