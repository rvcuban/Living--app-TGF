// src/schemas/formity-schema.js
import React from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// Importa tus componentes base
import Step from "../components/step";
import Layout from "../components/Layout";
import TextField from "../components/TextField";
import Checkbox from "../components/Chexbox";
import NextButton from "../components/next-button";
import BackButton from "../components/back-button";
import BubbleSelector from "../components/BubbleSelector";
import MultiBubbleSelector from "../components/MultiBubbleSelector";
import GoogleLocationField from "../components/GoogleLocationField";

import { MultiStep } from "../multi-steps/multi-step";

// Este "schema" en Formity es un array con varios pasos (form) y un "return" final
export const schema = [
  // Paso 1: Ubicación y horario
  {
    form: {
      values: () => ({
        location: ['', []],
        schedule: ['', []],
        occupation: ['', []], 
      }),
      render: ({ values, onNext, onBack, getState, setState }) => (
        <MultiStep
          step="ubicacion-horario"
          onNext={onNext}
          onBack={onBack}
          getState={getState}
          setState={setState}
        >
          <Step
            defaultValues={values}
            resolver={zodResolver(
              z.object({
                location: z.string().min(1, 'La ubicación es obligatoria'),
                schedule: z.enum(['manana', 'tarde', 'flexible'], {
                  errorMap: () => ({ message: 'El horario es obligatorio' }),
                }),
                occupation: z.enum(['estudiante', 'trabajador', 'otro'], {
                  errorMap: () => ({ message: 'Elige tu ocupación' }),
                }),
              })
            )}
          >
            <Layout
              heading="Paso 1: Ubicación y Horario"
              description="¿Dónde buscas compi y en qué horario estás más en casa?"
              fields={[
                <GoogleLocationField
                  key="location"
                  name="location"
                  label="Ubicación"
                  placeholder="Ej: Barcelona, Madrid..."
                />,
                
                <BubbleSelector
                key="schedule"
                name="schedule"
                label="¿En qué horario estás más en casa?"
                options={[
                  { value: 'manana', label: 'Mañana' },
                  { value: 'tarde', label: 'Tarde' },
                  { value: 'flexible', label: 'Flexible' },
                ]}
              />,
              <BubbleSelector
                key="occupation"
                name="occupation"
                label="¿A qué te dedicas?"
                options={[
                  { value: 'estudiante', label: 'Estudiante' },
                  { value: 'trabajador', label: 'Trabajador' },
                  { value: 'otro', label: 'Otro' },
                ]}
              />,

              ]}
              button={<NextButton>Siguiente</NextButton>}
            />
          </Step>
        </MultiStep>
      ),
    },
  },

  // Paso 2: Sobre ti (gustos, intereses, etc.)
  {
    form: {
      values: () => ({
        interests: [[], []],
        fumador: [false, []],
        mascotas: [false, []],
      }),
      render: ({ values, onNext, onBack, getState, setState }) => (
        <MultiStep
          step="sobre-ti"
          onNext={onNext}
          onBack={onBack}
          getState={getState}
          setState={setState}
        >
          <Step
            defaultValues={values}
            resolver={zodResolver(
              z.object({
                interests: z.array(
                  z.enum([
                    'fiestas',
                    'tranquilo',
                    'deportes',
                    'musica',
                    'Introvertido',
                    'Extrovertido',
                    'Artes',
                    'Videojuegos',
                    'Empresa'
                  ])
                ).nonempty('Elige al menos un gusto'), 
                fumador: z.boolean(),
                mascotas: z.boolean(),
              })
            )}
          >
            <Layout
              heading="Paso 2: Sobre ti"
              description="Háblanos de tus gustos, si fumas, si aceptarias mascotas..."
              fields={[
                <MultiBubbleSelector
                key="interests"
                name="interests"
                label="¿Cuéntanos sobre tus gustos?"
                options={[
                  { value: 'tranquilo',    label: 'Ambiente tranquilo' },
                  { value: 'fiestas',      label: 'Fiestas' },
                  { value: 'deportes',     label: 'Deportes' },
                  { value: 'musica',       label: 'Música' },
                  { value: 'Introvertido', label: 'Introvertido' },
                  { value: 'Extrovertido', label: 'Extrovertido' },
                  { value: 'Artes',        label: 'Artes' },
                  { value: 'Videojuegos',  label: 'Videojuegos' },
                  { value: 'Empresa',      label: 'Empresa' },
                ]}
              />,
                <Checkbox key="fumador" name="fumador" label="¿Fumas?" />,
                <Checkbox
                  key="mascotas"
                  name="mascotas"
                  label="¿Aceptas mascotas?"
                />,
              ]}
              button={<NextButton>Siguiente</NextButton>}
              back={<BackButton>Atrás</BackButton>}
            />
          </Step>
        </MultiStep>
      ),
    },
  },

  // Paso 3: Información personal (usuario + descripción)
  {
    form: {
      values: () => ({
        username: ['', []],
        bio: ['', []],
      }),
      render: ({ values, onNext, onBack, getState, setState }) => (
        <MultiStep
          step="info-personal"
          onNext={onNext}
          onBack={onBack}
          getState={getState}
          setState={setState}
        >
          <Step
            defaultValues={values}
            resolver={zodResolver(
              z.object({
                username: z.string().min(1, 'Nombre de usuario requerido'),
                bio: z.string().optional().default(''),
              })
            )}
          >
            <Layout
              heading="Paso 3: Información Personal"
              description="Pon un nombre de usuario y una breve descripción de ti o de lo que quieras"
              fields={[
                <TextField
                  key="username"
                  name="username"
                  label="Nombre de Usuario"
                  placeholder="Ej: Juan123..."
                />,
                <TextField
                  key="bio"
                  name="bio"
                  label="Descripción breve (opcional)"
                  placeholder="Escribe lo que quieras..."
                />,
              ]}
              button={<NextButton>Finalizar</NextButton>}
              back={<BackButton>Atrás</BackButton>}
            />
          </Step>
        </MultiStep>
      ),
    },
  },

  // Return: El objeto final que recibes al terminar
  {
    return: ({
      location,
      schedule,
      interests,
      fumador,
      mascotas,
      username,
      bio,
    }) => {
      return {
        location,
        schedule,
        interests,
        fumador,
        mascotas,
        username,
        bio,
      };
    },
  },
];
