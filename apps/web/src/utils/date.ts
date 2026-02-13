export function formatDate(value: string): string {
  const date = new Date(value);
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

const BRASILIA_OFFSET_MS = 3 * 60 * 60 * 1000;

function toBrasiliaTimestamp(date: Date): number {
  return date.getTime() - BRASILIA_OFFSET_MS;
}

export function hasMatchStarted(utcDate: string, referenceDate?: Date): boolean {
  if (!utcDate) {
    return false;
  }

  const matchDate = new Date(utcDate);
  if (Number.isNaN(matchDate.getTime())) {
    return true;
  }

  const now = referenceDate ?? new Date();
  // Both dates are in UTC; compare directly
  return now.getTime() >= matchDate.getTime();
}
