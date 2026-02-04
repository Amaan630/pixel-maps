import React, { useRef } from 'react';
import { Dimensions, Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, G, Line, Mask, Path, Rect, Text as SvgText } from 'react-native-svg';
import { useTheme } from '../../contexts/ThemeContext';
import { ThemeName } from '../../themes';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Minimap cutout dimensions
const CUTOUT_WIDTH = SCREEN_WIDTH * 0.75;
const CIRCULAR_CUTOUT_RADIUS = CUTOUT_WIDTH / 2;
const RECT_CUTOUT_HEIGHT = CUTOUT_WIDTH * 0.6;
const CYBERPUNK_SIZE = CUTOUT_WIDTH * 0.9;

// Marker dimensions
const TICK_LENGTH = 10;
const TICK_OFFSET = 6;
const N_MARKER_SIZE = 18;
const MARKER_OFFSET = 6;

export interface MiniMapOverlayProps {
  heading: number | null; // User's current heading in degrees
  onPressIn: () => void;
  onPressOut: () => void;
}

// Called from the overlay to decide the cutout shape so the user sees theme-correct minimaps.
function isCircularTheme(themeName: ThemeName): boolean {
  return themeName === 'western' || themeName === 'san-andreas';
}

// Called from the overlay to decide the cutout shape so the user sees theme-correct minimaps.
function isCyberpunkTheme(themeName: ThemeName): boolean {
  return themeName === 'cyberpunk';
}

// Called while rendering the cyberpunk cutout so the user sees the angled square shape.
function getCyberpunkPath(centerX: number, centerY: number) {
  const size = CYBERPUNK_SIZE;
  const left = centerX - size / 2;
  const top = centerY - size / 2;
  const right = centerX + size / 2;
  const bottom = centerY + size / 2;
  const chamfer = size * 0.12;
  const notchDepth = size * 0.04;
  const notchHeight = size * 0.18;
  const notchTop = size * 0.28;

  return [
    `M ${left} ${top}`,
    `L ${right} ${top}`,
    `L ${right} ${bottom}`,
    `L ${left + chamfer} ${bottom}`,
    `L ${left} ${bottom - chamfer}`,
    `L ${left} ${top + notchTop + notchHeight}`,
    `L ${left + notchDepth} ${top + notchTop + notchHeight}`,
    `L ${left + notchDepth} ${top + notchTop}`,
    `L ${left} ${top + notchTop}`,
    'Z',
  ].join(' ');
}

// Called while rendering the western compass ticks so the user sees them rotate with heading.
function rotatePoint(
  x: number,
  y: number,
  angleDeg: number,
  centerX: number,
  centerY: number
) {
  const angle = (angleDeg * Math.PI) / 180;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const dx = x - centerX;
  const dy = y - centerY;
  return {
    x: centerX + dx * cos - dy * sin,
    y: centerY + dx * sin + dy * cos,
  };
}

// Called for SA/LA compass placement so the user sees north pinned to the edge.
function getCompassPosition(
  heading: number,
  centerX: number,
  centerY: number,
  isCircular: boolean
) {
  const angle = (heading * Math.PI) / 180;
  const dx = Math.sin(angle);
  const dy = -Math.cos(angle);

  if (isCircular) {
    return {
      x: centerX + dx * (CIRCULAR_CUTOUT_RADIUS + MARKER_OFFSET),
      y: centerY + dy * (CIRCULAR_CUTOUT_RADIUS + MARKER_OFFSET),
    };
  }

  const halfW = CUTOUT_WIDTH / 2;
  const halfH = RECT_CUTOUT_HEIGHT / 2;
  const absDx = Math.abs(dx) < 0.0001 ? 0.0001 : Math.abs(dx);
  const absDy = Math.abs(dy) < 0.0001 ? 0.0001 : Math.abs(dy);
  const t = Math.min(halfW / absDx, halfH / absDy);
  return {
    x: centerX + dx * (t + MARKER_OFFSET),
    y: centerY + dy * (t + MARKER_OFFSET),
  };
}

export function MiniMapOverlay({ heading, onPressIn, onPressOut }: MiniMapOverlayProps) {
  const { theme, themeName } = useTheme();
  const { colors } = theme;

  const isCircular = isCircularTheme(themeName);
  const isCyberpunk = isCyberpunkTheme(themeName);

  // Calculate center position
  const centerX = SCREEN_WIDTH / 2;
  const centerY = SCREEN_HEIGHT / 2;

  // North marker rotation (counter-rotate to always point north)
  const resolvedHeading = heading ?? 0;
  const markerRotation = -resolvedHeading;
  const cyberpunkPath = isCyberpunk ? getCyberpunkPath(centerX, centerY) : '';
  const cyberpunkStroke = (colors as { roadCyan?: string; roadHsl?: string }).roadCyan
    ?? (colors as { roadHsl?: string }).roadHsl
    ?? colors.route;

  const isZoomingRef = useRef(false);

  // Called when the user touches the overlay so we only zoom out for black area touches.
  const handlePressIn = (event: { nativeEvent: { locationX: number; locationY: number } }) => {
    const { locationX, locationY } = event.nativeEvent;
    let insideCutout = false;
    if (isCircular) {
      const dx = locationX - centerX;
      const dy = locationY - centerY;
      insideCutout = Math.hypot(dx, dy) <= CIRCULAR_CUTOUT_RADIUS;
    } else if (isCyberpunk) {
      const half = CYBERPUNK_SIZE / 2;
      insideCutout =
        locationX >= centerX - half &&
        locationX <= centerX + half &&
        locationY >= centerY - half &&
        locationY <= centerY + half;
    } else {
      insideCutout =
        locationX >= centerX - CUTOUT_WIDTH / 2 &&
        locationX <= centerX + CUTOUT_WIDTH / 2 &&
        locationY >= centerY - RECT_CUTOUT_HEIGHT / 2 &&
        locationY <= centerY + RECT_CUTOUT_HEIGHT / 2;
    }

    if (!insideCutout && !isZoomingRef.current) {
      isZoomingRef.current = true;
      onPressIn();
    }
  };

  // Called when the user releases the overlay so we return to the close zoom.
  const handlePressOut = () => {
    if (!isZoomingRef.current) return;
    isZoomingRef.current = false;
    onPressOut();
  };

  return (
    <View style={styles.container} pointerEvents="auto">
      <Pressable
        style={styles.blocker}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      />
      <Svg width={SCREEN_WIDTH} height={SCREEN_HEIGHT} style={styles.svg}>
        <Defs>
          <Mask id="minimap-mask">
            {/* White = visible, #0d0d0d = hidden */}
            <Rect x="0" y="0" width={SCREEN_WIDTH} height={SCREEN_HEIGHT} fill="white" />
            {isCircular ? (
              <Circle
                cx={centerX}
                cy={centerY}
                r={CIRCULAR_CUTOUT_RADIUS}
                fill="#0d0d0d"
              />
            ) : isCyberpunk ? (
              <Path d={cyberpunkPath} fill="#0d0d0d" />
            ) : (
              <Rect
                x={centerX - CUTOUT_WIDTH / 2}
                y={centerY - RECT_CUTOUT_HEIGHT / 2}
                width={CUTOUT_WIDTH}
                height={RECT_CUTOUT_HEIGHT}
                fill="#0d0d0d"
              />
            )}
          </Mask>
        </Defs>

        {/* #0d0d0d overlay with cutout */}
        <Rect
          x="0"
          y="0"
          width={SCREEN_WIDTH}
          height={SCREEN_HEIGHT}
          fill="#0d0d0d"
          mask="url(#minimap-mask)"
        />

        {/* Cyberpunk border */}
        {isCyberpunk && (
          <Path
            d={cyberpunkPath}
            fill="none"
            stroke={cyberpunkStroke}
            strokeWidth={2}
          />
        )}

        {/* North markers */}
        {!isCyberpunk && (
          <>
            {themeName === 'western' && (
              <>
                {[
                  { label: 'N', angle: 0 },
                  { label: 'E', angle: 90 },
                  { label: 'S', angle: 180 },
                  { label: 'W', angle: 270 },
                ].map((cardinal) => {
                  const angle = cardinal.angle + markerRotation;
                  const inner = rotatePoint(
                    centerX,
                    centerY - CIRCULAR_CUTOUT_RADIUS - TICK_OFFSET,
                    angle,
                    centerX,
                    centerY
                  );
                  const outer = rotatePoint(
                    centerX,
                    centerY - CIRCULAR_CUTOUT_RADIUS - TICK_OFFSET - TICK_LENGTH,
                    angle,
                    centerX,
                    centerY
                  );
                  const label = rotatePoint(
                    centerX,
                    centerY - CIRCULAR_CUTOUT_RADIUS - TICK_OFFSET - TICK_LENGTH - 6,
                    angle,
                    centerX,
                    centerY
                  );
                  return (
                    <G key={cardinal.label}>
                      <Line
                        x1={inner.x}
                        y1={inner.y}
                        x2={outer.x}
                        y2={outer.y}
                        stroke={colors.charcoal}
                        strokeWidth={2}
                      />
                      <SvgText
                        x={label.x}
                        y={label.y + 4}
                        fill={colors.charcoal}
                        fontSize={10}
                        fontWeight="700"
                        textAnchor="middle"
                      >
                        {cardinal.label}
                      </SvgText>
                    </G>
                  );
                })}
              </>
            )}

            {(themeName === 'san-andreas' || themeName === 'los-angeles') && (
              (() => {
                const { x, y } = getCompassPosition(-resolvedHeading, centerX, centerY, isCircular);
                const isSanAndreas = themeName === 'san-andreas';
                return (
                  <>
                    <Circle
                      cx={x}
                      cy={y}
                      r={N_MARKER_SIZE / 2}
                      fill={isSanAndreas ? '#000000' : '#FFFFFF'}
                    />
                    <SvgText
                      x={x}
                      y={y + 5}
                      fill={isSanAndreas ? '#FFFFFF' : '#000000'}
                      fontSize={12}
                      fontWeight="800"
                      textAnchor="middle"
                    >
                      N
                    </SvgText>
                  </>
                );
              })()
            )}
          </>
        )}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  blocker: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  svg: {
    position: 'absolute',
    top: 0,
    left: 0,
    pointerEvents: 'none',
  },
});
