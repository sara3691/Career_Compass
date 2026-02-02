
import React, { useState, useEffect, useMemo } from 'react';
import { CareerRecommendation, UserData, CareerDetails } from '../../types';
import { getCareerDetails } from '../../services/geminiService';
import { COURSES_DATA } from '../../constants';
import { XMark } from '../icons/XMark';
import { AlertTriangle } from '../icons/AlertTriangle';
import { AcademicCap } from '../icons/AcademicCap';
import { BuildingLibrary } from '../icons/BuildingLibrary';
import { CurrencyDollar } from '../icons/CurrencyDollar';
import { MapPin } from '../icons/MapPin';
import { RocketLaunch } from '../icons/RocketLaunch';
import { ClipboardDocumentList } from '../icons/ClipboardDocumentList';
import { InformationCircle } from '../icons/InformationCircle';

interface CareerDetailsModalProps {
  career: CareerRecommendation;
  userData: UserData;
  onClose: () => void;
}

const LoadingSkeleton: React.FC = () => (
    <div className="animate-pulse space-y-4">
        <div className="h-4 bg-slate-200 rounded w-3/4"></div>
        <div className="h-4 bg-slate-200 rounded w-1/2"></div>
        <div className="space-y-4 pt-6">
            <div className="h-24 bg-slate-100 rounded-xl"></div>
            <div className="h-24 bg-slate-100 rounded-xl"></div>
        </div>
    </div>
);

const DetailSection: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; badge?: string }> = ({ title, icon, children, badge }) => (
    <div className="py-6 border-b border-slate-100 last:border-0">
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                    {icon}
                </div>
                <h4 className="ml-4 text-xl font-bold text-slate-800">{title}</h4>
            </div>
            {badge && (
                <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full uppercase tracking-wider">
                    {badge}
                </span>
            )}
        </div>
        <div className="ml-1 text-slate-600 leading-relaxed">{children}</div>
    </div>
)

const CareerDetailsModal: React.FC<CareerDetailsModalProps> = ({ career, userData, onClose }) => {
  const [aiData, setAiData] = useState<CareerDetails | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(true);
  const [aiError, setAiError] = useState<string | null>(null);

  // Instant static overview check
  const courseData = useMemo(() => {
    const key = Object.keys(COURSES_DATA).find(k => 
      k.toLowerCase() === career.careerName.toLowerCase() || 
      career.careerName.toLowerCase().includes(k.toLowerCase())
    );
    return key ? COURSES_DATA[key] : null;
  }, [career.careerName]);

  useEffect(() => {
    const fetchAIData = async () => {
      try {
        setIsLoadingAI(true);
        setAiError(null);
        const fetched = await getCareerDetails(career.careerName, userData);
        setAiData(fetched);
      } catch (e: any) {
        setAiError("Detailed dynamic guidance is currently processing. Please try again.");
        console.error(e);
      } finally {
        setIsLoadingAI(false);
      }
    };
    fetchAIData();
  }, [career, userData]);

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md flex justify-center items-center z-50 p-4 animate-in fade-in duration-300" onClick={onClose}>
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
        
        <header className="px-10 py-7 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-3 mb-1">
                <span className="px-2 py-0.5 bg-indigo-600 text-white text-[10px] font-bold rounded-md uppercase tracking-widest">AI Deep Analysis</span>
                <h2 className="text-3xl font-extrabold text-slate-900 leading-tight">{career.careerName}</h2>
            </div>
          </div>
          <button onClick={onClose} className="p-3 rounded-2xl bg-slate-100 text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-all active:scale-90">
            <XMark className="w-6 h-6" />
          </button>
        </header>

        <main className="flex-grow p-10 overflow-y-auto bg-white">
          <div className="space-y-2">
            
            {/* Disclaimer Banner */}
            <div className="mb-8 p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-start">
                <InformationCircle className="w-5 h-5 text-slate-400 mr-3 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-slate-500 leading-relaxed italic">
                    Disclaimer: These recommendations are AI-generated based on typical academic patterns. Suggested institutions and scholarships are for information only and do not guarantee admission or eligibility. Students must verify details on official institutional websites.
                </p>
            </div>

            {/* Static Overview (Fast Load) */}
            {courseData && (
                <DetailSection title="Course Overview" icon={<ClipboardDocumentList className="w-6 h-6"/>} badge={courseData.duration}>
                    <p className="text-slate-700 mb-6 text-lg font-medium">{courseData.overview}</p>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl">
                            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Entrance Requirements</h5>
                            <p className="text-sm text-slate-800 font-bold">{courseData.eligibility}</p>
                        </div>
                        <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl">
                            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Professional Roles</h5>
                            <div className="flex flex-wrap gap-2">
                                {courseData.jobRoles.map(role => (
                                    <span key={role} className="text-[11px] bg-white border border-slate-200 px-3 py-1 rounded-full text-indigo-700 font-semibold shadow-sm">{role}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </DetailSection>
            )}

            {/* AI Personalization */}
            <DetailSection title="Why This Fits You" icon={<AcademicCap className="w-6 h-6"/>} badge={`${career.matchPercentage}% Alignment`}>
                {isLoadingAI ? <LoadingSkeleton /> : aiError ? (
                    <div className="bg-red-50 p-4 rounded-xl text-red-700 text-sm">{aiError}</div>
                ) : (
                    <div className="bg-indigo-50/40 p-6 rounded-3xl border border-indigo-100 italic text-slate-800 leading-relaxed text-lg shadow-inner">
                        "{aiData?.whyThisCareerSuitsYou || career.whyItMatches}"
                    </div>
                )}
            </DetailSection>

            {/* AI Suggested Colleges */}
            <DetailSection title="Popular Institutional Options" icon={<BuildingLibrary className="w-6 h-6"/>}>
                {isLoadingAI ? <LoadingSkeleton /> : (
                    <div className="grid gap-4">
                        {aiData?.suggestedColleges.map((college, idx) => (
                            <div key={idx} className="p-5 bg-white border border-slate-100 rounded-2xl hover:border-indigo-200 hover:shadow-md transition-all">
                                <div className="flex justify-between items-start mb-2">
                                    <h5 className="font-bold text-slate-900 text-lg">{college.name}</h5>
                                    <span className="text-[10px] px-2 py-1 bg-slate-100 rounded-md font-bold text-slate-500 uppercase">{college.type}</span>
                                </div>
                                <p className="text-xs text-indigo-600 font-semibold flex items-center mb-3"><MapPin className="w-3 h-3 mr-1"/>{college.location}</p>
                                <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl">{college.reasoning}</p>
                            </div>
                        ))}
                    </div>
                )}
            </DetailSection>

            {/* AI Suggested Scholarships */}
            <DetailSection title="Common Financial Aid Patterns" icon={<CurrencyDollar className="w-6 h-6"/>}>
                {isLoadingAI ? <LoadingSkeleton /> : (
                    <div className="space-y-4">
                        {aiData?.suggestedScholarships.map((s, idx) => (
                            <div key={idx} className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-white border border-green-100">
                                <div className="flex justify-between items-center mb-3">
                                    <h5 className="font-bold text-slate-900 text-lg">{s.name}</h5>
                                    <span className="text-[10px] px-2 py-0.5 bg-green-600 text-white rounded font-black">TYPICAL SCHEME</span>
                                </div>
                                <p className="text-xs text-slate-500 font-bold mb-3">Provider: {s.provider}</p>
                                <p className="text-sm text-slate-700 leading-relaxed border-l-4 border-green-200 pl-4 py-1">{s.typicalEligibility}</p>
                            </div>
                        ))}
                    </div>
                )}
            </DetailSection>

            {/* Roadmap */}
            {aiData && (
                <DetailSection title="Strategic Path Forward" icon={<RocketLaunch className="w-6 h-6"/>}>
                    <div className="relative pl-10 space-y-8 before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-1 before:bg-slate-100">
                        {aiData.careerRoadmap.map((step, index) => (
                             <div key={index} className="relative">
                                <div className="absolute -left-[32px] top-1.5 w-6 h-6 rounded-full bg-white border-4 border-indigo-600 flex items-center justify-center text-[10px] font-black text-indigo-600 z-10">
                                    {index + 1}
                                </div>
                                <p className="text-sm font-bold text-slate-800 leading-relaxed bg-slate-50 p-4 rounded-2xl hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 transition-all">{step}</p>
                            </div>
                        ))}
                    </div>
                </DetailSection>
            )}

          </div>
        </main>
        
        <footer className="p-8 bg-slate-50 border-t border-slate-100 flex justify-center">
            <button onClick={onClose} className="px-16 py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-indigo-700 shadow-xl active:scale-95 transition-all text-sm tracking-widest uppercase">
                Got it, Thank You
            </button>
        </footer>
      </div>
    </div>
  );
};

export default CareerDetailsModal;
