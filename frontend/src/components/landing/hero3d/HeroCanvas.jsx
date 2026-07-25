import { Canvas } from '@react-three/fiber'

import useThemeColors from '../../../hooks/useThemeColors.js'
import Scene from './Scene.jsx'

/**
 * Renderer setup for the hero. This module is the lazy-loaded entry point, so
 * three.js only reaches the browser on devices that will actually use it.
 *
 * `flat` disables tone mapping: filmic tone mapping would shift the brand gold
 * and navy away from their defined values.
 */
export default function HeroCanvas({ active = true }) {
  const colors = useThemeColors()

  return (
    <Canvas
      flat
      frameloop={active ? 'always' : 'never'}
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 4.8], fov: 42 }}
      gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
      style={{ pointerEvents: 'none' }}
    >
      <Scene colors={colors} />
    </Canvas>
  )
}
