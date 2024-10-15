import React from 'react';

function InfoItem({ icon, title, content }) {
  return (
    <div className="flex gap-3 mt-5 max-md:mr-2.5">
      <img loading="lazy" src={icon} alt="" className="object-contain shrink-0 rounded-sm aspect-square w-[29px]" />
      <div className="flex flex-col self-start">
        <div className="self-start text-xs text-neutral-400">{title}</div>
        <div className="mt-1.5 text-xs text-stone-300">{content}</div>
      </div>
    </div>
  );
}

export default InfoItem;  