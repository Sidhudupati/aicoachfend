import React, { useRef, useState } from "react";

const Practice = () => {
  const [stage, setStage] = useState("intro");
  const [recording, setRecording] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.pitch = 1.1;
    utterance.rate = 1;
    speechSynthesis.speak(utterance);
  };

  const startPractice = () => {
    setStage("prompt");
    speak("Tell me about yourself.");
  };

  const startRecording = async () => {
    setStage("recording");
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    videoRef.current.srcObject = stream;
    videoRef.current.play();

    mediaRecorderRef.current = new MediaRecorder(stream);
    chunksRef.current = [];

    mediaRecorderRef.current.ondataavailable = (e) => chunksRef.current.push(e.data);
    mediaRecorderRef.current.onstop = handleRecordingStop;
    mediaRecorderRef.current.start();
    setRecording(true);
  };

  const stopRecording = () => {
    setRecording(false);
    mediaRecorderRef.current.stop();
    videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
  };

  const handleRecordingStop = async () => {
    const blob = new Blob(chunksRef.current, { type: "video/mp4" });
    const formData = new FormData();
    formData.append("video", blob, "interview_video.mp4");

    setStage("analyzing");
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:5050/analyze_video", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setAnalysis(data);
      setStage("result");
    } catch (err) {
      alert("Error analyzing video");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-6">
      
      {(stage === "intro" ) && (
        <h1 className="text-3xl font-bold mb-6 text-white">Shall we start?</h1>
      )}
      {stage === "intro" && (
        <button
          onClick={startPractice}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700"
        >
          Yes!
        </button>
      )}

      {(stage === "prompt" || stage === "recording") && (
        <div className="max-w-md w-full bg-gray-800 rounded-2xl shadow-lg p-8 text-center text-white mb-6">
          <p className="text-3xl font-bold">
            Tell me about yourself  
          </p>
        </div>
      )}

      {/* Start Recording button only during prompt stage */}
      {stage === "prompt" && (
        <button
          onClick={startRecording}
          className="px-6 py-3 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 mb-6"
        >
          Start Recording
        </button>
      )}

      {/* Video and Stop Recording button during recording stage */}
      {stage === "recording" && (
        <div className="flex flex-col items-center">
          <video ref={videoRef} className="rounded-lg shadow-md w-[400px]" autoPlay muted />
          <button
            onClick={stopRecording}
            className="mt-4 px-6 py-3 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700"
          >
            Stop Recording
          </button>
        </div>
      )}

      {stage === "analyzing" && (
        <p className="text-2xl text-white mt-4 animate-pulse">
          Analyzing your skills with AI...
        </p>
      )}

      {stage === "result" && analysis && (
        <div className="max-w-2xl mt-6 bg-white p-6 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-semibold mb-4 text-blue-700">Analysis Result</h2>
          <pre className="text-gray-700 whitespace-pre-wrap">{analysis.analysis}</pre>
        </div>
      )}
    </div>


  );
};

export default Practice;
