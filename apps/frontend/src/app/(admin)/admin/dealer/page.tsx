import type { JSX } from 'react';
import Dealers from './components/Dealers';
import { cookies } from 'next/headers';

const Page = async () => {
  const token = (await cookies()).get('access_token')?.value as string;
  return <Dealers token={token} />;
};

export default Page;
