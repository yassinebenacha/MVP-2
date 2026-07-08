export interface Segment {
  id: string;
  text: string;
  isNoise: boolean;
  score: number; // probability of classification
  type: "noise" | "signal";
  reason?: string;
}

export interface CleaningMetrics {
  totalSegments: number;
  noiseRemoved: number;
  contentRetained: number;
  cleaningRatio: number; // percentage
}

export interface CleaningResult {
  segments: Segment[];
  cleanedText: string;
  metrics: CleaningMetrics;
}

export interface ModelOption {
  id: string;
  name: string;
  description: string;
  badge: string;
  details: string;
  isBestModel?: boolean;
}
