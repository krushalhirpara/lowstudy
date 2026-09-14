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
  Flame, 
  BrainCircuit,
  FileText,
  Lightbulb,
  Building2,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  Award,
  Clock,
  X,
  ChevronRight,
  ShieldCheck,
  Globe,
  Sliders,
  GraduationCap
} from 'lucide-react';
import { MockDB } from '@/data/db';
import SyllabusSelectorModal from '@/components/syllabus/SyllabusSelectorModal';

export default function AiTutorPage({ searchParams }) {
  const [selectedUni, setSelectedUni] = useState(null);
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [selectedSem, setSelectedSem] = useState(null);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [selectedVersion, setSelectedVersion] = useState('new');
  const [isSyllabusModalOpen, setIsSyllabusModalOpen] = useState(false);

  // Controls
  const [language, setLanguage] = useState('english'); // english, gujarat, hinglish
  const [depth, setDepth] = useState('detailed'); // quick, short, detailed, exam, deep
  const [studyMode, setStudyMode] = useState('ask'); // ask, study, practice, revise, examprep

  // Chat State
  const [messages, setMessages] = useState([
    {
      id: 'msg-init',
      sender: 'ai',
      text: "Namaste! I am NyayaAI, your Gujarat Law & Syllabus Intelligence Assistant. How can I assist your study today? Ask me any doubt on your official Gujarat University curriculum, BNS 2023 sections, landmark case ratios, or exam questions.",
      timestamp: 'Just now',
      retrievedSources: []
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState(null);

  // Quiz Recommendation State
  const [activeQuizRec, setActiveQuizRec] = useState(null);
  const [quizModalData, setQuizModalData] = useState(null);
  const [quizAnswerState, setQuizAnswerState] = useState({});
  const [quizCurrentIdx, setQuizCurrentIdx] = useState(0);

  // Report Modal State
  const [reportModalMsgId, setReportModalMsgId] = useState(null);
  const [reportCategory, setReportCategory] = useState('Wrong Law');
  const [reportSuccessMsg, setReportSuccessMsg] = useState('');

  const chatBottomRef = useRef(null);

  useEffect(() => {
    MockDB.init();
    refreshContext();
  }, []);

  const refreshContext = () => {
    setSelectedUni(MockDB.getSelectedUni());
    setSelectedCollege(MockDB.getSelectedCollege());
    setSelectedSem(MockDB.getSelectedSem());
    setSelectedVersion(MockDB.getSelectedSyllabusVersion());
  };

  const promptPills = [
    "Explain BNS Section 103 (Murder) vs Old IPC 302",
    "Summarize Kesavananda Bharati v. State of Kerala",
    "What is the Golden Triangle in Constitutional Law?",
    "Explain consideration under Contract Law in Gujarati",
    "Give exam-oriented notes on Article 14"
  ];

  const handleSend = async (textToSend = null) => {
    const text = textToSend || inputQuery;
    if (!text.trim()) return;

    const userMsg = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputQuery('');
    setIsTyping(true);

    const studentContext = {
      universityId: selectedUni?.id || 'gu',
      universityName: selectedUni?.name || 'Gujarat University',
      collegeId: selectedCollege?.id || 'col-la-shah',
      semesterId: selectedSem?.id || 'sem1',
      semesterNum: selectedSem?.num || 1,
      syllabusVersion: selectedVersion || 'new'
    };

    try {
      const res = await fetch('/api/nyayaai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: text,
          language,
          depth,
          mode: studyMode,
          studentContext,
          historyCount: messages.length
        })
      });

      const data = await res.json();
      if (data.success) {
        const aiMsg = {
          id: `msg-ai-${Date.now()}`,
          sender: 'ai',
          text: data.text,
          retrievedSources: data.retrievedSources || [],
          isOutsideSyllabus: data.isOutsideSyllabus,
          timestamp: data.timestamp
        };
        setMessages(prev => [...prev, aiMsg]);

        if (data.quizRecommendation) {
          setActiveQuizRec(data.quizRecommendation);
        }
      }
    } catch (err) {
      console.error('NyayaAI Chat Error:', err);
    } finally {
      setIsTyping(false);
    }
  };

  const handleLaunchQuiz = async (rec) => {
    try {
      const res = await fetch('/api/nyayaai/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicTitle: rec.title,
          universityId: selectedUni?.id || 'gu',
          semesterId: selectedSem?.id || 'sem1',
          syllabusVersion: selectedVersion || 'new',
          questionCount: rec.questionCount || 5
        })
      });

      const data = await res.json();
      if (data.success) {
        setQuizModalData(data.quiz);
        setQuizCurrentIdx(0);
        setQuizAnswerState({});
        setActiveQuizRec(null);
      }
    } catch (err) {
      console.error('Quiz Generation Error:', err);
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch('/api/nyayaai/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageId: reportModalMsgId,
          isHelpful: false,
          reportReason: reportCategory
        })
      });
      setReportSuccessMsg('Report submitted to Admin panel.');
      setTimeout(() => {
        setReportModalMsgId(null);
        setReportSuccessMsg('');
      }, 1800);
    } catch (err) {}
  };

  const copyMessage = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Active Syllabus Context Header */}
      <div className="p-4 sm:p-5 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-bold text-emerald-400 font-mono">NYAYAAI SYLLABUS INTELLIGENCE</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-serif-title text-white">Ask NyayaAI — Personal Law Tutor</h1>
          
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300 font-mono">
            <span className="px-2.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-amber-400 font-bold">
              {selectedUni ? selectedUni.name : 'Gujarat University'}
            </span>
            <span>•</span>
            <span className="text-slate-300">
              {selectedCollege ? selectedCollege.name : 'Sir L.A. Shah Law College'}
            </span>
            <span>•</span>
            <span className="text-emerald-400 font-bold">
              {selectedSem ? `Semester ${selectedSem.num}` : 'Semester 1'}
            </span>
            <span>•</span>
            <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 text-[10px] uppercase font-bold">
              {selectedVersion === 'new' ? 'New BNS 2023' : 'Old IPC 1860'}
            </span>
          </div>
        </div>

        <button
          onClick={() => setIsSyllabusModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold border border-slate-700 transition-colors shrink-0"
        >
          Change Active Syllabus
        </button>
      </div>

      {/* Control Bar: Language, Depth, Mode */}
      <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-850 flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Language selector */}
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-amber-400" />
          <span className="text-slate-400 font-mono font-semibold">Language:</span>
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            {[
              { id: 'english', label: 'English' },
              { id: 'gujarat', label: 'ગુજરાતી' },
              { id: 'hinglish', label: 'Hinglish' }
            ].map(l => (
              <button
                key={l.id}
                onClick={() => setLanguage(l.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  language === l.id ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Answer Depth */}
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-emerald-400" />
          <span className="text-slate-400 font-mono font-semibold">Depth:</span>
          <select
            value={depth}
            onChange={(e) => setDepth(e.target.value)}
            className="bg-slate-900 text-slate-200 border border-slate-800 px-3 py-1 rounded-xl focus:outline-none text-xs font-semibold"
          >
            <option value="quick">Quick (2-4 lines)</option>
            <option value="short">Short (5-10 lines)</option>
            <option value="detailed">Detailed (Structured)</option>
            <option value="exam">Exam Ready (University Answer)</option>
            <option value="deep">Deep Study (Doctrinal + Cases)</option>
          </select>
        </div>

        {/* Study Mode */}
        <div className="flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-purple-400" />
          <span className="text-slate-400 font-mono font-semibold">Mode:</span>
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            {[
              { id: 'ask', label: 'Ask' },
              { id: 'study', label: 'Study' },
              { id: 'practice', label: 'Practice' },
              { id: 'revise', label: 'Revise' },
              { id: 'examprep', label: 'Exam Prep' }
            ].map(m => (
              <button
                key={m.id}
                onClick={() => setStudyMode(m.id)}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  studyMode === m.id ? 'bg-purple-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Recommended Quiz Banner */}
      {activeQuizRec && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-slate-900 border border-amber-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">{activeQuizRec.title}</p>
              <p className="text-[11px] text-slate-400">Test your understanding based on your current study session.</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleLaunchQuiz(activeQuizRec)}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow flex items-center gap-1"
            >
              <span>Take 5-MCQ Quiz</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setActiveQuizRec(null)}
              className="p-2 rounded-xl bg-slate-950 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Prompt Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
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
          <div key={msg.id || idx} className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            
            {msg.sender === 'ai' && (
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed space-y-3 relative ${
              msg.sender === 'user'
                ? 'bg-amber-500 text-slate-950 font-medium shadow-md'
                : 'bg-slate-950 border border-slate-800 text-slate-200 shadow-inner'
            }`}>
              <div className="whitespace-pre-wrap">{msg.text}</div>

              {/* RAG Sources Accordion if available */}
              {msg.retrievedSources && msg.retrievedSources.length > 0 && (
                <div className="pt-2 border-t border-slate-800/80 space-y-1.5 text-[11px] text-slate-400 font-mono">
                  <p className="font-bold text-amber-400 text-[10px] uppercase tracking-wider flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Verified Legal Sources:
                  </p>
                  {msg.retrievedSources.map((src, sIdx) => (
                    <div key={sIdx} className="bg-slate-900 p-2 rounded-lg border border-slate-850">
                      <p className="font-bold text-slate-300">{src.title}</p>
                      <ul className="list-disc list-inside text-[10px] text-slate-400 mt-1">
                        {Array.isArray(src.data) && src.data.slice(0, 2).map((d, dIdx) => (
                          <li key={dIdx} className="truncate">{typeof d === 'string' ? d : d.topicTitle || 'Source entry'}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Toolbar */}
              <div className={`flex items-center justify-between text-[10px] pt-1 ${
                msg.sender === 'user' ? 'text-slate-900 font-mono' : 'text-slate-500 font-mono'
              }`}>
                <span>{msg.timestamp}</span>
                
                {msg.sender === 'ai' && (
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => copyMessage(msg.text, idx)}
                      className="hover:text-emerald-400 transition-colors flex items-center gap-1"
                    >
                      {copiedIdx === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button 
                      onClick={() => setReportModalMsgId(msg.id)}
                      className="hover:text-red-400 transition-colors flex items-center gap-1"
                      title="Report legal error or unverified statement"
                    >
                      <ThumbsDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
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
            <span>NyayaAI is reasoning and checking verified statutory precedents...</span>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex items-center gap-3">
        <input 
          type="text"
          placeholder="Ask NyayaAI any doubt on your syllabus, BNS 2023 sections, landmark case ratios, or exam questions..."
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

      {/* Legal Disclaimer */}
      <div className="p-3 rounded-2xl bg-slate-950 border border-slate-850 text-center text-[11px] text-slate-500 font-mono">
        ⚖️ <strong>Educational Disclaimer:</strong> NyayaAI is designed for legal education and examination study. It is not a substitute for advice from a qualified advocate.
      </div>

      {/* Syllabus Selector Modal */}
      <SyllabusSelectorModal
        isOpen={isSyllabusModalOpen}
        onClose={() => setIsSyllabusModalOpen(false)}
        onSelectComplete={() => {
          refreshContext();
          setIsSyllabusModalOpen(false);
        }}
      />

      {/* Dynamic MCQ Quiz Modal */}
      {quizModalData && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 font-mono">Personalized Checkpoint Test</span>
                <h3 className="text-lg font-bold text-white font-serif-title">{quizModalData.title}</h3>
              </div>
              <button onClick={() => setQuizModalData(null)} className="p-2 rounded-xl bg-slate-950 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-slate-400 font-mono">Question {quizCurrentIdx + 1} of {quizModalData.questions.length}</p>
              <h4 className="text-sm sm:text-base font-bold text-white">{quizModalData.questions[quizCurrentIdx].question}</h4>

              <div className="space-y-2">
                {quizModalData.questions[quizCurrentIdx].options.map((opt, oIdx) => {
                  const isSelected = quizAnswerState[quizCurrentIdx] === oIdx;
                  return (
                    <button
                      key={oIdx}
                      onClick={() => setQuizAnswerState(prev => ({ ...prev, [quizCurrentIdx]: oIdx }))}
                      className={`w-full text-left p-3 rounded-xl border text-xs font-semibold transition-all ${
                        isSelected ? 'bg-amber-500/20 border-amber-500 text-amber-300' : 'bg-slate-950 border-slate-850 text-slate-300'
                      }`}
                    >
                      {String.fromCharCode(65 + oIdx)}. {opt}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <button
                onClick={() => { if (quizCurrentIdx > 0) setQuizCurrentIdx(prev => prev - 1); }}
                disabled={quizCurrentIdx === 0}
                className="px-4 py-2 bg-slate-950 border border-slate-800 text-xs font-bold text-slate-400 rounded-xl disabled:opacity-40"
              >
                Previous
              </button>

              {quizCurrentIdx + 1 < quizModalData.questions.length ? (
                <button
                  onClick={() => setQuizCurrentIdx(prev => prev + 1)}
                  className="px-5 py-2 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={() => {
                    alert("Personalized study test completed! Points added to your profile.");
                    setQuizModalData(null);
                  }}
                  className="px-5 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl"
                >
                  Complete Quiz
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Report Error Modal */}
      {reportModalMsgId && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white font-serif-title flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" /> Report AI Legal Error
            </h3>
            
            <form onSubmit={handleReportSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-400 font-semibold font-mono">Select Issue Category</label>
                <select
                  value={reportCategory}
                  onChange={(e) => setReportCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-slate-200 focus:outline-none"
                >
                  <option value="Wrong Law">Wrong Law / Statute Reference</option>
                  <option value="Wrong Section">Wrong Section Number</option>
                  <option value="Wrong Case">Wrong Case Citation / Holding</option>
                  <option value="Outdated Info">Outdated Legal Provision</option>
                  <option value="Not Relevant to Syllabus">Not Relevant to Selected Syllabus</option>
                  <option value="Explanation Unclear">Explanation Unclear</option>
                </select>
              </div>

              {reportSuccessMsg && (
                <div className="p-2 rounded bg-emerald-500/20 text-emerald-400 text-center font-bold">
                  {reportSuccessMsg}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReportModalMsgId(null)}
                  className="px-4 py-2 bg-slate-950 text-slate-400 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
