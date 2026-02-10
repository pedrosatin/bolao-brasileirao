export type PredictionInput = {
  matchId: number;
  home: number;
  away: number;
};

export type PredictionsPayload = {
  roundId?: number;
  participantName: string;
  predictions: PredictionInput[];
};

// Basic validation for the prediction payload.
export function parsePredictionsPayload(body: unknown): PredictionsPayload | null {
  if (!body || typeof body !== "object") {
    return null;
  }

  const data = body as Record<string, unknown>;
  const participantName = data.participantName;
  const roundId = data.roundId;
  const predictions = data.predictions;

  if (typeof participantName !== "string" || participantName.trim().length < 2) {
    return null;
  }

  if (!Array.isArray(predictions) || predictions.length === 0) {
    return null;
  }

  const parsedPredictions: PredictionInput[] = [];
  for (const item of predictions) {
    if (!item || typeof item !== "object") {
      return null;
    }
    const entry = item as Record<string, unknown>;
    if (typeof entry.matchId !== "number") {
      return null;
    }
    if (typeof entry.home !== "number" || typeof entry.away !== "number") {
      return null;
    }
    if (entry.home < 0 || entry.away < 0) {
      return null;
    }
    parsedPredictions.push({
      matchId: entry.matchId,
      home: entry.home,
      away: entry.away
    });
  }

  if (roundId !== undefined && typeof roundId !== "number") {
    return null;
  }

  return {
    roundId,
    participantName: participantName.trim(),
    predictions: parsedPredictions
  };
}
