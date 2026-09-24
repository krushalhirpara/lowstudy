"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Bot, 
  Send, 
  Sparkles, 
  User, 
  RotateCcw, 
  Copy, 
  Check, 
  BookOpen, 
  Scale, 
  BrainCircuit,
  FileText,
  Lightbulb,
  Building2,
  AlertTriangle,
  Award,
  Clock,
  Layers,
  ShieldCheck,
  Languages,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  Flame,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function AiStudyAssistantPage() {
  const [studentContext, setStudentContext] = useState(null);
  const [contextLoading, setContextLoading] = useState(true);

  // Active capability state
  const [activeCapability, setActiveCapability] = useState('EXPLAIN_SIMPLE');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  
  // Messages state
  const [messages, setMessages] = useState([
    {
      id: 'init-msg',
      sender: 'ai',
      capability: 'EXPLAIN_SIMPLE',
      content: `### 🎓 Welcome to the Lowstudy AI Study Assistant!

I am primarily grounded in **verified Lowstudy educational content** for your official **Saurashtra University LL.B. Semester 3** curriculum.

I strictly adhere to **Legal Grounding Rules**:
* ⚖️ Verified Bare Act sections (BNS, BNSS, BSA, Industrial Disputes, Taxation)
* 🏛️ Landmark Supreme Court & High Court precedents
* ✍️ University-pattern exam answer structures
* 🚫 Never fabricating legal sections or citations

Select a capability below or ask any legal doubt to begin!`,
      timestamp: 'Just now',
      verifiedSources: [
        { type: 'CURRICULUM', title: 'Saurashtra University LL.B. Semester 3 Verified Syllabus' }
      ]
    }
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [errorState, setErrorState] = useState(null);
  const [lastQueryData, setLastQueryData] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const chatBottomRef = useRef(null);

  // Capability definitions
  const capabilityList = [
    { key: 'EXPLAIN_SIMPLE', label: 'Explain Simply', icon: Lightbulb, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
    { key: 'EXPLAIN_GUJARATI', label: 'Explain in Gujarati', icon: Languages, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
    { key: 'EXPLAIN_ENGLISH', label: 'Explain in English', icon: BookOpen, color: 'text-sky-400 bg-sky-500/10 border-sky-500/20' },
    { key: 'STRUCTURE_EXAM_ANSWER', label: 'Exam Answer Structure', icon: FileText, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
    { key: 'GENERATE_PRACTICE_QUESTIONS', label: 'Generate Practice Qs', icon: HelpCircle, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
    { key: 'GENERATE_MCQS', label: 'Generate MCQs', icon: Award, color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
    { key: 'EXPLAIN_LEGAL_SECTION', label: 'Explain Section', icon: Scale, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
    { key: 'EXPLAIN_CASE_LAW', label: 'Explain Case Law', icon: Building2, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
    { key: 'SUMMARIZE_TOPIC', label: 'Summarize Topic', icon: Layers, color: 'text-teal-400 bg-teal-500/10 border-teal-500/20' },
    { key: 'QUICK_REVISION_NOTES', label: 'Quick Revision Notes', icon: Flame, color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
    { key: 'EXPLAIN_MCQ_ANSWER', label: 'Explain MCQ Answer', icon: CheckCircle2, color: 'text-lime-400 bg-lime-500/10 border-lime-500/20' },
    { key: 'CREATE_STUDY_PLAN', label: 'Personalized Study Plan', icon: Clock, color: 'text-amber-300 bg-amber-500/20 border-amber-500/40' }
  ];

  useEffect(() => {
    fetchContext();
  }, []);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const fetchContext = async () => {
    try {
      setContextLoading(true);
      const res = await fetch('/api/assistant/context');
      const json = await res.json();
      if (json.success) {
        setStudentContext(json.data);
        if (json.data.subjects && json.data.subjects.length > 0) {
          setSelectedSubjectId(json.data.subjects[0].id);
        }
      }
    } catch (err) {
      console.error('Error loading student context:', err);
    } finally {
      setContextLoading(false);
    }
  };

  const handleSend = async (overrideQuery = null, overrideCap = null) => {
    const queryToSend = (overrideQuery || inputQuery).trim();
    const capToSend = overrideCap || activeCapability;

    if (!queryToSend) return;

    setErrorState(null);
    setInputQuery('');

    // Add user message to state
    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      content: queryToSend,
      capability: capToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    const payload = {
      query: queryToSend,
      capability: capToSend,
      subjectId: selectedSubjectId || undefined,
      userId: 'usr-student-01'
    };
    setLastQueryData(payload);

    try {
      const res = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || `Server responded with status ${res.status}`);
      }

      const aiMsg = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        content: json.content,
        capability: json.capability,
        uncertaintyWarning: json.uncertaintyWarning,
        verifiedSources: json.verifiedSources || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error('Assistant error:', err);
      setErrorState(err.message || 'Failed to generate assistant response. Please retry.');
    } finally {
      setIsTyping(false);
    }
  };

  const handleRetry = () => {
    if (lastQueryData) {
      handleSend(lastQueryData.query, lastQueryData.capability);
    }
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-[100dvh] bg-slate-950 text-slate-100 flex flex-col font-poppins selection:bg-amber-500/20 selection:text-amber-300">
      
      {/* Top Banner & Active Student Context Ribbon */}
      <div className="border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-md shrink-0">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3.5 sm:py-4">
          <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
                <Link href="/dashboard" className="hover:text-amber-400 transition-colors">Dashboard</Link>
                <span>/</span>
                <span className="text-amber-400">AI Study Assistant</span>
              </div>
              <h1 className="text-lg xs-360:text-xl sm:text-2xl font-black text-white flex items-center gap-2 sm:gap-2.5">
                <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 shrink-0" />
                <span>Lowstudy AI Assistant</span>
                <span className="hidden xs-375:inline-block text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                  Verified Grounding
                </span>
              </h1>
            </div>

            {/* Context Stats Pill Ribbon */}
            {!contextLoading && studentContext && (
              <div className="flex items-center gap-2 text-xs overflow-x-auto scrollbar-none flex-nowrap w-full sm:w-auto pb-1 sm:pb-0">
                <span className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-semibold flex items-center gap-1.5 shrink-0 text-[11px] sm:text-xs">
                  <Building2 className="w-3.5 h-3.5 text-amber-400" />
                  {studentContext.university} ({studentContext.semester})
                </span>
                <span className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-semibold flex items-center gap-1.5 shrink-0 text-[11px] sm:text-xs">
                  <Award className="w-3.5 h-3.5 text-emerald-400" />
                  Progress: {studentContext.progressPercentage}%
                </span>
                <Link
                  href="/revision"
                  className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 font-bold flex items-center gap-1.5 transition-colors shrink-0 text-[11px] sm:text-xs"
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  {studentContext.totalWeakTopics} Weak Topics
                </Link>
                <Link
                  href="/revision/mistakes"
                  className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-400 font-bold flex items-center gap-1.5 transition-colors shrink-0 text-[11px] sm:text-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  {studentContext.totalMistakes} Mistakes
                </Link>
              </div>
            )}
          </div>

          {/* 12 Quick Capability Selector Pills */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-800/60 overflow-x-auto scrollbar-none pb-1 text-xs font-semibold flex-nowrap">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold shrink-0 mr-1">
              Capabilities:
            </span>
            {capabilityList.map((cap) => {
              const Icon = cap.icon;
              const isActive = activeCapability === cap.key;
              return (
                <button
                  key={cap.key}
                  onClick={() => setActiveCapability(cap.key)}
                  className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 shrink-0 transition-all ${
                    isActive 
                      ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-md shadow-amber-500/20' 
                      : 'bg-slate-900/60 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cap.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col space-y-6">
        
        {/* Messages List */}
        <div className="flex-1 space-y-6">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';

            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3.5 ${isUser ? 'flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  isUser 
                    ? 'bg-amber-500 text-slate-950 font-bold text-xs' 
                    : 'bg-slate-900 border border-amber-500/40 text-amber-400'
                }`}>
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Bubble */}
                <div className={`max-w-2xl sm:max-w-3xl space-y-3 ${
                  isUser 
                    ? 'bg-amber-500/10 border border-amber-500/30 text-slate-100 rounded-2xl rounded-tr-none p-4' 
                    : 'bg-slate-900/80 border border-slate-800 text-slate-200 rounded-2xl rounded-tl-none p-5 shadow-lg'
                }`}>
                  {/* Top Bar for AI message */}
                  {!isUser && (
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-amber-400">Lowstudy AI</span>
                        <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded uppercase font-bold">
                          {msg.capability?.replace(/_/g, ' ')}
                        </span>
                      </div>

                      <button
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition-colors"
                        title="Copy Response"
                      >
                        {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  )}

                  {/* Uncertainty Warning Banner (If applicable) */}
                  {msg.uncertaintyWarning && (
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex items-start gap-2.5 text-xs text-amber-300 leading-relaxed">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>{msg.uncertaintyWarning}</span>
                    </div>
                  )}

                  {/* Message Content (Rendered Markdown) */}
                  <div className="text-xs sm:text-sm text-slate-200 leading-relaxed space-y-3 whitespace-pre-wrap font-sans">
                    {msg.content}
                  </div>

                  {/* Verified Sources Grounding Footer */}
                  {msg.verifiedSources && msg.verifiedSources.length > 0 && (
                    <div className="pt-3 border-t border-slate-800/80 space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-400" />
                        Verified Lowstudy Sources Grounding:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.verifiedSources.map((src, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300"
                          >
                            {src.title}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Timestamp */}
                  <div className="text-[10px] text-slate-500 text-right">
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-xl bg-slate-900 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl rounded-tl-none flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce [animation-delay:0.4s]" />
                <span className="text-xs text-slate-400 font-semibold ml-2">
                  Grounding in verified syllabus & statutory provisions...
                </span>
              </div>
            </div>
          )}

          {/* Error Banner with Retry State */}
          {errorState && (
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                <div className="text-xs text-rose-300 font-semibold">
                  {errorState}
                </div>
              </div>
              <button
                onClick={handleRetry}
                className="px-4 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold rounded-xl flex items-center gap-1.5 shrink-0 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retry Request
              </button>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Input & Context Control Box */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-2xl sticky bottom-4 backdrop-blur-md">
          
          {/* Active Settings Row */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-bold">Target Subject:</span>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1 text-slate-200 text-xs font-semibold focus:outline-none focus:border-amber-500"
              >
                {studentContext?.subjects?.map(s => (
                  <option key={s.id} value={s.id}>{s.shortCode} - {s.title}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <span>Active Mode:</span>
              <span className="font-bold text-amber-400">
                {capabilityList.find(c => c.key === activeCapability)?.label || activeCapability}
              </span>
            </div>
          </div>

          {/* Query Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder={`Ask anything on your law curriculum (e.g. "Explain workman definition" or "Structure 14-mark answer on strike")...`}
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              disabled={isTyping}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || isTyping}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-md shadow-amber-500/20 disabled:opacity-50 transition-all shrink-0"
            >
              <span>Ask</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Suggested Prompts */}
          <div className="flex items-center gap-2 overflow-x-auto text-[11px] pt-1">
            <span className="text-slate-500 font-bold shrink-0">Try:</span>
            {[
              "Explain 'Workman' Section 2(s) simply",
              "Structure 14-mark exam answer on Strikes & Lockouts",
              "Generate 3 practice MCQs for Labour Law",
              "Create personalized study plan for my weak topics",
              "Explain Section 103 BNS 2023 in Gujarati"
            ].map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(p)}
                className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-amber-300 hover:border-amber-500/30 shrink-0 transition-colors"
              >
                {p}
              </button>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
}

// HelpCircle Icon Helper
function HelpCircle(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <path d="M12 17h.01" />
    </svg>
  );
}
