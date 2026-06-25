import fs from "fs";
import path from "path";
import pdfParse from "pdf-parse";

const cleanText = (text) => {
  return text
    .replace(/\r/g, " ")
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

export const extractDocumentText = async (filePath, originalFileName) => {
  try {
    const extension = path.extname(originalFileName).toLowerCase();

    if (extension === ".pdf") {
      const fileBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(fileBuffer);
      const text = cleanText(pdfData.text);

      if (!text || text.length < 50) {
        throw new Error(
          "Could not extract enough readable text from the PDF file"
        );
      }

      return {
        text,
        fileType: "pdf",
      };
    }

    if (extension === ".txt") {
      const rawText = fs.readFileSync(filePath, "utf-8");
      const text = cleanText(rawText);

      if (!text || text.length < 50) {
        throw new Error("TXT file must contain at least 50 readable characters");
      }

      return {
        text,
        fileType: "txt",
      };
    }

    throw new Error("Unsupported file type");
  } catch (error) {
    throw new Error(`Document text extraction failed: ${error.message}`);
  }
};