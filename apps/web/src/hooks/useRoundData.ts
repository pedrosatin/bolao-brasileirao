import { useEffect, useState } from "react";
import { fetchNextRound } from "../services/api";
import { Match, Round } from "../types";

export function useRoundData() {
  const [round, setRound] = useState<Round | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchNextRound();
      setRound(response.round);
      setMatches(response.matches);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar rodada");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return {
    round,
    matches,
    loading,
    error,
    refresh: load
  };
}
