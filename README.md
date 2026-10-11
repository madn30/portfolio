# Illustrated Corridor — an interactive 3D developer portfolio

A portfolio that feels like walking through a hand-drawn architectural sketch. Scroll to walk
down a pencil-lined corridor; each door opens onto a section (About, Projects, Skills,
Experience, Contact). Built with React, TypeScript, Vite, Three.js / React Three Fiber, GSAP,
and Tailwind CSS.

Everything in the scene is procedural — there are no downloaded models or textures. Paper
grain, pencil outlines, door plaques, and the little framed sketches are all generated on an
offscreen canvas or from jittered line geometry at runtime.

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173
```

Other scripts:

| Script                 | What it does                               |
| ---------------------- | ------------------------------------------ |
| `npm run build`        | Type-check and produce a production build  |
| `npm run preview`      | Serve the production build locally         |
| `npm run typecheck`    | `tsc -b` only                              |
| `npm run lint`         | ESLint                                     |
| `npm run format`       | Prettier (write)                           |
| `npm run format:check` | Prettier (check)                           |

Requires Node 20+.

## Make it yours

All content lives in `src/data/` and is plain TypeScript:

| File                     | Contents                                                                                     |
| ------------------------ | -------------------------------------------------------------------------------------------- |
| `siteConfig.ts`          | Name, title, headline, email, social links, form endpoint, and the door definitions          |
| `about.ts`               | Summary, experience paragraph, interests, philosophy, current focus                          |
| `projects.ts`            | Project gallery (id, title, description, tags, image, `demoUrl`, `repoUrl`)                  |
| `skills.ts`              | Skill categories (Frontend, Backend, Architecture, Tooling, Testing)                         |
| `experience.ts`          | Timeline entries (company, role, dates, description, technologies)                           |

Every entry shipped in the repo is placeholder content and is labelled as such in the UI
(`isPlaceholder: true`, `[YOUR NAME]`, `example.com`). Replace it before publishing.

Also update `index.html` (title, description, Open Graph tags) and swap `public/images/og.svg`
for a PNG/JPG social image if you want previews on every platform.

### Project images

Put illustrations in `public/images/projects/` and reference them from `projects.ts`. The
four included SVGs are original line drawings you can keep, edit, or delete. If an image fails
to load, the card falls back to the project title in handwriting.

### Links

- Omit `demoUrl` / `repoUrl` on a project to hide that link. Never point them at placeholders.
- Social links with an empty `url` are hidden.

### Contact form

The form validates input on the client. Behaviour depends on `siteConfig.contact.formEndpoint`:

- **Empty (default):** submitting opens the visitor's email client with the message prefilled
  (`mailto:` to `contact.email`). No fake "sent" message is shown.
- **Set to an endpoint** (Formspree, Basin, Getform, your own API accepting JSON POST):
  the form POSTs `{ name, email, message }` and shows a real success or error state.

Example: `formEndpoint: 'https://formspree.io/f/your-form-id'`.

## How it works

```
src/
  app/            App shell, hash router, navigation actions (open/close sections)
  components/
    scene/        R3F scene: CorridorScene, Corridor, Door, SceneCamera, SceneLighting,
                  InteractiveHotspot, SceneTransition, SketchEdges, details (plant, frames, lamps)
    sections/     DOM panels for each door + the intro
    layout/       Navigation, loading screen, station notes, paper overlay, error boundary
    fallback/     StaticCorridor — the SVG corridor shown when WebGL is unavailable
    ui/           Button, Modal, Tag, ProjectCard, ExternalLink, Doodles
  data/           All editable content
  hooks/          Reduced motion, device tier, WebGL probe, scroll progress, focus trap…
  store/          Tiny external store (useSyncExternalStore) + mutable per-frame refs
  utils/          Corridor geometry maths, sketch-line generator, procedural textures, gsap
```

- **Routing:** hash-based (`#/about`, `#/projects/<id>`), so every section is directly linkable
  and the browser's Back/Forward buttons work.
- **Walking:** the page is tall; scroll position maps to the camera's position along the
  corridor. Mouse position adds a subtle look-around. Touch devices skip the parallax.
- **Doors:** clicking a door (or a nav item) walks the camera to it, swings it open, sweeps a
  sheet of paper across the screen, then opens the section panel. Escape or "Back to the
  corridor" returns you to the same spot.
- **Quality tiers:** phones get a lower pixel ratio, no shadows, fewer details and lights.
  Users who prefer reduced motion get instant transitions and no parallax.
- **Fallbacks:** no WebGL → illustrated SVG corridor with the same links. A crash in the
  scene is caught by an error boundary and swaps in the same fallback.

## Accessibility

- All navigation is available in the DOM (header menu, station "Open" button, fallback list).
- Section panels and the project dialog trap focus, restore it on close, and close on Escape.
- Semantic landmarks and heading order; visible focus rings; `prefers-reduced-motion` honoured.
- The 3D canvas is decorative; the professional information is in HTML.

## Licence

Code: MIT. Illustrations and copy in this repository are original placeholder assets;
replace them with your own.
