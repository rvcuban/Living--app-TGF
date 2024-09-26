import React from 'react';

function ReviewsSection() {
    return (
        <div className="flex flex-col py-2.5 mt-3 w-full font-semibold bg-black bg-opacity-0 max-w-[650px] max-md:max-w-full">
            <div className="flex flex-col px-4 w-full max-md:pr-5 max-md:max-w-full">
                <div className="self-start text-sm text-zinc-600">Your reviews</div>
                <div className="flex flex-wrap gap-5 justify-between mt-6 w-full text-xs whitespace-nowrap max-md:max-w-full">
                    <div className="flex gap-3">
                        <img loading="lazy" src="https://cdn.builder.io/api/v1/image/assets/TEMP/0b56eb7d52a281cc913c5e76dc69c029710a5f3716c3ae4bcb6a85200d1ae242?placeholderIfAbsent=true&apiKey=75a06edce8de4127b1443d78918d0955" alt="" className="object-contain shrink-0 rounded-sm aspect-square w-[29px]" />
                        <div className="flex flex-col my-auto">
                            <div className="text-zinc-500">Overall</div>
                            <div className="self-start mt-2.5 text-gray-300">100%</div>
                        </div>
                    </div>


                    <img loading="lazy" src="https://cdn.builder.io/api/v1/image/assets/TEMP/c7e543e0acc72591ff9694b12bf000396c9c1180f45c8a76df4508fd26676d90?placeholderIfAbsent=true&apiKey=75a06edce8de4127b1443d78918d0955" alt="" className="object-contain shrink-0 my-auto aspect-[0.58] w-[7px]" />


                </div>
            </div>
            <div className="flex flex-wrap gap-6 self-start mt-2">
                <div className="flex flex-wrap flex-auto gap-3 py-2.5 pr-20 pl-5 bg-black bg-opacity-0 max-md:pr-5">
                    <img loading="lazy" src="https://cdn.builder.io/api/v1/image/assets/TEMP/c100decfbaa8165a12495dd13031deea45c12e034900c603bf90b8577e42e43c?placeholderIfAbsent=true&apiKey=75a06edce8de4127b1443d78918d0955" alt="" className="object-contain shrink-0 rounded-sm aspect-square w-[29px]" />
                    <div className="flex flex-col my-auto">
                        <div className="text-xs text-neutral-400">Reviews from hosts</div>
                        <div className="self-start mt-2.5 text-xs text-center text-gray-300">0</div>
                    </div>
                </div>
                <img loading="lazy" src="https://cdn.builder.io/api/v1/image/assets/TEMP/7284503ad8e85748541fba1c217f3eee8350fe9893a8d6abae3defc8f1e3de37?placeholderIfAbsent=true&apiKey=75a06edce8de4127b1443d78918d0955" alt="" className="object-contain shrink-0 my-auto aspect-[0.58] w-[7px]" />
            </div>
        </div>
    );
}

export default ReviewsSection;