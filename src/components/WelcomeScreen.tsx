import React, { ReactNode } from 'react';
import { LuBrainCircuit } from "react-icons/lu";

interface WelcomeScreenProps {
  children: ReactNode;
}

export function WelcomeScreen({ children }: WelcomeScreenProps) {
  return (
    <>
      <div className="flex flex-col items-center justify-center h-64 text-center p-8">
        <LuBrainCircuit className="w-12 h-12 text-blue-500 mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Welcome to Smart Chat</h2>
        <p className="text-gray-600">Choose a model type and start chatting!</p>
      </div>
      {children}
    </>
  );
}