import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

import useScrollProgress from '../../../hooks/useScrollProgress.js'

/**
 * The faceted core: a low-poly solid with a gold wireframe shell just outside it.
 * Detail is deliberately 1 (80 faces) so the whole scene stays cheap enough for
 * mid-range phones that do get the WebGL path.
 */
export default function CoreMesh({ colors }) {
  const group = useRef(null)
  const scroll = useScrollProgress()

  useFrame(({ clock }, delta) => {
    const node = group.current
    if (!node) return

    node.rotation.y += delta * 0.16
    // Scrolling tips the core forward, so the hero reacts to reading position.
    node.rotation.x = 0.22 + scroll.current * 0.9
    node.position.y = Math.sin(clock.elapsedTime * 0.6) * 0.07
  })

  return (
    <group ref={group}>
      <mesh>
        <icosahedronGeometry args={[1.15, 1]} />
        <meshStandardMaterial
          color={colors.navy}
          flatShading
          metalness={0.4}
          roughness={0.42}
        />
      </mesh>

      <mesh scale={1.04}>
        <icosahedronGeometry args={[1.15, 1]} />
        <meshBasicMaterial color={colors.accent} wireframe transparent opacity={0.45} />
      </mesh>
    </group>
  )
}
