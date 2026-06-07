import { useRef, useState } from "react";

function FloatingAditi() {
  const [status, setStatus] = useState("idle");
  const [text, setText] = useState("Click Talk to start...");
  const [reply, setReply] = useState("");

  const audioRef = useRef(null);
  const recognitionRef = useRef(null);
  const shouldListenRef = useRef(false);

  const startListening = async () => {
    if (!shouldListenRef.current) return;

    const isElectron = navigator.userAgent.toLowerCase().includes("electron");

if (isElectron) {
  try {
    setStatus("listening");
    setText(".......");

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const recorder = new MediaRecorder(stream);
    const chunks = [];

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };

recorder.start();

const audioContext = new AudioContext();
const source = audioContext.createMediaStreamSource(stream);
const analyser = audioContext.createAnalyser();

source.connect(analyser);

analyser.fftSize = 2048;

const dataArray = new Uint8Array(analyser.frequencyBinCount);

let voiceStarted = false;
let silenceStart = null;

const NOISE_THRESHOLD = 25;
const SILENCE_DURATION = 2000;
const MAX_RECORDING_TIME = 15000;

const maxTimer = setTimeout(() => {
  try {
    recorder.stop();
  } catch {}
}, MAX_RECORDING_TIME);

await new Promise((resolve) => {
  const checkSilence = () => {
    analyser.getByteFrequencyData(dataArray);

    const volume =
      dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;

    console.log("volume:", volume);

    if (volume > NOISE_THRESHOLD) {
      voiceStarted = true;
      silenceStart = null;
    }

    if (voiceStarted && volume < NOISE_THRESHOLD) {
      if (!silenceStart) {
        silenceStart = Date.now();
      }

      if (Date.now() - silenceStart >= SILENCE_DURATION) {
        clearTimeout(maxTimer);

        try {
          recorder.stop();
        } catch {}

        resolve();
        return;
      }
    }

    requestAnimationFrame(checkSilence);
  };

  checkSilence();
});

    const audioBlob = await new Promise((resolve) => {
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());

        resolve(
          new Blob(chunks, {
            type: "audio/webm",
          })
        );
      };
    });

    const formData = new FormData();
    formData.append("audio", audioBlob, "speech.webm");

    setStatus("thinking");
    setText("Understanding...");

    const sttRes = await fetch("http://127.0.0.1:4000/api/stt", {
      method: "POST",
      body: formData,
    });

    const sttData = await sttRes.json();

    const userText = sttData.text?.trim();

    if (!userText) {
      setText("I couldn't understand that.");
      setStatus("idle");
      return;
    }
  
    setText(userText);

    const res = await fetch("http://127.0.0.1:4000/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: userText }),
    });

    const data = await res.json();
    if (data.desktopAction?.type === "effect") {
  if (data.desktopAction.effect === "flowers") {
    window.electronAPI?.showFlowerEffect?.();
  }
  if (data.desktopAction?.effect === "cat") {
    window.electronAPI?.showCat?.();
}
if (data.desktopAction.effect === "rescue") {
    window.electronAPI?.showRescueEffect?.();
  }
}
    const aiReply = data.reply || data.message || "No reply received.";
    setReply(aiReply);

    if (!shouldListenRef.current) return;

    setStatus("speaking");

    if (data.audio && audioRef.current) {
      const audioUrl =
        data.audio +
        (data.audio.includes("?") ? "&" : "?") +
        "fresh=" +
        Date.now();

      const audio = audioRef.current;

      audio.pause();
      audio.currentTime = 0;
      audio.src = audioUrl;
      audio.volume = 1;

      audio.onended = () => {
        setStatus("idle");

        if (shouldListenRef.current) {
          setTimeout(() => {
            startListening();
          }, 700);
        }
      };

      setTimeout(() => {
        audio.play().catch((err) => {
          console.log("Electron audio play failed:", err);
          setStatus("idle");
        });
      }, 500);
    } else {
      setStatus("idle");
    }

    return;
  } catch (error) {
    console.log("Electron STT error:", error);
    setText("Electron STT failed.");
    setStatus("idle");
    return;
  }
}

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setText("Speech recognition not supported.");
      return;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.start();

    setStatus("listening");
    setText("Listening...");

    recognition.onresult = async (event) => {
      try {
        const userText = event.results[0][0].transcript.trim();

        if (!userText) {
          setStatus("idle");
          return;
        }
     
        setText(userText);
        setStatus("thinking");

        const res = await fetch("http://127.0.0.1:4000/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message: userText }),
        });

        const data = await res.json();
        if (data.desktopAction?.type === "effect") {
        if (data.desktopAction.effect === "flowers") {
    window.electronAPI?.showFlowerEffect?.();
  }
  if (data.desktopAction?.effect === "cat") {
    window.electronAPI?.showCat?.();
}
}
        console.log("FULL DATA:", data);

        const aiReply = data.reply || data.message || "No reply received.";
        setReply(aiReply);

        if (!shouldListenRef.current) return;

        setStatus("speaking");

        if (data.audio) {
          const audioUrl =
            data.audio +
            (data.audio.includes("?") ? "&" : "?") +
            "fresh=" +
            Date.now();

          console.log("Audio URL:", audioUrl);

          const audio = audioRef.current;

          if (!audio) {
            console.log("Audio element missing");
            setStatus("idle");
            return;
          }

          audio.pause();
          audio.currentTime = 0;
          audio.src = audioUrl;
          audio.volume = 1;

          audio.onended = () => {
            console.log("Audio ended");
            setStatus("idle");

            if (shouldListenRef.current) {
              setTimeout(() => {
                startListening();
              }, 700);
            }
          };

          audio.onerror = (e) => {
            console.log("Audio error:", e);
            setStatus("idle");
          };

          setTimeout(() => {
            audio
              .play()
              .then(() => {
                console.log("Audio playing");
              })
              .catch((err) => {
                console.log("Play failed:", err);
                setStatus("idle");
              });
          }, 500);
        } else {
          console.log("No audio received");
          setStatus("idle");
        }
      } catch (error) {
        console.log("Chat error:", error);
        setReply("Something went wrong.");
        setStatus("idle");
      }
    };

    recognition.onerror = (err) => {
      console.log("Speech error:", err.error);
      setStatus("idle");
    };
  };

  const handleMainButton = () => {
    shouldListenRef.current = true;

    if (status === "speaking" && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;

      setStatus("idle");
      setText("Listening again...");

      setTimeout(() => {
        startListening();
      }, 300);

      return;
    }

    startListening();
  };

  const stopAditi = () => {
    shouldListenRef.current = false;

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    setStatus("stopped");
    setText("Aditi stopped.");
  };

return (
  <div className="aditi-pill">
    <div className="left-section">
      <h2 className="aditi-title">
        Aditi <span>♡</span>
      </h2>

      <div className={`orb-holder ${status}`}>
        <div className="crescent-ring"></div>
        <div className="top-spike"></div>
        <div className="cross-bar vertical"></div>
        <div className="cross-bar diagonal-one"></div>
        <div className="cross-bar diagonal-two"></div>
        <div className="red-wrap"></div>
        <div className="hanging-cloth"></div>
        <div className="handle"></div>
        <div className="red-stick"></div>

        <div className="orb-frame">
          <div className="inner-orb"></div>
        </div>
      </div>
    </div>

    <div className="message-section">
      <p className="status">{status}</p>
      <p className="user-text">{text}</p>
      {reply && <p className="reply-text">{reply}</p>}
    </div>

    <audio ref={audioRef} />

    <div className="button-section">
      <button className="aditi-btn main-btn" onClick={handleMainButton}>
        {status === "speaking" ? "Stop" : "Talk"}
      </button>

      {/* <button
        className="aditi-btn effect-btn"
        onClick={() => {
          console.log("Electron API:", window.electronAPI);
          window.electronAPI?.showFlowerEffect?.();
        }}
      >
        Flo
      </button>

      <button
        className="aditi-btn effect-btn"
        onClick={() => {
          console.log("Electron API:", window.electronAPI);
          window.electronAPI?.showCat?.();
        }}
      >
        Cat
      </button>

      <button
        className="aditi-btn effect-btn"
        onClick={() => {
          console.log("Electron API:", window.electronAPI);
          window.electronAPI?.showRescueEffect?.();
        }}
      >
        Res
      </button> */}

      <button className="aditi-btn end-btn" onClick={stopAditi}>
        End
      </button>
    </div>
   {/* <div
  className="custom-resize-handle"
  onMouseDown={(e) => {
    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX;
    const startY = e.clientY;

    const startWidth = window.innerWidth;
    const startHeight = window.innerHeight;

    const onMouseMove = (moveEvent) => {
      const diffX = moveEvent.clientX - startX;
      const diffY = moveEvent.clientY - startY;

      window.electronAPI?.resizeAditiWindow?.({
        width: startWidth + diffX,
        height: startHeight + diffY,
      });
    };

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  }}
/> */}
  </div>
);
}

export default FloatingAditi;