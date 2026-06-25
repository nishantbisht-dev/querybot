import axiosInstance from "./axiosInstance";

export const getDashboardStatsApi = async () => {
  const [chatsResponse, documentsResponse] = await Promise.allSettled([
    axiosInstance.get("/chats"),
    axiosInstance.get("/documents"),
  ]);

  const chats =
    chatsResponse.status === "fulfilled"
      ? chatsResponse.value.data.chats || []
      : [];

  const documents =
    documentsResponse.status === "fulfilled"
      ? documentsResponse.value.data.documents || []
      : [];

  return {
    chats,
    documents,
    totalChats: chats.length,
    totalDocuments: documents.length,
  };
};