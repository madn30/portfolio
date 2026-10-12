import { accentHex } from '@/data/siteConfig'
import { STICKER_SIZE, hatchRect, stickerSlot } from '@/features/entrance/frontDoorGeometry'
import { CREAM, INK, WOOD_DARK } from '@/features/entrance/shared'

const ACCENTS = Object.values(accentHex)
const HALF_W = STICKER_SIZE.width / 2
const HALF_H = STICKER_SIZE.height / 2
const RADIUS = 6
const EAR = 8

const BODY = [
  `M${-HALF_W + RADIUS} ${-HALF_H}`,
  `H${HALF_W - RADIUS}`,
  `a${RADIUS} ${RADIUS} 0 0 1 ${RADIUS} ${RADIUS}`,
  `V${HALF_H - EAR}`,
  `L${HALF_W - EAR} ${HALF_H}`,
  `H${-HALF_W + RADIUS}`,
  `a${RADIUS} ${RADIUS} 0 0 1 ${-RADIUS} ${-RADIUS}`,
  `V${-HALF_H + RADIUS}`,
  `a${RADIUS} ${RADIUS} 0 0 1 ${RADIUS} ${-RADIUS}`,
  'Z',
].join(' ')

const EAR_PATH = `M${HALF_W} ${HALF_H - EAR}L${HALF_W - EAR} ${HALF_H}Q${HALF_W - EAR + 1} ${HALF_H - EAR + 2} ${HALF_W - 1.5} ${HALF_H - EAR + 0.5}Z`

const SHADOW = hatchRect(
  { x: -HALF_W + 2.5, y: -HALF_H + 3, width: STICKER_SIZE.width, height: STICKER_SIZE.height },
  2.6,
)

const GLOSS = hatchRect({ x: -HALF_W + 4, y: -HALF_H + 3, width: 12, height: 7 }, 3)

interface StickerProps {
  label: string
  index: number
  painted: boolean
}

export function Sticker({ label, index, painted }: StickerProps) {
  const slot = stickerSlot(index)
  const accent = ACCENTS[index % ACCENTS.length]
  return (
    <g
      transform={`translate(${slot.x.toFixed(1)} ${slot.y.toFixed(1)}) rotate(${slot.rotate.toFixed(1)})`}
    >
      <path d={SHADOW} stroke={INK} strokeWidth="0.8" opacity="0.45" />
      <path
        d={BODY}
        fill={painted ? accent : CREAM}
        stroke={INK}
        strokeWidth="1.6"
        opacity={painted ? 0.92 : 1}
      />
      <path
        d={`M${-HALF_W + 4} ${-HALF_H + 2.4}H${-HALF_W + 18}`}
        stroke={INK}
        strokeWidth="0.8"
        opacity="0.5"
      />
      <path d={EAR_PATH} fill={WOOD_DARK} stroke={INK} strokeWidth="0.8" />
      {painted && <path d={GLOSS} stroke={CREAM} strokeWidth="1.2" opacity="0.7" />}
      <text
        y="0.5"
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="Caveat, cursive"
        fontSize="16"
        fontWeight="600"
        fill={painted ? CREAM : INK}
      >
        {label}
      </text>
    </g>
  )
}
