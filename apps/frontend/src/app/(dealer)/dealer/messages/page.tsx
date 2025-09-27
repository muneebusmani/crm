import { use } from 'react';
import ChatStateProvider from './components/chat-state-provider';
import axios from 'axios';
import { get } from '@/lib/api';
import { cookies } from 'next/headers';

function getDealer(): { name: any } {
  return use(get(`/dealers/${use(cookies()).get('id')?.value}`));
}
export default function ChatPage() {
  const { name: dealerName } = getDealer();

  console.log('dealername ===>', dealerName);
  return <ChatStateProvider dealerName={dealerName} />;
}
