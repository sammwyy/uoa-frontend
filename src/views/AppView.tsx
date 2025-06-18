import { ChatView } from "@/components/chat/ChatView";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { WelcomeView } from "./WelcomeView";

export function AppView() {
  const params = useParams();

  const chatId = params.chatId;
  const secondaryChatId = params.secondaryChatId;

  const [focusedChat, setFocusedChat] = useState<string | null>(chatId || null);

  // If no chatId, show welcome page
  if (!chatId) {
    return <WelcomeView />;
  }

  if (!secondaryChatId) {
    return <ChatView chatId={chatId} />;
  }

  return (
    <div className="flex gap-5 w-full">
      <ChatView
        chatId={chatId}
        compact={true}
        showCloseButton={true}
        onClick={() => setFocusedChat(chatId)}
        isFocus={focusedChat === chatId}
      />

      <ChatView
        chatId={secondaryChatId}
        compact={true}
        hideSidebarToggle={true}
        showCloseButton={true}
        onClick={() => setFocusedChat(secondaryChatId)}
        isFocus={focusedChat === secondaryChatId}
      />
    </div>
  );
}
