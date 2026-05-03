export function formatDate(value) {
  return new Date(value).toLocaleString();
}

export function truncateHash(hash = "") {
  return `${hash.slice(0, 12)}...${hash.slice(-12)}`;
}
