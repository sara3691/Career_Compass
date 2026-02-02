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
 * MAIN MODULE: Application Orchestrator
 * Manages the state machine of the entire guidance journey.
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
      const recommendations = await getCareerRecommendations(appState.userData);
      setAppState(prev => ({ ...prev, results: recommendations, view: View.Results, isLoading: false }));
    } catch (error: any) {
      console.error("Submission Error:", error);
      
      // DIAGNOSIS: If the error contains specific keywords, help the user.
      let displayError = "An unexpected error occurred. Please try again.";
      
      if (error.message?.includes("API Key") || error.message?.includes("apiKey")) {
        displayError = "Configuration Issue: The application couldn't find a valid API Key. Please verify that 'API_KEY' is correctly set in your Netlify Environment Variables.";
      } else if (error.message?.includes("quota") || error.message?.includes("429")) {
        displayError = "Rate Limit: You've reached the Gemini API free tier limit. Please wait a minute and try again.";
      } else if (error.message) {
        displayError = `Service Error: ${error.message}`;
      }

      setAppState(prev => ({ 
        ...prev, 
        error: displayError, 
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
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans">
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.location.reload()}>
            <LightBulb className="w-8 h-8 text-indigo-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Career Compass AI</h1>
          </div>
          <div className="hidden sm:block text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
            Powered by Gemini 3 Flash
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {appState.view > View.Homepage && appState.view < View.Results && (
           <Stepper steps={steps} currentStep={appState.step - 1} />
        )}
        
        <div className="mt-8">
          {renderContent()}
        </div>

        {appState.view > View.Homepage && appState.view < View.Results && (
          <div className="mt-8 pt-6 border-t border-slate-200 flex justify-between items-center">
            <button
              onClick={prevStep}
              disabled={appState.step === 1 || appState.isLoading}
              className="px-6 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-all font-medium"
            >
              Back
            </button>
            {appState.step < steps.length + 1 ? (
              <button
                onClick={nextStep}
                className="px-8 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg active:scale-95"
              >
                Continue
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={appState.isLoading}
                className="px-8 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-green-400 flex items-center justify-center transition-all shadow-md hover:shadow-lg active:scale-95"
              >
                {appState.isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing...
                  </>
                ) : (
                  'Generate Guidance'
                )}
              </button>
            )}
          </div>
        )}
        
        {appState.error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl flex items-start animate-in fade-in slide-in-from-top-2">
                <AlertTriangle className="w-6 h-6 mr-3 text-red-600 flex-shrink-0 mt-0.5"/>
                <div className="flex flex-col">
                  <span className="font-bold mb-1">Error Occurred</span>
                  <span className="text-sm opacity-90">{appState.error}</span>
                </div>
            </div>
        )}
      </main>
      
      <footer className="mt-auto py-8 text-center text-slate-400 text-sm border-t border-slate-200">
        &copy; {new Date().getFullYear()} Career Compass AI &bull; Expert Guidance for Indian Students
      </footer>
    </div>
  );
};

export default App;