import { Check, Copy, ZoomIn } from "lucide-react";
import React, { useState } from "react";
import ReactMarkdown, { ExtraProps } from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  oneDark,
  oneLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";

import { useTheme } from "@/hooks/useTheme";
import { MessageRole } from "@/types";
import { Button } from "../ui/Button";
import { ImageModal } from "./ImageModal";

interface MessageRendererProps {
  content: string;
  role: MessageRole;
}

type CodeBlockProps = {
  inline?: boolean;
} & React.ClassAttributes<HTMLElement> &
  React.HTMLAttributes<HTMLElement> &
  ExtraProps;

export const MessageRenderer: React.FC<MessageRendererProps> = ({
  content,
  role,
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { baseTheme } = useTheme();

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(id);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const CodeBlock: React.FC<CodeBlockProps> = ({
    children,
    className,
    inline,
  }) => {
    const match = /language-(\w+)/.exec(className || "");
    const language = match ? match[1] : "";

    let codeId = "";
    const codeText = children as string;

    if (children) {
      if (children instanceof String) {
        codeId = `${language}-${codeText.slice(0, 20)}`;
      } else {
        console.error("Children is not a string:", children);
      }
    }

    if (inline) {
      return (
        <code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-sm font-mono text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700">
          {children}
        </code>
      );
    }

    return (
      <div
        className={`${
          role == "user"
            ? "whitespace-pre-wrap leading-relaxed text-sm sm:text-base"
            : ""
        } relative group my-4`}
      >
        <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-t-lg border-b border-gray-200 dark:border-gray-700">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {language || "code"}
          </span>
          <Button
            variant="ghost"
            size="sm"
            icon={copiedCode === codeId ? Check : Copy}
            onClick={() => copyToClipboard(codeText, codeId)}
            className={`opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
              copiedCode === codeId
                ? "text-green-600"
                : "text-gray-500 dark:text-gray-400"
            }`}
            title="Copy code"
          />
        </div>
        <SyntaxHighlighter
          style={baseTheme === "dark" ? oneDark : oneLight}
          language={language}
          PreTag="div"
          className="!mt-0 !rounded-t-none"
          customStyle={{
            margin: 0,
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
          }}
        >
          {codeText}
        </SyntaxHighlighter>
      </div>
    );
  };

  const ImageComponent: React.FC<{ src?: string; alt?: string }> = ({
    src,
    alt,
  }) => {
    if (!src) return null;

    return (
      <div className="relative group my-4">
        <div
          className="relative rounded-lg overflow-hidden cursor-pointer transition-transform duration-200 hover:scale-[1.02]"
          onClick={() => setSelectedImage(src)}
        >
          <img
            src={src}
            alt={alt || "Image"}
            className="w-full max-w-md rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div className="bg-black/50 backdrop-blur-sm rounded-full p-2">
                <ZoomIn className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </div>
        {alt && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 italic">
            {alt}
          </p>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="prose prose-sm dark:prose-invert max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            code: CodeBlock,
            img: ImageComponent,
            // Custom styling for other elements
            h1: ({ children }) => (
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4 mt-6">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3 mt-5">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2 mt-4">
                {children}
              </h3>
            ),
            p: ({ children }) => (
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                {children}
              </p>
            ),
            ul: ({ children }) => (
              <ul className="list-disc list-inside space-y-1 mb-3 text-gray-700 dark:text-gray-300">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal list-inside space-y-1 mb-3 text-gray-700 dark:text-gray-300">
                {children}
              </ol>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-primary-500 pl-4 py-2 my-4 bg-primary-50/50 dark:bg-primary-900/20 rounded-r-lg">
                <div className="text-gray-700 dark:text-gray-300 italic">
                  {children}
                </div>
              </blockquote>
            ),
            table: ({ children }) => (
              <div className="overflow-x-auto my-4">
                <table className="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg">
                  {children}
                </table>
              </div>
            ),
            th: ({ children }) => (
              <th className="px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 text-left font-semibold text-gray-800 dark:text-gray-200">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                {children}
              </td>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>

      {selectedImage && (
        <ImageModal
          src={selectedImage}
          alt="Selected image"
          isOpen={!!selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </>
  );
};
