"use client";

import { useState, useEffect } from 'react';
import { 
  Building2, 
  GraduationCap, 
  BookOpen, 
  Calendar, 
  Sparkles, 
  CheckCircle2, 
  X, 
  Search, 
  ShieldCheck, 
  ChevronRight,
  MapPin,
  ExternalLink
} from 'lucide-react';
import { MockDB } from '@/data/db';
import { GUJARAT_STATES } from '@/data/gujaratData';

export default function SyllabusSelectorModal({ isOpen, onClose, onSelectComplete }) {
  const [universities, setUniversities] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [semesters, setSemesters] = useState([]);

  // Selections
  const [selectedState, setSelectedState] = useState('gujarat');
  const [selectedUniId, setSelectedUniId] = useState('gu');
  const [selectedCollegeId, setSelectedCollegeId] = useState('col-la-shah');
  const [selectedProgramId, setSelectedProgramId] = useState('llb-3yr');
  const [selectedYear, setSelectedYear] = useState('2026-27');
  const [selectedSemId, setSelectedSemId] = useState('sem1');
  const [syllabusVersion, setSyllabusVersion] = useState('new');

  const [step, setStep] = useState(1); // 1: Uni & College, 2: Program & Year, 3: Semester & Version

  useEffect(() => {
    if (typeof window === "undefined") return;
    MockDB.init();
    const unis = MockDB.getUniversities();
    const progs = MockDB.getPrograms();
    const years = MockDB.getAcademicYears();
    const sems = MockDB.getSemesters();

    setUniversities(unis);
    setPrograms(progs);
    setAcademicYears(years);
    setSemesters(sems);

    const curUni = MockDB.getSelectedUni();
    const curCollege = MockDB.getSelectedCollege();
    const curSem = MockDB.getSelectedSem();

    if (curUni) setSelectedUniId(curUni.id);
    if (curCollege) setSelectedCollegeId(curCollege.id);
    if (curSem) setSelectedSemId(curSem.id);

    const cols = MockDB.getCollegesByUniversity(curUni ? curUni.id : 'gu');
    setColleges(cols);
  }, [isOpen]);

  const handleUniversityChange = (uniId) => {
    setSelectedUniId(uniId);
    const cols = MockDB.getCollegesByUniversity(uniId);
    setColleges(cols);
    if (cols.length > 0) {
      setSelectedCollegeId(cols[0].id);
    } else {
      setSelectedCollegeId('all');
    }
  };

  const handleSave = () => {
    MockDB.setSelectedSyllabusFull({
      uniId: selectedUniId,
      collegeId: selectedCollegeId,
      programId: selectedProgramId,
      year: selectedYear,
      semId: selectedSemId,
      version: syllabusVersion
    });

    if (onSelectComplete) {
      onSelectComplete({
        uniId: selectedUniId,
        collegeId: selectedCollegeId,
        programId: selectedProgramId,
        year: selectedYear,
        semId: selectedSemId,
        version: syllabusVersion
      });
    }

    if (onClose) onClose();
  };

  if (!isOpen) return null;

  const currentUniObj = universities.find(u => u.id === selectedUniId);
  const currentCollegeObj = colleges.find(c => c.id === selectedCollegeId);
  const currentProgramObj = programs.find(p => p.id === selectedProgramId);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl space-y-0 my-8">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[11px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Gujarat Law Syllabus Explorer</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-serif-title text-white">Find Your Official Law Syllabus</h2>
            <p className="text-xs text-slate-300">Select your University, College, and Semester to access verified curriculum notes & MCQs.</p>
          </div>

          <button 
            onClick={onClose} 
            className="p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto scrollbar-thin">
          
          {/* Step 1: State, University & College Selection */}
          <div className="space-y-4">
            
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Building2 className="w-4 h-4" /> 1. Select Gujarat Institution
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                State: Gujarat (Default)
              </span>
            </div>

            {/* University Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {universities.map(u => {
                const isSelected = selectedUniId === u.id;
                return (
                  <button
                    key={u.id}
                    onClick={() => handleUniversityChange(u.id)}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-2 btn-mobile-touch ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500 text-amber-300 font-bold shadow-md shadow-amber-500/10'
                        : 'bg-slate-950 border-slate-850 text-slate-400 hover:border-slate-750 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xl">{u.logo}</span>
                      <span className="text-[9px] font-mono font-bold text-slate-500 uppercase">{u.code}</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white leading-tight">{u.name}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{u.city}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Affiliated College Selector */}
            {colleges.length > 0 && (
              <div className="space-y-2 pt-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 font-mono">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" /> Select Affiliated Law College
                </label>
                <select
                  value={selectedCollegeId}
                  onChange={(e) => setSelectedCollegeId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-xs font-semibold text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="all">All Colleges affiliated with {currentUniObj?.name}</option>
                  {colleges.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.city}) — {c.type}
                    </option>
                  ))}
                </select>
              </div>
            )}

          </div>

          <hr className="border-slate-800" />

          {/* Step 2: Program & Academic Year */}
          <div className="space-y-4">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4" /> 2. Academic Program & Year
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Program Selector */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 font-mono">Degree Program</label>
                <select
                  value={selectedProgramId}
                  onChange={(e) => setSelectedProgramId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-xs font-semibold text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  {programs.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {/* Academic Year */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 font-mono">Academic Year</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-xs font-semibold text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  {academicYears.map(y => (
                    <option key={y.id} value={y.id}>{y.name}</option>
                  ))}
                </select>
              </div>

            </div>
          </div>

          <hr className="border-slate-800" />

          {/* Step 3: Semester & Version */}
          <div className="space-y-4">
            <span className="text-xs font-bold text-purple-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" /> 3. Semester & Criminal Code Version
            </span>

            {/* Semester Buttons */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 font-mono">Target Semester</label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {semesters.map(s => {
                  const isSelected = selectedSemId === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setSelectedSemId(s.id)}
                      className={`p-2.5 rounded-xl border text-center text-xs font-semibold transition-all btn-mobile-touch ${
                        isSelected
                          ? 'bg-purple-500/20 border-purple-500 text-purple-300 font-bold'
                          : 'bg-slate-950 border-slate-850 text-slate-400 hover:border-slate-750 hover:text-white'
                      }`}
                    >
                      Sem {s.num}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Syllabus Version Toggle */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-semibold text-slate-300 font-mono">Applicable Criminal Laws Version</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSyllabusVersion('new')}
                  className={`p-3 rounded-xl border text-left text-xs transition-all ${
                    syllabusVersion === 'new'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                      : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-white'
                  }`}
                >
                  <p className="font-bold text-white">New Criminal Laws (2023)</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">BNS, BNSS, BSA Applicable</p>
                </button>

                <button
                  type="button"
                  onClick={() => setSyllabusVersion('old')}
                  className={`p-3 rounded-xl border text-left text-xs transition-all ${
                    syllabusVersion === 'old'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                      : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-white'
                  }`}
                >
                  <p className="font-bold text-white">Old Penal Code (IPC 1860)</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">IPC, CrPC, IEA Legacy</p>
                </button>
              </div>
            </div>

          </div>

          {/* Verification Banner */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-white">Verified Official Source Mappings</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Selected syllabus is verified directly from <span className="text-amber-400 font-semibold">{currentUniObj?.name}</span> official academic notifications.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-5 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-bold transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
          >
            <span>View Verified Syllabus</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
