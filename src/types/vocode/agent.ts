export type AgentType = "llm" | "echo";

export interface AgentConfig {
  type: string;
  initialMessage?: string;
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
