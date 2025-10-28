import React from "react";
import { ArrowRight } from "lucide-react";

const Home = () => {
  return (
    <div className="text-center space-y-6">
      <h1 className="text-5xl font-bold text-white">Welcome to AI Interview Coach</h1>
      <p className="text-gray-400 max-w-xl mx-auto">
        Practice your interviews with real-time analysis of your speech, tone, and confidence.
      </p>
      <a
        href="/practice"
        className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all font-semibold text-lg"
      >
        Start Practicing
        
      </a>
    </div>
  );
};


export default Home;
