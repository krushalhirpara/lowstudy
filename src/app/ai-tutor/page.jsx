"use client";

import { useState, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  User, 
  RotateCcw, 
  Copy, 
  Check, 
  BookOpen, 
  Flame, 
  BrainCircuit,
  FileText,
  Lightbulb
} from 'lucide-react';

export default function AiTutorPage({ searchParams }) {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: "Namaste! I am NyayaAI, your 24/7 Indian Law Tutor. How can I assist your study today? You can ask me to explain statutory sections (e.g. BNS 103), summarize landmark judgments, generate revision flashcards, or simplify complex legal doctrines.",
      timestamp: 'Just now'
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState(null);

  const promptPills = [
    "Explain BNS Section 103 (Murder) vs Old IPC 302",
    "Summarize Kesavananda Bharati v. State of Kerala",
    "What is the Golden Triangle in Constitutional Law?",
    "Explain Res Judicata (Sec 11 CPC) with an example",
    "Generate 3 MCQs on Article 21 with explanations"
  ];

  const handleSend = (textToSend = null) => {
    const text = textToSend || inputQuery;
    if (!text.trim()) return;

    // Add user message
    const userMsg = { sender: 'user', text, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputQuery('');
    setIsTyping(true);

    // Simulate intelligent legal AI response
    setTimeout(() => {
      let aiText = "";
      const lower = text.toLowerCase();

      if (lower.includes('bns 103') || lower.includes('302') || lower.includes('murder')) {
        aiText = `### ⚖️ Section 103, Bharatiya Nyaya Sanhita (BNS, 2023)

**Comparison with IPC:** Formerly **IPC Section 302**.

1. **Definition & Punishment:** BNS Section 103 prescribes punishment for murder. Whosoever commits murder shall be punished with **death or imprisonment for life**, and shall also be liable to fine.
2. **Sub-clause (2) Mob Lynching:** Introduced explicitly in BNS 103(2): When a group of 5 or more persons acting in concert commits murder on grounds of race, caste, community, sex, place of birth, language, or personal belief, each member shall be punished with death or life imprisonment.
3. **Landmark Ratio:** The "Rarest of Rare Cases" doctrine (*Bachan Singh v. State of Punjab*) continues to govern the application of death penalty under BNS 103.`;
      } else if (lower.includes('kesavananda')) {
        aiText = `### 🏛️ Kesavananda Bharati v. State of Kerala (1973) 4 SCC 225

* **Bench:** 13 Judges (7:6 Majority)
* **Core Doctrine:** **Basic Structure Doctrine**
* **Ratio Decidendi:** Parliament possesses wide power to amend any provision of the Constitution under Article 368. However, this amending power does **not** extend to altering, damaging, or destroying the 'Basic Structure' (such as Judicial Review, Supremacy of Constitution, Secularism, and Federalism).
* **Key Significance:** Overruled *Golaknath (1967)* to uphold parliamentary amendment powers while safeguarding fundamental constitutional identity.`;
      } else if (lower.includes('golden triangle')) {
        aiText = `### 🔺 The Golden Triangle of Indian Constitution

The **Golden Triangle** consists of three vital Articles in Part III:
1. **Article 14:** Right to Equality before law and equal protection of laws.
2. **Article 19:** Fundamental Freedoms (Speech, Assembly, Association, Movement, Residence, Profession).
3. **Article 21:** Right to Life and Personal Liberty.

**Established In:** *Maneka Gandhi v. Union of India (1978)*. The Supreme Court held that these three articles do not exist in isolation. A law depriving a person of personal liberty (Art 21) must also satisfy the test of reasonableness under Art 14 and Art 19.`;
      } else if (lower.includes('res judicata')) {
        aiText = `### 📜 Res Judicata (Section 11, Code of Civil Procedure 1908)

* **Maxim:** *Res judicata pro veritate accipitur* (A matter adjudged is taken for truth).
* **Core Rule:** Once a matter has been directly and substantially in issue and finally decided by a competent court between the same parties, no court can re-try the same issue.
* **Illustration:** A sues B for rent under a lease. The court decides the lease is invalid. A cannot file a second suit claiming rent under the same lease for a subsequent year.`;
      } else {
        aiText = `### 📘 Legal Analysis: "${text}"

* **Statutory Framework:** In Indian Law, this issue touches upon statutory principles and constitutional safeguards under Article 14 & 21.
* **Key Explanation:** When analyzing this concept, courts evaluate statutory language, legislative intent, and judicial precedent established by the Supreme Court under Article 141.
* **Exam Tip:** Ensure to cite relevant statutory section numbers (e.g. BNS 2023 / CPC 1908) along with at least one landmark Supreme Court ruling.`;
      }

      setMessages(prev => [...prev, {
        sender: 'ai',
        text: aiText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      setIsTyping(false);
    }, 1200);
  };

  const copyMessage = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-700 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-emerald-500/20">
            <Bot className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-serif-title text-white flex items-center gap-2">
              NyayaAI Tutor Assistant
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">24/7 ONLINE</span>
            </h1>
            <p className="text-xs text-slate-400">Ask any doubt on Indian Constitutional Law, BNS, BNSS, BSA, Contract, or CPC.</p>
          </div>
        </div>

        <button 
          onClick={() => setMessages([messages[0]])}
          className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white border border-slate-800 text-xs flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Clear Chat</span>
        </button>
      </div>

      {/* Prompt Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none flex-nowrap">
        {promptPills.map((pill, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(pill)}
            className="px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs whitespace-nowrap transition-all flex items-center gap-1.5 btn-mobile-touch shrink-0"
          >
            <Lightbulb className="w-3 h-3 text-amber-400" />
            <span>{pill}</span>
          </button>
        ))}
      </div>

      {/* Chat Messages Container */}
      <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-4 sm:p-6 min-h-[450px] max-h-[550px] overflow-y-auto space-y-4 shadow-2xl">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            
            {msg.sender === 'ai' && (
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed space-y-2 relative ${
              msg.sender === 'user'
                ? 'bg-amber-500 text-slate-950 font-medium shadow-md'
                : 'bg-slate-950 border border-slate-800 text-slate-200 shadow-inner'
            }`}>
              <div className="whitespace-pre-wrap">{msg.text}</div>
              <div className={`flex items-center justify-between text-[10px] pt-1 ${
                msg.sender === 'user' ? 'text-slate-900 font-mono' : 'text-slate-500 font-mono'
              }`}>
                <span>{msg.timestamp}</span>
                {msg.sender === 'ai' && (
                  <button 
                    onClick={() => copyMessage(msg.text, idx)}
                    className="hover:text-emerald-400 transition-colors"
                  >
                    {copiedIdx === idx ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                )}
              </div>
            </div>

            {msg.sender === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <User className="w-4 h-4" />
              </div>
            )}

          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono pl-11">
            <Sparkles className="w-4 h-4 animate-spin" />
            <span>NyayaAI is reasoning and searching statutory precedents...</span>
          </div>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex items-center gap-3">
        <input 
          type="text"
          placeholder="Ask NyayaAI any question on Indian law, BNS sections, or judgment ratios..."
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          className="flex-1 bg-slate-900 text-white text-xs sm:text-sm px-4 py-3.5 rounded-2xl border border-slate-800 focus:outline-none focus:border-emerald-500 placeholder:text-slate-500 shadow-inner"
        />
        <button 
          type="submit"
          disabled={!inputQuery.trim()}
          className="px-5 sm:px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all shrink-0 btn-mobile-touch"
        >
          <span>Ask</span>
          <Send className="w-4 h-4" />
        </button>
      </form>

    </div>
  );
}
