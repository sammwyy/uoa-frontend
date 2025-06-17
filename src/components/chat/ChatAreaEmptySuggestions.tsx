import { BookOpen, Bot, Code2, Lightbulb, PenTool } from "lucide-react";
import React from "react";

interface SuggestionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick?: () => void;
}

const SuggestionCard: React.FC<SuggestionCardProps> = ({
  icon,
  title,
  description,
  onClick,
}) => (
  <div
    onClick={onClick}
    className="p-4 sm:p-6 rounded-2xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-gray-200/30 dark:border-gray-700/30 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-200 cursor-pointer group hover:scale-105 hover:shadow-lg"
  >
    <div className="flex items-center gap-3 mb-2 sm:mb-3">
      <div className="text-primary-500 group-hover:text-primary-600 transition-colors">
        {icon}
      </div>
      <h3 className="font-semibold text-gray-800 dark:text-gray-200">
        {title}
      </h3>
    </div>
    <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm leading-relaxed">
      {description}
    </p>
  </div>
);

interface ChatAreaEmptySuggestionsProps {
  onSuggestionClick?: (suggestion: string) => void;
  className?: string;
}

export const ChatAreaEmptySuggestions: React.FC<
  ChatAreaEmptySuggestionsProps
> = ({ onSuggestionClick, className = "" }) => {
  const suggestions = [
    {
      icon: <Lightbulb className="w-5 h-5" />,
      title: "💡 Get Ideas",
      description:
        "Brainstorm creative solutions and explore new possibilities",
      prompt: "Help me brainstorm ideas for...",
    },
    {
      icon: <BookOpen className="w-5 h-5" />,
      title: "📚 Learn",
      description: "Explore new topics and expand your knowledge",
      prompt: "Teach me about...",
    },
    {
      icon: <PenTool className="w-5 h-5" />,
      title: "✍️ Write",
      description: "Create content, documents, and written materials",
      prompt: "Help me write...",
    },
    {
      icon: <Code2 className="w-5 h-5" />,
      title: "🔧 Code",
      description: "Get programming help and technical assistance",
      prompt: "Help me code...",
    },
  ];

  const handleSuggestionClick = (prompt: string) => {
    onSuggestionClick?.(prompt);
  };

  return (
    <div
      className={`min-h-full flex items-center justify-center p-4 sm:p-8 ${className}`}
    >
      <div className="text-center max-w-2xl mx-auto">
        {/* Bot Avatar */}
        <div className="relative mb-6 sm:mb-8">
          <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center mx-auto shadow-xl animate-pulse">
            <Bot className="w-8 h-8 sm:w-12 sm:h-12 text-white" />
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-6 sm:h-6 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 animate-ping"></div>
          <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-6 sm:h-6 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
        </div>

        {/* Welcome Text */}
        <div className="mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 dark:text-gray-200 mb-4 sm:mb-6 bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
            How can I help you today?
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg lg:text-xl leading-relaxed max-w-lg mx-auto">
            Start a conversation with your AI assistant. Ask questions, get help
            with tasks, or just chat about anything!
          </p>
        </div>

        {/* Suggestion Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto mb-8">
          {suggestions.map((suggestion, index) => (
            <SuggestionCard
              key={index}
              icon={suggestion.icon}
              title={suggestion.title}
              description={suggestion.description}
              onClick={() => handleSuggestionClick(suggestion.prompt)}
            />
          ))}
        </div>

        {/* Quick Examples */}
        <div className="space-y-3 max-w-lg mx-auto">
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            Or try these examples:
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              "Explain quantum physics",
              "Write a poem",
              "Debug my code",
              "Plan a trip",
              "Create a recipe",
            ].map((example, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(example)}
                className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 hover:scale-105"
              >
                {example}
              </button>
            ))}
          </div>
        </div>

        {/* Footer hint */}
        <div className="mt-8 sm:mt-12">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            💡 Tip: Be specific in your questions to get the best results
          </p>
        </div>
      </div>
    </div>
  );
};
