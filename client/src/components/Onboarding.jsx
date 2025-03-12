// src/components/Onboarding.jsx
import React, { useCallback } from "react";
import { Formity } from "@formity/react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

import { schema } from "../schemas/formitySchema";
import { updateUserSuccess } from "../redux/user/userSlice";
import api from "../utils/apiFetch";

export default function Onboarding() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);

  // Se llama cuando el formulario multi-paso finaliza
  const onReturn = useCallback(
    async (values) => {
      try {
        const processedBio = values.bio?.trim() || null; //para poder dejar la vio vacia
        const payload = {
          ...values,
          isNewUser: false,
          bio: processedBio,
          preferences: {
            schedule: values.schedule,
            smoker: values.fumador,
            pets: values.mascotas
          },
        };
        const res = await api(`/user/update/${currentUser._id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();

        if (data.success) {
          // Actualizamos Redux y avisamos al usuario
          dispatch(updateUserSuccess(data));
          toast.success("Perfil actualizado correctamente.");
          // Navegamos a otra ruta, p.ej. al perfil
          navigate("/");
        } else {
          toast.error(data.message || "Error al actualizar el perfil.");
        }
      } catch (error) {
        toast.error("No se pudo actualizar el perfil. Inténtalo de nuevo.");
        console.error(error); //  the console error for debugging
      }
    },
    [currentUser, dispatch, navigate]
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Onboarding: ¡Completa tu perfil!
      </h1>
      <Formity
        schema={schema}
        onReturn={onReturn}
      // onYield: se ejecuta cuando pasas cada paso, si lo deseas
      />
    </div>
  );
}
