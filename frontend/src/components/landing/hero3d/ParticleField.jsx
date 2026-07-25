import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'

const COUNT = 700

/**
 * A spherical shell of points drifting around the core. Positions are generated
 * once into a single Float32Array and animated by rotating the whole object, so
 * there is no per-point work on the CPU each frame.
 */
export default function ParticleField({ colors }) {
  const points = useRef(null)

  const positions = useMemo(() => {
    const array = new Float32Array(COUNT * 3)

    for (let i = 0; i < COUNT; i += 1) {
      // Even distribution over a sphere: uniform in cos(phi), not in phi.
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const radius = 2.3 + Math.random() * 1.5

      array[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      array[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      array[i * 3 + 2] = radius * Math.cos(phi)
    }

    return array
  }, [])

  useFrame(({ clock }, delta) => {
    const node = points.current
    if (!node) return

    node.rotation.y += delta * 0.045
    node.rotation.x = Math.sin(clock.elapsedTime * 0.12) * 0.12
  })

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color={colors.link}
        size={0.022}
        sizeAttenuation
        transparent
        opacity={0.75}
        depthWrite={false}
      />
    </points>
  )
}
