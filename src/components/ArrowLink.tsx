import React from 'react';
import { Text, Image } from '@mantine/core';

interface ArrowLinkProps {
  href: string;
  text: string;
}

const ArrowLink = ({ href, text }: ArrowLinkProps) => {
  return (
    <div className="flex items-center gap-x-4">
      <div className="w-[24px] h-[24px] relative overflow-hidden">
        <Image
          src="/icons/arrow-right.svg"
          alt="Right pointer red arrow"
          w="auto"
          fit="contain"
          height={24}
        />
      </div>
    <a href={href} target="_blank" rel="noopener noreferrer">
      <Text c="black" td="underline" fw={700} className="text-2xl">{text}</Text>

    </a>
    </div>
  );
};

export default ArrowLink;
