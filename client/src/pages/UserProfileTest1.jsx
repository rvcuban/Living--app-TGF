import React from "react";
import UserAvatar from "../components/UserAvatar";
import UserInfo from "../components/UserInfo";
import UserDetails from "../components/UserDetails";


function UserProfile() {
  return (
    <main className="flex flex-wrap gap-5 justify-between w-full max-w-[628px] max-md:max-w-full">
      <section className="flex flex-col">
        <div className="py-3.5 pr-20 pl-4 bg-black bg-opacity-0 max-md:pr-5">
          <div className="flex gap-5 max-md:flex-col">
            <UserAvatar />
            <UserInfo />
          </div>
        </div>
        <UserDetails />
      </section>
      <EditButton />
    </main>
  );
}

export default UserProfile;
