import React from 'react';
import InfoItem from './InfoItem';
import LanguageSection from './LanguajeSection';
import AddressSection from './AddressSection';
import TravelDocuments from './TravelDocuments';
import TrustedContacts from './TrustedContacts';
import PersonalPreferences from './PersonalPreferences';
import ReviewsSection from './ReviewsSections';

const profileItems = [
    { icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/7630f2d8f2a9edd111ea306d0cbf7026fb36ffacacd3d89489edc7c36f022b2c?placeholderIfAbsent=true&apiKey=75a06edce8de4127b1443d78918d0955", title: "Phone", content: "+1 (123) 456 7890" },
    { icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/571643bde3271252919f61aa9e7e43b32e281b9b5dd35316df8a907ba2777f82?placeholderIfAbsent=true&apiKey=75a06edce8de4127b1443d78918d0955", title: "Date of birth", content: "Add your date of birth" }
];

function ProfileInfo() {
    return (
        <section className="flex relative z-10 flex-col grow shrink-0 items-start -mr-5 basis-0 bg-black bg-opacity-0 w-fit max-md:max-w-full">
            <div className="flex flex-col mt-5 ml-5 max-w-full font-semibold w-[114px] max-md:ml-2.5">
                {profileItems.map((item, index) => (
                    <InfoItem key={index} icon={item.icon} title={item.title} content={item.content} />
                ))}
            </div>
            <LanguageSection />
            <AddressSection />
            <TravelDocuments />
            <TrustedContacts />
            <PersonalPreferences />
            <ReviewsSection />
        </section>
    );
}

export default ProfileInfo;