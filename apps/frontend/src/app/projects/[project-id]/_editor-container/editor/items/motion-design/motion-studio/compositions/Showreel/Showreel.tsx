import { AbsoluteFill, Sequence } from "remotion";
import { useDesignFrame } from "../../use-design-frame";
import { COLORS, SCENES } from "./constants";
import { DataScene } from "./scenes/DataScene";
import { DepthScene } from "./scenes/DepthScene";
import { GridScene } from "./scenes/GridScene";
import { IntroScene } from "./scenes/IntroScene";
import { KineticTypeScene } from "./scenes/KineticTypeScene";
import { OutroScene } from "./scenes/OutroScene";
import { PhysicsScene } from "./scenes/PhysicsScene";
import { FilmGrain, ShowreelHud, StripeWipe, Vignette } from "./ShowreelOverlays";

export {
  SHOWREEL_DURATION,
  SHOWREEL_FPS,
  SHOWREEL_HEIGHT,
  SHOWREEL_WIDTH,
} from "./constants";

const SCENE_COMPONENTS: Record<(typeof SCENES)[number]["id"], React.FC> = {
  intro: IntroScene,
  type: KineticTypeScene,
  grid: GridScene,
  depth: DepthScene,
  data: DataScene,
  physics: PhysicsScene,
  outro: OutroScene,
};

export const Showreel: React.FC = () => {
  const frame = useDesignFrame();

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.ink }}>
      {SCENES.map((scene) => {
        const SceneComponent = SCENE_COMPONENTS[scene.id];
        return (
          <Sequence key={scene.id} from={scene.from} durationInFrames={scene.duration} name={scene.label}>
            <SceneComponent />
          </Sequence>
        );
      })}
      <StripeWipe frame={frame} cutFrame={120} colors={[COLORS.lime, COLORS.blue, COLORS.ink]} />
      <StripeWipe frame={frame} cutFrame={300} colors={[COLORS.paper, COLORS.orange, COLORS.ink]} />
      <Vignette />
      <FilmGrain frame={frame} />
      <ShowreelHud frame={frame} />
    </AbsoluteFill>
  );
};
