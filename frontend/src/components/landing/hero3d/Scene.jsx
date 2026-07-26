import CameraRig from './CameraRig.jsx'
import CoreMesh from './CoreMesh.jsx'
import OrbitRing from './OrbitRing.jsx'
import ParticleField from './ParticleField.jsx'

/** Scene composition and lighting. Every colour comes from the brand tokens. */
export default function Scene({ colors }) {
  return (
    <>
      <ambientLight intensity={1.1} />
      <directionalLight position={[3, 4, 5]} intensity={1.8} color={colors.accent} />
      <directionalLight position={[-4, -1.5, 2]} intensity={1.2} color={colors['brand-blue']} />

      <CameraRig />
      <CoreMesh colors={colors} />
      <OrbitRing colors={colors} />
      <ParticleField colors={colors} />
    </>
  )
}
