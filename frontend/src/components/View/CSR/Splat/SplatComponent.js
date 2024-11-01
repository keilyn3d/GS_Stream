import { Splat } from './SplatObject';

export function SplatComponent({
  splatUrl,
  splatPos,
  splatRot,
  splatScale,
  maxSplats,
  splatScaleFactor,
  splatRef,
}) {
  return (
    splatUrl && (
      <group
        position={splatPos}
        rotation={splatRot}
        scale={[splatScale, splatScale, splatScale]}
      >
        <Splat
          splatScaleFactor={splatScaleFactor}
          url={splatUrl}
          maxSplats={maxSplats}
          splatRef={splatRef}
        />
      </group>
    )
  );
}

export default SplatComponent;
