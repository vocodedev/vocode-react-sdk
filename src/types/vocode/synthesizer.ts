import { AudioEncoding } from "./audioEncoding";

export type SynthesizerType = "azure" | "google" | "eleven_labs";

export interface SynthesizerConfig {
  type: string;
  samplingRate: number;
  audioEncoding: AudioEncoding;
  shouldEncodeAsWav: boolean;
}

export interface AzureSynthesizerConfig extends SynthesizerConfig {
  type: "azure";
}
export interface GoogleSynthesizerConfig extends SynthesizerConfig {
  type: "google";
}
export interface ElevenLabsSynthesizerConfig extends SynthesizerConfig {
  type: "eleven_labs";
  voiceId?: string;
}
