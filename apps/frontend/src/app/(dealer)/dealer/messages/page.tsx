import { cookies } from 'next/headers';
import { use } from 'react';
import { get } from '@/lib/api';
import ChatContainer from './components/chat-container';

function getDealer(): { name: string } {
  return use(get(`/dealers/${use(cookies()).get('id')?.value}`));
}
export default function ChatPage() {
  const { name: dealerName } = getDealer();

  return <ChatContainer dealerName={dealerName} />;
}
