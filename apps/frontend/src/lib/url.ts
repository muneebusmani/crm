const API_URL = process.env.NEXT_PUBLIC_API_URL;
if (!API_URL) {
  throw new Error(
    'NEXT_PUBLIC_API_URL not set in the Environment. Either the env is missing or env not present for current Environment.',
  );
}
export default API_URL as string;
