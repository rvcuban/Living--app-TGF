import React from "react";


//aqui tengo el nombre y la ciudad a la que pertenece
function UserInfo({ currentUser ,className}) {
  if (!currentUser) {
    return <div>Cargando información del usuario...</div>;
  }
  return (
    <div className={`flex flex-col ${className}`}>
      
        <h2 className="text-xl font-semibold text-neutral-600">{currentUser.username}</h2>
        <p className="mt-3 text-xs text-gray-400">Seattle, WA, United States</p>
      </div>
    
  );
}

export default UserInfo;