'use client';

import { Check } from 'lucide-react';
import clsx from 'clsx';
import type { LucideIcon } from 'lucide-react';

interface Step {
  label: string;
  icon: LucideIcon;
}

interface StepperProps {
  steps: Step[];
  currentStep: number; // 0-indexed
}

export function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <div className="flex items-center justify-center w-full mb-8">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const Icon = step.icon;

        return (
          <div key={index} className="flex items-center">
            {/* Step circle */}
            <div className="flex flex-col items-center">
              <div
                className={clsx(
                  'w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300',
                  isCompleted && 'bg-primary-600 text-white',
                  isCurrent && 'bg-white border-2 border-primary-600 text-primary-600 shadow-glow-primary',
                  !isCompleted && !isCurrent && 'bg-gray-100 text-gray-400'
                )}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>
              <span
                className={clsx(
                  'text-xs mt-2 font-medium whitespace-nowrap',
                  isCurrent ? 'text-primary-700' : isCompleted ? 'text-gray-600' : 'text-gray-400'
                )}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <div
                className={clsx(
                  'w-12 sm:w-20 h-0.5 mx-2 mt-[-1.25rem] transition-colors duration-300',
                  index < currentStep ? 'bg-primary-600' : 'bg-gray-200'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
