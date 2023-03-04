import { AudioEncoding } from "./audioEncoding";

export type TranscriberType =
  | "transcriber_deepgram"
  | "transcriber_google"
  | "transcriber_assembly_ai";

export interface TranscriberConfig {
  type: string;
  samplingRate: number;
  audioEncoding: AudioEncoding;
  chunkSize: number;
}

export interface DeepgramTranscriberConfig extends TranscriberConfig {
  type: "transcriber_deepgram";
  model?: string;
  tier?: string;
  shouldWarmupModel?: boolean;
  version?: string;
  downsampling?: number;
}

export interface GoogleTranscriberConfig extends TranscriberConfig {
  type: "transcriber_google";
  model?: string;
  shouldWarmupModel?: boolean;
}

export interface AssemblyAITranscriberConfig extends TranscriberConfig {
  type: "transcriber_assembly_ai";
  shouldWarmupModel?: boolean;
}
