import React, { useState, ReactNode } from 'react';

type MessageType = 'success' | 'warning' | 'caution';

interface DismissibleMessageProps {
  title: string;
  description?: string;
  messageType?: MessageType;
}

type TypeStyles = {
  [key in MessageType]: {
    wrapper: string;
    icon: ReactNode;
  }
};

const iconMap: Record<MessageType, ReactNode> = {
  success: null,
  warning: (
    <span className="mr-3 text-2xl select-none" aria-hidden="true" role="img">❌</span>
  ),
  caution: (
    <span className="mr-3 text-2xl select-none" aria-hidden="true" role="img">⚠️</span>
  ),
};

const typeStyles: TypeStyles = {
  success: {
    wrapper: 'flex relative text-lg font-bold p-4 mb-4 border border-[#a8c599] bg-[#fcfff5] text-[#1e561f] rounded-md',
    icon: iconMap.success,
  },
  warning: {
    wrapper: 'flex relative text-lg font-bold p-4 mb-4 border border-[#c59999] bg-[#fff5f5] text-[#830e0e] rounded-md',
    icon: iconMap.warning,
  },
  caution: {
    wrapper: 'flex relative text-lg font-bold p-4 mb-4 border border-[#ffe58f] bg-[#fffbe6] text-[#996600] rounded-md',
    icon: iconMap.caution,
  },
};

const DismissibleMessage: React.FC<DismissibleMessageProps> = ({
  title = 'Placeholder Title',
  description = 'placeholder description',
  messageType = 'success',
}) => {
  const [open, setOpen] = useState(true);
  const type = typeStyles[messageType] || typeStyles.success;

  const close = () => {
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className={type.wrapper}>
      {type.icon}
      <div className="flex-1">
        {title}
        {description && (
          <div className="text-sm font-normal mt-3">{description}</div>
        )}
      </div>
      <button
        className="cursor-pointer ml-4 hover:opacity-80 text-xl leading-none p-1 align-top self-start"
        aria-label='Close Message'
        onClick={close}
      >
        ×
      </button>
    </div>
  );
};

export default DismissibleMessage;
