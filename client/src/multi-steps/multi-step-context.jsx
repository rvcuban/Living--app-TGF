// src/multi-step/multi-step-context.jsx
import React, { createContext, useContext } from 'react';

export const MultiStepContext = createContext({});

export const useMultiStep = () => {
  return useContext(MultiStepContext);
};
