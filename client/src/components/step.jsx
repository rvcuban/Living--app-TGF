// src/components/step.jsx
import React, { useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { useMultiStep } from '../multi-steps/multi-step-context';

export default function Step({ defaultValues, resolver, children }) {
  const methods = useForm({
    defaultValues,
    resolver,
    mode: 'onSubmit',
  });

  const { onNext, onBack } = useMultiStep();

  // Aquí podrías guardar el estado en localStorage cada vez que cambien los valores
  useEffect(() => {
    const subscription = methods.watch(() => {
      // Ejemplo: guardar estado parcial
    });
    return () => subscription.unsubscribe();
  }, [methods]);

  const handleSubmit = (data) => {
    // Por defecto, vamos al siguiente paso.
    onNext(data);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(handleSubmit)} className="space-y-4">
        {children}
      </form>
    </FormProvider>
  );
}
