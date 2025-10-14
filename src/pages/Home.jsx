import React from "react";
import { ArrowRight } from "lucide-react";

const Home = () => {
  return (
    <div className="text-center space-y-6">
      <h1 className="text-4xl font-bold text-white">Welcome to AI Interview Coach</h1>
      <p className="text-gray-400 max-w-xl mx-auto">
        Practice your interviews with real-time analysis of your speech, tone, and confidence.
      </p>
      <a
        href="/practice"
        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg text-white"
      >
        Start Practicing
        <ArrowRight size={18} />
      </a>
    </div>
  );
};

export default Home;
