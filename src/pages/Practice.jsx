import React, { useRef, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Mic, Video, CheckCircle, AlertCircle, TrendingUp } from "lucide-react";

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
      const res = await fetch("https://aicoachb-1.onrender.com", {
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

  const parseAnalysis = (analysisText) => {
    const scoreMatch = analysisText.match(/(?:overall\s+score|confidence\s+score)[:\s]+(\d+)\/10/i);
    const score = scoreMatch ? parseInt(scoreMatch[1]) : null;

    const strengthsMatch = analysisText.match(/strengths?[:\s]+(.*?)(?=improvements?|weaknesses?|areas?\s+for\s+improvement|$)/is);
    const improvementsMatch = analysisText.match(/(?:improvements?|weaknesses?|areas?\s+for\s+improvement)[:\s]+(.*?)(?=overall\s+score|confidence\s+score|$)/is);

    const cleanText = (text) => {
      return text
        .replace(/^\*+\s*/gm, '') // Remove leading asterisks
        .replace(/^[-•]\s*/gm, '') // Remove bullet points
        .trim();
    };

    const strengths = strengthsMatch 
      ? strengthsMatch[1].trim().split('\n').map(s => cleanText(s)).filter(s => s && s !== '*') 
      : [];
    const improvements = improvementsMatch 
      ? improvementsMatch[1].trim().split('\n').map(s => cleanText(s)).filter(s => s && s !== '*') 
      : [];

    return { score, strengths, improvements };
  };

  const getScoreColor = (score) => {
    if (score >= 8) return "#10b981";
    if (score >= 6) return "#f59e0b";
    return "#ef4444";
  };

  const renderResults = () => {
    if (!analysis) return null;

    const { score, strengths, improvements } = parseAnalysis(analysis.analysis);
    const scoreColor = getScoreColor(score);

    const chartData = [
      { name: "Score", value: score },
      { name: "Remaining", value: 10 - score }
    ];

    const COLORS = [scoreColor, "#1f2937"];

    return (
      <div className="max-w-5xl w-full mt-6 space-y-6">
        {/* Header Card */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 rounded-2xl shadow-2xl text-white">
          <h2 className="text-4xl font-bold mb-2">Interview Analysis Complete!</h2>
          <p className="text-blue-100">Here's your personalized feedback</p>
        </div>

        {/* Score and Chart Section */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Score Card */}
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800">Overall Score</h3>
              <TrendingUp className="text-blue-600" size={32} />
            </div>
            <div className="flex items-center justify-center">
              <div className="relative">
                {score !== null ? (
                  <>
                    <ResponsiveContainer width={200} height={200}>
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx={100}
                          cy={100}
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index]} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-5xl font-bold" style={{ color: scoreColor }}>
                          {score}
                        </div>
                        <div className="text-gray-500 text-sm">out of 10</div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center min-h-[150px]">
                    <div className="text-3xl font-bold text-red-600 mb-2">No Score Available</div>
                    <div className="text-gray-500 text-center">
                      Please record a meaningful response to get a score.
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-6 text-center">
              {score !== null ? (
                <div
                  className="inline-block px-4 py-2 rounded-full text-white font-semibold"
                  style={{ backgroundColor: scoreColor }}
                >
                  {score >= 8 ? "Excellent!" : score >= 6 ? "Good Job!" : "Keep Practicing!"}
                </div>
              ) : null}
            </div>
          </div>
  


          {/* Quick Stats */}
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Performance Metrics</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="text-green-600" size={24} />
                  <span className="font-semibold text-gray-700">Strengths Identified</span>
                </div>
                <span className="text-2xl font-bold text-green-600">{strengths.length}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertCircle className="text-orange-600" size={24} />
                  <span className="font-semibold text-gray-700">Areas to Improve</span>
                </div>
                <span className="text-2xl font-bold text-orange-600">{improvements.length}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Video className="text-blue-600" size={24} />
                  <span className="font-semibold text-gray-700">Analysis Type</span>
                </div>
                <span className="text-sm font-semibold text-blue-600">Audio + Visual</span>
              </div>
            </div>
          </div>
        </div>

        {/* Strengths Section */}
        {strengths.length > 0 && (
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <CheckCircle className="text-green-600" size={32} />
              <h3 className="text-2xl font-bold text-gray-800">Your Strengths</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {strengths.map((strength, idx) => (
                <div key={idx} className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                  <div className="text-green-600 font-bold text-lg">✓</div>
                  <p className="text-gray-700 flex-1">{strength}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Improvements Section */}
        {improvements.length > 0 && (
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <AlertCircle className="text-orange-600" size={32} />
              <h3 className="text-2xl font-bold text-gray-800">Areas for Improvement</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {improvements.map((improvement, idx) => (
                <div key={idx} className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                  <div className="text-orange-600 font-bold text-lg">→</div>
                  <p className="text-gray-700 flex-1">{improvement}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Full Analysis */}
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Detailed Analysis</h3>
          <div className="prose max-w-none">
            <pre className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-6 rounded-lg text-sm leading-relaxed">
              {analysis.analysis}
            </pre>
          </div>
        </div>

        {/* Transcription */}
        {analysis.transcription && (
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <Mic className="text-blue-600" size={28} />
              <h3 className="text-2xl font-bold text-gray-800">Audio Transcription</h3>
            </div>
            <div className="bg-blue-50 p-6 rounded-lg">
              <p className="text-gray-700 italic leading-relaxed">"{analysis.transcription}"</p>
            </div>
          </div>
        )}

        {/* Retry Button */}
        <div className="flex justify-center pb-8">
          <button
            onClick={() => {
              setStage("intro");
              setAnalysis(null);
            }}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all font-semibold text-lg"
          >
            Try Another Practice
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#111827] p-6">
      {stage === "intro" && (
        <>
          <h1 className="text-5xl font-bold mb-4 text-white">Shall we start?</h1>
          <p className="text-xl text-gray-300 mb-8">Get AI-powered feedback on your performance</p>
          <button
            onClick={startPractice}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all font-semibold text-lg"
          >
            Sure!
          </button>
        </>
      )}

      {(stage === "prompt" || stage === "recording") && (
        <div className="max-w-md w-full bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-2xl p-8 text-center text-white mb-6">
          <p className="text-3xl font-bold mb-2">Tell me about yourself</p>
          <p className="text-blue-100">Take your time and be authentic</p>
        </div>
      )}

      {stage === "prompt" && (
        <button
          onClick={startRecording}
          className="px-8 py-4 bg-green-600 text-white rounded-xl shadow-lg hover:bg-green-700 hover:shadow-xl transform hover:scale-105 transition-all font-semibold text-lg flex items-center gap-3"
        >
          <Video size={24} />
          Start Recording
        </button>
      )}

      {stage === "recording" && (
        <div className="flex flex-col items-center">
          <div className="relative">
            <video ref={videoRef} className="rounded-2xl shadow-2xl w-[500px] border-4 border-red-500" autoPlay muted />
            <div className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-full font-semibold flex items-center gap-2 animate-pulse">
              <div className="w-3 h-3 bg-white rounded-full"></div>
              Recording
            </div>
          </div>
          <button
            onClick={stopRecording}
            className="mt-6 px-8 py-4 bg-red-600 text-white rounded-xl shadow-lg hover:bg-red-700 hover:shadow-xl transform hover:scale-105 transition-all font-semibold text-lg"
          >
            Stop Recording
          </button>
        </div>
      )}

      {stage === "analyzing" && (
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-3xl text-white font-semibold animate-pulse">
            Analyzing your performance...
          </p>
          <p className="text-gray-400 mt-2">This may take a moment</p>
        </div>
      )}

      {stage === "result" && renderResults()}
    </div>
  );
};

export default Practice;