export function sketchRect(
  ctx: CanvasRenderingContext2D,
  random: () => number,
  x: number,
  y: number,
  w: number,
  h: number,
  width = 2.4,
  alpha = 0.9,
): void {
  for (let pass = 0; pass < 2; pass++) {
    ctx.globalAlpha = pass === 0 ? alpha : alpha * 0.45
    ctx.lineWidth = pass === 0 ? width : width * 0.6
    ctx.beginPath()
    const pts: [number, number][] = [
      [x, y],
      [x + w, y],
      [x + w, y + h],
      [x, y + h],
    ]
    pts.forEach(([px, py], i) => {
      const jx = px + (random() - 0.5) * 5
      const jy = py + (random() - 0.5) * 5
      if (i === 0) ctx.moveTo(jx, jy)
      else ctx.lineTo(jx, jy)
    })
    ctx.closePath()
    ctx.stroke()
  }
  ctx.globalAlpha = 1
}

export function hatch(
  ctx: CanvasRenderingContext2D,
  random: () => number,
  x: number,
  y: number,
  w: number,
  h: number,
  gap = 9,
  alpha = 0.22,
): void {
  ctx.save()
  ctx.beginPath()
  ctx.rect(x, y, w, h)
  ctx.clip()
  ctx.globalAlpha = alpha
  ctx.lineWidth = 1
  for (let d = -h; d < w + h; d += gap) {
    ctx.beginPath()
    ctx.moveTo(x + d + (random() - 0.5) * 2, y)
    ctx.lineTo(x + d - h + (random() - 0.5) * 2, y + h)
    ctx.stroke()
  }
  ctx.restore()
  ctx.globalAlpha = 1
}
