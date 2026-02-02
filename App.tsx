import React, { useState, useCallback } from 'react';
import { UserData, CareerRecommendation, AppState, View } from './types';
import { DEFAULT_USER_DATA } from './constants';
import Stepper from './components/ui/Stepper';
import Homepage from './components/steps/Homepage';
import AcademicDetails from './components/steps/AcademicDetails';
import SkillsAssessment from './components/steps/SkillsAssessment';
import InterestSelection from './components/steps/InterestSelection';
import LocationPreference from './components/steps/LocationPreference';
import CareerRecommendations from './components/results/CareerRecommendations';
import { getCareerRecommendations } from './services/geminiService';
import { AlertTriangle } from './components/icons/AlertTriangle';
import { LightBulb } from './components/icons/LightBulb';

/**
 * APP MODULE: Navigation & State Management
 * This component orchestrates the user flow and communicates with the secure backend gateway.
 */

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>({
    view: View.Homepage,
    step: 0,
    userData: DEFAULT_USER_DATA,
    results: [],
    isLoading: false,
    error: null,
  });

  const updateUserData = (data: Partial<UserData>) => {
    setAppState(prev => ({ ...prev, userData: { ...prev.userData, ...data } }));
  };

  const nextStep = () => {
    setAppState(prev => ({ ...prev, step: prev.step + 1, view: prev.view + 1 }));
  };

  const prevStep = () => {
    if (appState.step > 0) {
      setAppState(prev => ({ ...prev, step: prev.step - 1, view: prev.view - 1 }));
    }
  };
  
  const startGuidance = () => {
    setAppState(prev => ({...prev, view: View.AcademicDetails, step: 1}));
  };

  const handleSubmit = useCallback(async () => {
    setAppState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // The frontend now calls the Netlify Function gateway instead of using the AI SDK directly.
      // This is secure and avoids browser-side environment variable issues.
      const recommendations = await getCareerRecommendations(appState.userData);
      setAppState(prev => ({ ...prev, results: recommendations, view: View.Results, isLoading: false }));
    } catch (error: any) {
      console.error("Guidance Error:", error);
      setAppState(prev => ({ 
        ...prev, 
        error: error.message || "Failed to generate recommendations. Please check your network and try again.", 
        isLoading: false 
      }));
    }
  }, [appState.userData]);

  const renderContent = () => {
    switch (appState.view) {
      case View.Homepage:
        return <Homepage onStart={startGuidance} />;
      case View.AcademicDetails:
        return <AcademicDetails data={appState.userData.academics} onUpdate={(data) => updateUserData({ academics: data })} />;
      case View.SkillsAssessment:
        return <SkillsAssessment data={appState.userData.skills} onUpdate={(data) => updateUserData({ skills: data })} />;
      case View.InterestSelection:
        return <InterestSelection stream={appState.userData.academics.stream} data={appState.userData.interests} onUpdate={(data) => updateUserData({ interests: data })} />;
      case View.LocationPreference:
        return <LocationPreference data={appState.userData.location} onUpdate={(data) => updateUserData({ location: data })} />;
      case View.Results:
        return <CareerRecommendations 
            results={appState.results} 
            userData={appState.userData} 
            onRestart={() => setAppState({
                view: View.Homepage,
                step: 0,
                userData: DEFAULT_USER_DATA,
                results: [],
                isLoading: false,
                error: null,
            })} />;
      default:
        return <Homepage onStart={startGuidance} />;
    }
  };

  const steps = ['Academics', 'Skills', 'Interests', 'Location'];

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.location.reload()}>
            <LightBulb className="w-8 h-8 text-indigo-600" />
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Career Compass AI</h1>
          </div>
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
            Expert Indian Career Guidance
          </div>
        </header>

        {appState.view !== View.Homepage && appState.view !== View.Results && (
          <div className="mb-12">
            <Stepper steps={steps} currentStep={appState.step - 1} />
          </div>
        )}

        {appState.error && (
          <div className="mb-8 p-5 bg-red-50 border border-red-200 text-red-800 rounded-2xl flex items-start animate-in fade-in slide-in-from-top-2">
             <AlertTriangle className="w-6 h-6 mr-4 text-red-600 flex-shrink-0 mt-0.5" />
             <div className="flex flex-col">
                <span className="font-bold text-lg mb-1">Service Error</span>
                <span className="text-sm opacity-90 leading-relaxed">{appState.error}</span>
             </div>
          </div>
        )}

        {renderContent()}

        {appState.view !== View.Homepage && appState.view !== View.Results && (
           <div className="mt-12 flex justify-between items-center border-t border-slate-200 pt-8">
              <button 
                onClick={prevStep}
                disabled={appState.step <= 1 || appState.isLoading}
                className="px-6 py-2.5 border border-slate-300 rounded-xl text-slate-700 font-semibold hover:bg-white hover:shadow-sm disabled:opacity-40 transition-all active:scale-95"
              >
                Previous Step
              </button>
              
              {appState.view === View.LocationPreference ? (
                <button 
                  onClick={handleSubmit}
                  disabled={appState.isLoading}
                  className="px-10 py-2.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 disabled:bg-green-400 flex items-center shadow-lg hover:shadow-xl active:scale-95 transition-all"
                >
                  {appState.isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      AI Analyzing...
                    </>
                  ) : 'Find My Career Path'}
                </button>
              ) : (
                <button 
                  onClick={nextStep}
                  disabled={appState.isLoading}
                  className="px-10 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 shadow-lg hover:shadow-xl active:scale-95 transition-all"
                >
                  Continue
                </button>
              )}
           </div>
        )}
      </div>
      <footer className="mt-24 py-10 text-center text-slate-400 text-sm border-t border-slate-200">
        &copy; {new Date().getFullYear()} Career Compass AI &bull; Secure AI-Powered Roadmap System
      </footer>
    </div>
  );
};

export default App;