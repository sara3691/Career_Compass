
import React, { useState, useEffect } from 'react';
import { CareerRecommendation, UserData, CareerDetails } from '../../types';
import { getCareerDetails } from '../../services/geminiService';
import { XMark } from '../icons/XMark';
import { AlertTriangle } from '../icons/AlertTriangle';
import { AcademicCap } from '../icons/AcademicCap';
import { BuildingLibrary } from '../icons/BuildingLibrary';
import { CurrencyDollar } from '../icons/CurrencyDollar';
import { MapPin } from '../icons/MapPin';
import { RocketLaunch } from '../icons/RocketLaunch';
import { ClipboardDocumentList } from '../icons/ClipboardDocumentList';

interface CareerDetailsModalProps {
  career: CareerRecommendation;
  userData: UserData;
  onClose: () => void;
}

const LoadingSkeleton: React.FC = () => (
    <div className="animate-pulse space-y-4">
        <div className="h-4 bg-slate-200 rounded w-3/4"></div>
        <div className="h-4 bg-slate-200 rounded w-1/2"></div>
        <div className="space-y-2 pt-4">
            <div className="h-4 bg-slate-200 rounded"></div>
            <div className="h-4 bg-slate-200 rounded"></div>
            <div className="h-4 bg-slate-200 rounded w-5/6"></div>
        </div>
    </div>
);

const DetailSection: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="py-4">
        <div className="flex items-center mb-2">
            <div className="text-indigo-600">{icon}</div>
            <h4 className="ml-3 text-lg font-bold text-slate-800">{title}</h4>
        </div>
        <div className="ml-9 text-slate-600 text-sm space-y-2">{children}</div>
    </div>
)


const CareerDetailsModal: React.FC<CareerDetailsModalProps> = ({ career, userData, onClose }) => {
  const [details, setDetails] = useState<CareerDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const fetchedDetails = await getCareerDetails(career.careerName, userData);
        setDetails(fetchedDetails);
      } catch (e) {
        setError("Could not load career details. Please try again later.");
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetails();
  }, [career, userData]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <header className="p-4 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-900">{career.careerName}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100">
            <XMark className="w-6 h-6 text-slate-600" />
          </button>
        </header>

        <main className="p-6 overflow-y-auto">
          {isLoading && <LoadingSkeleton />}
          {error && (
            <div className="flex items-center p-4 bg-red-100 text-red-700 rounded-lg">
                <AlertTriangle className="w-6 h-6 mr-3"/>
                <span>{error}</span>
            </div>
          )}
          {details && (
            <div className="divide-y divide-slate-200">
                <DetailSection title="Why This Career Suits You" icon={<AcademicCap className="w-6 h-6"/>}>
                    <p>{details.whyThisCareerSuitsYou}</p>
                </DetailSection>

                <DetailSection title="Relevant Courses" icon={<ClipboardDocumentList className="w-6 h-6"/>}>
                    <ul className="list-disc list-inside">
                        {details.courses.map(course => <li key={course.name}><strong>{course.name}</strong> ({course.duration}): {course.description}</li>)}
                    </ul>
                </DetailSection>

                <DetailSection title="Entrance Exams" icon={<ClipboardDocumentList className="w-6 h-6"/>}>
                    <div className="flex flex-wrap gap-2">
                        {details.entranceExams.map(exam => <span key={exam} className="px-3 py-1 bg-slate-100 text-slate-800 text-xs font-medium rounded-full">{exam}</span>)}
                    </div>
                </DetailSection>
                
                <DetailSection title="Recommended Colleges" icon={<BuildingLibrary className="w-6 h-6"/>}>
                    <div className="space-y-3">
                    {details.colleges.map(college => (
                        <div key={college.name} className="p-3 bg-slate-50 rounded-md">
                            <p className="font-semibold text-slate-800">{college.name}</p>
                            <p className="text-xs text-slate-500 flex items-center"><MapPin className="w-3 h-3 mr-1"/>{college.location}</p>
                            <p className="text-xs mt-1"><strong>Course:</strong> {college.courseOffered} | <strong>Fees:</strong> {college.fees}</p>
                        </div>
                    ))}
                    </div>
                </DetailSection>
                
                <DetailSection title="Scholarships" icon={<CurrencyDollar className="w-6 h-6"/>}>
                     <div className="space-y-3">
                    {details.scholarships.map(scholarship => (
                        <div key={scholarship.name} className="p-3 bg-slate-50 rounded-md">
                             <p className="font-semibold text-slate-800">{scholarship.name} ({scholarship.provider})</p>
                             <p className="text-xs mt-1"><strong>Eligibility:</strong> {scholarship.eligibility} | <strong>Amount:</strong> {scholarship.amount}</p>
                        </div>
                    ))}
                    </div>
                </DetailSection>

                <DetailSection title="Career Roadmap" icon={<MapPin className="w-6 h-6"/>}>
                    <ol className="relative border-l border-slate-300">
                        {details.careerRoadmap.map((step, index) => (
                             <li key={index} className="mb-4 ml-4">
                                <div className="absolute w-3 h-3 bg-slate-300 rounded-full mt-1.5 -left-1.5 border border-white"></div>
                                <p className="text-sm font-semibold text-slate-800">{step}</p>
                            </li>
                        ))}
                    </ol>
                </DetailSection>

                <DetailSection title="Scope & Growth" icon={<RocketLaunch className="w-6 h-6"/>}>
                    <p>{details.scopeAndGrowth}</p>
                </DetailSection>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default CareerDetailsModal;
