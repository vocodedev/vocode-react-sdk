export type AgentType = "llm" | "echo";

export interface AgentConfig {
  type: string;
  initialMessage?: string;
  generateResponses?: boolean;
}

export interface LLMAgentConfig extends AgentConfig {
  type: "llm";
  promptPreamble: string;
  expectedFirstPrompt?: string;
}

export interface ChatGPTAgentConfig extends AgentConfig {
  type: "chat_gpt";
  promptPreamble: string;
  expectedFirstPrompt?: string;
}

export interface EchoAgentConfig extends AgentConfig {
  type: "echo";
}

export interface RESTfulEndpointConfig {
  url: string;
  method?: "GET" | "POST";
}

export interface RESTfulUserImplementedAgentConfig extends AgentConfig {
  type: "restful_user_implemented";
  respond: RESTfulEndpointConfig;
}

export interface WebSocketRouteConfig {
  url: string;
}

export interface WebSocketUserImplementedAgentConfig extends AgentConfig {
  type: "websocket_user_implemented";
  respond: WebSocketRouteConfig;
}
