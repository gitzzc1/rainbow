import React, { useState } from 'react';
import { useQuery } from 'react-query';
import styled from 'styled-components';
import SearchInput from '../components/ens-registration/SearchInput/SearchInput';
import {
  SheetActionButton,
  SheetActionButtonRow,
  SlackSheet,
} from '../components/sheet';
import {
  Box,
  Column,
  Columns,
  Heading,
  Inline,
  Stack,
  Text,
} from '@rainbow-me/design-system';

import { fetchRegistration } from '@rainbow-me/handlers/ens';
import { fromWei } from '@rainbow-me/helpers/utilities';
import { useDebounceString, useDimensions, useENS } from '@rainbow-me/hooks';
import { colors } from '@rainbow-me/styles';

const Container = styled.View`
  flex: 1;
`;

export default function RegisterEnsSheet() {
  const { height: deviceHeight } = useDimensions();

  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounceString(searchQuery);

  const { getAvailable, getRentPrice, getNameExpires } = useENS();
  const { data: registration, status } = useQuery(
    debouncedSearchQuery.length > 3 && ['registration', debouncedSearchQuery],
    async (_, searchQuery) => {
      const fastFormatter = timestamp => {
        const date = new Date(Number(timestamp) * 1000);
        return `${date.toDateString()}`;
      };
      const isAvailable = await getAvailable(searchQuery);
      // dummy default to 1 year
      const rentPrice = await getRentPrice(searchQuery, 31536000);
      const exipryDate = await getNameExpires(searchQuery);
      const registration = await fetchRegistration(searchQuery + '.eth');
      return {
        expiryDate: fastFormatter(exipryDate),
        isRegistered: !isAvailable,
        registrationDate: fastFormatter(registration.registrationDate),
        rentPrice: fromWei(rentPrice.toString()),
      };
    }
  );
  const isLoading = status === 'loading';
  const isSuccess = registration && status === 'success';

  const state = useMemo(() => {
    if (isSuccess) {
      if (registration?.isRegistered) {
        return 'warning';
      }
      return 'success';
    }
    return undefined;
  }, [isSuccess, registration?.isRegistered]);

  return (
    <Container>
      <SlackSheet
        bottomInset={42}
        {...(ios
          ? { height: '100%' }
          : { additionalTopPadding: true, contentHeight: deviceHeight })}
      >
        <Box paddingTop="30px">
          <Stack alignHorizontal="center" space="15px">
            <Heading size="23px" weight="heavy">
              􀠎 Find your name
            </Heading>
            <Text color="secondary50" size="18px" weight="bold">
              Search available profile names
            </Text>
          </Stack>

          <Box
            alignItems="center"
            paddingHorizontal="19px"
            paddingVertical="42px"
          >
            <SearchInput
              isLoading={isLoading}
              onChangeText={setSearchQuery}
              placeholder="Input placeholder"
              state={state}
            />
          </Box>

          {isLoading && (
            <Text color="secondary40" size="18px" weight="bold">
              Hold a sec...
            </Text>
          )}
          {isSuccess && (
            <Stack alignHorizontal="center" space="5px">
              <Columns alignHorizontal="center" space="19px">
                <Column width="1/2">
                  <Text color="secondary40" size="18px" weight="bold">
                    {registration.isRegistered ? 'Taken' : 'Available'}
                  </Text>
                </Column>
                <Column width="1/2">
                  <Text color="secondary40" size="18px" weight="bold">
                    {registration.isRegistered ? 'Taken' : 'Available'}
                  </Text>
                </Column>
              </Columns>
              <Inline wrap={false}>
                <Text color="secondary40" size="18px" weight="bold">
                  {registration.isRegistered
                    ? `Til ${registration.expiryDate}`
                    : `"Price"`}
                </Text>
              </Inline>
              {!registration.isRegistered && (
                <Text color="secondary40" size="18px" weight="bold">
                  Estimated cost?
                </Text>
              )}
            </Stack>
          )}
        </Box>
        {isSuccess && (
          <SheetActionButtonRow>
            {registration.isRegistered ? (
              <SheetActionButton
                color={colors.grey}
                label="Clear"
                onPress={() => null}
                weight="heavy"
              />
            ) : (
              <SheetActionButton
                color={colors.green}
                label="Continue on"
                onPress={() => null}
                weight="heavy"
              />
            )}
          </SheetActionButtonRow>
        )}
      </SlackSheet>
    </Container>
  );
}
