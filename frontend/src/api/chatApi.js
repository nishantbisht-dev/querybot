import axiosInstance from "./axiosInstance";

export const askQuestionApi = async ({ question, chatId }) => {
  const response = await axiosInstance.post("/chats/ask", {
    question,
    chatId,
  });

  return response.data;
};

export const getChatsApi = async () => {
  const response = await axiosInstance.get("/chats");
  return response.data;
};

export const getSingleChatApi = async (chatId) => {
  const response = await axiosInstance.get(`/chats/${chatId}`);
  return response.data;
};

export const deleteChatApi = async (chatId) => {
  const response = await axiosInstance.delete(`/chats/${chatId}`);
  return response.data;
};