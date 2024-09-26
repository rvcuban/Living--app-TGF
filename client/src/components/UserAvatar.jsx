function UserAvatar() {
    return (
      <div className="flex flex-col w-6/12 max-md:ml-0 max-md:w-full">
        <img
          loading="lazy"
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/f8df0696119bffe8853d4fdc6c2a97b25f6b832646745ad30c392047ddf9a710?placeholderIfAbsent=true&apiKey=75a06edce8de4127b1443d78918d0955"
          alt="User avatar"
          className="object-contain shrink-0 aspect-square rounded-[42px] w-[83px] max-md:mt-6"
        />
      </div>
    );
  }
  
  export default UserAvatar;