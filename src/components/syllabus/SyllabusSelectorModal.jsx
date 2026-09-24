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

  const handleProgramChange = (progId) => {
    setSelectedProgramId(progId);
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
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl space-y-0 my-8">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-amber-50/70 via-white to-amber-50/40 border-b border-slate-200 flex items-center justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 text-[11px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Gujarat Law Syllabus Explorer</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-serif-title text-slate-900">Find Your Official Law Syllabus</h2>
            <p className="text-xs text-slate-600">Select your University, College, and Semester to access verified curriculum notes & MCQs.</p>
          </div>

          <button 
            onClick={onClose} 
            className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto scrollbar-thin">
          
          {/* Step 1: State, University & College Selection */}
          <div className="space-y-4">
            
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Building2 className="w-4 h-4" /> 1. Select Gujarat Institution
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
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
                        ? 'bg-amber-50 border-amber-500 text-amber-900 font-bold shadow-md shadow-amber-500/10'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-amber-300 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xl">{u.logo}</span>
                      <span className="text-[9px] font-mono font-bold text-slate-500 uppercase">{u.code}</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{u.name}</p>
                      <p className="text-[10px] text-slate-500 capitalize">{u.city || u.location}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Affiliated Law College Dropdown */}
            {colleges.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-semibold text-slate-700 flex items-center gap-1.5 font-mono">
                    <GraduationCap className="w-4 h-4 text-emerald-600" /> Affiliated Law College (Optional):
                  </label>
                  <span className="text-[10px] text-slate-500 font-mono">{colleges.length} Colleges Available</span>
                </div>
                <select
                  value={selectedCollegeId}
                  onChange={(e) => setSelectedCollegeId(e.target.value)}
                  className="w-full bg-white border border-slate-200 p-3 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-500"
                >
                  <option value="">-- Direct University Department / Main Campus --</option>
                  {colleges.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code}) - {c.city}
                    </option>
                  ))}
                </select>
              </div>
            )}

          </div>

          {/* Step 2: Law Program & Semester */}
          <div className="space-y-4 pt-2 border-t border-slate-200">
            
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" /> 2. Degree Program & Semester
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Program Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 font-mono">Law Degree Program</label>
                <select
                  value={selectedProgramId}
                  onChange={(e) => handleProgramChange(e.target.value)}
                  className="w-full bg-white border border-slate-200 p-3 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-500"
                >
                  {programs.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {/* Academic Year Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 font-mono">Academic Year</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full bg-white border border-slate-200 p-3 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-500"
                >
                  <option value="2026-27">Academic Year 2026-27 (Current Active)</option>
                  <option value="2025-26">Academic Year 2025-26</option>
                  <option value="2024-25">Academic Year 2024-25 (Legacy Batch)</option>
                </select>
              </div>
            </div>

            {/* Semester Pill Selectors */}
            <div className="space-y-2 pt-1">
              <label className="text-xs font-semibold text-slate-700 font-mono">Select Semester</label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {semesters.map(s => {
                  const isSelected = selectedSemId === s.id;
                  return (
                    <button
                      type="button"
                      key={s.id}
                      onClick={() => setSelectedSemId(s.id)}
                      className={`p-2.5 rounded-xl border text-center text-xs font-semibold transition-all btn-mobile-touch ${
                        isSelected
                          ? 'bg-purple-50 border-purple-500 text-purple-900 font-bold shadow-sm'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-purple-300 hover:bg-white'
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
              <label className="text-xs font-semibold text-slate-700 font-mono">Applicable Criminal Laws Version</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSyllabusVersion('new')}
                  className={`p-3 rounded-xl border text-left text-xs transition-all ${
                    syllabusVersion === 'new'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-white'
                  }`}
                >
                  <p className="font-bold text-slate-900">New Criminal Laws (2023)</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">BNS, BNSS, BSA Applicable</p>
                </button>

                <button
                  type="button"
                  onClick={() => setSyllabusVersion('old')}
                  className={`p-3 rounded-xl border text-left text-xs transition-all ${
                    syllabusVersion === 'old'
                      ? 'bg-amber-50 border-amber-500 text-amber-900 font-bold shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-white'
                  }`}
                >
                  <p className="font-bold text-slate-900">Old Penal Code (IPC 1860)</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">IPC, CrPC, IEA Legacy</p>
                </button>
              </div>
            </div>

          </div>

          {/* Verification Banner */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-slate-900">Verified Official Source Mappings</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Selected syllabus is verified directly from <span className="text-amber-700 font-semibold">{currentUniObj?.name}</span> official academic notifications.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-5 bg-white border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors border border-slate-300"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 text-slate-950 font-bold text-xs shadow-md flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
          >
            <span>View Verified Syllabus</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
