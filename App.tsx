
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
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      setAppState(prev => ({ ...prev, error: 'Failed to generate career recommendations. Please check your inputs and try again.', isLoading: false }));
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
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <LightBulb className="w-8 h-8 text-indigo-600" />
            <h1 className="text-2xl font-bold text-slate-900">Career Compass AI</h1>
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
              disabled={appState.step === 1}
              className="px-6 py-2 bg-slate-300 text-slate-700 rounded-lg hover:bg-slate-400 disabled:bg-slate-200 disabled:cursor-not-allowed transition-colors"
            >
              Back
            </button>
            {appState.step < steps.length + 1 ? (
              <button
                onClick={nextStep}
                className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={appState.isLoading}
                className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-green-400 flex items-center justify-center"
              >
                {appState.isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </>
                ) : (
                  'Get Recommendations'
                )}
              </button>
            )}
          </div>
        )}
        {appState.error && (
            <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center">
                <AlertTriangle className="w-6 h-6 mr-3"/>
                <span>{appState.error}</span>
            </div>
        )}
      </main>
    </div>
  );
};

export default App;
