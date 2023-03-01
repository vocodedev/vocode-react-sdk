import {
  IMediaRecorder,
  MediaRecorder,
  register,
} from "extendable-media-recorder";
import { connect } from "extendable-media-recorder-wav-encoder";
import React from "react";
import { ConversationConfig, ConversationStatus } from "../types/conversation";
import { blobToBase64, stringify } from "../utils";
import { AudioEncoding } from "../types/vocode/audioEncoding";
import {
  AudioMessage,
  StartMessage,
  StopMessage,
} from "../types/vocode/websocket";
import { DeepgramTranscriberConfig, TranscriberConfig } from "../types";
import { isSafari, isChrome } from "react-device-detect";
import { Buffer } from "buffer";

const VOCODE_API_URL = "api.vocode.dev";

export const useConversation = (
  config: ConversationConfig
): {
  status: ConversationStatus;
  start: () => void;
  stop: () => void;
  analyserNode: AnalyserNode | undefined;
} => {
  const [audioContext, setAudioContext] = React.useState<AudioContext>();
  const [audioAnalyser, setAudioAnalyser] = React.useState<AnalyserNode>();
  const [audioQueue, setAudioQueue] = React.useState<Buffer[]>([]);
  const [processing, setProcessing] = React.useState(false);
  const [recorder, setRecorder] = React.useState<IMediaRecorder>();
  const [socket, setSocket] = React.useState<WebSocket>();
  const [status, setStatus] = React.useState<ConversationStatus>("idle");

  // get audio context and metadata about user audio
  React.useEffect(() => {
    const audioContext = new AudioContext();
    setAudioContext(audioContext);
    const audioAnalyser = audioContext.createAnalyser();
    setAudioAnalyser(audioAnalyser);
  }, []);

  // once the conversation is connected, stream the microphone audio into the socket
  React.useEffect(() => {
    if (!recorder || !socket) return;
    if (status === "connected") {
      recorder.addEventListener("dataavailable", ({ data }: { data: Blob }) => {
        blobToBase64(data).then((base64Encoded: string | null) => {
          if (!base64Encoded) return;
          const audioMessage: AudioMessage = {
            type: "audio",
            data: base64Encoded,
          };
          socket.readyState === WebSocket.OPEN &&
            socket.send(stringify(audioMessage));
        });
      });
    }
  }, [recorder, socket, status]);

  // accept wav audio from webpage
  React.useEffect(() => {
    const registerWav = async () => {
      await register(await connect());
    };
    registerWav().catch(console.error);
  }, []);

  // play audio that is queued
  React.useEffect(() => {
    const playArrayBuffer = (arrayBuffer: ArrayBuffer) => {
      audioContext &&
        audioAnalyser &&
        audioContext.decodeAudioData(arrayBuffer, (buffer) => {
          const source = audioContext.createBufferSource();
          source.buffer = buffer;
          source.connect(audioContext.destination);
          source.connect(audioAnalyser);
          source.start(0);
          source.onended = () => {
            setProcessing(false);
          };
        });
    };
    if (!processing && audioQueue.length > 0) {
      setProcessing(true);
      const audio = audioQueue.shift();
      audio &&
        fetch(URL.createObjectURL(new Blob([audio])))
          .then((response) => response.arrayBuffer())
          .then(playArrayBuffer);
    }
  }, [audioQueue, processing]);

  const stopConversation = (status: ConversationStatus = "idle") => {
    setAudioQueue([]);
    setStatus(status);
    if (!recorder || !socket) return;
    recorder.stop();
    const stopMessage: StopMessage = {
      type: "stop",
    };
    socket.send(stringify(stopMessage));
    ![WebSocket.CLOSING, WebSocket.CLOSED].includes(socket.readyState) &&
      socket.close();
  };

  const startConversation = async () => {
    if (!audioContext || !audioAnalyser) return;
    setStatus("connecting");

    if (!isSafari && !isChrome) {
      stopConversation("error");
      return;
    }

    if (audioContext.state === "suspended") {
      audioContext.resume();
    }

    const resp = await fetch(`https://${VOCODE_API_URL}/auth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.vocodeConfig.apiKey}`,
      },
    });
    const data = await resp.json();
    const token = data.token;

    const socket = new WebSocket(
      `wss://${VOCODE_API_URL}/conversation?key=${token}`
    );
    socket.onerror = (error) => {
      setStatus("error");
    };
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "audio") {
        setAudioQueue((prev) => [...prev, Buffer.from(message.data, "base64")]);
      } else if (message.type === "ready") {
        setStatus("connected");
      }
    };
    socket.onclose = () => {
      stopConversation();
    };
    setSocket(socket);

    // wait for socket to be ready
    await new Promise((resolve) => {
      const interval = setInterval(() => {
        if (socket.readyState === WebSocket.OPEN) {
          clearInterval(interval);
          resolve(null);
        }
      }, 100);
    });

    let audioStream;
    try {
      const trackConstraints: MediaTrackConstraints = {
        echoCancellation: true,
      };
      if (config.audioDeviceConfig.inputDeviceId) {
        console.log(
          "Using input device",
          config.audioDeviceConfig.inputDeviceId
        );
        trackConstraints.deviceId = config.audioDeviceConfig.inputDeviceId;
      }
      audioStream = await navigator.mediaDevices.getUserMedia({
        video: false,
        audio: trackConstraints,
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === "NotAllowedError") {
        alert(
          "Allowlist this site at chrome://settings/content/microphone to talk to the bot."
        );
      }
      console.error(error);
      stopConversation("error");
      return;
    }
    const micSettings = audioStream.getAudioTracks()[0].getSettings();
    console.log(micSettings);
    const inputAudioMetadata = {
      samplingRate: micSettings.sampleRate || audioContext.sampleRate,
      audioEncoding: "linear16" as AudioEncoding,
    };
    console.log("Input audio metadata", inputAudioMetadata);

    const outputAudioMetadata = {
      samplingRate:
        config.audioDeviceConfig.outputSamplingRate || audioContext.sampleRate,
      audioEncoding: "linear16" as AudioEncoding,
    };
    console.log("Output audio metadata", inputAudioMetadata);

    let transcriberConfig: TranscriberConfig = Object.assign(
      config.transcriberConfig,
      inputAudioMetadata
    );
    if (isSafari && transcriberConfig.type === "deepgram") {
      (transcriberConfig as DeepgramTranscriberConfig).downsampling = 2;
    }

    const startMessage: StartMessage = {
      type: "start",
      transcriberConfig: Object.assign(
        config.transcriberConfig,
        inputAudioMetadata
      ),
      agentConfig: config.agentConfig,
      synthesizerConfig: Object.assign(
        config.synthesizerConfig,
        outputAudioMetadata
      ),
    };

    socket.send(stringify(startMessage));
    console.log("Access to microphone granted");

    let recorderToUse = recorder;
    if (recorderToUse && recorderToUse.state === "paused") {
      recorderToUse.resume();
    } else if (!recorderToUse) {
      recorderToUse = new MediaRecorder(audioStream, {
        mimeType: "audio/wav",
      });
      setRecorder(recorderToUse);
    }

    recorderToUse.start(10);
  };

  return {
    status,
    start: startConversation,
    stop: stopConversation,
    analyserNode: audioAnalyser,
  };
};
