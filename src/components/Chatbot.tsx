import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Scissors,
  HelpCircle,
  Gem,
  Minimize2,
  RefreshCw,
  Feather,
  Camera,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

const QUICK_SUGGESTIONS = [
  { label: 'Find Outfit from Photo', query: 'Can I upload an outfit photo to find matching sarees or jewelry?' },
  { label: 'Pairing with Tissue Silk', query: 'Which temple jewelry and blouse pair best with a Tissue Silk Saree?' },
  { label: 'Kora vs Chanderi Fabric', query: 'What is the difference between Kora Organza and Chanderi Silk?' },
  { label: 'Blouse Tailoring Guide', query: 'How do I take accurate measurements for custom blouse stitching?' },
  { label: 'Temple Kada Bangles', query: 'Which bangles and accessories look best with bridal Kanchipuram?' },
  { label: 'Zari Monogramming', query: 'How does personal couple monogramming work on MUDRA creations?' },
];

export const Chatbot: React.FC = () => {
  const { navigateTo, openVisualSearch } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: 'Namaste and Radhe Radhe! 🙏✨ I am MUDRA Assist, your Royal Stylist & Cultural Concierge at MUDRA.\n\nWhether you need advice on bespoke blouse tailoring, pairing temple bangles with Tissue or Kora silks, or finding an auspicious wedding outfit, I am delighted to assist you.',
      timestamp: 'Just now',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setIsLoading(true);

    try {
      // Build lightweight conversation history for the backend
      const historyPayload = messages
        .filter((m) => m.id !== 'welcome-1')
        .slice(-6)
        .map((m) => ({
          role: m.sender === 'user' ? ('user' as const) : ('model' as const),
          text: m.text,
        }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          history: historyPayload,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server responded with ${res.status}`);
      }

      const data = await res.json();
      const botReply = data.reply || 'Namaste! Please feel free to ask about our fabrics, tailoring, or jewelry.';

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'assistant',
          text: botReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err) {
      console.error('Chat error:', err);
      // Fallback response so customer is never stuck
      let localFallback = 'Namaste! Our atelier provides custom made-to-measure tailoring, temple jewelry matching, and handloom silks across India. How can I assist you with sizes or fabrics?';
      const q = text.toLowerCase();
      if (q.includes('fabric') || q.includes('tissue') || q.includes('kora') || q.includes('chanderi')) {
        localFallback = 'For traditional drapes:\n• **Tissue Silk**: High-glamour metallic sheen for evening receptions\n• **Chanderi**: Lightweight sheer luxury with gold zari booties\n• **Kora Organza**: Crisp, sheer drape with floral meenakari border\n\nAll fabrics can be paired with our Bespoke Tailoring service!';
      } else if (q.includes('bangle') || q.includes('jewelry')) {
        localFallback = 'Our 22K gold-plated Temple Kada Bangles and Guttapusalu necklaces feature Radha-Krishna motifs and freshwater pearls, perfectly balancing heavy Banarasi and Kanchipuram silks.';
      } else if (q.includes('measure') || q.includes('custom') || q.includes('stitch')) {
        localFallback = 'To customize: open any product page and click "Customize Fit, Stitching & Monogram". You can specify your bust, waist, shoulder, armhole, neckline style, and even add a gold zari couple monogram!';
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          sender: 'assistant',
          text: localFallback,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const resetChat = () => {
    setMessages([
      {
        id: 'welcome-1',
        sender: 'assistant',
        text: 'Namaste! 🙏✨ I am MUDRA Assist, your Royal Stylist. How may I guide your traditional wardrobe or ornament selection today?',
        timestamp: 'Just now',
      },
    ]);
  };

  return (
    <>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-2.5 bg-[#0C2B4E] hover:bg-[#07172C] text-[#F3E8CE] rounded-full shadow-2xl border-2 border-[#D4AF37] transition-all transform hover:scale-105 group cursor-pointer"
          aria-label="Open MUDRA Assist Stylist"
        >
          <div className="relative flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-gradient-to-b from-[#0F355F] to-[#041021] p-1.5 border-2 border-[#E5B23A] ring-2 ring-[#D4AF37]/50 flex items-center justify-center overflow-hidden shadow-md">
              <img src="/mudra-logo.png" alt="MUDRA Assist" className="w-full h-full object-contain filter drop-shadow-[0_1px_5px_rgba(255,226,133,0.85)]" />
            </div>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white animate-pulse" />
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-bold font-heading tracking-wide leading-none text-[#F3E8CE]">
              MUDRA Assist
            </p>
            <p className="text-[10px] text-[#E5B23A] font-semibold leading-tight mt-0.5">
              Royal Stylist Concierge
            </p>
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[92vw] sm:w-[420px] h-[580px] max-h-[88vh] bg-[#FAF8F5] rounded-2xl shadow-2xl border border-[#D4AF37]/50 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          
          {/* Header */}
          <div className="bg-[#0C2B4E] text-[#F3E8CE] p-4 flex items-center justify-between border-b border-[#D4AF37]/30">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gradient-to-b from-[#0F355F] to-[#041021] p-1.5 border-2 border-[#E5B23A] ring-2 ring-[#D4AF37]/50 shadow-lg flex items-center justify-center overflow-hidden">
                  <img src="/mudra-logo.png" alt="MUDRA Assist" className="w-full h-full object-contain filter drop-shadow-[0_2px_6px_rgba(255,226,133,0.9)]" />
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-[#0C2B4E]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-heading text-sm font-bold text-[#F3E8CE]">
                    MUDRA Assist • Royal Stylist
                  </h3>
                  <span className="px-1.5 py-0.2 bg-[#D4AF37]/20 text-[#D4AF37] text-[9px] font-mono rounded">
                    AI CONCIERGE
                  </span>
                </div>
                <p className="text-[11px] text-[#A0AEC0]">
                  Divine Couture, Fabrics & Bespoke Tailoring
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={resetChat}
                className="p-1.5 text-[#A0AEC0] hover:text-[#D4AF37] rounded-md transition-colors cursor-pointer"
                title="Restart conversation"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-[#A0AEC0] hover:text-[#F3E8CE] rounded-md transition-colors cursor-pointer"
                title="Minimize stylist"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Category Badges Bar */}
          <div className="px-3 py-2 bg-[#FAF5E8] border-b border-[#E8E2D9] flex items-center gap-2 overflow-x-auto text-[10px] text-[#8C7A58] whitespace-nowrap">
            <span className="font-semibold text-[#0C2B4E] shrink-0 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#D4AF37]" /> Topics:
            </span>
            <button
              onClick={() => {
                setIsOpen(false);
                openVisualSearch();
              }}
              className="px-2 py-0.5 bg-white border border-[#D4AF37] font-semibold text-[#0C2B4E] rounded hover:bg-[#FAF5E8] flex items-center gap-1 cursor-pointer"
            >
              <Camera className="w-2.5 h-2.5 text-[#D4AF37]" />
              <span>Shop by Photo</span>
            </button>
            <button
              onClick={() => handleSendMessage('Tell me about Kora Organza, Tissue Silk, and Chanderi fabrics')}
              className="px-2 py-0.5 bg-white border border-[#D9D0C3] rounded hover:border-[#0C2B4E] text-[#4A5568] hover:text-[#0C2B4E] cursor-pointer"
            >
              Fabric Guide
            </button>
            <button
              onClick={() => handleSendMessage('How does the Bespoke Custom Tailoring Atelier work?')}
              className="px-2 py-0.5 bg-white border border-[#D9D0C3] rounded hover:border-[#0C2B4E] text-[#4A5568] hover:text-[#0C2B4E] cursor-pointer"
            >
              Tailoring & Sizing
            </button>
            <button
              onClick={() => handleSendMessage('Which temple bangles and necklaces match silk sarees?')}
              className="px-2 py-0.5 bg-white border border-[#D9D0C3] rounded hover:border-[#0C2B4E] text-[#4A5568] hover:text-[#0C2B4E] cursor-pointer"
            >
              Temple Jewelry
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-b from-[#0F355F] to-[#041021] p-1 border border-[#E5B23A] shadow-xs flex items-center justify-center mr-2 shrink-0 mt-0.5 overflow-hidden">
                    <img src="/mudra-logo.png" alt="MUDRA" className="w-full h-full object-contain filter drop-shadow-[0_1px_3px_rgba(255,226,133,0.7)]" />
                  </div>
                )}
                <div
                  className={`max-w-[84%] rounded-xl px-3.5 py-2.5 leading-relaxed shadow-xs ${
                    msg.sender === 'user'
                      ? 'bg-[#0C2B4E] text-white rounded-br-xs'
                      : 'bg-white text-[#1A202C] border border-[#E8E2D9] rounded-bl-xs'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                  <span
                    className={`block text-[9px] mt-1 text-right ${
                      msg.sender === 'user' ? 'text-white/60' : 'text-[#A0AEC0]'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start items-center gap-2 text-[#718096]">
                <div className="w-6 h-6 rounded-full bg-[#0C2B4E] text-[#D4AF37] flex items-center justify-center font-bold text-[10px] shrink-0">
                  म
                </div>
                <div className="bg-white border border-[#E8E2D9] rounded-xl px-3.5 py-2 flex items-center gap-1.5 shadow-xs">
                  <span className="text-[11px] text-[#8C7A58] italic font-serif">
                    MUDRA Assist is crafting styling advice
                  </span>
                  <span className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full animate-bounce" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Prompt Suggestions (if few messages) */}
          {messages.length <= 3 && !isLoading && (
            <div className="px-3 pb-2 pt-1 border-t border-[#E8E2D9] bg-[#FAF8F5]">
              <span className="text-[10px] text-[#8C7A58] font-semibold block mb-1.5">
                Suggested questions for MUDRA Assist:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_SUGGESTIONS.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => handleSendMessage(item.query)}
                    className="text-[11px] px-2.5 py-1 bg-white hover:bg-[#FAF5E8] text-[#0C2B4E] border border-[#D4AF37]/40 rounded-md transition-colors text-left cursor-pointer"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Bar */}
          <div className="p-3 bg-white border-t border-[#E8E2D9]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-1.5"
            >
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  openVisualSearch();
                }}
                className="p-2 text-[#8C7A58] hover:text-[#0C2B4E] hover:bg-[#FAF5E8] border border-[#D9D0C3] hover:border-[#0C2B4E] rounded-lg transition-colors cursor-pointer shrink-0"
                title="Upload an outfit image to find matching products"
                aria-label="Upload outfit image"
              >
                <Camera className="w-4 h-4 text-[#0C2B4E]" />
              </button>
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask MUDRA Assist about fabrics, measurements..."
                className="flex-1 text-xs px-3.5 py-2.5 bg-[#FAF8F5] border border-[#D9D0C3] rounded-lg focus:outline-hidden focus:border-[#0C2B4E] text-[#1A202C] placeholder-[#A0AEC0]"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="p-2.5 bg-[#0C2B4E] hover:bg-[#07172C] disabled:opacity-40 text-[#D4AF37] rounded-lg shadow-sm transition-colors cursor-pointer shrink-0"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <div className="flex items-center justify-between text-[10px] text-[#A0AEC0] pt-1.5 px-0.5">
              <span>Tradition Woven with Divine Grace</span>
              <span className="text-[#8C7A58] flex items-center gap-1">
                <Scissors className="w-2.5 h-2.5 text-[#D4AF37]" /> Bespoke Atelier
              </span>
            </div>
          </div>

        </div>
      )}
    </>
  );
};
