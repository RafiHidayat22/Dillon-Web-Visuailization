'use client';

import React from 'react';
import { Steps } from 'antd';

const { Step } = Steps;

interface StepProgresProps {
  currentStep: number;
}

const StepProgres: React.FC<StepProgresProps> = ({ currentStep }) => {
  const steps = ['Step 1', 'Step 2', 'Step 3', 'Step 4'];

  return (
    <div className="my-10 flex justify-center font-sans overflow-x-auto w-full px-4">
      <Steps current={currentStep - 1} direction="horizontal" >
        {steps.map((step, index) => {
          let status: 'wait' | 'process' | 'finish' = 'wait';

          if (index < currentStep - 1) {
            status = 'finish'; 
          } else if (index === currentStep - 1) {
            status = 'process';
          }

          let icon;
          if (status === 'process') {
            icon = <div className="font-semibold text-white">{step}</div>;
          } else if (status === 'finish') {
            icon = undefined; 
          } else {
            if (index > currentStep - 1) {
              icon = <div style={{ width: 24, height: 24 }}></div>; 
            } else {
              icon = undefined;
            }
          }

          return (
            <Step
              key={step}
              title={step}
              status={status}
              icon={icon}
            />
          );
        })}
      </Steps>
    </div>
  );
};

export default StepProgres;
