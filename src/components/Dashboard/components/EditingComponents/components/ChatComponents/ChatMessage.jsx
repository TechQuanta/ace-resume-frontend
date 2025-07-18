import React, { useRef, useEffect } from 'react';
import { MessageSquare, History } from 'lucide-react';
import { motion } from 'framer-motion';

const getMessageBubbleClasses = (msgType, theme) => {
  if (msgType === 'user') {
    return 'bg-blue-500 dark:bg-blue-700 text-white dark:text-gray-100 rounded-tr-none';
  } else {
    return 'bg-gray-200 dark:bg-zinc-700 text-zinc-900 dark:text-gray-100 rounded-tl-none';
  }
};

// This function takes plain text and inserts <b> tags.
// It will be applied to the raw message content *before* markdown parsing.
const highlightRelevantWords = (text, jobDesc) => {
  if (!jobDesc || !jobDesc.trim()) return text;
  // Use a more robust regex to ensure whole words are matched
  const words = jobDesc.toLowerCase().split(/\W+/).filter(Boolean);
  // Sort words by length descending to match longer phrases first, preventing partial matches
  words.sort((a, b) => b.length - a.length);

  // Create a regex to match whole words and escape special characters in words
  const escapedWords = words.map(word => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const regex = new RegExp(`\\b(${escapedWords.join('|')})\\b`, 'gi');

  // Replace matches with <b> tags. marked.js will generally leave HTML tags alone.
  return text.replace(regex, (match) => `<b>${match}</b>`);
};

// Ensure renderMarkdown is destructured from props
const ChatMessages = ({ messages, loading, error, showHistory, theme, fontSize, autoCoverLetterMode, jobDescription, matchJobDescription, renderMarkdown }) => {
  const messagesContainerRef = useRef(null);
  const isInitialMount = useRef(true); // New ref to track initial mount

  useEffect(() => {
    // Prevent scrolling on initial mount unless there are already messages that overflow
    if (isInitialMount.current) {
      isInitialMount.current = false;
      if (messagesContainerRef.current) {
        if (messagesContainerRef.current.scrollHeight > messagesContainerRef.current.clientHeight) {
          messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
      }
      return; // Skip the rest of the effect for initial mount
    }

    // Only scroll if we are in the main chat view, not history
    if (messagesContainerRef.current && !showHistory) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages.length, showHistory, loading]); // Dependencies remain the same for subsequent updates

  // --- UPDATED renderMessageContent function ---
  const renderMessageContent = (msg) => {
    let contentToProcess = msg.content; // Start with the raw content from the message

    // Apply job description highlighting *first* to the raw markdown string.
    // highlightRelevantWords will insert <b> tags, which marked.js should preserve.
    if (msg.type === 'bot' && matchJobDescription && msg.jobDescription && msg.jobDescription.trim()) {
      contentToProcess = highlightRelevantWords(contentToProcess, msg.jobDescription);
    }

    // Now, pass the (potentially highlighted) content to the markdown renderer.
    // The renderMarkdown function (from Chatbot.jsx) already handles:
    // 1. Newline to <br> conversion
    // 2. Markdown parsing (e.g., **bold** to <strong>bold</strong>)
    // 3. HTML sanitization
    return renderMarkdown(contentToProcess); // This returns the { __html: ... } object
  };

  return (
    <div ref={messagesContainerRef} className="flex-1 overflow-y-auto space-y-4 p-4 custom-scrollbar">
      {showHistory ? (
        messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500 italic text-center">
            <History size={48} className="mb-4" />
            <p>Your chat history is empty.</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`p-4 rounded-xl max-w-[80%] break-words shadow-md
                ${getMessageBubbleClasses(msg.type, theme)} ${fontSize}`}>
                {/* Use the updated renderMessageContent for history messages */}
                <span dangerouslySetInnerHTML={renderMessageContent(msg)} />
              </div>
            </div>
          ))
        )
      ) : ( // Normal chat view
        <>
          {messages.length === 0 && !loading ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500 italic text-center">
              <MessageSquare size={48} className="mb-4" />
              <p>Start a conversation by typing a message below.</p>
              {autoCoverLetterMode && <p className="mt-2">In this mode, tell me details for your cover letter!</p>}
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <motion.div
                  className={`p-4 rounded-xl max-w-[80%] break-words shadow-md
                    ${getMessageBubbleClasses(msg.type, theme)} ${fontSize}`}
                  initial={{ opacity: 0, y: 0 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Use the updated renderMessageContent for live chat messages */}
                  <span dangerouslySetInnerHTML={renderMessageContent(msg)} />
                </motion.div>
              </div>
            ))
          )}
          {loading && (
            <div className="flex justify-start">
              <motion.div
                className={`p-4 rounded-xl max-w-[80%] break-words shadow-md bg-gray-200 dark:bg-zinc-700 text-zinc-900 dark:text-gray-100 rounded-tl-none ${fontSize}`}
                initial={{ opacity: 0, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center">
                  <span className="animate-pulse">Typing...</span>
                </div>
              </motion.div>
            </div>
          )}
          {error && (
            <div className="text-red-500 text-center text-sm mt-2 font-medium">
              ⚠️ {error}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ChatMessages;