import { useFrame } from '@react-three/fiber'

/**
 * Eases the camera toward the pointer for a parallax response. The easing factor
 * is derived from the frame delta so the motion feels identical at 60Hz and
 * 120Hz instead of running twice as fast on a high-refresh display.
 */
export default function CameraRig({ strength = 0.4 }) {
  useFrame(({ camera, pointer }, delta) => {
    const ease = 1 - Math.pow(0.0015, delta)
    camera.position.x += (pointer.x * strength - camera.position.x) * ease
    camera.position.y += (pointer.y * strength * 0.6 - camera.position.y) * ease
    camera.lookAt(0, 0, 0)
  })

  return null
}
