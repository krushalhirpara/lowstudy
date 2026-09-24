"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  ArrowLeft, 
  RotateCcw, 
  HelpCircle, 
  BookOpen, 
  Scale, 
  FileText, 
  Award, 
  ExternalLink,
  ChevronRight,
  Flame,
  Clock,
  Layers,
  Check
} from 'lucide-react';

export default function RevisionSessionPage() {
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionCategory, setSessionCategory] = useState('NEED_REVISION');
  const [sessionCount, setSessionCount] = useState(10);
  
  // MCQ state for MCQ cards
  const [mcqSelectedKey, setMcqSelectedKey] = useState(null);
  const [mcqChecked, setMcqChecked] = useState(false);

  // Review submission state
  const [submitting, setSubmitting] = useState(false);
  const [reviewResults, setReviewResults] = useState({}); // cardIndex => { isCorrect, newStatus, correctReviewCount }
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    startNewSession(sessionCategory, sessionCount);
  }, []);

  const startNewSession = async (category = 'NEED_REVISION', count = 10) => {
    try {
      setLoading(true);
      setIsCompleted(false);
      setCurrentIndex(0);
      setReviewResults({});
      setMcqSelectedKey(null);
      setMcqChecked(false);

      const params = new URLSearchParams({
        category,
        count: count.toString()
      });

      const res = await fetch(`/api/revision/session?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setSessionData(json.data);
      }
    } catch (err) {
      console.error('Error starting revision session:', err);
    } finally {
      setLoading(false);
    }
  };

  const currentCard = sessionData?.cards?.[currentIndex];

  const handleMCQOptionSelect = (key) => {
    if (mcqChecked) return;
    setMcqSelectedKey(key);
  };

  const handleMCQCheck = () => {
    if (!mcqSelectedKey || !currentCard) return;
    const isCorrect = mcqSelectedKey === currentCard.correctKey;
    setMcqChecked(true);
    handleReviewSubmit(isCorrect);
  };

  const handleReviewSubmit = async (isCorrect) => {
    if (!currentCard || submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/revision/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          revisionItemId: currentCard.revisionItemId,
          isCorrect
        })
      });
      const result = await res.json();
      if (result.success) {
        setReviewResults(prev => ({
          ...prev,
          [currentIndex]: {
            isCorrect,
            newStatus: result.newStatus,
            correctReviewCount: result.correctReviewCount,
            isMastered: result.isMastered
          }
        }));
      }
    } catch (err) {
      console.error('Error submitting review:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextCard = () => {
    if (currentIndex + 1 < (sessionData?.cards?.length || 0)) {
      setCurrentIndex(prev => prev + 1);
      setMcqSelectedKey(null);
      setMcqChecked(false);
    } else {
      setIsCompleted(true);
    }
  };

  const handlePrevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setMcqSelectedKey(null);
      setMcqChecked(false);
    }
  };

  const reviewedResult = reviewResults[currentIndex];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20 font-poppins selection:bg-amber-500/20 selection:text-amber-300">
      
      {/* Top Header */}
      <div className="border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-md sticky top-14 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/revision"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="text-xs text-slate-400 font-semibold flex items-center gap-2">
                <span>Multi-Asset Revision Session</span>
                <span>•</span>
                <span className="text-amber-400 font-bold">{sessionCategory.replace('_', ' ')}</span>
              </div>
              <h1 className="text-lg font-black text-white">Active Spaced Review</h1>
            </div>
          </div>

          {/* Progress Indicator */}
          {sessionData?.cards?.length > 0 && !isCompleted && (
            <div className="text-right">
              <span className="text-xs font-bold text-slate-400">
                Card <strong className="text-amber-400">{currentIndex + 1}</strong> of {sessionData.cards.length}
              </span>
              <div className="w-32 sm:w-48 h-2 bg-slate-800 rounded-full overflow-hidden mt-1.5">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / sessionData.cards.length) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        
        {loading ? (
          <div className="py-24 text-center space-y-4">
            <div className="w-12 h-12 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-semibold text-slate-400">Assembling multi-asset revision bundle...</p>
          </div>
        ) : isCompleted ? (
          /* Session Completion Screen */
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-500 to-emerald-500 p-0.5 mx-auto shadow-xl">
              <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-white">Session Completed!</h2>
              <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
                Your spaced repetition intervals and mastery counts have been updated according to evidence-based progression rules.
              </p>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-lg mx-auto pt-2">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div className="text-2xl font-black text-white">{sessionData?.cards?.length || 0}</div>
                <div className="text-xs text-slate-400 mt-0.5">Cards Reviewed</div>
              </div>
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div className="text-2xl font-black text-emerald-400">
                  {Object.values(reviewResults).filter(r => r.isCorrect).length}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">Retained Correctly</div>
              </div>
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 col-span-2 sm:col-span-1">
                <div className="text-2xl font-black text-amber-400">
                  {Object.values(reviewResults).filter(r => r.isMastered).length}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">New Masteries</div>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-3 pt-4">
              <button
                onClick={() => startNewSession('NEED_REVISION', sessionCount)}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                Start Another Session
              </button>
              <Link
                href="/revision"
                className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm transition-all"
              >
                Back to Revision Hub
              </Link>
            </div>
          </div>
        ) : !currentCard ? (
          /* Empty Cards State */
          <div className="py-20 text-center bg-slate-900/40 border border-slate-800 rounded-3xl p-8 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">No items pending in this queue</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              All items in {sessionCategory.replace('_', ' ')} have been addressed, or no items meet this filter yet.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  setSessionCategory('ALL');
                  startNewSession('ALL', 10);
                }}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl"
              >
                Practice All Available Items
              </button>
            </div>
          </div>
        ) : (
          /* Active Card Review Display */
          <div className="space-y-6">
            
            {/* Card Frame */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
              
              {/* Card Meta & Badges */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${currentCard.badgeColor}`}>
                    {currentCard.badge}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">
                    {currentCard.subjectCode}
                  </span>
                </div>

                {/* Progression Info */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Mastery Streak:</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3].map(step => (
                      <div
                        key={step}
                        className={`w-2.5 h-2.5 rounded-full ${
                          (reviewedResult ? reviewedResult.correctReviewCount : currentCard.correctReviewCount) >= step
                            ? 'bg-emerald-400'
                            : 'bg-slate-800 border border-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[11px] font-bold text-slate-400 ml-1">
                    ({(reviewedResult ? reviewedResult.correctReviewCount : currentCard.correctReviewCount)}/3)
                  </span>
                </div>
              </div>

              {/* CARD BODY ACCORDING TO ENTITY TYPE */}

              {/* 1. QUICK NOTE */}
              {currentCard.entityType === 'NOTE' && (
                <div className="space-y-5">
                  <div>
                    <div className="text-xs font-semibold text-amber-400">{currentCard.unitInfo}</div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">{currentCard.title}</h2>
                  </div>

                  {currentCard.keyPoints && currentCard.keyPoints.length > 0 && (
                    <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80 space-y-2">
                      <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Key Legal Points
                      </span>
                      <ul className="space-y-1.5 text-xs sm:text-sm text-slate-300">
                        {currentCard.keyPoints.map((kp, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-amber-400 font-bold">•</span>
                            <span>{kp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-800/50 text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {currentCard.content}
                  </div>
                </div>
              )}

              {/* 2. QUESTION */}
              {currentCard.entityType === 'QUESTION' && (
                <div className="space-y-5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-sky-400 px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/20">
                      {currentCard.marks} Marks
                    </span>
                    <span className="text-xs text-slate-400 font-medium">{currentCard.priority}</span>
                  </div>

                  <h2 className="text-lg sm:text-xl font-bold text-white leading-snug">
                    {currentCard.title}
                  </h2>

                  <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80 space-y-2">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5" />
                      Evidence-Based Importance
                    </span>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {currentCard.whyImportant}
                    </p>
                  </div>

                  <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-800/50 text-xs text-slate-400">
                    <strong className="text-slate-200 block mb-1">Standard Exam Answer Structure:</strong>
                    Introduction → Definition → Relevant Legal Provisions → Essential Elements → Detailed Explanation → Landmark Case Laws → Example → Conclusion.
                  </div>
                </div>
              )}

              {/* 3. INTERACTIVE MCQ */}
              {currentCard.entityType === 'MCQ' && (
                <div className="space-y-5">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Topic: {currentCard.topicTitle || 'General Law'}
                    </span>
                    <h2 className="text-lg sm:text-xl font-bold text-white mt-1 leading-snug">
                      {currentCard.title}
                    </h2>
                  </div>

                  {/* Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentCard.options?.map((opt) => {
                      const isSelected = mcqSelectedKey === opt.key;
                      const isCorrectOpt = opt.key === currentCard.correctKey;
                      
                      let optionStyles = 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300';
                      if (mcqChecked) {
                        if (isCorrectOpt) {
                          optionStyles = 'bg-emerald-500/20 border-emerald-500 text-white ring-1 ring-emerald-500/40';
                        } else if (isSelected && !isCorrectOpt) {
                          optionStyles = 'bg-rose-500/20 border-rose-500 text-white ring-1 ring-rose-500/40';
                        }
                      } else if (isSelected) {
                        optionStyles = 'bg-amber-500/20 border-amber-500 text-white ring-1 ring-amber-500/40';
                      }

                      return (
                        <button
                          key={opt.key}
                          onClick={() => handleMCQOptionSelect(opt.key)}
                          disabled={mcqChecked}
                          className={`p-3.5 rounded-2xl border text-left text-xs font-semibold flex items-start gap-3 transition-all ${optionStyles}`}
                        >
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                            isSelected ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {opt.key}
                          </span>
                          <span className="leading-snug">{opt.text}</span>
                        </button>
                      );
                    })}
                  </div>

                  {!mcqChecked ? (
                    <div className="flex justify-end">
                      <button
                        onClick={handleMCQCheck}
                        disabled={!mcqSelectedKey || submitting}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 disabled:opacity-50 transition-all flex items-center gap-2"
                      >
                        {submitting ? 'Verifying...' : 'Check Answer'}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1.5">
                      <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5" />
                        Explanation
                      </span>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        {currentCard.explanation}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* 4. STATUTORY SECTION */}
              {currentCard.entityType === 'LEGAL_SECTION' && (
                <div className="space-y-5">
                  <div>
                    <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Bare Act Provision</span>
                    <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                      {currentCard.title}
                    </h2>
                    <p className="text-sm font-semibold text-slate-300 mt-1">{currentCard.sectionHeading}</p>
                  </div>

                  <div className="bg-slate-950/70 p-5 rounded-2xl border border-slate-800/80 text-xs sm:text-sm text-slate-300 leading-relaxed font-mono whitespace-pre-wrap">
                    {currentCard.content}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    {currentCard.punishment && (
                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                        <span className="text-slate-500 font-bold block mb-1">Punishment</span>
                        <span className="text-amber-400 font-semibold">{currentCard.punishment}</span>
                      </div>
                    )}
                    {currentCard.bailableStatus && (
                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                        <span className="text-slate-500 font-bold block mb-1">Bailability</span>
                        <span className="text-slate-200 font-semibold">{currentCard.bailableStatus}</span>
                      </div>
                    )}
                    {currentCard.cognizableStatus && (
                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                        <span className="text-slate-500 font-bold block mb-1">Cognizability</span>
                        <span className="text-slate-200 font-semibold">{currentCard.cognizableStatus}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 5. CASE LAW */}
              {currentCard.entityType === 'CASE_LAW' && (
                <div className="space-y-5">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                      <span>{currentCard.court}</span>
                      <span>•</span>
                      <span>{currentCard.citation}</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                      {currentCard.title}
                    </h2>
                  </div>

                  <div className="bg-slate-950/70 p-5 rounded-2xl border border-indigo-500/20 space-y-2">
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5" />
                      Key Principle & Ratio Decidendi
                    </span>
                    <p className="text-sm text-slate-200 leading-relaxed font-semibold">
                      {currentCard.keyPrinciple}
                    </p>
                    {currentCard.ratioDecidendi && (
                      <p className="text-xs text-slate-400 leading-relaxed pt-1">
                        {currentCard.ratioDecidendi}
                      </p>
                    )}
                  </div>

                  {currentCard.facts && (
                    <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-800/50 text-xs text-slate-300 leading-relaxed">
                      <strong className="text-slate-200 block mb-1">Facts of the Case:</strong>
                      {currentCard.facts}
                    </div>
                  )}
                </div>
              )}

              {/* Instant Progression Banner when reviewed */}
              {reviewedResult && (
                <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 animate-in fade-in-50 duration-200 ${
                  reviewedResult.isCorrect
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-200'
                }`}>
                  <div className="flex items-center gap-3">
                    {reviewedResult.isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                    )}
                    <div>
                      <div className="font-bold text-xs sm:text-sm">
                        {reviewedResult.isMastered 
                          ? '🎉 Mastery Achieved! (3/3 consecutive correct reviews)'
                          : reviewedResult.isCorrect
                          ? 'Retained! Advanced to Review Again.'
                          : 'Marked for Urgent Revision (Streak reset to 0)'}
                      </div>
                      <div className="text-[11px] opacity-80 mt-0.5">
                        Status: <strong className="uppercase">{reviewedResult.newStatus.replace('_', ' ')}</strong>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleNextCard}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1 shrink-0"
                  >
                    Next Card
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

            </div>

            {/* Bottom Evaluation Controls (For Non-MCQ Cards) */}
            {currentCard.entityType !== 'MCQ' && (
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <button
                  onClick={handlePrevCard}
                  disabled={currentIndex === 0}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-30 text-xs font-semibold flex items-center gap-2 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Previous Card
                </button>

                {/* Self Evaluation Buttons */}
                {!reviewedResult ? (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleReviewSubmit(false)}
                      disabled={submitting}
                      className="px-5 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold flex items-center gap-2 transition-all"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Need Review (Forgot)
                    </button>
                    <button
                      onClick={() => handleReviewSubmit(true)}
                      disabled={submitting}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center gap-2 transition-all"
                    >
                      <Check className="w-4 h-4" />
                      Retained (Got Right)
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleNextCard}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 flex items-center gap-2 transition-all ml-auto"
                  >
                    Continue to Next
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}

            {/* MCQ Next button if already checked */}
            {currentCard.entityType === 'MCQ' && reviewedResult && (
              <div className="flex justify-between items-center pt-2">
                <button
                  onClick={handlePrevCard}
                  disabled={currentIndex === 0}
                  className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-30 text-xs font-semibold flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Previous Card
                </button>
                <button
                  onClick={handleNextCard}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 flex items-center gap-2"
                >
                  Continue to Next
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
