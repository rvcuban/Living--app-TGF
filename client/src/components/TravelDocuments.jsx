import React from 'react';
function TravelDocuments() {
    return (
      <div className="flex flex-col items-start self-stretch py-3 pr-20 pl-5 mt-3 w-full font-semibold bg-black bg-opacity-0 max-md:pr-5 max-md:max-w-full">
        <div className="text-xs text-zinc-600">Travel documents</div>
        <div className="flex gap-2.5 mt-6">
          <img loading="lazy" src="https://cdn.builder.io/api/v1/image/assets/TEMP/6bae5b9f6c1d213242afc4c2c1807ca23ea1734fee1318ebba0ab62cd5fe915f?placeholderIfAbsent=true&apiKey=75a06edce8de4127b1443d78918d0955" alt="" className="object-contain shrink-0 rounded-sm aspect-[1.07] w-[31px]" />
          <div className="flex flex-col my-auto">
            <div className="self-start text-xs text-zinc-500">Passport</div>
            <div className="mt-1.5 text-xs text-gray-400">Add your passport</div>
          </div>
        </div>
      </div>
    );
  }
  
  export default TravelDocuments;