/**
 * Full-page paper grain and vignette layered over everything (canvas and DOM alike),
 * so the 3D scene and the HTML panels share one sheet of paper.
 */
export function PaperOverlay() {
  return (
    <>
      <div className="paper-vignette" aria-hidden="true" />
      <div className="paper-grain" aria-hidden="true" />
    </>
  )
}
