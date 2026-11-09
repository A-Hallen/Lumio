import { useEffect } from 'react';
import Animated, { Easing, useAnimatedProps, useReducedMotion, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Defs, G, LinearGradient, Path, Pattern, Stop, Line, Text as SvgText, TSpan } from 'react-native-svg';
import { fanWedges, needlePoint, type FanGeometry } from '../core/fan';
import { dialLabels, hourParts, type TimeFormat } from '../core/time';
import { color, font } from '../theme/tokens';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedLine = Animated.createAnimatedComponent(Line);

const ORNAMENT = [color.cobalt, color.ruby, color.bottle, color.turquoise];
const LABEL_MINUTES = [0, 360, 720, 1080, 1440];

type Props = {
  width: number;
  lightPerSlot: boolean[];
  currentSlot: number;
  nowMinute: number;
  /** Minuto de hoy en que cambia el estado, o null si el cambio cae en otro dia. */
  nextChangeMinute: number | null;
  timeFormat?: TimeFormat;
  /** false para usar el abanico solo como adorno, sin la hora en el centro. */
  showClock?: boolean;
};

function Pane({ d, hasLight, isCurrent, index }: { d: string; hasLight: boolean; isCurrent: boolean; index: number }) {
  const reduce = useReducedMotion();
  const o = useSharedValue(reduce ? 1 : 0);
  useEffect(() => {
    if (!reduce) o.value = withDelay(index * 70, withTiming(1, { duration: 380, easing: Easing.out(Easing.cubic) }));
  }, [index, o, reduce]);
  const animated = useAnimatedProps(() => ({ opacity: o.value }));
  return (
    <G>
      <AnimatedPath animatedProps={animated} d={d} fill={hasLight ? 'url(#lit)' : color.glassOff} />
      {!hasLight && <Path d={d} fill="url(#hatch)" />}
      <Path d={d} fill="none" stroke={color.line} strokeWidth={3.5} strokeLinejoin="round" />
      {isCurrent && <Path d={d} fill="none" stroke={color.cal} strokeWidth={2.5} strokeLinejoin="round" />}
    </G>
  );
}

export function Fan({ width, lightPerSlot, currentSlot, nowMinute, nextChangeMinute, timeFormat = '24', showClock = true }: Props) {
  const reduce = useReducedMotion();
  const clock = hourParts(nowMinute, timeFormat);
  const labels = dialLabels(timeFormat);
  const ring = 9;
  const rOuter = width / 2 - ring - 12;
  // 16 px de margen arriba para que quepa la marca de las 12 del mediodia.
  const g: FanGeometry = { cx: width / 2, cy: rOuter + ring + 26, rOuter, rInner: rOuter * 0.38 };
  const height = g.cy + 30;
  const wedges = fanWedges(g, lightPerSlot, currentSlot);

  const sweep = useSharedValue(reduce ? nowMinute : 0);
  useEffect(() => {
    sweep.value = reduce ? nowMinute : withTiming(nowMinute, { duration: 900, easing: Easing.out(Easing.cubic) });
  }, [nowMinute, reduce, sweep]);
  const needle = useAnimatedProps(() => {
    const a = (Math.PI * (180 - (180 * sweep.value) / 1440)) / 180;
    return {
      x1: g.cx + g.rInner * Math.cos(a),
      y1: g.cy - g.rInner * Math.sin(a),
      x2: g.cx + (g.rOuter + 4) * Math.cos(a),
      y2: g.cy - (g.rOuter + 4) * Math.sin(a),
    };
  });

  // Aro ornamental: 8 segmentos con los colores del vitral en rotacion.
  const ornament = Array.from({ length: 8 }, (_, i) => i);
  const step = 180 / 8;
  const mark = nextChangeMinute === null ? null : needlePoint({ ...g, rOuter: g.rOuter + ring / 2 + 2 }, nextChangeMinute);

  return (
    <Svg width={width} height={height} accessibilityLabel="Abanico del dia: un cristal por tramo de tres horas">
      <Defs>
        <LinearGradient id="lit" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={color.glassOn} />
          <Stop offset="1" stopColor={color.glassOnDeep} />
        </LinearGradient>
        <Pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <Line x1="0" y1="0" x2="0" y2="6" stroke={color.glassOffEdge} strokeWidth="1.2" opacity={0.55} />
        </Pattern>
      </Defs>

      {ornament.map((i) => {
        const a0 = 180 - i * step;
        const a1 = 180 - (i + 1) * step;
        const R = g.rOuter + ring + 2;
        const r = g.rOuter + 3;
        const p = (rr: number, a: number) => `${g.cx + rr * Math.cos((a * Math.PI) / 180)} ${g.cy - rr * Math.sin((a * Math.PI) / 180)}`;
        const d = `M ${p(R, a0)} A ${R} ${R} 0 0 1 ${p(R, a1)} L ${p(r, a1)} A ${r} ${r} 0 0 0 ${p(r, a0)} Z`;
        return <Path key={i} d={d} fill={ORNAMENT[i % 4]} stroke={color.line} strokeWidth={1.5} />;
      })}

      {wedges.map((w) => (
        <Pane key={w.index} {...w} />
      ))}

      <Path
        d={`M ${g.cx - g.rInner} ${g.cy} A ${g.rInner} ${g.rInner} 0 0 1 ${g.cx + g.rInner} ${g.cy} Z`}
        fill={color.lead}
        stroke={color.line}
        strokeWidth={3}
      />
      {showClock && (
        <SvgText x={g.cx} y={g.cy - 6} fill={color.cal} fontFamily={font.displayMedium} fontSize={g.rInner * 0.62} textAnchor="middle">
          {clock.main}
          {clock.suffix ? <TSpan fontSize={g.rInner * 0.3}>{` ${clock.suffix}`}</TSpan> : null}
        </SvgText>
      )}

      <AnimatedLine animatedProps={needle} stroke={color.line} strokeWidth={7} strokeLinecap="round" />
      <AnimatedLine animatedProps={needle} stroke={color.cal} strokeWidth={3} strokeLinecap="round" />

      {mark && <Circle cx={mark.x} cy={mark.y} r={5.5} fill={color.ruby} stroke={color.cal} strokeWidth={1.5} />}

      {LABEL_MINUTES.map((m, i) => {
        const p = needlePoint({ ...g, rOuter: g.rOuter + ring + 18 }, m);
        // Las marcas de las 00 y las 24 caen fuera del dibujo: se pegan a cada esquina, bajo el arco.
        const edge = i === 0 ? 'start' : i === LABEL_MINUTES.length - 1 ? 'end' : 'middle';
        const x = edge === 'start' ? 4 : edge === 'end' ? width - 4 : p.x;
        return (
          <SvgText key={m} x={x} y={edge === 'middle' ? p.y + 4 : g.cy + 22} fill={color.smoke} fontSize={12} textAnchor={edge}>
            {labels[i]}
          </SvgText>
        );
      })}
    </Svg>
  );
}
