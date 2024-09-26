import React from 'react';

function TrustedContacts() {
  return (
    <div className="flex flex-col items-start mt-4 ml-5 max-w-full font-semibold w-[204px] max-md:ml-2.5">
      <div className="text-sm text-zinc-600">Trusted contacts</div>
      <div className="flex gap-2.5 mt-6">
        <img loading="lazy" src="https://cdn.builder.io/api/v1/image/assets/TEMP/e17e8c8380a08f986b704b1fcf23579e93f803a6b2027c8d3c033b85e6c6b067?placeholderIfAbsent=true&apiKey=75a06edce8de4127b1443d78918d0955" alt="" className="object-contain shrink-0 rounded aspect-[1.07] w-[31px]" />
        <div className="flex flex-col my-auto">
          <div className="self-start text-xs text-zinc-500">Contact</div>
          <div className="mt-2.5 text-xs text-neutral-300">Add a trusted contact</div>
        </div>
      </div>
    </div>
  );
}

export default TrustedContacts;