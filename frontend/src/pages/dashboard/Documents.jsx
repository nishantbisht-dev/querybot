import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  AlertCircle,
  Eye,
  FileText,
  Loader2,
  Plus,
  RefreshCw,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import {
  deleteDocumentApi,
  getDocumentsApi,
  getSingleDocumentApi,
  uploadDocumentApi,
} from "../../api/documentApi";
import { useAuth } from "../../context/AuthContext";

const Documents = () => {
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [documentFile, setDocumentFile] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [selectedChunks, setSelectedChunks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const isAdmin = user?.role === "admin";

  const fetchDocuments = async () => {
    try {
      setLoading(true);

      const data = await getDocumentsApi();

      setDocuments(data.documents || []);
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to fetch documents";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchDocuments();
    }
  }, [isAdmin]);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const validTypes = ["application/pdf", "text/plain"];

    if (!validTypes.includes(file.type)) {
      toast.error("Only PDF and TXT files are allowed");
      event.target.value = "";
      setDocumentFile(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5 MB");
      event.target.value = "";
      setDocumentFile(null);
      return;
    }

    setDocumentFile(file);
  };

  const removeFile = () => {
    setDocumentFile(null);

    const fileInput = document.getElementById("document-upload");

    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleUpload = async (event) => {
    event.preventDefault();

    if (!title.trim() || title.trim().length < 3) {
      toast.error("Document title must be at least 3 characters");
      return;
    }

    if (!documentFile) {
      toast.error("Please select a PDF or TXT file");
      return;
    }

    try {
      setUploading(true);

      const data = await uploadDocumentApi({
        title: title.trim(),
        documentFile,
      });

      toast.success(data.message || "Document uploaded successfully");

      setTitle("");
      removeFile();
      await fetchDocuments();
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to upload document";

      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  const handleViewDocument = async (documentId) => {
    try {
      setViewLoading(true);

      const data = await getSingleDocumentApi(documentId);

      setSelectedDocument(data.document);
      setSelectedChunks(data.chunks || []);
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to open document";

      toast.error(message);
    } finally {
      setViewLoading(false);
    }
  };

  const handleDeleteDocument = async (documentId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this document and all related chunks?"
    );

    if (!confirmDelete) return;

    try {
      setDeletingId(documentId);

      const data = await deleteDocumentApi(documentId);

      toast.success(data.message || "Document deleted successfully");

      if (selectedDocument?._id === documentId) {
        setSelectedDocument(null);
        setSelectedChunks([]);
      }

      await fetchDocuments();
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to delete document";

      toast.error(message);
    } finally {
      setDeletingId(null);
    }
  };

  if (!isAdmin) {
    return (
      <div className="glass-card rounded-[2rem] p-8">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600">
          <AlertCircle size={28} />
        </div>

        <h1 className="mt-6 text-3xl font-black text-slate-900">
          Admin Access Required
        </h1>

        <p className="mt-3 max-w-2xl text-slate-600">
          Only admin users can upload, view, and manage knowledge-base
          documents. Customers can use the chat page to ask questions.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900">
            Knowledge Documents
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            Upload PDF or TXT files. QueryBot will extract text, create chunks,
            generate embeddings, and store them for RAG search.
          </p>
        </div>

        <button
          onClick={fetchDocuments}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-70"
        >
          <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="glass-card rounded-[2rem] p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
              <Upload size={24} />
            </div>

            <div>
              <h2 className="text-xl font-black text-slate-900">
                Upload Document
              </h2>
              <p className="text-sm text-slate-500">PDF/TXT, max 5 MB</p>
            </div>
          </div>

          <form onSubmit={handleUpload} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Document Title
              </label>

              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Refund Policy"
                className="soft-input w-full rounded-2xl px-4 py-3 outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Document File
              </label>

              {!documentFile ? (
                <label
                  htmlFor="document-upload"
                  className="flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-[1.5rem] border-2 border-dashed border-violet-200 bg-white/60 px-5 py-8 text-center transition hover:border-violet-400 hover:bg-violet-50/70"
                >
                  <Plus className="mb-3 text-slate-500" size={34} />

                  <span className="font-bold text-slate-800">
                    Click to select file
                  </span>

                  <span className="mt-1 text-sm text-slate-500">
                    PDF or TXT file only
                  </span>

                  <input
                    id="document-upload"
                    type="file"
                    accept=".pdf,.txt,application/pdf,text/plain"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="rounded-2xl border border-green-200 bg-green-50 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-600 text-white">
                        <FileText size={24} />
                      </div>

                      <div>
                        <p className="font-bold text-green-800">
                          File selected
                        </p>

                        <p className="mt-1 break-all text-sm font-medium text-slate-800">
                          {documentFile.name}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {(documentFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={removeFile}
                      className="rounded-lg bg-white p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="primary-btn flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3.5 font-bold disabled:cursor-not-allowed disabled:opacity-70"
            >
              {uploading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Uploading & Embedding...
                </>
              ) : (
                <>
                  <Upload size={20} />
                  Upload Document
                </>
              )}
            </button>
          </form>
        </section>

        <section className="glass-card rounded-[2rem] p-6">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-900">
                Uploaded Documents
              </h2>
              <p className="text-sm text-slate-500">
                {documents.length} document(s) found
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-60 items-center justify-center">
              <Loader2 className="animate-spin text-violet-600" size={38} />
            </div>
          ) : documents.length === 0 ? (
            <div className="flex min-h-60 flex-col items-center justify-center rounded-2xl bg-white/60 p-8 text-center">
              <FileText className="mb-4 text-slate-400" size={48} />
              <h3 className="text-lg font-black text-slate-800">
                No documents yet
              </h3>
              <p className="mt-2 max-w-sm text-sm text-slate-500">
                Upload your first knowledge-base document to start building RAG
                search.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {documents.map((document) => (
                <DocumentCard
                  key={document._id}
                  document={document}
                  deletingId={deletingId}
                  onView={handleViewDocument}
                  onDelete={handleDeleteDocument}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="mt-6 glass-card rounded-[2rem] p-6">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-900">
              Document Chunks
            </h2>
            <p className="text-sm text-slate-500">
              View extracted chunks from a selected document.
            </p>
          </div>

          {selectedDocument && (
            <button
              onClick={() => {
                setSelectedDocument(null);
                setSelectedChunks([]);
              }}
              className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-200"
            >
              Clear
            </button>
          )}
        </div>

        {viewLoading ? (
          <div className="flex min-h-52 items-center justify-center">
            <Loader2 className="animate-spin text-violet-600" size={38} />
          </div>
        ) : !selectedDocument ? (
          <div className="flex min-h-52 flex-col items-center justify-center rounded-2xl bg-white/60 p-8 text-center">
            <Eye className="mb-4 text-slate-400" size={44} />
            <h3 className="text-lg font-black text-slate-800">
              No document selected
            </h3>
            <p className="mt-2 max-w-sm text-sm text-slate-500">
              Click view on any uploaded document to see its extracted chunks.
            </p>
          </div>
        ) : (
          <div>
            <div className="mb-5 rounded-2xl bg-slate-950 p-5 text-white">
              <h3 className="text-lg font-black">{selectedDocument.title}</h3>
              <p className="mt-1 text-sm text-slate-300">
                {selectedDocument.originalFileName} •{" "}
                {selectedDocument.totalChunks} chunks •{" "}
                {selectedDocument.totalCharacters} characters
              </p>
            </div>

            <div className="space-y-4">
              {selectedChunks.map((chunk) => (
                <div
                  key={chunk._id}
                  className="rounded-2xl border border-slate-200 bg-white/75 p-5"
                >
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-700">
                      Chunk #{chunk.chunkIndex}
                    </span>

                    <span className="text-xs font-semibold text-slate-400">
                      {chunk.characterCount} chars
                    </span>
                  </div>

                  <p className="text-sm leading-7 text-slate-700">
                    {chunk.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

const DocumentCard = ({ document, deletingId, onView, onDelete }) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/75 p-5">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div className="flex gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-700">
            <FileText size={24} />
          </div>

          <div>
            <h3 className="font-black text-slate-900">{document.title}</h3>

            <p className="mt-1 break-all text-sm text-slate-500">
              {document.originalFileName}
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase text-slate-600">
                {document.fileType}
              </span>

              <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-700">
                {document.totalChunks} chunks
              </span>

              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                {document.status}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onView(document._id)}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-800"
          >
            <Eye size={16} />
            View
          </button>

          <button
            onClick={() => onDelete(document._id)}
            disabled={deletingId === document._id}
            className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2 text-sm font-bold text-red-600 transition hover:bg-red-100 disabled:opacity-60"
          >
            {deletingId === document._id ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <Trash2 size={16} />
            )}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default Documents;