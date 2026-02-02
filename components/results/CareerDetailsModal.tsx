
import React, { useState, useEffect, useMemo } from 'react';
import { CareerRecommendation, UserData, CareerDetails } from '../../types';
import { getCareerDetails } from '../../services/geminiService';
import { COURSES_DATA } from '../../constants';
import { XMark } from '../icons/XMark';
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
            <div className="h-20 bg-slate-100 rounded-xl"></div>
            <div className="h-20 bg-slate-100 rounded-xl"></div>
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
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiError, setAiError] = useState<boolean>(false);

  // Fast-load static data
  const courseData = useMemo(() => {
    const key = Object.keys(COURSES_DATA).find(k => 
      k.toLowerCase() === career.careerName.toLowerCase() || 
      career.careerName.toLowerCase().includes(k.toLowerCase())
    );
    return key ? COURSES_DATA[key] : null;
  }, [career.careerName]);

  useEffect(() => {
    const fetchAIData = async () => {
      setIsLoadingAI(true);
      setAiError(false);
      try {
        const fetched = await getCareerDetails(career.careerName, userData);
        setAiData(fetched);
      } catch (e) {
        setAiError(true);
        console.warn("AI details failed. Showing static info only.");
      } finally {
        setIsLoadingAI(false);
      }
    };
    fetchAIData();
  }, [career, userData]);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-white rounded-[1.5rem] shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
        
        <header className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-black text-slate-900 leading-tight">{career.careerName}</h2>
            <p className="text-sm text-slate-500 font-medium">{courseData?.duration || 'Professional Path'}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-all">
            <XMark className="w-6 h-6" />
          </button>
        </header>

        <main className="flex-grow p-8 overflow-y-auto bg-white">
          <div className="space-y-4">
            
            {/* Overview - Static */}
            {courseData && (
                <DetailSection title="Course Overview" icon={<ClipboardDocumentList className="w-6 h-6"/>}>
                    <p className="text-slate-700 mb-6 text-base leading-relaxed">{courseData.overview}</p>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Requirements</h5>
                            <p className="text-sm text-slate-800 font-bold">{courseData.eligibility}</p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Career Roles</h5>
                            <div className="flex flex-wrap gap-1.5">
                                {courseData.jobRoles.slice(0, 3).map(role => (
                                    <span key={role} className="text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded-full text-indigo-700 font-bold">{role}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </DetailSection>
            )}

            {/* Match Analysis - AI Enhanced */}
            <DetailSection title="Suitability Analysis" icon={<AcademicCap className="w-6 h-6"/>} badge={isLoadingAI ? "Analyzing..." : `${career.matchPercentage}% Fit`}>
                {isLoadingAI ? <LoadingSkeleton /> : (
                    <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100 italic text-slate-800 text-lg">
                        "{aiData?.whyThisCareerSuitsYou || career.whyItMatches}"
                    </div>
                )}
            </DetailSection>

            {/* Institutional Options */}
            {(aiData || isLoadingAI) && (
              <DetailSection title="Top Institutions" icon={<BuildingLibrary className="w-6 h-6"/>}>
                  {isLoadingAI ? <LoadingSkeleton /> : (
                      <div className="grid gap-3">
                          {aiData?.suggestedColleges.map((college, idx) => (
                              <div key={idx} className="p-4 border border-slate-100 rounded-xl hover:border-indigo-100 transition-all">
                                  <div className="flex justify-between items-start mb-1">
                                      <h5 className="font-bold text-slate-900">{college.name}</h5>
                                      <span className="text-[9px] px-1.5 py-0.5 bg-slate-100 rounded font-bold text-slate-500 uppercase">{college.type}</span>
                                  </div>
                                  <p className="text-xs text-indigo-600 font-medium flex items-center mb-2"><MapPin className="w-3 h-3 mr-1"/>{college.location}</p>
                                  <p className="text-xs text-slate-500 leading-relaxed">{college.reasoning}</p>
                              </div>
                          ))}
                      </div>
                  )}
              </DetailSection>
            )}

            {/* Strategic Roadmap */}
            {aiData && (
                <DetailSection title="Career Roadmap" icon={<RocketLaunch className="w-6 h-6"/>}>
                    <div className="space-y-4 relative pl-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-indigo-100">
                        {aiData.careerRoadmap.map((step, index) => (
                             <div key={index} className="relative">
                                <div className="absolute -left-[25px] top-1.5 w-4 h-4 rounded-full bg-white border-2 border-indigo-500 z-10" />
                                <p className="text-sm font-semibold text-slate-700 bg-slate-50 p-3 rounded-xl border border-transparent hover:border-slate-200 transition-all">{step}</p>
                            </div>
                        ))}
                    </div>
                </DetailSection>
            )}

            {/* Disclaimer */}
            <div className="mt-8 p-4 bg-slate-50 rounded-xl flex items-start border border-slate-100">
                <InformationCircle className="w-5 h-5 text-slate-400 mr-3 mt-0.5 flex-shrink-0" />
                <p className="text-[10px] text-slate-400 leading-relaxed">
                    Institutional data and roadmaps are for informational purposes. Students are advised to verify entrance criteria and fees via official university portals.
                </p>
            </div>

          </div>
        </main>
        
        <footer className="p-6 bg-slate-50 border-t border-slate-100 flex justify-center">
            <button onClick={onClose} className="px-12 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-indigo-600 transition-all text-sm uppercase tracking-wide">
                Close Details
            </button>
        </footer>
      </div>
    </div>
  );
};

export default CareerDetailsModal;
