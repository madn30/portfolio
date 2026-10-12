import { useEffect, useRef } from 'react'
import { accentHex } from '@/data/siteConfig'
import { gsap } from '@/shared/utils/gsap'
import {
  BLUE,
  BRASS,
  CREAM,
  GLASS,
  HAIR,
  INK,
  LEAF,
  METAL_DARK,
  SKIN,
  STONE,
  WOOD_DARK,
  canHover,
} from '@/features/entrance/shared'
import {
  BOOKS,
  FRAME_BOX,
  MEETING_RAIL,
  PANE,
  SASH_DROP,
  SASH_MEMBER,
  SHELF_PLANT,
  SILL,
  SURROUND,
  hatch,
} from './windowGeometry'

const ROOM = '#5b7695'
const SHADOW = '#2b3a4c'

interface PeekWindowProps {
  animate: boolean
}

const paneRight = PANE.x + PANE.width
const paneBottom = PANE.y + PANE.height
const bar1 = PANE.x + PANE.width / 3
const bar2 = PANE.x + (PANE.width * 2) / 3

function frameRing(x: number, y: number, width: number, height: number, member: number): string {
  const inner = width - member * 2
  return `M${x} ${y}h${width}v${height}h${-width}ZM${x + member} ${y + member}h${inner}v${height - member * 2}h${-inner}Z`
}

interface SashProps {
  y: number
  height: number
}

function Sash({ y, height }: SashProps) {
  const top = y + SASH_MEMBER
  const bottom = y + height - SASH_MEMBER
  const mid = (top + bottom) / 2
  const left = PANE.x + SASH_MEMBER
  const right = paneRight - SASH_MEMBER
  const bars = `M${bar1} ${top}V${bottom}M${bar2} ${top}V${bottom}M${left} ${mid}H${right}`
  return (
    <>
      <path d={bars} stroke={CREAM} strokeWidth="4" />
      <path d={bars} stroke={INK} strokeWidth="1.6" />
      <path
        d={`M${bar1 - 3} ${top}V${bottom}M${bar2 - 3} ${top}V${bottom}M${left} ${mid - 3}H${right}`}
        stroke={INK}
        strokeWidth="0.8"
        opacity="0.5"
      />
      <path
        d={frameRing(PANE.x, y, PANE.width, height, SASH_MEMBER)}
        fill={CREAM}
        fillRule="evenodd"
        stroke={INK}
        strokeWidth="1.6"
      />
    </>
  )
}

interface CurtainProps {
  mirror?: boolean
}

function Curtain({ mirror = false }: CurtainProps) {
  return (
    <g transform={mirror ? `translate(${PANE.x + paneRight} 0) scale(-1 1)` : undefined}>
      <path
        d="M1080 404 H1118 C1108 440, 1120 480, 1106 520 C1116 545, 1104 560, 1114 576 H1080 Z"
        fill={CREAM}
        stroke={INK}
        strokeWidth="1.6"
      />
      <path
        d="M1092 404 C1089 460, 1096 520, 1090 576 M1104 404 C1106 450, 1098 500, 1102 540"
        fill="none"
        stroke={INK}
        strokeWidth="0.8"
        opacity="0.6"
      />
    </g>
  )
}

function Interior() {
  return (
    <>
      <rect x={PANE.x} y={PANE.y} width={PANE.width} height={PANE.height} fill={ROOM} />
      <path d={`M${PANE.x} 548H${paneRight}`} stroke={INK} strokeWidth="0.8" opacity="0.6" />
      <path d="M1118 452 H1150 L1158 484 H1110 Z" fill={BRASS} stroke={INK} strokeWidth="1.6" />
      <path d={hatch(1120, 456, 18, 26, 5)} stroke={INK} strokeWidth="0.8" opacity="0.35" />
      <path d="M1134 484 V518" stroke={METAL_DARK} strokeWidth="2.4" />
      <ellipse cx="1134" cy="520" rx="12" ry="3" fill={METAL_DARK} stroke={INK} strokeWidth="1.6" />
      <path d="M1114 522 H1156" stroke={WOOD_DARK} strokeWidth="4" />
      <path d="M1114 522 H1156 M1118 524 V548 M1152 524 V548" stroke={INK} strokeWidth="1.6" />
      <path d="M1170 468 H1248" stroke={WOOD_DARK} strokeWidth="4" />
      <path
        d="M1170 468 H1248 M1176 470 v9 l8 -9 M1242 470 v9 l-8 -9"
        fill="none"
        stroke={INK}
        strokeWidth="1.6"
      />
      {BOOKS.map(({ color, ...book }) => (
        <rect key={book.x} {...book} fill={color} stroke={INK} strokeWidth="1.6" />
      ))}
      <path
        d="M1210 468 L1215 444 L1222 445 L1218 468 Z"
        fill={accentHex.plum}
        stroke={INK}
        strokeWidth="1.6"
      />
      <path d="M1179 448 v12 M1197 447 v14" stroke={CREAM} strokeWidth="0.8" opacity="0.8" />
      <path
        d="M1226 456 h14 l-2 12 h-10 Z"
        fill={accentHex.terracotta}
        stroke={INK}
        strokeWidth="1.6"
      />
      {SHELF_PLANT.map((frond, index) => (
        <path
          key={index}
          d={frond.spine}
          fill="none"
          stroke={LEAF}
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      ))}
      <Curtain />
      <Curtain mirror />
    </>
  )
}

export function PeekWindow({ animate }: PeekWindowProps) {
  const avatar = useRef<SVGGElement>(null)

  useEffect(() => {
    const target = avatar.current
    return () => gsap.killTweensOf(target)
  }, [])

  const peek = (out: boolean) => {
    if (!animate || !canHover() || !avatar.current) return
    gsap.to(avatar.current, {
      x: out ? 0 : 150,
      rotation: out ? 6 : 0,
      transformOrigin: '50% 100%',
      duration: out ? 0.5 : 0.4,
      ease: out ? 'back.out(1.7)' : 'power2.in',
      overwrite: true,
    })
  }

  return (
    <g data-entrance-reveal onPointerEnter={() => peek(true)} onPointerLeave={() => peek(false)}>
      <rect
        x={SURROUND.x}
        y={SURROUND.y}
        width={SURROUND.width}
        height={SURROUND.height}
        fill={STONE}
        stroke={INK}
        strokeWidth="2.4"
        className="pointer-events-auto"
      />
      <rect
        x={SURROUND.x + 7}
        y={SURROUND.y + 7}
        width={SURROUND.width - 14}
        height={SURROUND.height - 14}
        fill="none"
        stroke={INK}
        strokeWidth="0.8"
      />
      <path
        d={hatch(SURROUND.x + 1, FRAME_BOX.y, FRAME_BOX.x - SURROUND.x - 2, FRAME_BOX.height, 6)}
        stroke={INK}
        strokeWidth="0.8"
        opacity="0.4"
      />
      <rect
        x={FRAME_BOX.x}
        y={FRAME_BOX.y}
        width={FRAME_BOX.width}
        height={FRAME_BOX.height}
        fill={CREAM}
        stroke={INK}
        strokeWidth="1.6"
      />
      <path
        d={`M${SURROUND.x} ${SURROUND.y}L${FRAME_BOX.x} ${FRAME_BOX.y}M${SURROUND.x + SURROUND.width} ${SURROUND.y}L${FRAME_BOX.x + FRAME_BOX.width} ${FRAME_BOX.y}`}
        stroke={INK}
        strokeWidth="0.8"
      />
      <g clipPath="url(#window-pane)">
        <Interior />
        <g ref={avatar} transform="translate(150 0)">
          <path
            d="M1130 576 C 1134 540, 1150 530, 1175 530 C 1200 530, 1216 540, 1220 576 Z"
            fill={BLUE}
            stroke={INK}
            strokeWidth="2"
          />
          <path
            d="M1214 544 C 1228 530, 1236 516, 1238 498"
            fill="none"
            stroke={INK}
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="1240" cy="492" r="8" fill={SKIN} stroke={INK} strokeWidth="1.8" />
          <path
            d="M1236 486 l-2 -7 M1241 485 l1 -8 M1246 487 l4 -6"
            stroke={INK}
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <circle cx="1175" cy="500" r="26" fill={SKIN} stroke={INK} strokeWidth="2" />
          <path
            d="M1150 492 C 1152 472, 1166 466, 1178 470 C 1186 464, 1198 470, 1200 490"
            fill={HAIR}
            stroke={INK}
            strokeWidth="2"
          />
          <circle cx="1166" cy="500" r="2.2" fill={INK} />
          <circle cx="1184" cy="500" r="2.2" fill={INK} />
          <path
            d="M1166 512 q9 8 18 0"
            fill="none"
            stroke={INK}
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </g>
        <rect
          x={PANE.x}
          y={PANE.y}
          width={PANE.width}
          height={PANE.height}
          fill={GLASS}
          opacity="0.28"
        />
        <path
          d={hatch(PANE.x, PANE.y, 118, 96, 8)}
          stroke={CREAM}
          strokeWidth="0.8"
          opacity="0.55"
        />
        <path d={hatch(1186, PANE.y, 84, 54, 13)} stroke={CREAM} strokeWidth="0.8" opacity="0.35" />
        <path d={hatch(1096, 500, 70, 60, 16)} stroke={CREAM} strokeWidth="0.8" opacity="0.25" />
      </g>
      <rect x={PANE.x} y={PANE.y} width={PANE.width} height={SASH_DROP} fill={SHADOW} />
      <Sash y={MEETING_RAIL} height={paneBottom - MEETING_RAIL} />
      <Sash y={PANE.y + SASH_DROP} height={MEETING_RAIL - PANE.y - SASH_DROP} />
      <path
        d={`M${PANE.x} ${MEETING_RAIL}H${paneRight}M${PANE.x} ${MEETING_RAIL + SASH_MEMBER}H${paneRight}`}
        stroke={INK}
        strokeWidth="2.4"
      />
      <path
        d={`M${PANE.x} ${MEETING_RAIL}v10q0 5 ${SASH_MEMBER} 2v-12M${paneRight} ${MEETING_RAIL}v10q0 5 ${-SASH_MEMBER} 2v-12`}
        fill={CREAM}
        stroke={INK}
        strokeWidth="1.6"
      />
      <rect
        x={SILL.x}
        y={SILL.y}
        width={SILL.width}
        height={SILL.height}
        fill={STONE}
        stroke={INK}
        strokeWidth="2.4"
      />
      <path
        d={`M${SILL.x + 4} ${SILL.y + 4}H${SILL.x + SILL.width - 4}M${SILL.x + 3} ${SILL.y + SILL.height - 4}H${SILL.x + SILL.width - 3}`}
        stroke={INK}
        strokeWidth="0.8"
      />
      <path
        d={hatch(SILL.x + 2, SILL.y + SILL.height, SILL.width - 4, 6, 5)}
        stroke={INK}
        strokeWidth="0.8"
        opacity="0.7"
      />
      <path
        d={`M${SILL.x + 2} ${SILL.y + SILL.height + 6}H${SILL.x + SILL.width - 2}`}
        stroke={INK}
        strokeWidth="1.6"
      />
    </g>
  )
}
