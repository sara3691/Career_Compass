
import React from 'react';

interface StepperProps {
  steps: string[];
  currentStep: number;
}

const Stepper: React.FC<StepperProps> = ({ steps, currentStep }) => {
  return (
    <nav aria-label="Progress">
      <ol role="list" className="space-y-4 md:flex md:space-x-8 md:space-y-0">
        {steps.map((step, index) => (
          <li key={step} className="md:flex-1">
            {currentStep > index ? (
              <div className="group flex w-full flex-col border-l-4 border-indigo-600 py-2 pl-4 transition-colors md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4">
                <span className="text-sm font-medium text-indigo-600 transition-colors">{`Step ${index + 1}`}</span>
                <span className="text-sm font-medium">{step}</span>
              </div>
            ) : currentStep === index ? (
              <div className="flex w-full flex-col border-l-4 border-indigo-600 py-2 pl-4 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4" aria-current="step">
                <span className="text-sm font-medium text-indigo-600">{`Step ${index + 1}`}</span>
                <span className="text-sm font-medium">{step}</span>
              </div>
            ) : (
              <div className="group flex w-full flex-col border-l-4 border-gray-200 py-2 pl-4 transition-colors md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4">
                <span className="text-sm font-medium text-gray-500 transition-colors">{`Step ${index + 1}`}</span>
                <span className="text-sm font-medium">{step}</span>
              </div>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Stepper;
