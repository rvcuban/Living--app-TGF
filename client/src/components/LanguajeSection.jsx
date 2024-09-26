import React from 'react';

function LanguageSection() {
  return (
    <div className="flex flex-wrap gap-10 mt-1.5 w-full font-semibold whitespace-nowrap max-w-[617px] max-md:max-w-full">
      <div className="flex flex-wrap flex-auto gap-2.5 items-start px-4 py-2.5 text-xs bg-black bg-opacity-0 text-zinc-500">
        <img loading="lazy" src="https://cdn.builder.io/api/v1/image/assets/TEMP/1658e6424ee28b3185c1eea8f21d7c3b78db06d560ab9d40ca6ba79196a65bb9?placeholderIfAbsent=true&apiKey=75a06edce8de4127b1443d78918d0955" alt="" className="object-contain shrink-0 self-start rounded aspect-[1.04] w-[26px]" />
        <div className="flex-auto my-auto max-md:max-w-full">Language</div>
      </div>
      <div className="my-auto text-xs text-neutral-400">English</div>
    </div>
  );
}

export default LanguageSection;