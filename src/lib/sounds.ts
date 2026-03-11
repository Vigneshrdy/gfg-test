/**
 * Lightweight Web Audio API sound effects — no external dependencies.
 * Sounds are generated programmatically so no audio files are needed.
 */

let _ctx: AudioContext | null = null

function ctx(): AudioContext {
  if (!_ctx) _ctx = new AudioContext()
  // Resume in case of browser autoplay policy
  if (_ctx.state === 'suspended') _ctx.resume()
  return _ctx
}

/** Short pleasant ascending chime — use for success / query complete */
export function playSuccess(): void {
  try {
    const c = ctx()
    const now = c.currentTime
    const notes = [523.25, 659.25, 783.99] // C5 E5 G5

    notes.forEach((freq, i) => {
      const osc = c.createOscillator()
      const gain = c.createGain()
      osc.connect(gain)
      gain.connect(c.destination)
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, now + i * 0.08)
      gain.gain.setValueAtTime(0, now + i * 0.08)
      gain.gain.linearRampToValueAtTime(0.18, now + i * 0.08 + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.35)
      osc.start(now + i * 0.08)
      osc.stop(now + i * 0.08 + 0.36)
    })
  } catch {
    // AudioContext may be blocked — silently ignore
  }
}

/** Short descending buzz — use for errors */
export function playError(): void {
  try {
    const c = ctx()
    const now = c.currentTime
    const osc = c.createOscillator()
    const gain = c.createGain()
    osc.connect(gain)
    gain.connect(c.destination)
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(220, now)
    osc.frequency.linearRampToValueAtTime(130, now + 0.25)
    gain.gain.setValueAtTime(0.15, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35)
    osc.start(now)
    osc.stop(now + 0.36)
  } catch {
    // silently ignore
  }
}

/** Soft neutral tick — use for info / upload complete */
export function playNotification(): void {
  try {
    const c = ctx()
    const now = c.currentTime
    const osc = c.createOscillator()
    const gain = c.createGain()
    osc.connect(gain)
    gain.connect(c.destination)
    osc.type = 'sine'
    osc.frequency.setValueAtTime(880, now)
    gain.gain.setValueAtTime(0.12, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2)
    osc.start(now)
    osc.stop(now + 0.21)
  } catch {
    // silently ignore
  }
}
