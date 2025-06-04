import { useState } from "react";

const useAiChat = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const addMessage = (message) => {
    setMessages((prev) => [...prev, message]);
  };

  const clearMessages = () => {
    setMessages([]);
  };

  const sendMessage = async (prompt) => {
    setIsLoading(true);

    // Add user message
    const userMessage = {
      role: "user",
      content: prompt,
      timestamp: new Date(),
    };
    addMessage(userMessage);

    try {
      const response = await fetch("/api/ai/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Add AI response
      const aiMessage = {
        role: "ai",
        content: data.aiResponse,
        action: data.action,
        actionResult: data.actionResult,
        timestamp: new Date(),
      };

      addMessage(aiMessage);

      return { success: true, data };
    } catch (error) {
      // Add error message
      const errorMessage = {
        role: "ai",
        content: "Sorry, I encountered an error processing your request.",
        error: true,
        timestamp: new Date(),
      };
      addMessage(errorMessage);

      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
    addMessage,
  };
};

export default useAiChat;
