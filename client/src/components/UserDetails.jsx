import React from "react";

function UserDetails() {
    return (
        <div className="flex flex-col mt-2.5 ml-4 font-semibold w-[79px] max-md:ml-2.5">
            <h3 className="self-start text-xs text-zinc-600">Your details</h3>
            <div className="flex gap-3 mt-5 whitespace-nowrap">
                <img
                    loading="lazy"
                    src="../assets/Email.png"
                    alt="Email icon"
                    className="object-contain shrink-0 rounded-sm aspect-square w-[29px]"
                />
                <div className="flex flex-col flex-1 self-start">
                    <label htmlFor="userEmail" className="self-start text-xs text-zinc-500">Email</label>
                    <p id="userEmail" className="mt-2.5 text-xs text-gray-400">amanda@gmail.com</p>
                </div>
            </div>
        </div>
    );
}

export default UserDetails;