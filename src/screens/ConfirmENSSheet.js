import { useNavigation } from '@react-navigation/core';
import React from 'react';
import {
  SheetActionButton,
  SheetActionButtonRow,
  SlackSheet,
} from '../components/sheet';
import { Box, Text } from '@rainbow-me/design-system';
import Routes from '@rainbow-me/routes';

export const ConfirmENSSheetHeight = 600;

export default function ConfirmENSSheet() {
  const { goBack, navigate } = useNavigation();

  return (
    <SlackSheet
      additionalTopPadding
      contentHeight={ConfirmENSSheetHeight}
      height="100%"
      scrollEnabled={false}
    >
      <Box
        background="body"
        paddingVertical="30px"
        style={{ height: ConfirmENSSheetHeight }}
      >
        <Box flexGrow={1}>
          <Text>Confirmation placeholder</Text>
        </Box>
        <SheetActionButtonRow>
          <SheetActionButton
            label="Hold to buy"
            onPress={() => {
              goBack();
              setTimeout(() => {
                navigate(Routes.PROFILE_SCREEN);
              }, 50);
            }}
            size="big"
            weight="heavy"
          />
        </SheetActionButtonRow>
      </Box>
    </SlackSheet>
  );
}
