import axiosInstance from "./axiosInstance";

export const uploadDocumentApi = async ({ title, documentFile }) => {
  const formData = new FormData();

  formData.append("title", title);
  formData.append("document", documentFile);

  const response = await axiosInstance.post("/documents", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const getDocumentsApi = async () => {
  const response = await axiosInstance.get("/documents");
  return response.data;
};

export const getSingleDocumentApi = async (documentId) => {
  const response = await axiosInstance.get(`/documents/${documentId}`);
  return response.data;
};

export const deleteDocumentApi = async (documentId) => {
  const response = await axiosInstance.delete(`/documents/${documentId}`);
  return response.data;
};