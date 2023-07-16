import { AgentConfig } from "./vocode/agent";
import { SynthesizerConfig } from "./vocode/synthesizer";
import { TranscriberConfig } from "./vocode/transcriber";
import { AudioEncoding } from "./vocode/audioEncoding";

export type ConversationStatus = "idle" | "connecting" | "connected" | "error";

export type CurrentSpeaker = "agent" | "user" | "none";

export type AudioDeviceConfig = {
  inputDeviceId?: string;
  outputDeviceId?: string;
  outputSamplingRate?: number;
};

export type VocodeConfig = {
  apiKey: string;
  conversationId?: string;
  baseUrl?: string;
};

export type ConversationConfig = {
  audioDeviceConfig: AudioDeviceConfig;
  transcriberConfig: Omit<TranscriberConfig, "samplingRate" | "audioEncoding">;
  agentConfig: AgentConfig;
  synthesizerConfig: Omit<SynthesizerConfig, "samplingRate" | "audioEncoding">;
  vocodeConfig: VocodeConfig;
};

export type SelfHostedConversationConfig = {
  backendUrl: string;
  audioDeviceConfig: AudioDeviceConfig;
  conversationId?: string;
  timeSlice?: number;
  chunkSize?: number;
  downsampling?: number;
  subscribeTranscript?: boolean;
};

export type AudioMetadata = {
  samplingRate: number;
  audioEncoding: AudioEncoding;
};

export type Transcript = {
  sender: string;
  text: string;
};
