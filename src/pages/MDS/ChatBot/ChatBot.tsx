import DefaultLayout from '../../../layout/DefaultLayout.tsx';
import {
  FormEvent,
  useContext,
  useEffect,
  useRef,
  useState,
  KeyboardEvent,
} from 'react';
import axios from 'axios';
import { useMutation } from '@tanstack/react-query';
import { AuthContext } from '../../../components/AuthWrapper.tsx';
import { Message } from '../../../types/ChatBot.ts';
import { v7 as uuidv7 } from 'uuid';
import { Button, Textarea } from '@headlessui/react';
import { FilePlus, PaperPlaneTilt } from '@phosphor-icons/react';
import clsx from 'clsx';
import MessageContent from '../Suggestion/MessageContent.tsx';
import HistoryModal from './HistoryModal.tsx';

export default function MDSChatBot() {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  const handleDownload = async (s3Uri: string) => {
    try {
      const response = await axios.get(route + `/puclic/download_file`, {
        params: { uri: s3Uri },
        responseType: 'blob',
      });

      // Create and trigger download
      const fileName = s3Uri.split('/').pop() || 'download';
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      // Handle error appropriately
    }
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      type: 'agent',
      sender: 'ChatBot',
      content:
        "Hello! I'm an AI assistant specializing in MDS 3.0 and PDPM documentation. I have access to the latest official information on these topics and can provide accurate, clear, and helpful answers to your questions. I can explain concepts, provide references to specific sections in the documentation, and help interpret guidelines based on the official sources. How can I assist you today with any MDS 3.0 or PDPM related questions?",
      time: new Date(),
    },
  ]);
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Prevent new line
      const formEvent = new Event('submit', { bubbles: true });
      handleSubmit(formEvent as unknown as FormEvent<HTMLFormElement>);
    }
  };
  console.log(messages);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const [sessionId, setSessionId] = useState(uuidv7());
  const [isPending, setIsPending] = useState(false);
  const { route, user_data } = useContext(AuthContext);
  const mutation = useMutation({
    mutationFn: (message) =>
      axios.post(`${route}/chat/send`, {
        message: message,
        sessionId: sessionId,
      }),
    onMutate: (newMessage: string) => {
      // Optimistically update the UI
      const userMessage = {
        type: 'user',
        sender: user_data.name,
        content: newMessage,
        time: new Date(),
      };

      setIsPending(true);
      setMessages((prevMessages) => [...prevMessages, userMessage]);
    },
    onSuccess: (returnedData: {
      data: { message: string; citations: any };
    }) => {
      // Update with the response from the server
      const agentMessage = {
        type: 'agent',
        sender: 'ChatBot',
        content: returnedData.data.message,
        citations: returnedData.data.citations.sort(
          (a: any, b: any) =>
            a.generatedResponsePart.textResponsePart.span.end -
            b.generatedResponsePart.textResponsePart.span.end,
        ),
        time: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, agentMessage]);
    },
    onError: (error) => {
      console.error('Error:', error);
      const errorMessage = {
        type: 'error',
        sender: 'ChatBot',
        content: 'An error occurred. Please try again.',
        time: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    },
    onSettled: () => {
      //scroll to bottom
      setIsPending(false);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    mutation.mutate(input);
    setInput('');
  };

  const history = JSON.parse(localStorage.getItem('MDSChatBotHistory') || '[]');

  useEffect(() => {
    if (messages.length > 1) {
      localStorage.setItem(
        'MDSChatBotHistory',
        JSON.stringify([
          { sessionId: sessionId, messages: messages },
          ...history.filter(
            (h: { sessionId: string; messages: Message[] }) =>
              h.sessionId !== sessionId,
          ),
        ]),
      );
    }
  }, [messages]);

  return (
    <DefaultLayout title="MDS - ChatBot">
      <div className="flex flex-col h-full max-w-screen-2xl mx-auto sm:pb-4">
        <div
          id="chat-container"
          className="flex-grow overflow-y-auto no-scrollbar bg-gray-100 p-4 rounded-lg mb-4"
        >
          {messages.map((message, index) => (
            <div
              key={index}
              className={`py-2 ${message.type === 'user' ? 'text-right' : ''}`}
            >
              <p className="text-xs text-gray-500">
                {message.sender +
                  ' ' +
                  new Date(message.time).toLocaleTimeString()}
              </p>
              <span
                className={`inline-block p-2 rounded-lg whitespace-pre-wrap ${
                  message.type === 'user'
                    ? 'bg-blue-500 text-white'
                    : message.type === 'agent'
                      ? 'bg-green-500 text-white'
                      : 'bg-red-500 text-white'
                }`}
              >
                <MessageContent
                  content={message.content.replace(/[\n]{3,3}/g, '\n').trim()}
                  citations={message.citations}
                />
              </span>
              <p className="text-xs text-gray-500 mt-2 flex flex-wrap gap-2 items-center">
                {message.type === 'agent' &&
                  message.citations &&
                  message.citations?.length > 0 && <span>Citations:</span>}
                {message.type === 'agent' &&
                  message.citations &&
                  message.citations.map((citation, citationIndex) =>
                    citation.retrievedReferences.map((reference, index) => (
                      <a
                        key={citationIndex + '' + index}
                        className="rounded  bg-slate-200 p-1 hover:bg-slate-300 cursor-pointer"
                        onClick={() =>
                          handleDownload(reference.location.s3Location.uri)
                        }
                      >
                        {reference.content.text.substring(0, 50) + '...'}
                      </a>
                    )),
                  )}
              </p>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <form
          onSubmit={handleSubmit}
          className="p-2 flex flex-col items-end rounded-lg bg-white has-[:focus]:shadow-2xl has-[:disabled]:cursor-not-allowed has-[:disabled]:bg-slate-400"
        >
          <Textarea
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            rows={3}
            className={clsx(
              'flex-grow w-full bg-transparent resize-none p-2 rounded-lg focus:outline-none',
              isPending ? 'cursor-wait text-white' : 'cursor-text',
            )}
            onKeyDown={handleKeyDown}
            value={isPending ? 'Processing...' : input}
            disabled={isPending}
          />
          <div className="flex w-full items-center p-2 justify-between">
            <div className="flex gap-2">
              <Button
                className=" focus:outline-stroke group"
                onClick={() => {
                  setSessionId(uuidv7());
                  setMessages([
                    {
                      type: 'agent',
                      sender: 'ChatBot',
                      content:
                        "Hello! I'm an AI assistant specializing in MDS 3.0 and PDPM documentation. I have access to the latest official information on these topics and can provide accurate, clear, and helpful answers to your questions. I can explain concepts, provide references to specific sections in the documentation, and help interpret guidelines based on the official sources. How can I assist you today with any MDS 3.0 or PDPM related questions?",
                      time: new Date(),
                    },
                  ]);
                }}
                disabled={isPending}
              >
                <FilePlus
                  weight="fill"
                  className="size-5 text-primary hover:text-blue-600 group-[:disabled]:text-gray"
                />
              </Button>
              <HistoryModal
                history={history}
                setSessionId={setSessionId}
                setMessages={setMessages}
                disabled={isPending}
              />
            </div>
            <Button
              type="submit"
              className=" focus:outline-stroke group"
              disabled={isPending}
            >
              <PaperPlaneTilt
                weight="fill"
                className="size-5 text-primary hover:text-blue-600 group-[:disabled]:text-gray"
              />
            </Button>
          </div>
        </form>
      </div>
    </DefaultLayout>
  );
}
