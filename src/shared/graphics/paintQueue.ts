const BUDGET_MS = 6

const jobs: (() => void)[] = []
let scheduled = false

function run(): void {
  const start = performance.now()
  try {
    while (jobs.length > 0 && performance.now() - start < BUDGET_MS) jobs.shift()?.()
  } finally {
    // A throwing job surfaces as an uncaught error but must not wedge the queue.
    if (jobs.length > 0) requestAnimationFrame(run)
    else scheduled = false
  }
}

/**
 * Runs canvas painting a few milliseconds per frame instead of all at once, so mounting a
 * room never holds the frame loop for the time it takes to draw every texture.
 */
export function queuePaint(job: () => void): void {
  jobs.push(job)
  if (scheduled) return
  scheduled = true
  requestAnimationFrame(run)
}

/** How many paint jobs are still waiting. Rooms stay hidden until it reaches zero. */
export function pendingPaints(): number {
  return jobs.length
}
