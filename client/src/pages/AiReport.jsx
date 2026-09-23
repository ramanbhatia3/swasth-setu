import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Send, Bot, User, Sparkles, Activity, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AiReport() {
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: "Hello! I am the Swasth Setu AI Assistant. I can help you understand medical terms, explain lab reports, or guide you on how to find the right hospital services. How can I help you today?\n\n*(Note: I am an AI, not a doctor. Always consult a verified medical professional for diagnoses.)*"
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Auto-scroll to bottom of chat
  const messagesEndRef = useRef(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    // Add user message to UI immediately
    setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/ai/chat`, {
        message: userMessage
      });

      if (res.data.success) {
        setMessages(prev => [...prev, { sender: 'ai', text: res.data.reply }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { 
        sender: 'ai', 
        text: "Sorry, I am experiencing network issues right now. Please try again later.",
        isError: true 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col h-[calc(100vh-4rem)]">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3 font-serif">
            <Sparkles className="text-primary-600 dark:text-primary-400" size={28} />
            Swasth Setu AI
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Your personal healthcare guide and report analyzer.</p>
        </div>
        <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-4 py-2 rounded-lg border border-amber-200 dark:border-amber-800/50 text-sm font-medium">
          <ShieldAlert size={16} /> Not for medical emergencies
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-grow bg-white dark:bg-[#141311] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col overflow-hidden transition-colors">
        
        {/* Messages Area */}
        <div className="flex-grow p-6 overflow-y-auto bg-slate-50 dark:bg-[#0f0e0c] space-y-6">
          {messages.map((msg, index) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={index} 
              className={`flex gap-4 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div className="shrink-0">
                {msg.sender === 'user' ? (
                  user?.profileImage ? (
                    <img src={user.profileImage} alt="User" className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-800 dark:bg-slate-700 text-white flex items-center justify-center">
                      <User size={20} />
                    </div>
                  )
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary-600 dark:bg-primary-700 text-white flex items-center justify-center shadow-md shadow-primary-200 dark:shadow-none">
                    <Bot size={24} />
                  </div>
                )}
              </div>

              {/* Message Bubble */}
              <div className={`p-4 rounded-2xl text-sm md:text-base whitespace-pre-wrap leading-relaxed ${
                msg.sender === 'user' 
                  ? 'bg-primary-600 text-white rounded-tr-sm' 
                  : msg.isError
                    ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900/50 rounded-tl-sm'
                    : 'bg-white dark:bg-[#141311] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-tl-sm shadow-sm'
              }`}>
                {msg.text}
              </div>
            </motion.div>
          ))}
          
          {/* Loading Indicator */}
          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4 max-w-[85%]">
              <div className="w-10 h-10 rounded-full bg-primary-600 dark:bg-primary-700 text-white flex items-center justify-center shrink-0 shadow-md shadow-primary-200 dark:shadow-none">
                <Bot size={24} />
              </div>
              <div className="p-4 rounded-2xl rounded-tl-sm bg-white dark:bg-[#141311] border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 shadow-sm flex items-center gap-2">
                <Activity size={16} className="animate-spin text-primary-500" /> AI is thinking...
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white dark:bg-[#141311] border-t border-slate-200 dark:border-slate-800">
          <form onSubmit={handleSendMessage} className="relative max-w-4xl mx-auto">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about symptoms, hospital services, or medical terms..."
              className="w-full pl-5 pr-14 py-4 bg-slate-50 dark:bg-[#0f0e0c] border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-600 focus:bg-white dark:focus:bg-[#141311] outline-none transition-all text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 shadow-inner"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              <Send size={20} />
            </button>
          </form>
          <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-3">
            AI-generated information can be inaccurate. Never use this tool for medical emergencies.
          </p>
        </div>

      </div>
    </div>
  );
}