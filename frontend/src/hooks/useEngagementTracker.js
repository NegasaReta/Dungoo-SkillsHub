import { useCallback, useRef, useState } from 'react'

/**
 * On-device engagement tracking with MediaPipe Face Landmarker.
 *
 * Frames are read from the candidate's camera, measured in this tab, and thrown
 * away. What leaves the device is one summary of ratios at the end of the call —
 * never a frame, never a landmark, and never anything per-frame.
 *
 * Everything here is best-effort: if the model will not load, or the device is
 * too slow, tracking yields nothing and the interview carries on. Engagement is
 * feedback, not a gate.
 */

// Hosted assets keep the app bundle small, at the cost of needing the network on
// first use. Vendor these into /public before demo day if the venue wifi is a risk.
// The version here must match the installed @mediapipe/tasks-vision: the runtime
// and the JS wrapper are built as a pair.
const WASM_BASE = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm'
const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task'

// Eight samples a second is plenty for ratios measured over minutes, and leaves
// the CPU free for the audio loop on a low-end phone.
const SAMPLE_FPS = 8

// Canonical Face Landmarker indices.
const NOSE_TIP = 1
const FACE_LEFT = 234
const FACE_RIGHT = 454
const BROW = 10
const CHIN = 152

// How far off-centre the nose may sit before we stop counting it as facing the
// camera. Both need tuning against real recordings on real devices.
const MAX_YAW_OFFSET = 0.12
const MAX_PITCH_OFFSET = 0.18
const NOSE_REST_HEIGHT = 0.5

// Scaling constants that turn raw spread into a 0-1 ratio.
const FULL_JITTER = 0.15
const FULL_EXPRESSION_SPREAD = 0.12

// Blinking is involuntary, so it is left out of "expression variety".
const EXPRESSION_SHAPES = [
  'mouthSmileLeft',
  'mouthSmileRight',
  'jawOpen',
  'browInnerUp',
  'browOuterUpLeft',
]

function freshStats() {
  return {
    samples: 0,
    facing: 0,
    spanSum: 0,
    noseSumX: 0,
    noseSumY: 0,
    noseSumX2: 0,
    noseSumY2: 0,
    shapes: new Map(),
    startedAt: 0,
  }
}

/** Standard deviation from running sums, guarding the float noise near zero. */
function spread(sum, sumOfSquares, count) {
  if (count < 2) return 0
  const variance = sumOfSquares / count - (sum / count) ** 2
  return variance > 0 ? Math.sqrt(variance) : 0
}

const clamp01 = (value) => Math.min(1, Math.max(0, value))

export default function useEngagementTracker() {
  const landmarkerRef = useRef(null)
  const videoRef = useRef(null)
  const timerRef = useRef(null)
  const statsRef = useRef(freshStats())
  const busyRef = useRef(false)

  const [summary, setSummary] = useState(null)

  const teardown = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = null

    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.srcObject = null
      videoRef.current = null
    }

    landmarkerRef.current?.close?.()
    landmarkerRef.current = null
    busyRef.current = false
  }, [])

  const measure = useCallback(() => {
    const landmarker = landmarkerRef.current
    const video = videoRef.current
    // Skip rather than queue: a slow device should drop samples, not fall behind.
    if (!landmarker || !video || busyRef.current || video.readyState < 2) return

    busyRef.current = true
    try {
      const result = landmarker.detectForVideo(video, performance.now())
      const face = result?.faceLandmarks?.[0]
      if (!face) return

      const stats = statsRef.current
      const nose = face[NOSE_TIP]
      const left = face[FACE_LEFT]
      const right = face[FACE_RIGHT]
      const brow = face[BROW]
      const chin = face[CHIN]

      const span = Math.abs(right.x - left.x) || 1e-6
      const height = Math.abs(chin.y - brow.y) || 1e-6
      const yawOffset = Math.abs((nose.x - left.x) / span - 0.5)
      const pitchOffset = Math.abs((nose.y - brow.y) / height - NOSE_REST_HEIGHT)

      stats.samples += 1
      if (yawOffset < MAX_YAW_OFFSET && pitchOffset < MAX_PITCH_OFFSET) stats.facing += 1

      stats.spanSum += span
      stats.noseSumX += nose.x
      stats.noseSumY += nose.y
      stats.noseSumX2 += nose.x * nose.x
      stats.noseSumY2 += nose.y * nose.y

      for (const shape of result.faceBlendshapes?.[0]?.categories ?? []) {
        if (!EXPRESSION_SHAPES.includes(shape.categoryName)) continue
        const running = stats.shapes.get(shape.categoryName) ?? { sum: 0, sumSq: 0, count: 0 }
        running.sum += shape.score
        running.sumSq += shape.score * shape.score
        running.count += 1
        stats.shapes.set(shape.categoryName, running)
      }
    } catch {
      // A dropped frame is not worth interrupting an interview over.
    } finally {
      busyRef.current = false
    }
  }, [])

  const start = useCallback(
    async (stream) => {
      if (!stream?.getVideoTracks?.().length) return
      teardown()
      statsRef.current = freshStats()
      setSummary(null)

      try {
        // Imported on demand so the model runtime never lands in the main bundle.
        const { FaceLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision')
        const fileset = await FilesetResolver.forVisionTasks(WASM_BASE)

        landmarkerRef.current = await FaceLandmarker.createFromOptions(fileset, {
          baseOptions: { modelAssetPath: MODEL_URL, delegate: 'GPU' },
          runningMode: 'VIDEO',
          numFaces: 1,
          outputFaceBlendshapes: true,
        })

        // Its own element, so tracking does not depend on the tile being rendered.
        const video = document.createElement('video')
        video.srcObject = stream
        video.muted = true
        video.playsInline = true
        await video.play()
        videoRef.current = video

        statsRef.current.startedAt = performance.now()
        timerRef.current = setInterval(measure, 1000 / SAMPLE_FPS)
      } catch {
        // No model, no engagement section. The interview is unaffected.
        teardown()
      }
    },
    [measure, teardown]
  )

  /** Stop tracking and return the one summary that may leave the device. */
  const stop = useCallback(() => {
    const stats = statsRef.current
    teardown()

    if (!stats.samples) {
      setSummary(null)
      return null
    }

    const meanSpan = stats.spanSum / stats.samples || 1e-6
    const jitter =
      (spread(stats.noseSumX, stats.noseSumX2, stats.samples) +
        spread(stats.noseSumY, stats.noseSumY2, stats.samples)) /
      2 /
      meanSpan

    const spreads = [...stats.shapes.values()].map((shape) =>
      spread(shape.sum, shape.sumSq, shape.count)
    )
    const meanSpread = spreads.length
      ? spreads.reduce((total, value) => total + value, 0) / spreads.length
      : 0

    const result = {
      eye_contact: clamp01(stats.facing / stats.samples),
      head_stability: clamp01(1 - jitter / FULL_JITTER),
      expression_variety: clamp01(meanSpread / FULL_EXPRESSION_SPREAD),
      samples: stats.samples,
      duration_seconds: Number(((performance.now() - stats.startedAt) / 1000).toFixed(1)),
    }

    setSummary(result)
    return result
  }, [teardown])

  const reset = useCallback(() => {
    teardown()
    statsRef.current = freshStats()
    setSummary(null)
  }, [teardown])

  return { summary, start, stop, reset }
}
