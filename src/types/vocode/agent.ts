export type AgentType =
  | "agent_llm"
  | "agent_echo"
  | "agent_chat_gpt"
  | "agent_chat_gpt_alpha"
  | "agent_restful_user_implemented"
  | "agent_websocket_user_implemented";

export interface AgentConfig {
  type: AgentType;
  initialMessage?: string;
  generateResponses?: boolean;
}

export interface LLMAgentConfig extends AgentConfig {
  type: "agent_llm";
  promptPreamble: string;
  expectedFirstPrompt?: string;
}

export interface ChatGPTAgentConfig extends AgentConfig {
  type: "agent_chat_gpt";
  promptPreamble: string;
  expectedFirstPrompt?: string;
}

export interface ChatGPTAlphaAgentConfig extends AgentConfig {
  type: "agent_chat_gpt_alpha";
  promptPreamble: string;
  expectedFirstPrompt?: string;
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
