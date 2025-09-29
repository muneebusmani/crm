import { cookies } from 'next/headers';
import Dealers from './components/dealers';

const Page = async () => {
  const token = (await cookies()).get('access_token')?.value as string;
  return <Dealers token={token} />;
};

export default Page;
