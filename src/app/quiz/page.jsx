"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Award, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Sparkles, 
  ArrowRight, 
  HelpCircle,
  Flame,
  Check,
  ShieldAlert,
  ChevronRight,
  Bookmark,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { MockDB } from '@/data/db';

export default function QuizPage() {
  const [mounted, setMounted] = useState(false);
  const [availableTests, setAvailableTests] = useState([]);
  const [activeTest, setActiveTest] = useState(null);
  const [testState, setTestState] = useState('idle'); // idle, running, review
  const [selectedUni, setSelectedUni] = useState(null);
  const [selectedSem, setSelectedSem] = useState(null);
  
  // Test running state
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { index: selectedOptionIndex }
  const [flaggedQuestions, setFlaggedQuestions] = useState({}); // { index: boolean }
  const [timeLeft, setTimeLeft] = useState(0);
  const [useNegativeMarking, setUseNegativeMarking] = useState(true);

  // Result metrics
  const [finalScore, setFinalScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [penaltyCount, setPenaltyCount] = useState(0);

  useEffect(() => {
    setMounted(true);
    MockDB.init();
    setSelectedUni(MockDB.getSelectedUni());
    setSelectedSem(MockDB.getSelectedSem());

    const tests = MockDB.getMockTests();
    // Filter tests that only contain valid (non-OUTDATED) questions
    const validTests = tests.map(t => ({
      ...t,
      questions: t.questions.filter(q => q.status !== 'OUTDATED')
    }));
    setAvailableTests(validTests);
  }, []);

  // Timer countdown hook
  useEffect(() => {
    if (testState !== 'running' || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [testState, timeLeft]);

  useEffect(() => {
    if (timeLeft === 0 && testState === 'running') {
      handleSubmitTest();
    }
  }, [timeLeft, testState]);

  const handleStartTest = (test) => {
    setActiveTest(test);
    setCurrentIdx(0);
    setSelectedAnswers({});
    setFlaggedQuestions({});
    setTimeLeft(test.timeLimit * 60);
    setTestState('running');
  };

  const handleSelectOption = (idx) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [currentIdx]: idx
    }));
  };

  const toggleFlag = () => {
    setFlaggedQuestions(prev => ({
      ...prev,
      [currentIdx]: !prev[currentIdx]
    }));
  };

  const handleSubmitTest = () => {
    if (!activeTest) return;
    
    let correct = 0;
    let incorrect = 0;
    
    activeTest.questions.forEach((q, idx) => {
      const ans = selectedAnswers[idx];
      if (ans !== undefined) {
        if (ans === q.correctIndex) {
          correct += 1;
        } else {
          incorrect += 1;
        }
      }
    });

    const penalty = useNegativeMarking ? (incorrect * 0.25) : 0;
    const finalVal = Math.max(0, correct - penalty);

    setCorrectCount(correct);
    setIncorrectCount(incorrect);
    setPenaltyCount(penalty);
    setFinalScore(finalVal);
    setTestState('review');

    // Update student progress in MockDB
    const currentProfile = MockDB.getProfile();
    const earnedXp = Math.round(finalVal * 25);
    const earnedCoins = Math.round(finalVal * 5);
    MockDB.updateProfile({
      xp: currentProfile.xp + earnedXp,
      coins: currentProfile.coins + earnedCoins
    });
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-xs text-slate-500 font-mono">
        Setting up exam prep portal...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* 1. IDLE SELECTION VIEW */}
      {testState === 'idle' && (
        <div className="space-y-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
              <Award className="w-3.5 h-3.5" />
              <span>Mock Test Hub</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold font-serif-title text-white">University Mock Exams</h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Prepare for your semester exams, AIBE, and Judiciary services. Choose a mock test configuration to begin your evaluation.
            </p>
          </div>

          {/* Test settings panel */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xl">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                Negative Marking Toggle
              </h3>
              <p className="text-xs text-slate-400 max-w-lg">
                Simulate official exam parameters: Incorrect responses deduct -0.25 points from cumulative scoring.
              </p>
            </div>
            <button
              onClick={() => setUseNegativeMarking(!useNegativeMarking)}
              className="flex items-center gap-2 text-slate-300 font-bold text-xs"
            >
              {useNegativeMarking ? (
                <ToggleRight className="w-10 h-10 text-emerald-500" />
              ) : (
                <ToggleLeft className="w-10 h-10 text-slate-650" />
              )}
              <span>{useNegativeMarking ? "Enabled (-0.25)" : "Disabled (Zero Penalty)"}</span>
            </button>
          </div>

          {/* Available Tests list */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {availableTests.map((test) => (
              <div key={test.id} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 flex flex-col justify-between hover:border-slate-700 transition-all">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-2.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/25 text-amber-400 font-mono font-bold uppercase">
                      {test.questions.length} Questions
                    </span>
                    <span className="text-slate-450 font-semibold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {test.timeLimit} mins
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white font-serif-title leading-snug">{test.title}</h3>
                  <p className="text-xs text-slate-400">Includes core syllabus questions mapping, structural analysis, and code justifications.</p>
                </div>
                <button
                  onClick={() => handleStartTest(test)}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs shadow-md shadow-amber-500/10 btn-mobile-touch mt-2"
                >
                  Launch Mock Test
                </button>
              </div>
            ))}

            {availableTests.length === 0 && (
              <div className="col-span-2 text-center py-12 rounded-3xl bg-slate-900/40 border border-slate-850 text-slate-500 italic text-xs">
                No mock tests configured for your selected University and Semester yet. Select another university above or check back later!
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. RUNNING EXAM WORKSPACE */}
      {testState === 'running' && activeTest && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main workspace */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Header info bar */}
            <div className="flex items-center justify-between p-5 rounded-2xl bg-slate-900 border border-slate-800 gap-4 flex-wrap">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">Exam in Session</span>
                <h3 className="text-sm font-bold text-white">{activeTest.title}</h3>
              </div>
              <div className="px-4 py-2 bg-slate-950 border border-slate-850 rounded-xl font-mono text-sm text-amber-400 font-bold flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
                <span>Timer: {formatTime(timeLeft)}</span>
              </div>
            </div>

            {/* Question card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-850 text-slate-400 font-mono">
                  Question {currentIdx + 1} of {activeTest.questions.length}
                </span>
                <button
                  onClick={toggleFlag}
                  className={`px-3 py-1 rounded-lg border font-semibold btn-mobile-touch ${
                    flaggedQuestions[currentIdx]
                      ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                      : 'bg-slate-950 border-slate-850 text-slate-400'
                  }`}
                >
                  {flaggedQuestions[currentIdx] ? "★ Flagged for Review" : "☆ Flag for Review"}
                </button>
              </div>

              <h2 className="text-base sm:text-lg font-bold text-white leading-relaxed">
                {activeTest.questions[currentIdx].question}
              </h2>

              {/* Options list */}
              <div className="space-y-3">
                {activeTest.questions[currentIdx].options.map((opt, oIdx) => {
                  const isSelected = selectedAnswers[currentIdx] === oIdx;
                  return (
                    <button
                      key={oIdx}
                      onClick={() => handleSelectOption(oIdx)}
                      className={`w-full text-left p-3.5 sm:p-4 rounded-xl border text-xs sm:text-sm transition-all flex items-start gap-3 btn-mobile-touch ${
                        isSelected 
                          ? 'bg-amber-500/10 border-amber-500 text-amber-300 font-bold' 
                          : 'bg-slate-950 border-slate-850 text-slate-350 hover:border-slate-700'
                      }`}
                    >
                      <span className="w-6 h-6 rounded bg-slate-900 border border-slate-750 flex items-center justify-center font-mono text-[10px] text-slate-450 shrink-0 font-bold">
                        {String.fromCharCode(65 + oIdx)}
                      </span>
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Navigation Actions */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => { if (currentIdx > 0) setCurrentIdx(prev => prev - 1); }}
                  disabled={currentIdx === 0}
                  className="px-4 py-2 bg-slate-950 border border-slate-850 hover:bg-slate-900 disabled:opacity-40 rounded-xl text-xs font-bold text-slate-400 btn-mobile-touch"
                >
                  Previous
                </button>

                {currentIdx + 1 < activeTest.questions.length ? (
                  <button
                    onClick={() => setCurrentIdx(prev => prev + 1)}
                    className="px-5 py-2.5 bg-slate-950 border border-slate-850 hover:bg-slate-900 rounded-xl text-xs font-bold text-white btn-mobile-touch flex items-center gap-1"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmitTest}
                    className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-xl text-xs font-black shadow-lg shadow-emerald-500/25 btn-mobile-touch animate-bounce"
                  >
                    Submit Mock Exam
                  </button>
                )}
              </div>
            </div>

          </div>

          {/* Right Grid: Question Status Grid Nav Panel */}
          <div className="lg:col-span-1 p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">Exam Matrix</span>
            <div className="grid grid-cols-4 gap-2">
              {activeTest.questions.map((_, qIdx) => {
                const isAnswered = selectedAnswers[qIdx] !== undefined;
                const isFlagged = flaggedQuestions[qIdx];
                const isCurrent = currentIdx === qIdx;
                
                let tileStyle = "bg-slate-950 border-slate-850 text-slate-500";
                if (isAnswered) tileStyle = "bg-emerald-500/20 border-emerald-500/40 text-emerald-400";
                if (isFlagged) tileStyle = "bg-amber-500/20 border-amber-500/40 text-amber-400";
                if (isCurrent) tileStyle = "border-2 border-white text-white font-black";

                return (
                  <button
                    key={qIdx}
                    onClick={() => setCurrentIdx(qIdx)}
                    className={`h-10 rounded-xl text-xs font-mono font-bold flex items-center justify-center border transition-all ${tileStyle}`}
                  >
                    {qIdx + 1}
                  </button>
                );
              })}
            </div>
            
            <div className="pt-3 border-t border-slate-800 space-y-2 text-[10px] text-slate-400 font-mono">
              <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded bg-emerald-500/20 border border-emerald-500/40" /><span>Answered</span></div>
              <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded bg-amber-500/20 border border-amber-500/40" /><span>Flagged for Review</span></div>
              <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded bg-slate-950 border border-slate-850" /><span>Unanswered</span></div>
            </div>
          </div>
        </div>
      )}

      {/* 3. TEST RESULT REVIEW PANEL */}
      {testState === 'review' && activeTest && (
        <div className="space-y-8">
          {/* Top Banner Stats */}
          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-6 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center shadow-inner">
              <Award className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-bold font-serif-title text-white">Mock Test Concluded</h2>
              <p className="text-xs text-slate-450 leading-relaxed max-w-md mx-auto">
                Evaluation sheet compiled based on the active curriculum rules. Dynamic points have been added to your profile.
              </p>
            </div>

            {/* Grid stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
              
              <div className="p-4 bg-slate-950 border border-slate-850 rounded-2xl">
                <p className="text-2xl font-black text-white font-mono">{correctCount}</p>
                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider font-mono mt-0.5">Correct</p>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-850 rounded-2xl">
                <p className="text-2xl font-black text-red-400 font-mono">{incorrectCount}</p>
                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider font-mono mt-0.5">Wrong</p>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-850 rounded-2xl">
                <p className="text-2xl font-black text-amber-400 font-mono">-{penaltyCount}</p>
                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider font-mono mt-0.5">Penalty</p>
              </div>

              <div className="p-4 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl">
                <p className="text-2xl font-black text-emerald-400 font-mono">{finalScore} / {activeTest.questions.length}</p>
                <p className="text-[10px] uppercase font-bold text-emerald-500 tracking-wider font-mono mt-0.5">Final Score</p>
              </div>

            </div>

            <div className="text-xs text-amber-400 font-bold flex items-center justify-center gap-1.5 font-mono">
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>Earned +{Math.round(finalScore * 25)} XP Points and +{Math.round(finalScore * 5)} Coins!</span>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setTestState('idle')}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-750 text-white rounded-xl text-xs font-bold btn-mobile-touch flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Return to Hub</span>
              </button>
              
              <Link
                href="/dashboard"
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-black shadow-lg shadow-amber-500/15"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>

          {/* Question Review List */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white font-serif-title">Detailed Question-by-Question Review</h3>
            <div className="space-y-4">
              {activeTest.questions.map((q, idx) => {
                const isSelected = selectedAnswers[idx] !== undefined;
                const userAns = selectedAnswers[idx];
                const isCorrect = userAns === q.correctIndex;

                return (
                  <div key={idx} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between text-xs flex-wrap gap-2">
                      <span className="font-mono text-slate-450 font-bold">Question {idx + 1}</span>
                      <span className={`px-2.5 py-0.5 rounded font-mono text-[9px] uppercase tracking-wider font-bold ${
                        isCorrect 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : userAns === undefined
                            ? 'bg-slate-950 text-slate-500 border border-slate-800'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {isCorrect ? "Correct" : userAns === undefined ? "Skipped" : "Incorrect"}
                      </span>
                    </div>

                    <h4 className="text-sm sm:text-base font-bold text-white leading-relaxed">{q.question}</h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {q.options.map((opt, oIdx) => {
                        let cellStyle = "bg-slate-950/60 border border-slate-850 text-slate-400";
                        if (oIdx === q.correctIndex) {
                          cellStyle = "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold";
                        } else if (userAns === oIdx) {
                          cellStyle = "bg-red-500/10 border border-red-500/30 text-red-300";
                        }
                        
                        return (
                          <div key={oIdx} className={`p-3 rounded-xl flex items-center gap-2 ${cellStyle}`}>
                            <span className="w-5 h-5 rounded bg-slate-900 border border-slate-850 flex items-center justify-center font-mono text-[9px] shrink-0 font-bold text-slate-450">
                              {String.fromCharCode(65 + oIdx)}
                            </span>
                            <span>{opt}</span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="p-3.5 bg-slate-950 border border-slate-850 rounded-xl space-y-1">
                      <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider font-mono">Statutory Reason</p>
                      <p className="text-xs text-slate-350 leading-normal">{q.explanation}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
