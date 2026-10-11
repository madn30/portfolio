/** True for http(s) and mailto URLs; false for empty strings or anything unparsable. */
export function isSafeExternalUrl(url: string | undefined): url is string {
  if (!url) return false
  try {
    const parsed = new URL(url)
    return (
      parsed.protocol === 'https:' || parsed.protocol === 'http:' || parsed.protocol === 'mailto:'
    )
  } catch {
    return false
  }
}
