import React from 'react';
function AddressSection() {
    return (
      <div className="flex flex-col mt-3 ml-5 max-w-full font-semibold w-[108px] max-md:ml-2.5">
        <div className="text-sm text-neutral-500 max-md:mr-1.5">Where you live</div>
        <div className="flex gap-2.5 mt-5">
          <img loading="lazy" src="https://cdn.builder.io/api/v1/image/assets/TEMP/b479ae9d685416ef270970fa45e95cc8d7d80883ecfbe6e21bbf00e1ab0ed6bc?placeholderIfAbsent=true&apiKey=75a06edce8de4127b1443d78918d0955" alt="" className="object-contain shrink-0 rounded-sm aspect-[1.07] w-[31px]" />
          <div className="flex flex-col self-start">
            <div className="self-start text-xs text-zinc-500">Address</div>
            <div className="mt-1.5 text-xs text-gray-400">Add your address</div>
          </div>
        </div>
      </div>
    );
  }
    
  export default AddressSection;  