# vocode React SDK

```javascript

import {
  useConversation,
  AudioDeviceConfig,
  DeepgramTranscriberConfig,
  LLMAgentConfig,
  AzureSynthesizerConfig,
  VocodeConfig
} from "vocode";

const audioDeviceConfig: AudioDeviceConfig = {
  inputDeviceId: "default",
  outputDeviceId: "default",
};
const transcriberConfig: Omit<
  DeepgramTranscriberConfig,
  "samplingRate" | "audioEncoding"
> = {
  type: "deepgram",
  model: "conversationalai",
  chunkSize: 2048,
};
const agentConfig: LLMAgentConfig = {
  type: "llm",
  initialMessage: "Hello!",
  promptPreamble:
    "Vocode is an SDK that allows developers to create voice bots like this one in less than 10 lines of code. The AI is explaining to the human what Vocode is.",
};
const synthesizerConfig: Omit<
  AzureSynthesizerConfig,
  "samplingRate" | "audioEncoding"
> = {
  type: "azure",
  shouldEncodeAsWav: true,
};
const vocodeConfig: VocodeConfig = {
  apiKey: process.env.REACT_APP_VOCODE_API_KEY || "",
};

const { status, start, stop, analyserNode } = useConversation({
  audioDeviceConfig,
  transcriberConfig,
  agentConfig,
  synthesizerConfig,
  vocodeConfig
});
```
