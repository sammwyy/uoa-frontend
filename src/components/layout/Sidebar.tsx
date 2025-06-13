import { MessageSquare, Plus, Settings, Trash2 } from "lucide-react";
import React from "react";

import { Chat } from "@/types";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

interface SidebarProps {
  chats: Chat[];
  activeChat: Chat | null;
  onSelectChat: (chat: Chat) => void;
  onNewChat: () => void;
  onDeleteChat: (chatId: string) => void;
  onOpenSettings: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  chats,
  activeChat,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  onOpenSettings,
  isOpen,
  onToggle,
}) => {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed top-0 left-0 h-full w-80 z-50 
        ${
          isOpen ? "bg-theme-bg-surface/95 lg:bg-transparent" : "bg-transparent"
        } 
        backdrop-blur-md border-r border-white/20 dark:border-gray-700/30
        transform transition-all duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        flex flex-col
      `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 mb-4 border-b border-white/20 dark:border-gray-700/30">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
            Conversations
          </h2>
        </div>

        {/* New Chat Button */}
        <div className="px-6 mb-6">
          <Button
            variant="primary"
            size="lg"
            icon={Plus}
            onClick={onNewChat}
            className="w-full"
          >
            New Chat
          </Button>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {chats.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 mt-12">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No conversations yet</p>
              <p className="text-sm mt-2">Start a new chat to begin</p>
            </div>
          ) : (
            <div className="space-y-3">
              {chats.map((chat) => (
                <Card
                  key={chat._id}
                  variant={activeChat?._id === chat._id ? "glass" : "default"}
                  padding="md"
                  onClick={() => onSelectChat(chat)}
                  className={`group cursor-pointer ${
                    activeChat?._id === chat._id
                      ? "bg-theme-bg-selected border-primary-200/50 dark:border-primary-700/50"
                      : ""
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3
                        className={`font-semibold truncate text-sm ${
                          activeChat?._id === chat._id
                            ? "text-primary-700 dark:text-primary-300"
                            : "text-gray-800 dark:text-gray-200"
                        }`}
                      >
                        {chat.title}
                      </h3>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {new Date(chat.lastActivityAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Trash2}
                      onClick={(e) => {
                        e?.stopPropagation();
                        onDeleteChat(chat._id);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 hover:bg-red-100/50 dark:hover:bg-red-900/30"
                    />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Settings Button at Bottom */}
        <div className="p-6 border-t border-white/20 dark:border-gray-700/30">
          <Button
            variant="secondary"
            size="lg"
            icon={Settings}
            onClick={onOpenSettings}
            className="w-full"
          >
            Settings
          </Button>
        </div>
      </div>
    </>
  );
};
