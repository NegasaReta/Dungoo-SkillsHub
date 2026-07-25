import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

/** Two tilted rings around the core, standing in for a practice loop. */
export default function OrbitRing({ colors }) {
  const outer = useRef(null)
  const inner = useRef(null)

  useFrame((_, delta) => {
    if (outer.current) outer.current.rotation.z += delta * 0.1
    if (inner.current) inner.current.rotation.z -= delta * 0.14
  })

  return (
    <group rotation={[1.15, 0.25, 0]}>
      <mesh ref={outer}>
        <torusGeometry args={[2.1, 0.012, 8, 96]} />
        <meshBasicMaterial color={colors.accent} transparent opacity={0.65} />
      </mesh>
      <mesh ref={inner} scale={0.78}>
        <torusGeometry args={[2.1, 0.008, 8, 96]} />
        <meshBasicMaterial color={colors.link} transparent opacity={0.5} />
      </mesh>
    </group>
  )
}
