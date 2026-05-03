function preprocessText(text = "") {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 1);
}

function vectorizeText(texts) {
  const tokenizedTexts = texts.map((text) => preprocessText(text));
  const vocabulary = [];
  const vocabularyIndex = new Map();
  const documentFrequencies = new Map();

  tokenizedTexts.forEach((tokens) => {
    const uniqueTokens = new Set(tokens);

    uniqueTokens.forEach((token) => {
      if (!vocabularyIndex.has(token)) {
        vocabularyIndex.set(token, vocabulary.length);
        vocabulary.push(token);
      }

      documentFrequencies.set(token, (documentFrequencies.get(token) || 0) + 1);
    });
  });

  const totalDocuments = tokenizedTexts.length;
  const vectors = tokenizedTexts.map((tokens) => {
    const termCounts = new Map();
    tokens.forEach((token) => {
      termCounts.set(token, (termCounts.get(token) || 0) + 1);
    });

    const maxTermFrequency = Math.max(...termCounts.values(), 1);
    const vector = new Array(vocabulary.length).fill(0);

    vocabulary.forEach((token, index) => {
      const termFrequency = (termCounts.get(token) || 0) / maxTermFrequency;
      const inverseDocumentFrequency = Math.log((1 + totalDocuments) / (1 + (documentFrequencies.get(token) || 0))) + 1;
      vector[index] = Number((termFrequency * inverseDocumentFrequency).toFixed(8));
    });

    return vector;
  });

  return {
    vocabulary,
    vectors,
  };
}

function cosineSimilarity(vectorA = [], vectorB = []) {
  if (vectorA.length !== vectorB.length || vectorA.length === 0) {
    return 0;
  }

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let index = 0; index < vectorA.length; index += 1) {
    dotProduct += vectorA[index] * vectorB[index];
    magnitudeA += vectorA[index] ** 2;
    magnitudeB += vectorB[index] ** 2;
  }

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }

  return dotProduct / (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB));
}

module.exports = {
  preprocessText,
  vectorizeText,
  cosineSimilarity,
};
