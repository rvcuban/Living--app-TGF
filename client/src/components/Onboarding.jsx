// src/components/Onboarding.jsx
import React, { useCallback } from "react";
import { Formity } from "@formity/react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

import { schema } from "../schemas/formitySchema";
import { updateUserSuccess, updateUserFailure, updateUserStart } from "../redux/user/userSlice";
import api from "../utils/apiFetch";

export default function Onboarding() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);

  // Se llama cuando el formulario multi-paso finaliza
  const onReturn = useCallback(
    async (values) => {
      if (!currentUser?._id) {
        console.error("No currentUser ID available:", currentUser);
        toast.error("No se pudo identificar el usuario actual");
        return;
      }
  
      try {
        // Dispatch start action to show loading state
        dispatch(updateUserStart());
        
        const processedBio = values.bio?.trim() || ""; // Empty string instead of null
        
        // Store userId to use in case Redux gets cleared 
        const userId = currentUser._id;
        localStorage.setItem('lastUserId', userId);
        
        // Format data for API
        const payload = {
          ...values,
          isNewUser: false,  // This is correct - marking user as not new after onboarding
          bio: processedBio,
          preferences: {
            schedule: values.schedule || 'flexible',
            smoker: Boolean(values.fumador),
            pets: Boolean(values.mascotas)
          },
          location: values.location || "",
          interests: values.interests || []
        };
        
        console.log("Sending update with payload:", payload);
        
        const response = await api.post(`/user/update/${userId}`, payload);
        const data = response.data;
        
        // Make sure we keep important data from current state
        const updatedUserData = {
          ...currentUser,
          ...data,
          _id: userId,  // Ensure ID is always present
          isNewUser: false  // User is no longer new after onboarding
        };
        
        // Update Redux with new user data
        dispatch(updateUserSuccess(updatedUserData));
        toast.success("¡Perfil configurado correctamente!");
        
        // Wait for state to persist before navigating
        setTimeout(() => {
          navigate("/profile");
        }, 500);
      } catch (error) {
        console.error("Error updating profile:", error);
        dispatch(updateUserFailure(error.response?.data?.message || "Error al actualizar el perfil"));
        toast.error(error.response?.data?.message || "Error al actualizar el perfil");
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
