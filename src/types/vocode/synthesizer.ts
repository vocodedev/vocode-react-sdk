import { AudioEncoding } from "./audioEncoding";

export type SynthesizerType =
  | "synthesizer_azure"
  | "synthesizer_google"
  | "synthesizer_eleven_labs"
  | "synthesizer_rime"
  | "synthesizer_play_ht";

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

export interface RimeSynthesizerConfig extends SynthesizerConfig {
  type: "synthesizer_rime";
  speaker: string;
}

export interface PlayHtSynthesizerConfig extends SynthesizerConfig {
  type: "synthesizer_play_ht";
  voiceId: string;
  speed?: string;
  preset?: string;
}
