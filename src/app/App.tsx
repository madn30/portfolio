import { lazy, Suspense, useEffect, useLayoutEffect } from 'react'
import { useRoute } from './router'
import { cancelPendingNavigation } from './navigation'
import { ErrorBoundary } from '@/components/layout/ErrorFallback'
import { LoadingScreen } from '@/components/layout/LoadingScreen'
import { Navigation } from '@/components/layout/Navigation'
import { PaperOverlay } from '@/components/layout/PaperOverlay'
import { StationNotes } from '@/components/layout/StationNotes'
import { StaticCorridor } from '@/components/fallback/StaticCorridor'
import { SceneTransition } from '@/components/scene/SceneTransition'
import { AboutSection } from '@/components/sections/AboutSection'
import { ContactSection } from '@/components/sections/ContactSection'
import { ExperienceSection } from '@/components/sections/ExperienceSection'
import { IntroSection } from '@/components/sections/IntroSection'
import { ProjectsSection } from '@/components/sections/ProjectsSection'
import { SkillsSection } from '@/components/sections/SkillsSection'
import { useDeviceProfile } from '@/hooks/useDeviceProfile'
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useScrollProgress } from '@/hooks/useScrollProgress'
import { useWebGLSupport } from '@/hooks/useWebGLSupport'
import { setWorld, useWorld, worldRefs } from '@/store/worldStore'
import { doorStationProgress, getDoor, SCROLL_PAGES, scrollToProgress } from '@/utils/corridor'

// The WebGL scene (three.js + R3F) is the heaviest chunk; load it only when it can run.
const CorridorScene = lazy(() => import('@/components/scene/CorridorScene'))

function usePointerParallax(enabled: boolean): void {
  useEffect(() => {
    if (!enabled) return
    const onMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return
      worldRefs.pointerX = (event.clientX / window.innerWidth) * 2 - 1
      worldRefs.pointerY = -((event.clientY / window.innerHeight) * 2 - 1)
    }
    const onLeave = () => {
      worldRefs.pointerX = 0
      worldRefs.pointerY = 0
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerleave', onLeave)
    return () => {
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerleave', onLeave)
      onLeave()
    }
  }, [enabled])
}

export default function App() {
  const route = useRoute()
  const webgl = useWebGLSupport()
  const profile = useDeviceProfile()
  const reducedMotion = useReducedMotion()
  const sceneFailed = useWorld((s) => s.sceneFailed)
  const sceneReady = useWorld((s) => s.sceneReady)

  const show3D = webgl && !sceneFailed
  const sectionOpen = route.section !== 'home'

  useScrollProgress(show3D)
  usePointerParallax(show3D && !profile.touch && !reducedMotion)
  useLockBodyScroll(sectionOpen)

  // Keep the world in sync with the URL (covers Back/Forward and deep links).
  useEffect(() => {
    cancelPendingNavigation()
    setWorld({
      activeDoor: route.section === 'home' ? null : route.section,
      enteringDoor: null,
      hoveredDoor: null,
    })
    // Stand in front of the door whose section is open (covers nav clicks, typed hashes,
    // and Back/Forward) so closing it leaves the visitor at that door.
    if (route.section !== 'home' && show3D) {
      scrollToProgress(doorStationProgress(getDoor(route.section)), false)
    }
  }, [route.section, show3D])

  // On a deep link, stand in front of the matching door so closing the section feels right.
  useLayoutEffect(() => {
    if (route.section !== 'home') {
      setWorld({ introDone: true })
      scrollToProgress(doorStationProgress(getDoor(route.section)), false)
    }
    // Intentionally runs once on mount only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Reflect the current section in the document title.
  useEffect(() => {
    const base = document.title.split(' · ').pop() ?? document.title
    document.title = route.section === 'home' ? base : `${getDoor(route.section).label} · ${base}`
  }, [route.section])

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-md focus:bg-ink focus:px-4 focus:py-2 focus:text-cream"
      >
        Skip to content
      </a>

      <Navigation route={route} />

      <main id="main-content">
        {show3D ? (
          <>
            {/* The page scrolls; the camera walks. */}
            <div aria-hidden="true" style={{ height: `${SCROLL_PAGES * 100}vh` }} />
            <ErrorBoundary
              onError={() => setWorld({ sceneFailed: true, sceneReady: false })}
              fallback={null}
            >
              <Suspense fallback={null}>
                <CorridorScene profile={profile} reducedMotion={reducedMotion} />
              </Suspense>
            </ErrorBoundary>
            <LoadingScreen visible={!sceneReady} />
            <IntroSection layout="world" hidden={sectionOpen} />
            <StationNotes visible={!sectionOpen} touch={profile.touch} />
          </>
        ) : (
          <>
            <IntroSection layout="static" />
            <StaticCorridor reason={sceneFailed ? 'failed' : 'unsupported'} />
          </>
        )}

        {route.section === 'about' && <AboutSection />}
        {route.section === 'projects' && <ProjectsSection projectId={route.projectId} />}
        {route.section === 'skills' && <SkillsSection />}
        {route.section === 'experience' && <ExperienceSection />}
        {route.section === 'contact' && <ContactSection />}
      </main>

      <SceneTransition />
      <PaperOverlay />
    </>
  )
}
