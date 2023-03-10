import { AudioEncoding } from "./audioEncoding";

export type TranscriberType =
  | "transcriber_deepgram"
  | "transcriber_google"
  | "transcriber_assembly_ai";

export type EndpointingType =
  | "endpointing_time_based"
  | "endpointing_punctuation_based";

export interface EndpointingConfig {
  type: EndpointingType;
}

export interface TimeEndpointingConfig extends EndpointingConfig {
  type: "endpointing_time_based";
  timeCutoffSeconds?: number;
}

export interface PunctuationEndpointingConfig extends EndpointingConfig {
  type: "endpointing_punctuation_based";
  timeCutoffSeconds?: number;
}

export interface TranscriberConfig {
  type: string;
  samplingRate: number;
  audioEncoding: AudioEncoding;
  chunkSize: number;
  endpointingConfig?: EndpointingConfig;
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
