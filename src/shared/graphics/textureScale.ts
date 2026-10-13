let scale = 1

/**
 * Resolution multiplier for every painted canvas texture. The low quality tier paints at
 * half size, which quarters the pixels to draw, upload and keep on weak devices.
 */
export function setTextureScale(next: number): void {
  scale = next
}

export function getTextureScale(): number {
  return scale
}
