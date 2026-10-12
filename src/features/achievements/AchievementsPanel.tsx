import { Check, Lock } from 'lucide-react'
import { ACHIEVEMENTS, useAchievements } from './achievements'
import { DropPanel } from '@/shared/components/panels/DropPanel'

interface AchievementsPanelProps {
  open: boolean
  onClose: () => void
}

export function AchievementsPanel({ open, onClose }: AchievementsPanelProps) {
  const unlocked = useAchievements((s) => s.unlocked)
  return (
    <DropPanel
      id="corridor-trophies"
      open={open}
      title="Achievements"
      label="Achievements"
      align="end"
      className="max-w-xs"
      onClose={onClose}
    >
      <ul className="panel-scroll mt-3 max-h-[50vh] space-y-2.5 overflow-y-auto pr-1">
        {ACHIEVEMENTS.map((achievement) => {
          const done = unlocked.includes(achievement.id)
          return (
            <li
              key={achievement.id}
              className={`flex items-start gap-3 ${done ? '' : 'opacity-55'}`}
            >
              <span
                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                  done ? 'border-ink bg-ochre/70 text-ink' : 'border-ink/40 text-charcoal'
                }`}
                aria-hidden="true"
              >
                {done ? <Check size={13} strokeWidth={2.5} /> : <Lock size={12} />}
              </span>
              <span>
                <span
                  className={`font-hand text-xl leading-none ${done ? 'text-ink' : 'text-charcoal'}`}
                >
                  {achievement.title}
                </span>
                <span className="block text-sm text-charcoal">{achievement.hint}</span>
                <span className="sr-only">{done ? ' (unlocked)' : ' (locked)'}</span>
              </span>
            </li>
          )
        })}
      </ul>
      <p className="mt-4 border-t-2 border-dashed border-ink/25 pt-2 text-center font-hand text-lg uppercase tracking-wider text-ink">
        {unlocked.length} / {ACHIEVEMENTS.length} explored
      </p>
    </DropPanel>
  )
}
