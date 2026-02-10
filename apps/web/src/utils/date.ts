export function formatDate(value: string): string {
  const date = new Date(value);
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

export function isAfterCutoff(cutoffAt?: string | null): boolean {
  if (!cutoffAt) {
    return false;
  }
  return new Date() > new Date(cutoffAt);
}
