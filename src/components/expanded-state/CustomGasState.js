import { useIsFocused, useRoute } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import Animated, { useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeArea } from 'react-native-safe-area-context';
import styled from 'styled-components';
import Divider from '../Divider';
import { ExchangeHeader } from '../exchange';
import { FloatingPanel } from '../floating-panels';
import { GasSpeedButton } from '../gas';
import { Column } from '../layout';
import {
  SheetHandleFixedToTopHeight,
  SheetKeyboardAnimation,
  SlackSheet,
} from '../sheet';
import { FeesPanel, FeesPanelTabs } from './custom-gas';
import {
  useAccountSettings,
  useBooleanState,
  useColorForAsset,
  useDimensions,
  useGas,
  useHeight,
  useKeyboardHeight,
} from '@rainbow-me/hooks';
import { useNavigation } from '@rainbow-me/navigation';
import { gweiToWei, parseGasFeeParam } from '@rainbow-me/parsers';
import {
  colors,
  lightModeThemeColors,
  padding,
  position,
} from '@rainbow-me/styles';

const springConfig = {
  damping: 500,
  mass: 3,
  stiffness: 1000,
};

const AnimatedContainer = styled(Animated.View)`
  ${position.size('100%')};
`;

const Footer = styled(Column).attrs({
  align: 'end',
  grow: 1,
  justify: 'end',
  shrink: 0,
})`
  ${padding(6, 0, 0)};
  background-color: black;
`;

const FOOTER_MIN_HEIGHT = 143;
const FOOTER_CONTENT_MIN_HEIGHT = 241;

function useAndroidDisableGesturesOnFocus() {
  const { params } = useRoute();
  const isFocused = useIsFocused();
  useEffect(() => {
    android && params?.toggleGestureEnabled?.(!isFocused);
  }, [isFocused, params]);
}

export default function CustomGasState({ restoreFocusOnSwapModal, asset }) {
  const { network } = useAccountSettings();
  const { setParams } = useNavigation();
  const { params: { longFormHeight } = {} } = useRoute();
  const { height: deviceHeight, width: deviceWidth } = useDimensions();
  const keyboardHeight = useKeyboardHeight();
  const [isKeyboardVisible, showKeyboard, hideKeyboard] = useBooleanState();
  const insets = useSafeArea();
  const [footerHeight, setFooterHeight] = useHeight(FOOTER_MIN_HEIGHT);
  const [slippageMessageHeight] = useHeight();
  const [contentHeight] = useHeight(FOOTER_CONTENT_MIN_HEIGHT);
  const contentScroll = useSharedValue(0);
  const colorForAsset = useColorForAsset(asset || {});
  const [currentGasTrend] = useState('stable');
  const { selectedGasFee, updateToCustomGasFee } = useGas();

  useEffect(() => () => restoreFocusOnSwapModal(), [restoreFocusOnSwapModal]);
  useAndroidDisableGesturesOnFocus();

  const keyboardOffset = keyboardHeight + insets.bottom + 10;

  const sheetHeightWithoutKeyboard =
    SheetHandleFixedToTopHeight +
    contentHeight +
    slippageMessageHeight +
    footerHeight +
    30;

  const sheetHeightWithKeyboard =
    sheetHeightWithoutKeyboard + keyboardHeight - 23;

  const additionalScrollForKeyboard =
    sheetHeightWithoutKeyboard + keyboardOffset >
    deviceHeight - insets.top + insets.bottom
      ? deviceHeight -
        insets.top +
        insets.bottom -
        (sheetHeightWithoutKeyboard + keyboardOffset)
      : 0;

  // if ETH color, use blueApple
  const assetColor = useMemo(() => {
    if (colorForAsset === colors.brighten(lightModeThemeColors.dark)) {
      return colors.appleBlue;
    }
    return colorForAsset;
  }, [colorForAsset]);

  const updateGasFee = useCallback(
    ({ priorityFeePerGas = 0, feePerGas = 0 }) => {
      const {
        gasFeeParams: { maxFeePerGas, maxPriorityFeePerGas },
      } = selectedGasFee;
      const gweiMaxPriorityFeePerGas = maxPriorityFeePerGas.gwei;
      const gweiMaxFeePerGas = maxFeePerGas.gwei;

      const newGweiMaxPriorityFeePerGas =
        Math.round((gweiMaxPriorityFeePerGas + priorityFeePerGas) * 100) / 100;
      const newGweiMaxFeePerGas =
        Math.round((gweiMaxFeePerGas + feePerGas) * 100) / 100;

      const newMaxPriorityFeePerGas = parseGasFeeParam(
        Number(gweiToWei(newGweiMaxPriorityFeePerGas))
      );
      const newMaxFeePerGas = parseGasFeeParam(
        Number(gweiToWei(newGweiMaxFeePerGas))
      );

      const newGasParams = {
        ...selectedGasFee.gasFeeParams,
        maxFeePerGas: newMaxFeePerGas,
        maxPriorityFeePerGas: newMaxPriorityFeePerGas,
      };
      updateToCustomGasFee(newGasParams);
    },
    [selectedGasFee, updateToCustomGasFee]
  );

  useEffect(() => {
    if (isKeyboardVisible) {
      contentScroll.value = withSpring(
        additionalScrollForKeyboard,
        springConfig
      );
      setParams({ longFormHeight: sheetHeightWithKeyboard });
    } else {
      contentScroll.value = withSpring(0, springConfig);
      setParams({ longFormHeight: sheetHeightWithoutKeyboard });
    }
  }, [
    additionalScrollForKeyboard,
    contentScroll,
    isKeyboardVisible,
    sheetHeightWithKeyboard,
    sheetHeightWithoutKeyboard,
    setParams,
  ]);

  return (
    <SheetKeyboardAnimation
      as={AnimatedContainer}
      isKeyboardVisible={isKeyboardVisible}
      translateY={contentScroll}
    >
      <SlackSheet
        backgroundColor={colors.black}
        contentHeight={ios ? longFormHeight : sheetHeightWithoutKeyboard}
        hideHandle
        removeTopPadding
        scrollEnabled={false}
      >
        <FloatingPanel radius={38}>
          <ExchangeHeader />
          <FeesPanel
            colorForAsset={assetColor}
            currentGasTrend={currentGasTrend}
            selectedGasFee={selectedGasFee}
            updateGasFee={updateGasFee}
          />
          <Divider />
          <FeesPanelTabs colorForAsset={assetColor} />
        </FloatingPanel>
        <Footer onLayout={setFooterHeight}>
          <Column justify="center" width={deviceWidth}>
            <GasSpeedButton
              asset={asset}
              currentNetwork={network}
              onCustomGasBlur={hideKeyboard}
              onCustomGasFocus={showKeyboard}
              showGasOptions
              testID="swap-details-gas"
              theme="dark"
            />
          </Column>
        </Footer>
      </SlackSheet>
    </SheetKeyboardAnimation>
  );
}