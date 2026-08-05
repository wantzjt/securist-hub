/** Lightweight share-safe content hash (not cryptographic strength for secrets). */
export function contentHash(input: string): string {
  let h = 2166136261
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return `h${(h >>> 0).toString(16).padStart(8, '0')}`
}
