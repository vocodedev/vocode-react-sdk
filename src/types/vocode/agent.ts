import { BaseMessage } from "./message";

export type AgentType =
  | "agent_llm"
  | "agent_echo"
  | "agent_chat_gpt"
  | "agent_chat_gpt_alpha"
  | "agent_restful_user_implemented"
  | "agent_websocket_user_implemented";

export interface FillerAudioConfig {
  silenceThresholdSeconds?: number;
  usePhrases?: boolean;
  useTypingNoise?: boolean;
}

export interface AgentConfig {
  type: AgentType;
  initialMessage?: BaseMessage;
  generateResponses?: boolean;
  endConversationOnGoodbye?: boolean;
  sendFillerAudio?: boolean | FillerAudioConfig;
}

export interface CutOffResponse {
  messages?: string[];
}

export interface LLMAgentConfig extends AgentConfig {
  type: "agent_llm";
  promptPreamble: string;
  expectedFirstPrompt?: string;
  modelName?: string;
  temperature?: number;
  maxTokens?: number;
  cutOffResponse?: CutOffResponse;
}

export interface ChatGPTAgentConfig extends AgentConfig {
  type: "agent_chat_gpt";
  promptPreamble: string;
  expectedFirstPrompt?: string;
  modelName?: string;
  temperature?: number;
  maxTokens?: number;
  cutOffResponse?: CutOffResponse;
}

export interface EchoAgentConfig extends AgentConfig {
  type: "agent_echo";
}

export interface RESTfulEndpointConfig {
  url: string;
  method?: "GET" | "POST";
}

export interface RESTfulUserImplementedAgentConfig extends AgentConfig {
  type: "agent_restful_user_implemented";
  respond: RESTfulEndpointConfig;
}

export interface WebSocketRouteConfig {
  url: string;
}

export interface WebSocketUserImplementedAgentConfig extends AgentConfig {
  type: "agent_websocket_user_implemented";
  respond: WebSocketRouteConfig;
}
