import React from "react";
import { Image, ThemeIcon } from "@mantine/core";

interface InfoCardProps {
  title: string;
  description: string;
  imgSrc: string;
}

const InfoCard = ({ title, description, imgSrc }: InfoCardProps) => {
  return (
    <div className="px-4 py-6 bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-[#e1e1e1] inline-flex flex-col justify-start items-end gap-4 overflow-hidden">
      <div className="self-stretch inline-flex justify-start items-center gap-2">
        <ThemeIcon variant="light" radius="xl" size="xl" color="#C7501A26">
          <Image src={imgSrc} alt="" style={{ width: '70%', height: '70%' }}/>
        </ThemeIcon>
        <div className="justify-start text-secondary text-xl font-bold leading-6">
          {title}
        </div>
      </div>
      <div className="self-stretch h-32 justify-start text-primary text-sm font-normal">
        {description}
      </div>
    </div>
  );
};

export default InfoCard;
