export const chunkText = (text, chunkSize = 900, overlap = 120) => {
  if (!text || typeof text !== "string") {
    return [];
  }

  const cleanedText = text.replace(/\s+/g, " ").trim();

  if (!cleanedText) {
    return [];
  }

  const chunks = [];
  let start = 0;
  let chunkIndex = 0;

  while (start < cleanedText.length) {
    const end = Math.min(start + chunkSize, cleanedText.length);
    let chunk = cleanedText.slice(start, end);

    const lastPeriod = chunk.lastIndexOf(".");
    const lastQuestion = chunk.lastIndexOf("?");
    const lastExclamation = chunk.lastIndexOf("!");

    const bestSentenceEnd = Math.max(lastPeriod, lastQuestion, lastExclamation);

    if (
      end < cleanedText.length &&
      bestSentenceEnd > chunkSize * 0.5
    ) {
      chunk = chunk.slice(0, bestSentenceEnd + 1);
    }

    const finalChunk = chunk.trim();

    if (finalChunk.length >= 50) {
      chunks.push({
        chunkIndex,
        content: finalChunk,
        characterCount: finalChunk.length,
      });

      chunkIndex += 1;
    }

    const nextStart = start + finalChunk.length - overlap;

    if (nextStart <= start) {
      start += chunkSize;
    } else {
      start = nextStart;
    }
  }

  return chunks;
};