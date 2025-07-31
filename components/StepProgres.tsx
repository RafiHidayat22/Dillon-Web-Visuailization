'use client'
import React from 'react';

interface StepProgresProps {
  currentStep: number;
}

const StepProgres: React.FC<StepProgresProps> = ({ currentStep }) => {
  const steps = [1, 2, 3, 4];

  return (
    <div className="flex items-center justify-center my-10 font-sans">
      {steps.map((step, index) => (
        <React.Fragment key={step}>
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg
              ${currentStep === step ? 'bg-[#26d0ce]' : 'bg-[#0a58ca]'}`}
          >
            {step}
          </div>
          {index < steps.length - 1 && (
            <div className="flex-1 h-2 bg-[#0a58ca] mx-2 rounded-full" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default StepProgres;
