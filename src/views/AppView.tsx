import { ChatView } from "@/components/chat/ChatView";
import { useParams } from "react-router-dom";

export function AppView() {
  const params = useParams();
  const chatId = params.chatId;

  if (!chatId) <h1>Chat not found</h1>;

  return <ChatView chatId={chatId!} />;
}
