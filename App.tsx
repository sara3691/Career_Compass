
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
 * APP MODULE: Navigation & Orchestration
 * Manages the multi-step form and AI integration.
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
    
    // Diagnostic check for the browser environment
    if (typeof process === 'undefined' || !process.env || !process.env.API_KEY) {
      setAppState(prev => ({ 
        ...prev, 
        error: "Critical Error: API_KEY is not defined in the browser. Please ensure your build tool (Vite/Webpack) is injecting 'process.env.API_KEY' from your Netlify environment variables into the final bundle.", 
        isLoading: false 
      }));
      return;
    }

    try {
      const recommendations = await getCareerRecommendations(appState.userData);
      setAppState(prev => ({ ...prev, results: recommendations, view: View.Results, isLoading: false }));
    } catch (error: any) {
      console.error("AI Submission Error:", error);
      setAppState(prev => ({ 
        ...prev, 
        error: error.message || "The AI service is currently unavailable. Please check your internet connection and API key quota.", 
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
            // Fix: Added missing properties (results, isLoading, error) to the setAppState call to satisfy AppState type
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

  // Fix: Added the missing return statement for the component to fix 'Type () => void is not assignable to type FC<{}>'
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {appState.view !== View.Homepage && appState.view !== View.Results && (
          <div className="mb-12">
            <Stepper steps={['Academics', 'Skills', 'Interests', 'Location']} currentStep={appState.step - 1} />
          </div>
        )}

        {appState.error && (
          <div className="mb-8 p-4 bg-red-100 border border-red-200 text-red-700 rounded-lg flex items-center">
             <AlertTriangle className="w-6 h-6 mr-3" />
             <span>{appState.error}</span>
          </div>
        )}

        {renderContent()}

        {appState.view !== View.Homepage && appState.view !== View.Results && (
           <div className="mt-12 flex justify-between">
              <button 
                onClick={prevStep}
                disabled={appState.step <= 1 || appState.isLoading}
                className="px-6 py-2 border border-slate-300 rounded-md text-slate-700 font-semibold hover:bg-slate-100 disabled:opacity-50"
              >
                Previous
              </button>
              
              {appState.view === View.LocationPreference ? (
                <button 
                  onClick={handleSubmit}
                  disabled={appState.isLoading}
                  className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-md hover:bg-indigo-700 disabled:opacity-50 flex items-center"
                >
                  {appState.isLoading ? 'Processing...' : 'Find My Career'}
                </button>
              ) : (
                <button 
                  onClick={nextStep}
                  disabled={appState.isLoading}
                  className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700"
                >
                  Next
                </button>
              )}
           </div>
        )}
      </div>
    </div>
  );
};

// Fix: Added the missing default export to resolve 'Module App has no default export' in index.tsx
export default App;
