export const CAT_BASE = { x: 604, y: 760 }
export const EAR_PIVOT = { x: 631, y: 602 }

export const HAUNCH = 'M612 672 C584 664, 555 682, 552 714 C550 740, 557 760, 572 760 L612 760 Z'
export const HIND_PAW = 'M568 760 C568 745, 590 745, 590 760'
export const HAUNCH_FOLD = 'M574 748 C568 732, 578 716, 598 712'
export const BODY =
  'M596 652 C585 662, 580 684, 586 710 C589 730, 589 748, 589 760 L643 760 C643 748, 644 730, 646 710 C651 684, 645 662, 634 652 C622 660, 606 660, 596 652 Z'
export const BIB =
  'M601 666 C597 686, 599 700, 608 708 L624 708 C632 700, 634 686, 630 666 C622 672, 610 672, 601 666 Z'
export const LEG_SPLIT = 'M616 706 C615 722, 615 740, 616 750'
export const PAWS = 'M589 760 C589 741, 614 741, 614 760 M618 760 C618 741, 643 741, 643 760'
export const TOES = 'M598 747 l0 4 M605 747 l0 4 M627 747 l0 4 M634 747 l0 4'
export const COLLAR =
  'M593 657 C603 667, 627 668, 639 657 C638 667, 628 673, 616 673 C604 673, 594 667, 593 657 Z'
export const HEAD =
  'M583 614 C581 628, 588 646, 604 652 C612 655, 624 655, 632 650 C641 644, 645 632, 644 618 C643 606, 636 598, 626 596 L598 596 C589 597, 584 604, 583 614 Z'
export const EAR_LEFT = 'M585 607 C583 596, 582 588, 581 581 C590 586, 598 592, 605 597'
export const EAR_RIGHT = 'M640 607 C642 596, 644 588, 645 581 C637 586, 629 592, 622 597'
export const EAR_LEFT_INNER = 'M588 603 L585 588 L600 597 Z'
export const EAR_RIGHT_INNER = 'M637 603 L640 588 L625 597 Z'
export const EAR_TUFTS = 'M591 600 l3 -5 M595 602 l3 -4 M634 600 l-3 -5 M630 602 l-3 -4'
export const FOREHEAD = 'M602 612 L606 604 L610 613 L614 604 L618 613 L622 604 L626 612'
export const CHEEK_STRIPES = 'M585 624 l7 2 M585 632 l8 1 M643 626 l-7 2 M643 634 l-8 1'
export const RUFFS = 'M583 622 l-3 2 l3 2 l-3 3 l4 1 M644 624 l3 2 l-3 2 l3 3 l-4 1'
export const MUZZLE =
  'M601 632 C599 643, 607 650, 617 650 C627 650, 635 644, 633 633 C627 636, 607 636, 601 632 Z'
interface Eye {
  x0: number
  x1: number
  y: number
  inset: number
  top: number
  bottom: number
}

const LEFT_EYE: Eye = { x0: 592.5, x1: 607.5, y: 621, inset: 3, top: 614.5, bottom: 627 }
const RIGHT_EYE: Eye = { x0: 620.5, x1: 633.5, y: 622, inset: 2.5, top: 615.5, bottom: 628 }
const LID_MEET = 0.72

function eyeShape(eye: Eye, upper: number, lower: number): string {
  const a = eye.x0 + eye.inset
  const b = eye.x1 - eye.inset
  const u = upper.toFixed(2)
  const l = lower.toFixed(2)
  return `M${eye.x0} ${eye.y} C${a} ${u}, ${b} ${u}, ${eye.x1} ${eye.y} C${b} ${l}, ${a} ${l}, ${eye.x0} ${eye.y} Z`
}

export function eyesPath(closed: number): string {
  return [LEFT_EYE, RIGHT_EYE]
    .map((eye) => {
      const meet = eye.top + (eye.bottom - eye.top) * LID_MEET
      return eyeShape(
        eye,
        eye.top + (meet - eye.top) * closed,
        eye.bottom + (meet - eye.bottom) * closed,
      )
    })
    .join(' ')
}
export const NOSE = 'M613 633 L622 633 L617.5 639 Z'
export const MOUTH =
  'M617.5 639 L617.5 642 C617 646, 612 647, 609.5 644 M617.5 642 C618 646, 623 647, 625.5 644'
export const WHISKER_DOTS = 'M608 639 l0.4 0 M605 643 l0.4 0 M627 640 l0.4 0 M630 644 l0.4 0'
export const WHISKERS =
  'M606 638 l-30 -7 M605 642 l-32 0 M606 646 l-28 8 M629 639 l28 -7 M630 643 l30 0 M629 647 l26 8'
export const BROWS = 'M596 613 l-6 -11 M600 612 l-2 -12 M628 614 l5 -11 M625 613 l1 -12'

function hatch(x: number, y: number, dx: number, dy: number, count: number, gap: number): string {
  const len = Math.hypot(dx, dy) || 1
  const nx = (-dy / len) * gap
  const ny = (dx / len) * gap
  const marks: string[] = []
  for (let i = 0; i < count; i++) {
    marks.push(`M${(x + nx * i).toFixed(1)} ${(y + ny * i).toFixed(1)} l${dx} ${dy}`)
  }
  return marks.join(' ')
}

function tuft(x: number, y: number, angle: number, length = 5): string {
  const a = (angle * Math.PI) / 180
  return `M${x} ${y} l${(Math.cos(a) * length).toFixed(1)} ${(Math.sin(a) * length).toFixed(1)}`
}

export const HAUNCH_STRIPES = [
  hatch(566, 690, 10, -4, 2, 3.5),
  hatch(560, 710, 12, -3, 2, 3.5),
  hatch(562, 730, 10, -2, 2, 3.5),
  hatch(584, 682, 9, -5, 2, 3.5),
].join(' ')

export const BACK_STRIPES = [
  hatch(588, 672, 8, 5, 2, 3.5),
  hatch(584, 694, 7, 6, 2, 3.5),
  hatch(590, 720, 6, 7, 2, 3.5),
  hatch(646, 686, -6, 7, 2, 3.5),
  hatch(644, 716, -5, 8, 2, 3.5),
].join(' ')

export const SHADE = [
  hatch(585, 678, 4, 5, 4, 3),
  hatch(638, 676, 4, 5, 4, 3),
  hatch(592, 656, 3, 3, 3, 2.5),
  hatch(632, 656, -3, 3, 3, 2.5),
].join(' ')

export const COAT_FUR = [
  tuft(582, 640, 200),
  tuft(586, 648, 210),
  tuft(640, 644, -20),
  tuft(554, 700, 185),
  tuft(552, 722, 180),
  tuft(556, 742, 175),
  tuft(566, 680, 215),
  tuft(584, 668, 230),
  tuft(583, 690, 190),
  tuft(584, 716, 185),
  tuft(648, 690, -5),
  tuft(646, 716, -5),
].join(' ')

interface Point {
  x: number
  y: number
}

function cubic(p0: Point, p1: Point, p2: Point, p3: Point, t: number): Point {
  const u = 1 - t
  return {
    x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
    y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
  }
}

function tailCentre(t: number, sway: number): Point {
  const dx = sway * 3
  const dy = sway * -2.5
  if (t < 0.5) {
    return cubic(
      { x: 562, y: 720 },
      { x: 528, y: 732 },
      { x: 536, y: 766 },
      { x: 606, y: 756 },
      t * 2,
    )
  }
  return cubic(
    { x: 606, y: 756 },
    { x: 640, y: 755 },
    { x: 668, y: 752 + dy * 0.4 },
    { x: 660 + dx, y: 736 + dy },
    (t - 0.5) * 2,
  )
}

const TAIL_STEPS = 28
export const TAIL_SPLIT = 0.225

function tailWidth(t: number): number {
  return 6 - t * 3.6
}

function tailEdge(t: number, sway: number): [Point, Point] {
  const p = tailCentre(t, sway)
  const q = tailCentre(Math.min(1, t + 0.01), sway)
  const len = Math.hypot(q.x - p.x, q.y - p.y) || 1
  const w = tailWidth(t)
  const nx = (-(q.y - p.y) / len) * w
  const ny = ((q.x - p.x) / len) * w
  return [
    { x: p.x + nx, y: p.y + ny },
    { x: p.x - nx, y: p.y - ny },
  ]
}

const pt = (p: Point) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`

export function tailPath(sway: number, from = 0, to = 1): string {
  const left: string[] = []
  const right: string[] = []
  const steps = Math.max(2, Math.round(TAIL_STEPS * (to - from)))
  for (let i = 0; i <= steps; i++) {
    const t = from + ((to - from) * i) / steps
    const [a, b] = tailEdge(t, sway)
    left.push(pt(a))
    right.push(pt(b))
  }
  const cap: string[] = []
  if (to === 1) {
    const tip = tailCentre(1, sway)
    const back = tailCentre(0.97, sway)
    const len = Math.hypot(tip.x - back.x, tip.y - back.y) || 1
    const r = tailWidth(1)
    cap.push(
      pt({ x: tip.x + ((tip.x - back.x) / len) * r, y: tip.y + ((tip.y - back.y) / len) * r }),
    )
  }
  return `M${[...left, ...cap, ...right.reverse()].join(' L')}`
}

export const TAIL_ROOT = tailPath(0, 0, TAIL_SPLIT + 0.03)

export function tailStripes(sway: number): string {
  const marks: string[] = []
  for (const t of [0.34, 0.47, 0.6, 0.73, 0.85]) {
    const [a, b] = tailEdge(t, sway)
    const c = tailCentre(t, sway)
    const k = 0.6
    marks.push(
      `M${pt({ x: c.x + (a.x - c.x) * k, y: c.y + (a.y - c.y) * k })} L${pt({ x: c.x + (b.x - c.x) * k, y: c.y + (b.y - c.y) * k })}`,
    )
  }
  return marks.join(' ')
}
