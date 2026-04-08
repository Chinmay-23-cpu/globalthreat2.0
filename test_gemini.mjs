import { GoogleGenAI } from '@google/genai';

async function test() {
  try {
    const ai = new GoogleGenAI({ apiKey: 'AIzaSyDEHM9OaA8kY7GqdoybMJ0fJeTeIwmE8yA' });
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: "You are an AI."
      }
    });

    const response = await chat.sendMessage({ message: 'Hello' });
    console.log("SUCCESS:", response.text);
  } catch(e) {
    console.error("ERROR:", e);
  }
}

test();
