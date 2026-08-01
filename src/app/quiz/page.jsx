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
  Check
} from 'lucide-react';
import { MOCK_QUIZZES } from '@/data/legalData';

export default function QuizPage() {
  const quiz = MOCK_QUIZZES[0];
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 mins

  const currentQ = quiz.questions[currentIdx];

  useEffect(() => {
    if (isCompleted || timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [isCompleted, timeLeft]);

  const handleOptionSelect = (optionIdx) => {
    if (isAnswered) return;
    setSelectedOption(optionIdx);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null) return;
    setIsAnswered(true);
    if (selectedOption === currentQ.correct) {
      setScore(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentIdx + 1 < quiz.questions.length) {
      setCurrentIdx(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsCompleted(true);
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setIsCompleted(false);
    setTimeLeft(600);
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Quiz Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold">
              +{quiz.xpReward} XP REWARD
            </span>
            <span className="text-xs text-slate-400">AIBE & Judiciary Prep</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-serif-title text-white">{quiz.title}</h1>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-950 border border-slate-800 text-amber-400 font-mono text-sm font-bold self-start sm:self-auto">
          <Clock className="w-4 h-4 text-amber-400" />
          <span>{formatTime(timeLeft)}</span>
        </div>
      </div>

      {!isCompleted ? (
        <div className="p-5 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-2xl">
          
          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>Question {currentIdx + 1} of {quiz.questions.length}</span>
              <span>Score: {score}</span>
            </div>
            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full rounded-full transition-all"
                style={{ width: `${((currentIdx + 1) / quiz.questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Text */}
          <div className="space-y-2">
            <h2 className="text-lg sm:text-xl font-bold text-white leading-relaxed">
              {currentQ.question}
            </h2>
          </div>

          {/* Options Grid */}
          <div className="space-y-3">
            {currentQ.options.map((opt, idx) => {
              let optStyle = "bg-slate-950 border-slate-800 text-slate-300 hover:border-amber-500/50";
              if (selectedOption === idx) {
                optStyle = "bg-amber-500/15 border-amber-500 text-amber-300 font-bold";
              }
              if (isAnswered) {
                if (idx === currentQ.correct) {
                  optStyle = "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold";
                } else if (selectedOption === idx) {
                  optStyle = "bg-red-500/20 border-red-500 text-red-300";
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleOptionSelect(idx)}
                  className={`w-full text-left p-3.5 sm:p-4 rounded-2xl border text-xs sm:text-sm transition-all flex items-start justify-between gap-3 btn-mobile-touch ${optStyle}`}
                >
                  <span className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center font-mono text-xs text-slate-400 shrink-0 mt-0.5 font-bold">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="leading-relaxed">{opt}</span>
                  </span>

                  {isAnswered && idx === currentQ.correct && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  )}
                  {isAnswered && selectedOption === idx && idx !== currentQ.correct && (
                    <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation Box */}
          {isAnswered && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 animate-fade-in">
              <p className="text-xs font-bold text-amber-400 flex items-center gap-1.5 font-serif-title">
                <HelpCircle className="w-4 h-4" /> Legal Statutory Explanation:
              </p>
              <p className="text-xs text-slate-300 leading-relaxed">
                {currentQ.explanation}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            {!isAnswered ? (
              <button 
                onClick={handleSubmitAnswer}
                disabled={selectedOption === null}
                className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20"
              >
                Submit Answer
              </button>
            ) : (
              <button 
                onClick={handleNextQuestion}
                className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20"
              >
                <span>{currentIdx + 1 < quiz.questions.length ? 'Next Question' : 'View Final Score'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>
      ) : (
        /* Summary Screen */
        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center">
            <Award className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-bold font-serif-title text-white">Quiz Completed!</h2>
            <p className="text-xs text-slate-400">Great effort on constitutional law & BNS 2023 practice.</p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 max-w-sm mx-auto space-y-2">
            <p className="text-3xl font-bold text-emerald-400 font-mono">{score} / {quiz.questions.length}</p>
            <p className="text-xs text-slate-300">Total Score ({Math.round((score / quiz.questions.length) * 100)}%)</p>
            <p className="text-xs text-amber-400 font-bold pt-2 flex items-center justify-center gap-1">
              <Sparkles className="w-4 h-4" /> +{score * 25} XP Earned!
            </p>
          </div>

          <div className="flex items-center justify-center gap-4 pt-2">
            <button 
              onClick={handleRestart}
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-white font-bold text-xs flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Retake Quiz
            </button>

            <Link 
              href="/dashboard"
              className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-lg"
            >
              Return to Dashboard
            </Link>
          </div>
        </div>
      )}

    </div>
  );
}
