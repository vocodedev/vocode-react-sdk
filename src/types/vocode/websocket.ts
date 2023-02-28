import type { TranscriberConfig } from "./transcriber";
import type { AgentConfig } from "./agent";
import type { SynthesizerConfig } from "./synthesizer";

export type WebSocketMessageType = "start" | "audio" | "ready" | "stop";

export interface WebSocketMessage {
  type: WebSocketMessageType;
}

export interface StartMessage extends WebSocketMessage {
  type: "start";
  transcriberConfig: TranscriberConfig;
  agentConfig: AgentConfig;
  synthesizerConfig: SynthesizerConfig;
}

export interface AudioMessage extends WebSocketMessage {
  type: "audio";
  data: string;
}

export interface ReadyMessage extends WebSocketMessage {
  type: "ready";
}

export interface StopMessage extends WebSocketMessage {
  type: "stop";
}
