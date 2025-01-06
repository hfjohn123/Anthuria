import { useState } from 'react';
import { ClockCounterClockwise } from '@phosphor-icons/react';
import SideBarModal from '../../../components/Modal/SideBarModal.tsx';
import { Message } from '../../../types/ChatBot.ts';

export default function HistoryModal({
  history,
  setSessionId,
  setMessages,
  disabled = false,
}: {
  history: { sessionId: string; messages: Message[] }[];
  setSessionId: React.Dispatch<React.SetStateAction<string>>;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  disabled?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <SideBarModal
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      title="Chat History"
      disabled={disabled}
      button={
        <ClockCounterClockwise
          weight="fill"
          className="size-5 text-primary hover:text-blue-600 group-[:disabled]:text-gray-400"
        />
      }
    >
      <div className="w-screen sm:w-80 flex flex-col ">
        {history.map((history) => (
          <div
            key={history.sessionId}
            className="px-2 py-4 hover:bg-slate-100 cursor-pointer"
            onClick={() => {
              setIsOpen(false);
              setSessionId(history.sessionId);
              setMessages(history.messages);
            }}
          >
            <p className="line-clamp-1 font-semibold">
              {history.messages[1].content}
            </p>
            <p className="line-clamp-1 text-sm">
              {history.messages[history.messages.length - 1].content}
            </p>
          </div>
        ))}
      </div>
    </SideBarModal>
  );
}
