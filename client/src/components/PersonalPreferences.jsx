import React from 'react';

function PersonalPreferences() {
    return (
        <div className="flex flex-col items-start mt-4 ml-5 max-w-full font-semibold w-[204px] max-md:ml-2.5">
            <div className="mt-6 text-sm text-zinc-600">Personal preferences</div>
            <div className="flex gap-3 self-stretch mt-5">
                <img loading="lazy" src="https://cdn.builder.io/api/v1/image/assets/TEMP/16b2a35214c76140779a4ab8a019b70bdc0421da0ee67bfb3f9d32ccb986e6a4?placeholderIfAbsent=true&apiKey=75a06edce8de4127b1443d78918d0955" alt="" className="object-contain shrink-0 rounded-sm aspect-[1.04] w-[29px]" />
                <div className="flex flex-col self-start"></div>
                <div className="flex flex-col self-start">
                    <div className="self-start text-xs text-zinc-500">Notifications</div>
                    <div className="mt-1.5 text-xs text-neutral-300">Set your communication preferences</div>
                </div>
            </div>
            <div className="flex gap-3 mt-5 text-xs">
                <img loading="lazy" src="https://cdn.builder.io/api/v1/image/assets/TEMP/7c3f248ed6e3d37245d3b3936b3542eb756944793de82339f16bb9e9f133a443?placeholderIfAbsent=true&apiKey=75a06edce8de4127b1443d78918d0955" alt="" className="object-contain shrink-0 rounded-sm aspect-[1.04] w-[29px]" />
                <div className="flex flex-col my-auto">
                    <div className="self-start text-zinc-500">Travel for work</div>
                    <div className="mt-2.5 text-neutral-300">Help us show you the right experience</div>
                </div>
            </div>
        </div>
    );
}

export default PersonalPreferences;