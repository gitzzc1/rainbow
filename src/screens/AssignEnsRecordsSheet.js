import { useNavigation, useRoute } from '@react-navigation/core';
import React from 'react';
import { SheetActionButton, SheetActionButtonRow } from '../components/sheet';
import { Box, Heading, Stack, Text } from '@rainbow-me/design-system';
import Routes from '@rainbow-me/routes';

export default function AssignENSRecordsSheet() {
  const { params } = useRoute();
  const { navigate } = useNavigation();

  const handlePressContinue = useCallback(() => {
    navigate(Routes.CONFIRM_ENS_SHEET);
  }, [navigate]);

  return (
    <Box background="body" flexGrow={1} paddingVertical="30px">
      <Box flexGrow={1}>
        <Stack alignHorizontal="center" space="15px">
          <Heading size="26px" weight="heavy">
            {params?.ensName}.eth
          </Heading>
          <Text
            color={{ custom: 'rgba(152, 117, 215, 1)' }}
            size="16px"
            weight="heavy"
          >
            Create your profile
          </Text>
        </Stack>
      </Box>
      <SheetActionButtonRow>
        <SheetActionButton
          label="Review"
          onPress={handlePressContinue}
          size="big"
          weight="heavy"
        />
      </SheetActionButtonRow>
    </Box>
  );
}
