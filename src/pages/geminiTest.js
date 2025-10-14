import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the project root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Debug: Check if API key is loaded
console.log('API Key loaded:', !!process.env.GOOGLE_API_KEY);
console.log('API Key length:', process.env.GOOGLE_API_KEY?.length);

// Initialize with just the API key string
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

async function run() {
  // Use the correct model name without "models/" prefix
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
  });

  const result = await model.generateContent("Write a short haiku about AI.");
  console.log(result.response.text());
}

run().catch(console.error);