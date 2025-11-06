import React from 'react';
import { Image } from '@mantine/core';

interface InfoCardProps {
  title: string;
  description: string;
  imgSrc: React.ReactNode;
}

const InfoCard = ({title, description, imgSrc} : InfoCardProps) => {

  return (
    <div className="px-4 py-6 bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-[#e1e1e1] inline-flex flex-col justify-start items-end gap-4 overflow-hidden">
      <div className="self-stretch inline-flex justify-start items-center gap-2 overflow-hidden">
        <div className="w-12 h-12 relative overflow-hidden">
          <Image
            src={imgSrc}
            alt={ `Icon for {title} card`}
            w="auto"
            fit="contain"
            height={64}
          />
        </div>
        <div className="justify-start text-[#002a3a] text-xl font-bold font-['Poppins'] leading-6">
          {title}
        </div>
      </div>
      <div className="self-stretch h-32 justify-start text-[#333333] text-sm font-normal font-['Poppins']">
        {description}
      </div>
    </div>
  );
}

export default InfoCard;
