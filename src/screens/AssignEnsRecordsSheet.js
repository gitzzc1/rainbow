import React from 'react';
import { SlackSheet } from '../components/sheet';
import { Box, Text } from '@rainbow-me/design-system';

import { useDimensions } from '@rainbow-me/hooks';

export default function AssignEnsRecordsSheet() {
  const { height: deviceHeight } = useDimensions();

  return (
    <Box background="body" flexGrow={1}>
      <SlackSheet
        bottomInset={42}
        limitScrollViewContent
        {...(ios
          ? { height: '100%' }
          : { additionalTopPadding: true, contentHeight: deviceHeight })}
      >
        <Text>Hello world</Text>
      </SlackSheet>
    </Box>
  );
}
