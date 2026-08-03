import ChatManager from "@/components/dashboard/ChatManager";
import { requireUser } from "@/lib/auth/server";

export default async function ChatPage() {
  const user = await requireUser();
  return <ChatManager user={user} />;
}
