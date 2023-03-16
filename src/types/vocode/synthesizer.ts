import { AudioEncoding } from "./audioEncoding";

export type SynthesizerType =
  | "synthesizer_azure"
  | "synthesizer_google"
  | "synthesizer_eleven_labs";

export interface SynthesizerConfig {
  type: SynthesizerType;
  samplingRate: number;
  audioEncoding: AudioEncoding;
  shouldEncodeAsWav: boolean;
}

export interface AzureSynthesizerConfig extends SynthesizerConfig {
  type: "synthesizer_azure";
  voiceName?: string;
  pitch?: number;
  rate?: number;
}
export interface GoogleSynthesizerConfig extends SynthesizerConfig {
  type: "synthesizer_google";
}
export interface ElevenLabsSynthesizerConfig extends SynthesizerConfig {
  type: "synthesizer_eleven_labs";
  voiceId?: string;
}
