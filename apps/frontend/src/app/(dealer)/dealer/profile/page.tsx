import { cookies } from "next/headers";
import Profile from "./components/profile";

const ProfilePage = async () => {
  const id = (await cookies()).get("id")?.value;
  return <Profile id={id} />;
};

export default ProfilePage;
