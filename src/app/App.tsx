import { lazy, Suspense, useEffect, useLayoutEffect } from 'react'
import { useRoute } from './router'
import { installAudioUnlock, play, setAmbience } from './audio'
import { cancelPendingNavigation } from './navigation'
import { ErrorBoundary } from '@/shared/components/ErrorFallback'
import { LoadingScreen } from '@/features/loader'
import { Navigation } from '@/app/components/Navigation'
import { PaperOverlay } from '@/app/components/PaperOverlay'
import { StationNotes } from '@/app/components/StationNotes'
import { EntranceScene } from '@/features/entrance'
import { HotspotHint } from '@/app/components/HotspotHint'
import { WalkerEyes } from '@/app/components/WalkerEyes'
import { ScreenReaderNav } from '@/app/components/ScreenReaderNav'
import { SceneTransition, StaticCorridor } from '@/features/world'
import {
  AboutSection,
  ContactSection,
  ExperienceSection,
  IntroSection,
  ProjectsSection,
  SkillsSection,
} from '@/features/portfolio'
import { siteConfig } from '@/data/siteConfig'
import { useDeviceProfile } from '@/shared/hooks/useDeviceProfile'
import { useDocumentMeta } from '@/shared/hooks/useDocumentMeta'
import { useLockBodyScroll } from '@/shared/hooks/useLockBodyScroll'
import { useReducedMotion } from '@/shared/hooks/useReducedMotion'
import { useWalk } from '@/shared/hooks/useWalk'
import { useWebGLSupport } from '@/shared/hooks/useWebGLSupport'
import { unlock } from '@/features/achievements'
import { setWorld, useWorld, worldRefs, worldStore } from '@/shared/store/worldStore'
import { doorStationProgress, getDoor } from '@/shared/corridor/corridor'
import { walkToProgress } from './walk'

const CorridorScene = lazy(() => import('@/features/world/corridor/components/CorridorScene'))

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
  const entered = useWorld((s) => s.entered)

  const show3D = webgl && !sceneFailed
  const sectionOpen = route.section !== 'home'
  const outside = show3D && !entered && !sectionOpen

  useWalk(show3D, sectionOpen || outside)
  usePointerParallax(show3D && !profile.touch && !reducedMotion && !outside)
  useLockBodyScroll(show3D)
  useDocumentMeta(route.section)

  useEffect(() => installAudioUnlock(), [])

  useEffect(() => {
    setAmbience(!show3D || outside ? null : route.section === 'home' ? 'corridor' : route.section)
  }, [show3D, outside, route.section])

  useEffect(() => {
    cancelPendingNavigation()
    if (route.section === 'home' && worldStore.getState().activeDoor !== null) play('close')
    setWorld((prev) => ({
      activeDoor: route.section === 'home' ? null : route.section,
      enteringDoor: null,
      hoveredDoor: null,
      entered: prev.entered || route.section !== 'home',
      transitionTick:
        prev.activeDoor !== null && route.section !== 'home' && prev.activeDoor !== route.section
          ? prev.transitionTick + 1
          : prev.transitionTick,
    }))
    if (route.section !== 'home') {
      unlock('guest')
      if (show3D) walkToProgress(doorStationProgress(getDoor(route.section)), false)
    }
  }, [route.section, show3D])

  useEffect(() => {
    setWorld({ focusedProject: route.projectId ?? null })
  }, [route.projectId])

  useLayoutEffect(() => {
    if (route.section !== 'home') {
      setWorld({ introDone: true, entered: true })
      walkToProgress(doorStationProgress(getDoor(route.section)), false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-md focus:bg-ink focus:px-4 focus:py-2 focus:text-cream"
      >
        Skip to content
      </a>
      <ScreenReaderNav route={route} />

      {!outside && <Navigation route={route} />}

      <main id="main-content">
        {show3D ? (
          <>
            <ErrorBoundary
              onError={() => setWorld({ sceneFailed: true, sceneReady: false })}
              fallback={null}
            >
              <Suspense fallback={null}>
                <CorridorScene profile={profile} reducedMotion={reducedMotion} />
              </Suspense>
            </ErrorBoundary>
            <LoadingScreen />
            {outside ? (
              <EntranceScene />
            ) : (
              <>
                <IntroSection hidden={sectionOpen} />
                <StationNotes visible={!sectionOpen} touch={profile.touch} />
              </>
            )}
          </>
        ) : (
          <>
            <h1 className="sr-only">
              {siteConfig.name} — {siteConfig.title}
            </h1>
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
      {show3D && <HotspotHint />}
      {show3D && !outside && !reducedMotion && <WalkerEyes />}
      <PaperOverlay />
    </>
  )
}
