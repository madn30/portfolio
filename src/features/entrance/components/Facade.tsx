import {
  BRASS,
  BRICK,
  BRICK_DARK,
  BRICK_LIGHT,
  BRICK_SHADE,
  GLASS,
  GLOW,
  INK,
  LEAF_DARK,
  METAL,
  METAL_DARK,
  MORTAR,
  OPENING,
  PAVEMENT,
  STONE,
  WOOD,
  WOOD_DARK,
} from '@/features/entrance/shared'
import {
  ARCH,
  BRICK_TILE,
  PLINTH_TOP,
  brickTile,
  characterBricks,
  fanlightBars,
  pavement,
  plinthJoints,
  quoins,
  voussoirJoints,
} from './facadeGeometry'

const STONE_LIGHT = '#b9c1c8'
const STONE_DARK = '#7f8891'
const FLAME = '#f08a2c'
const LAMP_GLASS = '#fff1b8'
const HATCH = 'url(#facade-hatch)'
const CROSS = 'url(#facade-cross)'
const UNITS = 'userSpaceOnUse'
const TREADS = [
  { tread: 'M680 772H920L928 784H672Z', riser: [672, 784, 256, 24] },
  { tread: 'M672 808H928L940 822H660Z', riser: [660, 822, 280, 28] },
  { tread: 'M660 850H940L954 866H646Z', riser: [646, 866, 308, 26] },
] as const
const PIPE_BANDS = [
  [1552, 118, 22, 10],
  [1552, 338, 22, 10],
  [1552, 558, 22, 10],
  [1554, 250, 18, 12],
  [1554, 470, 18, 12],
  [1554, 690, 18, 12],
] as const

const box = ([x, y, width, height]: readonly [number, number, number, number]) => ({
  x,
  y,
  width,
  height,
})

function Defs() {
  const shade = { width: 7, height: 7, patternUnits: UNITS, patternTransform: 'rotate(-35)' }
  return (
    <defs>
      <pattern
        id="facade-bricks"
        {...box([0, 0, BRICK_TILE.width, BRICK_TILE.height])}
        patternUnits={UNITS}
      >
        <path d={brickTile.tones[0]} fill={BRICK} />
        <path d={brickTile.tones[1]} fill={BRICK_LIGHT} />
        <path d={brickTile.tones[2]} fill={BRICK_DARK} />
        <path d={brickTile.shaded} fill={BRICK_SHADE} opacity="0.4" />
        <path d={brickTile.outlines} fill="none" stroke={INK} strokeWidth="1" opacity="0.45" />
        <path d={brickTile.hatched} fill="none" stroke={BRICK_SHADE} strokeWidth="0.9" />
      </pattern>
      <pattern id="facade-hatch" {...shade}>
        <line x1="0" y1="0" x2="0" y2="7" stroke={INK} strokeWidth="1" opacity="0.22" />
      </pattern>
      <pattern id="facade-cross" {...shade}>
        <path d="M0 0V7M0 3.5H7" stroke={INK} strokeWidth="0.9" opacity="0.24" fill="none" />
      </pattern>
      <pattern id="facade-grain" {...shade} width="13" height="13">
        <line x1="0" y1="0" x2="0" y2="13" stroke={INK} strokeWidth="0.8" opacity="0.09" />
      </pattern>
      <mask id="facade-hole">
        <rect width="1600" height="900" fill="#fff" />
        <rect {...box([OPENING.x, OPENING.y, OPENING.width, OPENING.height])} fill="#000" />
      </mask>
    </defs>
  )
}

function Wall() {
  return (
    <g>
      <rect width="1600" height="900" fill={MORTAR} />
      <rect width="1600" height={PLINTH_TOP} fill="url(#facade-bricks)" />
      <g fill="none" stroke={INK} strokeLinecap="round">
        <path d={characterBricks.dark} stroke={BRICK_SHADE} strokeWidth="0.9" opacity="0.8" />
        <path d={characterBricks.cross} strokeWidth="0.8" opacity="0.22" />
        <path d={characterBricks.cracks} strokeWidth="1.1" opacity="0.55" strokeLinejoin="round" />
      </g>
      <path d={quoins} fill={STONE} stroke={INK} strokeWidth="1.6" />
      <g fill={STONE} stroke={INK} strokeWidth="1.8">
        <rect y="384" width="646" height="12" />
        <rect x="954" y="384" width="646" height="12" />
        <rect y={PLINTH_TOP} width="1600" height="54" />
      </g>
      <rect y="396" width="646" height="7" fill={HATCH} />
      <rect x="954" y="396" width="646" height="7" fill={HATCH} />
      <rect y={PLINTH_TOP} width="1600" height="12" fill={STONE_LIGHT} />
      <g stroke={INK} fill="none">
        <path d="M0 390H646M954 390H1600M0 718H1600" strokeWidth="1" opacity="0.45" />
        <path d={plinthJoints} strokeWidth="1" opacity="0.5" />
      </g>
      <g stroke={INK} fill={STONE_DARK} strokeWidth="1.1">
        <rect x="1408" y="728" width="44" height="22" rx="1" />
        <path d="M1414 733v12M1422 733v12M1430 733v12M1438 733v12M1446 733v12" fill="none" />
      </g>
      <path d="M0 760H1600" stroke={INK} strokeWidth="2.4" fill="none" />
    </g>
  )
}

function Surround() {
  const { cx, cy, innerRx, innerRy, outerRx, outerRy } = ARCH
  const arch = `M${cx - outerRx} ${cy}A${outerRx} ${outerRy} 0 0 1 ${cx + outerRx} ${cy}H${cx + innerRx}A${innerRx} ${innerRy} 0 0 0 ${cx - innerRx} ${cy}Z`
  const frame = `M686 762V${cy}A${innerRx} ${innerRy} 0 0 1 914 ${cy}V762Z`
  return (
    <g>
      <rect x="954" y="396" width="12" height="366" fill={CROSS} />
      <g fill={STONE} stroke={INK} strokeWidth="1.8">
        <rect x="652" y="412" width="34" height="310" />
        <rect x="914" y="412" width="34" height="310" />
      </g>
      <g stroke={INK} strokeWidth="1" opacity="0.4" fill="none">
        <path d="M661 426V708M669 426V708M677 426V708M923 426V708M931 426V708M939 426V708" />
        <path d="M646 404H692M908 404H954M646 730H692M908 730H954" />
      </g>
      <rect x="680" y="412" width="6" height="310" fill={HATCH} />
      <rect x="942" y="412" width="6" height="310" fill={HATCH} />
      <rect x="652" y="412" width="34" height="8" fill={CROSS} />
      <rect x="914" y="412" width="34" height="8" fill={CROSS} />
      <g fill={STONE_LIGHT} stroke={INK} strokeWidth="1.8">
        <rect x="646" y="396" width="46" height="16" />
        <rect x="908" y="396" width="46" height="16" />
        <rect x="646" y="722" width="46" height="40" />
        <rect x="908" y="722" width="46" height="40" />
      </g>
      <path d={arch} fill={STONE} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      <path d={voussoirJoints} stroke={INK} strokeWidth="1.4" opacity="0.8" fill="none" />
      <path d="M782 354H818L824 312H776Z" fill={STONE_LIGHT} stroke={INK} strokeWidth="2" />
      <path d="M800 324l8 10-8 10-8-10Z" stroke={INK} strokeWidth="1" opacity="0.5" fill="none" />
      <path d={frame} fill={WOOD_DARK} stroke={INK} strokeWidth="3" />
      <path d={`M695 ${cy}A105 58 0 0 1 905 ${cy}Z`} fill={GLASS} />
      <g stroke={INK} fill="none">
        <path d={fanlightBars} strokeWidth="1.6" />
        <path d={`M742 ${cy}A58 32 0 0 1 858 ${cy}`} strokeWidth="1.4" />
        <path d={`M788 ${cy}A12 12 0 0 1 812 ${cy}Z`} strokeWidth="1.4" fill={WOOD} />
        <path d="M716 392l14-16M724 400l10-12M864 376l10 10" stroke="#fff" opacity="0.7" />
      </g>
      <rect x="686" y="412" width="228" height="13" fill={WOOD} stroke={INK} strokeWidth="1.6" />
      <rect x="686" y="425" width="9" height="336" fill={WOOD} stroke={INK} strokeWidth="1" />
      <rect x="905" y="425" width="9" height="336" fill={WOOD_DARK} stroke={INK} strokeWidth="1" />
      <rect x="905" y="425" width="9" height="336" fill={CROSS} />
      <g fill={GLOW}>
        <ellipse cx="598" cy="505" rx="112" ry="96" opacity="0.08" />
        <ellipse cx="598" cy="505" rx="72" ry="62" opacity="0.1" />
        <ellipse cx="598" cy="505" rx="40" ry="36" opacity="0.14" />
      </g>
    </g>
  )
}

function Pavement() {
  return (
    <g>
      <rect y="760" width="1600" height="140" fill={PAVEMENT} />
      <rect y="760" width="1600" height="140" fill="url(#facade-grain)" />
      <rect y="876" width="1600" height="24" fill={STONE} />
      <g fill="none" stroke={INK} strokeLinecap="round">
        <path d={pavement.joints} strokeWidth="1.1" opacity="0.5" />
        <path d={pavement.cracks} strokeWidth="0.9" opacity="0.45" strokeLinejoin="round" />
        <path d={pavement.pebbles} strokeWidth="1" opacity="0.55" fill={STONE_LIGHT} />
        <path d={pavement.weeds} stroke={LEAF_DARK} strokeWidth="1.3" />
        <path d="M0 876H1600" strokeWidth="1.8" />
        <path d="M0 884H1600" strokeWidth="1" opacity="0.45" />
        <path d="M230 878v20M560 878v20M1120 878v20M1480 878v20" strokeWidth="1" opacity="0.5" />
      </g>
      <rect y="884" width="1600" height="16" fill={HATCH} />
      <rect y="760" width="1600" height="6" fill={CROSS} />
      <g stroke={LEAF_DARK} strokeWidth="1.3" fill="none">
        <path d="M120 760l-6-14M128 760l2-16M136 760l6-12" />
        <path d="M1300 760l-6-14M1308 760l2-16M1316 760l6-12" />
        <path d="M1010 760l-5-12M1017 760l1-15" />
        <path d="M470 760l-5-12M477 760l1-15M484 760l5-11" />
      </g>
      <g stroke={INK} fill="none">
        <ellipse cx="380" cy="826" rx="54" ry="17" fill={METAL} strokeWidth="2" />
        <g strokeWidth="1" opacity="0.6">
          <ellipse cx="380" cy="826" rx="46" ry="13" />
          <path d="M350 820l12 12M362 818l14 14M376 817l14 14M390 817l14 13M404 819l10 10" />
          <path d="M368 826h6M386 826h6" />
        </g>
        <rect x="1090" y="846" width="62" height="22" fill={METAL_DARK} strokeWidth="1.8" />
        <rect x="1096" y="849" width="50" height="16" fill={INK} opacity="0.5" stroke="none" />
        <path d="M1098 850v14M1107 850v14M1116 850v14M1125 850v14M1134 850v14" stroke={METAL} />
      </g>
    </g>
  )
}

function Steps() {
  return (
    <g data-entrance-reveal>
      <rect x="640" y="892" width="320" height="8" fill={CROSS} />
      <rect x="680" y="761" width="240" height="11" fill={STONE} stroke={INK} strokeWidth="1.8" />
      {TREADS.map(({ tread, riser }) => (
        <g key={tread} stroke={INK} strokeWidth="1.8" strokeLinejoin="round">
          <path d={tread} fill={STONE_LIGHT} />
          <rect {...box(riser)} fill={STONE_DARK} />
          <rect {...box(riser)} fill={HATCH} stroke="none" />
        </g>
      ))}
      <g stroke={INK} fill="none" strokeLinecap="round" strokeWidth="1" opacity="0.5">
        <path d="M680 764H920M672 786H928M660 824H940M646 868H954" />
        <path d="M700 778q100 3 200 0M690 815q110 4 220 0M680 858q120 4 240 0" opacity="0.6" />
        <path d="M842 822l3 9-2 7 4 8M706 866l-2 8 3 6M688 794l-4 10M900 836l-5 12" />
      </g>
    </g>
  )
}

function Lantern() {
  const flame = 'M598 517C591 510 592 503 598 495C604 503 605 510 598 517Z'
  return (
    <g data-entrance-reveal>
      <rect {...box([650, 436, 10, 34])} rx="2" fill={METAL_DARK} stroke={INK} strokeWidth="1.6" />
      <circle cx="655" cy="442" r="2" fill={BRASS} />
      <circle cx="655" cy="464" r="2" fill={BRASS} />
      <g fill="none" stroke={INK} strokeLinecap="round">
        <path d="M652 446H598" strokeWidth="3" />
        <path d="M646 448C626 448 612 462 624 474c6 6 12-2 6-6" strokeWidth="2.2" />
        <path d="M602 446c-10 2-12 10-6 12" strokeWidth="1.8" />
        <path d="M598 446V458" strokeWidth="2" />
      </g>
      <circle cx="598" cy="461" r="3.5" fill={BRASS} stroke={INK} strokeWidth="1.4" />
      <path d="M580 480L598 464L616 480Z" fill={METAL_DARK} stroke={INK} strokeWidth="1.8" />
      <path d="M598 466V478" stroke={INK} strokeWidth="1" opacity="0.5" />
      <rect x="577" y="480" width="42" height="5" fill={METAL} stroke={INK} strokeWidth="1.6" />
      <path d="M583 485H613L616 522H580Z" fill={LAMP_GLASS} stroke={INK} strokeWidth="2" />
      <path
        d="M592 485l-1 37M604 485l1 37M581 503h34"
        stroke={INK}
        strokeWidth="1.2"
        opacity="0.7"
      />
      <path d="M586 492l4-5M587 498l6-7" stroke="#fff" strokeWidth="1.2" opacity="0.8" />
      <path d={flame} fill={FLAME} stroke={INK} strokeWidth="1" />
      <path d="M598 513c-3-3-3-7 0-11c3 4 3 8 0 11Z" fill={GLOW} />
      <rect x="579" y="522" width="38" height="5" fill={METAL} stroke={INK} strokeWidth="1.6" />
      <path d="M598 527V533" stroke={INK} strokeWidth="1.6" />
      <circle cx="598" cy="535" r="2.5" fill={BRASS} stroke={INK} strokeWidth="1.2" />
    </g>
  )
}

function Drainpipe() {
  const shoe = 'M1556 742v8q0 8 8 8h20v-10h-12q-2 0-2-2v-4Z'
  return (
    <g data-entrance-reveal>
      <rect x="1556" y="0" width="14" height="742" fill={METAL} stroke={INK} strokeWidth="1.8" />
      <rect x="1565" y="0" width="5" height="742" fill={HATCH} />
      <g fill={METAL_DARK} stroke={INK} strokeWidth="1.4">
        {PIPE_BANDS.map((band) => (
          <rect key={band[1]} {...box(band)} />
        ))}
        <path d="M1548 123h4M1574 123h4M1548 343h4M1574 343h4M1548 563h4M1574 563h4" />
      </g>
      <path d={shoe} fill={METAL} stroke={INK} strokeWidth="1.8" />
      <rect {...box([1570, 762, 30, 12])} fill={METAL_DARK} stroke={INK} strokeWidth="1.6" />
      <path d="M1576 765v6M1582 765v6M1588 765v6M1594 765v6" stroke={METAL} strokeWidth="1" />
    </g>
  )
}

function Fittings() {
  return (
    <g data-entrance-reveal>
      <rect {...box([924, 560, 14, 24])} rx="3" fill={BRASS} stroke={INK} strokeWidth="1.4" />
      <circle cx="931" cy="572" r="4" fill={INK} opacity="0.75" />
      <g fill="none" stroke={METAL_DARK} strokeWidth="2.4" strokeLinecap="round">
        <path d="M966 762V748M988 762V748M966 752H988" />
        <path d="M964 748c-4-4-2-8 2-6M990 748c4-4 2-8-2-6" strokeWidth="1.6" />
      </g>
    </g>
  )
}

export function Facade() {
  return (
    <svg
      viewBox="0 0 1600 900"
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      <Defs />
      <g mask="url(#facade-hole)">
        <Wall />
        <Surround />
      </g>
      <Pavement />
      <Drainpipe />
      <Steps />
      <Lantern />
      <Fittings />
    </svg>
  )
}
