import React, { useMemo } from 'react';
import RadialGradient, {
  RadialGradientProps,
} from 'react-native-radial-gradient';
import Animated from 'react-native-reanimated';

const AnimatedRadialGradient = Animated.createAnimatedComponent(RadialGradient);

export type RadialGradientBackgroundProps = RadialGradientProps & {
  width: number;
  height: number;
};

const RadialGradientBackground = ({
  height,
  width,
  style,
  ...props
}: RadialGradientBackgroundProps) => {
  const center = useMemo(() => [width, width / 2], [width]);

  return (
    <AnimatedRadialGradient
      {...props}
      center={center}
      radius={width}
      style={[
        style,
        {
          height: width,
          position: 'absolute',
          top: -(width - height) / 2,
          width,
        },
      ]}
    />
  );
};

export default RadialGradientBackground;
