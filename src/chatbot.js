import { GoogleGenAI } from '@google/genai';

/**
 * ChatbotController manages the OSINT Assistant UI and Gemini API integration.
 */
export class ChatbotController {
  constructor() {
    this.apiKey = 'AIzaSyDEHM9OaA8kY7GqdoybMJ0fJeTeIwmE8yA';
    this.ai = new GoogleGenAI({ apiKey: this.apiKey });
    this.chatSession = null;
    this.isOpen = false;

    // DOM Elements
    this.container = document.getElementById('chatbot-container');
    this.toggleBtn = document.getElementById('chatbot-toggle');
    this.closeBtn = document.getElementById('chatbot-close');
    this.windowEl = document.getElementById('chatbot-window');
    this.messagesContainer = document.getElementById('chatbot-messages');
    this.inputField = document.getElementById('chatbot-input-field');
    this.sendBtn = document.getElementById('chatbot-send');

    if (!this.container) return; // Chatbot UI not present

    this.bindEvents();
    this.initChatSession();
  }

  bindEvents() {
    this.toggleBtn.addEventListener('click', () => this.toggleWindow());
    this.closeBtn.addEventListener('click', () => this.closeWindow());
    
    this.sendBtn.addEventListener('click', () => this.handleSendMessage());
    this.inputField.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.handleSendMessage();
      }
    });
  }

  initChatSession() {
    // We restrict the persona and scope through system instructions.
    const systemInstruction = `You are an OSINT (Open Source Intelligence) voice assistant integrated into a Global Events Monitor dashboard. Your purpose is to provide analysis, summaries, and information strictly related to world events, geopolitics, conflicts, natural disasters, climate events, and disease outbreaks.
Do NOT answer questions or provide information outside of this scope (e.g., coding help, general recipes, pop culture, personal advice). 
CRITICAL RULE: Keep your output short, summarized, and strictly to the point. Your responses MUST NOT exceed 10 lines of text. Do not use overly complex formatting because your text will be read aloud by an AI voice. Maintain an objective, professional, and analytical tone.`;

    this.chatSession = this.ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.2, // Low temperature for more analytical/objective tone
      }
    });
  }

  toggleWindow() {
    if (this.isOpen) {
      this.closeWindow();
    } else {
      this.openWindow();
    }
  }

  openWindow() {
    this.isOpen = true;
    this.windowEl.hidden = false;
    this.toggleBtn.style.transform = 'scale(0)';
    // focus input after animation
    setTimeout(() => {
      this.inputField.focus();
    }, 300);
  }

  closeWindow() {
    this.isOpen = false;
    this.windowEl.hidden = true;
    this.toggleBtn.style.transform = 'scale(1)';
  }

  async handleSendMessage() {
    const text = this.inputField.value.trim();
    if (!text) return;

    // Clear input
    this.inputField.value = '';

    // Render user message
    this.renderMessage(text, 'user-message');

    // Show typing indicator
    const typingIndicator = this.renderTypingIndicator();

    try {
      if (!this.chatSession) {
        throw new Error("Chat session not initialized");
      }

      // Send to Gemini
      const response = await this.chatSession.sendMessage({ message: text });
      
      // Remove typing indicator
      typingIndicator.remove();

      // Render AI response
      this.renderMessage(response.text, 'ai-message');
      
      // Speak the response via AI voice assistant
      this.speakText(response.text);

    } catch (error) {
      console.error("Chatbot Error:", error);
      if (typingIndicator && typingIndicator.parentNode) {
        typingIndicator.remove();
      }
      
      let errorMsg = "Error connecting to intelligence feed. Please try again.";
      const errStr = error.message || error.toString();
      
      if (errStr.includes('503') || errStr.includes('high demand')) {
        errorMsg = "The AI model is currently experiencing high demand and is temporarily unavailable. Please try again in a few moments.";
      } else {
        errorMsg = `An error occurred: ${errStr}`;
      }
      
      this.renderMessage(errorMsg, 'ai-message');
    }
  }

  renderMessage(text, className) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-message ${className}`;
    
    // We strictly use textContent for security (preventing XSS from LLM)
    // For a real app, we might parse markdown. We do rudimentary replacement here.
    const p = document.createElement('p');
    p.textContent = text;
    msgDiv.appendChild(p);

    this.messagesContainer.appendChild(msgDiv);
    this.scrollToBottom();
  }

  renderTypingIndicator() {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'chat-message ai-message typing-indicator';
    msgDiv.innerHTML = '<span></span><span></span><span></span>';
    this.messagesContainer.appendChild(msgDiv);
    this.scrollToBottom();
    return msgDiv;
  }

  scrollToBottom() {
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }

  speakText(text) {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      // Clean up markdown before reading (basic asterisk removal for bold/italic)
      const cleanText = text.replace(/[*#]/g, '');

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      // Try to select a good voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => v.name.toLowerCase().includes('google') || v.name.toLowerCase().includes('premium')) || voices[0];
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      window.speechSynthesis.speak(utterance);
    } else {
      console.warn("Text-to-speech is not supported in this browser.");
    }
  }
}
