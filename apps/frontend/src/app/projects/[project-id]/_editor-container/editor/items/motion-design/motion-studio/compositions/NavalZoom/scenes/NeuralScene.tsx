import { AbsoluteFill, random } from "remotion";
import { CENTER, easeInExpo, easeInOutQuint, MONO_FONT, NAVAL_COLORS, tween } from "../constants";

const LAYERS = [4, 6, 8, 6, 4];
const CHIP_SIZE = 220;
const LAYER_SPACING = 250;
const NODE_SPACING = 108;

type NeuralNode = {
  layer: number;
  pad: { x: number; y: number };
  pin: { x: number; y: number };
  neuron: { x: number; y: number };
};

// Each neuron starts life as a PCB pad wired to the chip, so the board can morph into the network.
const NODES: NeuralNode[] = LAYERS.flatMap((count, layer) =>
  Array.from({ length: count }, (_, index) => {
    const seed = `${layer}-${index}`;
    const angle = random(`pad-angle-${seed}`) * Math.PI * 2;
    const distance = 300 + random(`pad-distance-${seed}`) * 330;
    const pad = { x: CENTER.x + Math.cos(angle) * distance * 1.5, y: CENTER.y + Math.sin(angle) * distance * 0.75 };
    const isHorizontal = Math.abs(Math.cos(angle)) > 0.6;
    const pin = isHorizontal
      ? { x: CENTER.x + Math.sign(Math.cos(angle)) * CHIP_SIZE / 2, y: CENTER.y + (random(`pin-${seed}`) - 0.5) * CHIP_SIZE * 0.8 }
      : { x: CENTER.x + (random(`pin-${seed}`) - 0.5) * CHIP_SIZE * 0.8, y: CENTER.y + Math.sign(Math.sin(angle)) * CHIP_SIZE / 2 };
    const neuron = {
      x: CENTER.x + (layer - (LAYERS.length - 1) / 2) * LAYER_SPACING,
      y: CENTER.y + (index - (count - 1) / 2) * NODE_SPACING,
    };
    return { layer, pad, pin, neuron };
  }),
);

const CONNECTIONS = NODES.flatMap((from, fromIndex) =>
  NODES.map((to, toIndex) => ({ fromIndex, toIndex, isLinked: to.layer === from.layer + 1 })).filter((link) => link.isLinked),
);

function mix(a: number, b: number, amount: number) {
  return a + (b - a) * amount;
}

export const NeuralScene: React.FC<{ frame: number }> = ({ frame }) => {
  const morph = tween({ frame, start: 30, duration: 44, easing: easeInOutQuint });
  const converge = tween({ frame, start: 92, duration: 32, easing: easeInExpo });
  const wave = (frame - 58) / 9;
  const flash = tween({ frame, start: 104, duration: 20 });

  const positions = NODES.map((node) => {
    const x = mix(mix(node.pad.x, node.neuron.x, morph), CENTER.x, converge);
    const y = mix(mix(node.pad.y, node.neuron.y, morph), CENTER.y, converge);
    return { x, y };
  });

  return (
    <AbsoluteFill style={{ backgroundColor: NAVAL_COLORS.board }}>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <g opacity={1 - morph}>
          {NODES.map((node, index) => {
            const path = `M ${node.pin.x},${node.pin.y} L ${node.pad.x},${node.pin.y} L ${node.pad.x},${node.pad.y}`;
            const length = Math.abs(node.pad.x - node.pin.x) + Math.abs(node.pad.y - node.pin.y);
            return (
              <g key={index}>
                <path d={path} fill="none" stroke="#1E6E7E" strokeWidth={5} />
                <path
                  d={path}
                  fill="none"
                  stroke={NAVAL_COLORS.cyan}
                  strokeWidth={5}
                  strokeDasharray={`40 ${length}`}
                  strokeDashoffset={-((frame * 14 + index * 90) % (length + 40))}
                />
              </g>
            );
          })}
          <rect
            x={CENTER.x - CHIP_SIZE / 2}
            y={CENTER.y - CHIP_SIZE / 2}
            width={CHIP_SIZE}
            height={CHIP_SIZE}
            rx={10}
            fill="#0A2530"
            stroke={NAVAL_COLORS.cyan}
            strokeWidth={3}
          />
          <text x={CENTER.x} y={CENTER.y + 8} textAnchor="middle" fontFamily={MONO_FONT} fontWeight={700} fontSize={22} letterSpacing={3} fill={NAVAL_COLORS.cyan}>
            NPU · 7nm
          </text>
        </g>

        <g opacity={morph * (1 - converge)}>
          {CONNECTIONS.map(({ fromIndex, toIndex }) => {
            const from = positions[fromIndex]!;
            const to = positions[toIndex]!;
            const isActive = Math.abs(NODES[fromIndex]!.layer + 0.5 - wave) < 0.6;
            const pulse = ((frame * 0.05 + fromIndex * 0.13 + toIndex * 0.07) % 1 + 1) % 1;
            return (
              <g key={`${fromIndex}-${toIndex}`}>
                <line
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke={isActive ? NAVAL_COLORS.amber : NAVAL_COLORS.cyan}
                  strokeOpacity={isActive ? 0.7 : 0.16}
                  strokeWidth={isActive ? 2 : 1}
                />
                <circle cx={mix(from.x, to.x, pulse)} cy={mix(from.y, to.y, pulse)} r={2.5} fill={NAVAL_COLORS.foam} opacity={0.6} />
              </g>
            );
          })}
        </g>

        {positions.map((position, index) => {
          const node = NODES[index]!;
          const activation = Math.max(0, 1 - Math.abs(node.layer - wave));
          const radius = mix(12, 18, morph) + activation * 8;
          return (
            <g key={index}>
              <circle cx={position.x} cy={position.y} r={radius * 2.4} fill={NAVAL_COLORS.cyan} opacity={0.12 + activation * 0.3} />
              <circle
                cx={position.x}
                cy={position.y}
                r={radius}
                fill={activation > 0.4 ? NAVAL_COLORS.amber : "#0B3342"}
                stroke={NAVAL_COLORS.cyan}
                strokeWidth={3}
              />
            </g>
          );
        })}

        <circle cx={CENTER.x} cy={CENTER.y} r={40 + flash * 1200} fill={NAVAL_COLORS.foam} opacity={converge * (1 - flash * 0.2)} />
      </svg>

      <div
        style={{
          position: "absolute",
          left: 150,
          top: 210,
          fontFamily: MONO_FONT,
          fontWeight: 700,
          fontSize: 20,
          letterSpacing: "0.14em",
          color: NAVAL_COLORS.cyan,
          opacity: (1 - converge) * tween({ frame, start: 6, duration: 20 }),
        }}
      >
        {morph < 0.5 ? "SIGNAL PROCESSING · PCB" : "NEURAL INFERENCE · 28 NODES · 144 WEIGHTS"}
      </div>
    </AbsoluteFill>
  );
};
