// src/multi-step/multi-step.jsx
import React, { useCallback, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { MultiStepContext } from './multi-step-context';

export function MultiStep({
  step,
  onNext,
  onBack,
  getState,
  setState,
  children,
}) {
  const [animate, setAnimate] = useState(false);

  const handleNext = useCallback(
    (values) => {
      setAnimate(true);
      // Usamos un pequeño delay para activar la animación
      setTimeout(() => onNext(values), 0);
    },
    [onNext]
  );

  const handleBack = useCallback(
    (values) => {
      setAnimate(true);
      setTimeout(() => onBack(values), 0);
    },
    [onBack]
  );

  const contextValues = useMemo(() => ({
    onNext: handleNext,
    onBack: handleBack,
    getState,
    setState,
    // también podríamos exponer getValues si queremos
    getValues: (formValues) => formValues || {},
  }), [handleNext, handleBack, getState, setState]);

  return (
    <AnimatePresence
      mode="popLayout"
      initial={false}
      onExitComplete={() => setAnimate(false)}
    >
      <motion.div
        key={step}
        inert={animate ? true : undefined}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0, transition: { duration: 0.2 } }}
        exit={{ opacity: 0, x: -50, transition: { duration: 0.2 } }}
        className="h-full"
      >
        <MultiStepContext.Provider value={contextValues}>
          {children}
        </MultiStepContext.Provider>
      </motion.div>
    </AnimatePresence>
  );
}
