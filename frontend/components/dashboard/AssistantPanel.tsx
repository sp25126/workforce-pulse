'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bot, User, Send, RefreshCw, AlertCircle, Quote } from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function AssistantPanel() {
  const [sessionId, setSessionId] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initialize unique session ID
  useEffect(() => {
    let sid = localStorage.getItem('pulse_chat_session_id');
    if (!sid) {
      sid = 'session_' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('pulse_chat_session_id', sid);
    }
    setSessionId(sid);
    
    // Default initial bot greeting
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: 'Hello! I am your Workforce Pulse assistant. I can query operational time tracking aggregates, employee detail lists, weekly trends, and data quality anomalies directly. Ask me anything about the audit data!'
      }
    ]);
  }, []);

  // Scroll chat history to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || loading) return;

    const userText = inputValue;
    setInputValue('');
    setError(null);

    const userMessage: ChatMessage = {
      id: 'msg_' + Date.now(),
      role: 'user',
      content: userText
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';
      const response = await fetch(`${apiBaseUrl}/chat/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          session_id: sessionId,
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      });

      if (!response.ok) {
        throw new Error(`API returned error status ${response.status}`);
      }

      const resData = await response.json();
      
      setMessages(prev => [
        ...prev,
        {
          id: 'msg_' + Date.now() + '_res',
          role: 'assistant',
          content: resData.content
        }
      ]);
    } catch (err: any) {
      setError(err?.message || 'Failed to send chat message. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    if (loading) return;
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: 'Conversations and filters reset. How can I help you query the dataset?'
      }
    ]);
    setError(null);
  };

  // Helper to parse text and highlight citations [source: ...]
  const renderMessageContent = (content: string) => {
    // Regex matches [source: text here]
    const citationRegex = /\[source:\s*([^\]]+)\]/gi;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = citationRegex.exec(content)) !== null) {
      const textBefore = content.substring(lastIndex, match.index);
      const sourceText = match[1];

      if (textBefore) {
        parts.push(textBefore);
      }

      parts.push(
        <span 
          key={match.index} 
          className="inline-flex items-center bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 font-bold text-[9px] px-1.5 py-0.5 rounded-full select-none ml-1 cursor-help tracking-wide"
          title={`Data verified from: ${sourceText}`}
        >
          <Quote className="h-2 w-2 mr-0.5" />
          {sourceText}
        </span>
      );

      lastIndex = citationRegex.lastIndex;
    }

    const textRemaining = content.substring(lastIndex);
    if (textRemaining) {
      parts.push(textRemaining);
    }

    return parts.length > 0 ? parts : content;
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-xl shadow-sm flex flex-col h-[400px] overflow-hidden">
      {/* Panel Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/20 shrink-0">
        <div className="flex items-center space-x-2.5">
          <div className="bg-blue-50 border border-blue-150 p-1.5 rounded-lg text-blue-600">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Grounded AI Assistant</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Operational copilot</p>
          </div>
        </div>
        <button
          onClick={handleClearHistory}
          disabled={loading}
          className="text-[10px] font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded transition-all cursor-pointer disabled:opacity-50"
        >
          Reset Session
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/30">
        {messages.map((msg) => {
          const isBot = msg.role === 'assistant';
          return (
            <div 
              key={msg.id} 
              className={`flex items-start space-x-2.5 ${isBot ? '' : 'flex-row-reverse space-x-reverse'}`}
            >
              {/* Avatar Icon */}
              <div className={`h-7 w-7 rounded-lg flex items-center justify-center border shrink-0 ${
                isBot 
                  ? 'bg-blue-50 border-blue-150 text-blue-600' 
                  : 'bg-slate-100 border-slate-250 text-slate-600'
              }`}>
                {isBot ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
              </div>

              {/* Message Bubble */}
              <div className={`p-3 rounded-xl max-w-[85%] text-xs leading-relaxed font-semibold border ${
                isBot 
                  ? 'bg-white border-slate-200 text-slate-700 shadow-sm' 
                  : 'bg-blue-600 border-blue-650 text-white shadow-sm'
              }`}>
                {isBot ? renderMessageContent(msg.content) : msg.content}
              </div>
            </div>
          );
        })}

        {/* Loading Spinner */}
        {loading && (
          <div className="flex items-center space-x-2.5">
            <div className="h-7 w-7 rounded-lg bg-blue-50 border border-blue-150 text-blue-600 flex items-center justify-center shrink-0">
              <Bot className="h-4 w-4" />
            </div>
            <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center space-x-2 shadow-sm text-xs font-semibold text-slate-400">
              <RefreshCw className="h-3.5 w-3.5 animate-spin text-blue-500" />
              <span>Querying database aggregates...</span>
            </div>
          </div>
        )}

        {/* Error Flag Alert */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-start space-x-2.5 text-xs text-rose-800 font-semibold shadow-sm">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p>Failed to query assistant endpoint.</p>
              <p className="text-[10px] text-rose-500 font-semibold">{error}</p>
            </div>
          </div>
        )}
        
        <div ref={chatEndRef} />
      </div>

      {/* Input controls footer */}
      <form onSubmit={handleSend} className="p-4 border-t border-slate-100 bg-white flex items-center space-x-2 shrink-0">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask a question (e.g. Who spent most time in Finance?)"
          disabled={loading}
          className="flex-1 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading || !inputValue.trim()}
          className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-lg shadow-sm hover:shadow transition-all disabled:opacity-50 cursor-pointer"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
