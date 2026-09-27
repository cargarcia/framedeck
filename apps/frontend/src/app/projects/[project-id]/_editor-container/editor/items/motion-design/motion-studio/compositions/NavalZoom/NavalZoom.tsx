import { AbsoluteFill } from "remotion";
import { useDesignFrame } from "../../use-design-frame";
import { NAVAL_COLORS, ZOOM_SCENES, type ZoomSceneId } from "./constants";
import { NavalZoomHud } from "./NavalZoomHud";
import { ConsoleScene } from "./scenes/ConsoleScene";
import { GlobeScene } from "./scenes/GlobeScene";
import { LogoScene } from "./scenes/LogoScene";
import { NeuralScene } from "./scenes/NeuralScene";
import { OceanScene } from "./scenes/OceanScene";
import { OpsRoomScene } from "./scenes/OpsRoomScene";
import { VesselScene } from "./scenes/VesselScene";
import { ZoomLayer } from "./ZoomLayer";

export {
  NAVAL_ZOOM_DURATION,
  NAVAL_ZOOM_FPS,
  NAVAL_ZOOM_HEIGHT,
  NAVAL_ZOOM_WIDTH,
} from "./constants";

export type NavalZoomProps = {
  logoSrc?: string;
};

const SCENE_COMPONENTS: Record<Exclude<ZoomSceneId, "logo">, React.FC<{ frame: number }>> = {
  globe: GlobeScene,
  ocean: OceanScene,
  vessel: VesselScene,
  ops: OpsRoomScene,
  console: ConsoleScene,
  neural: NeuralScene,
};

// One continuous dive: orbit, sea, ship, operations room, console, silicon, brand.
export const NavalZoom: React.FC<NavalZoomProps> = ({ logoSrc }) => {
  const frame = useDesignFrame();

  return (
    <AbsoluteFill style={{ backgroundColor: NAVAL_COLORS.abyss }}>
      {ZOOM_SCENES.map((scene, index) => (
        <ZoomLayer
          key={scene.id}
          frame={frame}
          from={scene.from}
          duration={scene.duration}
          focus={scene.focus}
          isFirst={index === 0}
          isLast={index === ZOOM_SCENES.length - 1}
        >
          {(localFrame) => {
            if (scene.id === "logo") return <LogoScene frame={localFrame} logoSrc={logoSrc} />;
            const SceneComponent = SCENE_COMPONENTS[scene.id];
            return <SceneComponent frame={localFrame} />;
          }}
        </ZoomLayer>
      ))}
      <NavalZoomHud frame={frame} />
    </AbsoluteFill>
  );
};
