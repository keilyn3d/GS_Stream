import { Splat } from './splat-object'; // 상대 경로로 변경

export function SplatComponent({
  splatUrl,
  splatPos,
  splatRot,
  splatScale,
  maxSplats,
  splatScaleFactor,
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
        />
      </group>
    )
  );
}

export default SplatComponent;
