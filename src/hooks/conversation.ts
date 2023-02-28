import {
  IMediaRecorder,
  MediaRecorder,
  register,
} from "extendable-media-recorder";
import { connect } from "extendable-media-recorder-wav-encoder";
import { Buffer } from "buffer";
import React from "react";
import { ConversationConfig, ConversationStatus } from "../types/conversation";
import { blobToBase64, stringify } from "../utils";
import { AudioEncoding } from "../types/vocode/audioEncoding";
import {
  AudioMessage,
  StartMessage,
  StopMessage,
} from "../types/vocode/websocket";

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
    const audioContext = new window.AudioContext();
    setAudioContext(audioContext);
    setAudioAnalyser(audioContext.createAnalyser());
  }, []);

  // once the conversation is connected, stream the microphone audio into the socket
  React.useEffect(() => {
    if (!recorder || !socket) return;
    if (status === "connected") {
      recorder.ondataavailable = ({ data }: { data: Blob }) => {
        blobToBase64(data).then((base64Encoded: string | null) => {
          if (!base64Encoded) return;
          const audioMessage: AudioMessage = {
            type: "audio",
            data: base64Encoded,
          };
          socket.readyState === WebSocket.OPEN &&
            socket.send(stringify(audioMessage));
        });
      };
    }
  }, [recorder, socket, status]);

  // accept wav audio from webpage
  React.useEffect(() => {
    const registerWav = async () => {
      await register(await connect());
    };
    registerWav().catch(console.error);
  }, []);

  // when audio comes into the queue, play it to the user
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
    audioAnalyser && audioAnalyser.disconnect();
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

    if (audioContext.state === "suspended") {
      audioContext.resume();
    }

    const resp = await fetch(
      `https://${process.env.REACT_APP_BACKEND_URL}/auth/token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.REACT_APP_VOCODE_API_KEY}`,
        },
      }
    );
    const data = await resp.json();
    const token = data.token;

    const socket = new WebSocket(
      `wss://${process.env.REACT_APP_BACKEND_URL}/conversation?key=${token}`
    );
    socket.onerror = (error) => {
      setStatus("error");
    };
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "audio") {
        const audio = Buffer.from(message.data, "base64");
        setAudioQueue((prev) => [...prev, audio]);
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

    console.log(await navigator.mediaDevices.enumerateDevices());
    let audioStream;
    try {
      audioStream = await navigator.mediaDevices.getUserMedia({
        video: false,
        audio: {
          // echoCancellation: true,
          // autoGainControl: true,
          deviceId: config.audioDeviceConfig.inputDeviceId,
        },
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
    const inputAudioMetadata = {
      samplingRate: micSettings.sampleRate || audioContext.sampleRate,
      audioEncoding: "linear16" as AudioEncoding,
    };
    console.log("Input audio metadata", inputAudioMetadata);

    if (!("setSinkId" in AudioContext.prototype)) {
      alert("Upgrade to Chrome 110 to talk to the bot.");
      stopConversation("error");
      return;
    }
    if (config.audioDeviceConfig.outputDeviceId !== "default") {
      // @ts-ignore - setSinkId is not in the typescript definition
      await audioContext.setSinkId(config.audioDeviceConfig.outputDeviceId);
    }
    const outputAudioMetadata = {
      samplingRate:
        config.audioDeviceConfig.outputSamplingRate || audioContext.sampleRate,
      audioEncoding: "linear16" as AudioEncoding,
    };
    console.log("Output audio metadata", inputAudioMetadata);

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
