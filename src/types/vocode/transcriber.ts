import { AudioEncoding } from "./audioEncoding";

export type TranscriberType = "deepgram" | "google";

export interface TranscriberConfig {
  type: string;
  samplingRate: number;
  audioEncoding: AudioEncoding;
  chunkSize: number;
}

export interface DeepgramTranscriberConfig extends TranscriberConfig {
  type: "deepgram";
  model?: string;
  tier?: string;
  shouldWarmupModel?: boolean;
  version?: string;
}

export interface GoogleTranscriberConfig extends TranscriberConfig {
  type: "google";
  model?: string;
  shouldWarmupModel?: boolean;
}
