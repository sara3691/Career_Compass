
import React, { useState } from 'react';
import { CareerRecommendation, UserData } from '../../types';
import Card from '../ui/Card';
import UserSummary from './UserSummary';
import CareerDetailsModal from './CareerDetailsModal';
import AbroadSupportInfo from './AbroadSupportInfo';
import { ArrowPath } from '../icons/ArrowPath';
import { CheckCircle } from '../icons/CheckCircle';
import { XCircle } from '../icons/XCircle';
import { ShieldCheck } from '../icons/ShieldCheck';

interface CareerRecommendationsProps {
  results: CareerRecommendation[];
  userData: UserData;
  onRestart: () => void;
}

const CareerCard: React.FC<{ career: CareerRecommendation, isParentMode: boolean, onDetailsClick: () => void }> = ({ career, isParentMode, onDetailsClick }) => {
    const eligibilityClass = career.eligibilityStatus === 'Eligible' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
    const eligibilityIcon = career.eligibilityStatus === 'Eligible' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />;
    
    const riskClass = career.riskLevel === 'Low' ? 'bg-blue-100 text-blue-800' : career.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-orange-100 text-orange-800';

    return (
        <Card className="flex flex-col h-full">
            <div className="flex-grow">
                <div className="flex justify-between items-start">
                    <h3 className="text-xl font-bold text-slate-900">{career.careerName}</h3>
                    <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${eligibilityClass}`}>
                            {eligibilityIcon}
                            <span className="ml-1">{career.eligibilityStatus}</span>
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${riskClass}`}>
                            {career.riskLevel} Risk
                        </span>
                    </div>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2.5 mt-3">
                    <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${career.matchPercentage}%` }}></div>
                </div>
                <p className="text-sm text-slate-600 mt-1">Match Score: {career.matchPercentage}%</p>
                
                <p className="mt-4 text-slate-600 text-sm">
                    {isParentMode ? career.parentalAdvice : career.shortDescription}
                </p>
                
                {!isParentMode && (
                    <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                        <p className="text-sm font-semibold text-slate-800">Why it matches you:</p>
                        <p className="text-sm text-slate-600 mt-1">{career.whyItMatches}</p>
                    </div>
                )}
            </div>
            <button 
                onClick={onDetailsClick}
                className="mt-6 w-full text-center px-4 py-2 bg-indigo-100 text-indigo-700 font-semibold rounded-lg hover:bg-indigo-200 transition-colors"
            >
                View Full Details
            </button>
        </Card>
    );
};

const CareerRecommendations: React.FC<CareerRecommendationsProps> = ({ results, userData, onRestart }) => {
    const [isParentMode, setIsParentMode] = useState(false);
    const [selectedCareer, setSelectedCareer] = useState<CareerRecommendation | null>(null);

    const eligibleCareers = results.filter(r => r.eligibilityStatus === 'Eligible');
    const notEligibleCareers = results.filter(r => r.eligibilityStatus !== 'Eligible');
  
    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold text-slate-900">Your Personalized Career Recommendations</h2>
                    <p className="mt-1 text-slate-600">Based on your profile, here are some potential career paths.</p>
                </div>
                <button onClick={onRestart} className="flex items-center px-4 py-2 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300 transition-colors">
                    <ArrowPath className="w-5 h-5 mr-2" />
                    Start Over
                </button>
            </div>

            <UserSummary userData={userData} />

            {userData.location.abroad && <AbroadSupportInfo />}
            
            <div className="flex justify-end">
                <label htmlFor="parent-mode" className="flex items-center cursor-pointer">
                    <ShieldCheck className="w-6 h-6 mr-2 text-slate-600" />
                    <span className="mr-3 font-medium text-slate-700">Parent Mode</span>
                    <div className="relative">
                        <input type="checkbox" id="parent-mode" className="sr-only" checked={isParentMode} onChange={() => setIsParentMode(!isParentMode)} />
                        <div className={`block w-14 h-8 rounded-full ${isParentMode ? 'bg-indigo-600' : 'bg-slate-300'}`}></div>
                        <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${isParentMode ? 'transform translate-x-6' : ''}`}></div>
                    </div>
                </label>
            </div>

            {eligibleCareers.length > 0 && (
                 <div>
                    <h3 className="text-2xl font-bold text-slate-800 mb-4">Recommended for You</h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {eligibleCareers.map(career => (
                            <CareerCard key={career.careerName} career={career} isParentMode={isParentMode} onDetailsClick={() => setSelectedCareer(career)} />
                        ))}
                    </div>
                 </div>
            )}
            
            {notEligibleCareers.length > 0 && (
                <div className="mt-12">
                   <h3 className="text-2xl font-bold text-slate-800 mb-4">Other Paths Considered</h3>
                   <p className="text-slate-600 mb-4">The following careers were considered based on your interests but you are not academically eligible for them right now. This is for your information only.</p>
                   <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                       {notEligibleCareers.map(career => (
                           <CareerCard key={career.careerName} career={career} isParentMode={isParentMode} onDetailsClick={() => setSelectedCareer(career)} />
                       ))}
                   </div>
                </div>
           )}

            {selectedCareer && (
                <CareerDetailsModal 
                    career={selectedCareer} 
                    userData={userData}
                    onClose={() => setSelectedCareer(null)} 
                />
            )}
        </div>
    );
};

export default CareerRecommendations;
