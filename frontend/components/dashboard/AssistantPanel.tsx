'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bot, User, Send, RefreshCw, AlertCircle, Quote, Minimize2 } from 'lucide-react';

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
  const [isOpen, setIsOpen] = useState(true);
  
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
        content: 'Hello! I am Pulse AI Copilot. I can query operational time tracking aggregates, employee detail lists, weekly trends, and data quality anomalies directly. Ask me anything about the audit data!'
      }
    ]);
  }, []);

  // Scroll chat history to bottom
  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading, isOpen]);

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
          className="inline-flex items-center bg-blue-50/90 hover:bg-blue-100/80 border border-blue-200/70 text-blue-700 font-extrabold text-[9px] px-1.5 py-0.5 rounded-md select-none ml-1 cursor-help tracking-wide break-all"
          title={`Data verified from: ${sourceText}`}
        >
          <Quote className="h-2 w-2 mr-0.5 text-blue-500 shrink-0" />
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

  // Minimized Trigger Button
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex items-center space-x-2 sm:space-x-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 cursor-pointer active:scale-95 border border-blue-500 max-w-[calc(100vw-32px)]"
      >
        <div className="bg-white/20 p-1.5 rounded-xl shrink-0">
          <Bot className="h-4 w-4 text-white" />
        </div>
        <span className="truncate">Pulse AI Copilot</span>
        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
      </button>
    );
  }

  return (
    <div className="fixed inset-x-3 bottom-3 sm:inset-x-auto sm:right-6 sm:bottom-6 z-50 w-auto sm:w-[400px] h-[460px] sm:h-[480px] max-h-[85vh] rounded-2xl border border-slate-200/90 bg-white shadow-2xl transition-all duration-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
      {/* Panel Header */}
      <div className="px-4 sm:px-5 py-3.5 sm:py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
        <div className="flex items-center space-x-2.5 min-w-0 pr-2">
          <div className="bg-blue-600 p-1.5 rounded-xl text-white shadow-xs shrink-0">
            <Bot className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-slate-900 text-sm truncate">Pulse AI Copilot</h3>
            <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider truncate">Operational Copilot</p>
          </div>
        </div>

        <div className="flex items-center space-x-1 shrink-0">
          <button
            onClick={handleClearHistory}
            disabled={loading}
            className="text-[9px] font-extrabold text-slate-500 hover:text-slate-700 hover:bg-slate-100/80 px-2 py-1 rounded-lg transition-all cursor-pointer disabled:opacity-50"
            title="Reset Chat Session"
          >
            Reset
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-lg transition-all cursor-pointer"
            title="Minimize"
          >
            <Minimize2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-3.5 bg-slate-50/30">
        {messages.map((msg) => {
          const isBot = msg.role === 'assistant';
          return (
            <div 
              key={msg.id} 
              className={`flex items-start space-x-2.5 ${isBot ? '' : 'flex-row-reverse space-x-reverse'}`}
            >
              {/* Avatar Icon */}
              <div className={`h-7 w-7 rounded-xl flex items-center justify-center border shrink-0 ${
                isBot 
                  ? 'bg-blue-50 border-blue-200/80 text-blue-600' 
                  : 'bg-slate-100 border-slate-250 text-slate-700'
              }`}>
                {isBot ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
              </div>

              {/* Message Bubble */}
              <div className={`p-3 sm:p-3.5 rounded-2xl max-w-[85%] text-xs leading-relaxed font-semibold border shadow-2xs break-words ${
                isBot 
                  ? 'bg-white border-slate-200/90 text-slate-750' 
                  : 'bg-blue-600 border-blue-700 text-white'
              }`}>
                {isBot ? renderMessageContent(msg.content) : msg.content}
              </div>
            </div>
          );
        })}

        {/* Loading Spinner */}
        {loading && (
          <div className="flex items-center space-x-2.5">
            <div className="h-7 w-7 rounded-xl bg-blue-50 border border-blue-200/80 text-blue-600 flex items-center justify-center shrink-0">
              <Bot className="h-4 w-4" />
            </div>
            <div className="p-3 bg-white border border-slate-200/90 rounded-2xl flex items-center space-x-2 shadow-2xs text-xs font-semibold text-slate-400">
              <RefreshCw className="h-3.5 w-3.5 animate-spin text-blue-500 shrink-0" />
              <span>Querying database aggregates...</span>
            </div>
          </div>
        )}

        {/* Error Flag Alert */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200/80 rounded-2xl flex items-start space-x-2.5 text-xs text-rose-800 font-semibold shadow-2xs">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1 min-w-0">
              <p>Failed to query assistant endpoint.</p>
              <p className="text-[10px] text-rose-500 font-semibold truncate">{error}</p>
            </div>
          </div>
        )}
        
        <div ref={chatEndRef} />
      </div>

      {/* Input controls footer */}
      <form onSubmit={handleSend} className="p-3 border-t border-slate-100 bg-white flex items-center space-x-2 shrink-0">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask Pulse Copilot..."
          disabled={loading}
          className="flex-1 min-w-0 bg-slate-50/80 border border-slate-200/90 focus:border-blue-500 rounded-xl px-3 sm:px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading || !inputValue.trim()}
          className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-xl shadow-sm hover:shadow transition-all disabled:opacity-50 cursor-pointer shrink-0 active:scale-95"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
