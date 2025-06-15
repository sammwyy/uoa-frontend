import { ChatView } from "@/components/chat/ChatView";
import { useParams } from "react-router-dom";
import { WelcomeView } from "./WelcomeView";

export function AppView() {
  const params = useParams();
  const chatId = params.chatId;

  // If no chatId, show welcome page
  if (!chatId) {
    return <WelcomeView />;
  }

  return <ChatView chatId={chatId} />;
}