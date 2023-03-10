export type MessageType = "message_base" | "message_ssml";

export interface BaseMessage {
  type: MessageType;
  text: string;
}

export interface SSMLMessage extends BaseMessage {
  type: "message_ssml";
  ssml: string;
}
