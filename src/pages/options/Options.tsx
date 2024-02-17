import React, { useEffect } from 'react';
import '@pages/options/Options.css';
import { ChakraProvider, Input, InputGroup, InputLeftAddon } from '@chakra-ui/react';
import { optionsStorage } from '@src/shared/storages/optionsStorage';

const Options: React.FC = () => {
  const [gistId, setGistId] = React.useState('');
  const [gistToken, setGistToken] = React.useState('');

  useEffect(() => {
    optionsStorage.get().then(data => {
      setGistId(data.gistId);
      setGistToken(data.token);
    });
  }, []);

  return (
    <ChakraProvider>
      <div className={'m-12'}>
        <InputGroup className={'mb-2'}>
          <InputLeftAddon>Gist ID</InputLeftAddon>
          <Input
            value={gistId}
            onChange={event => {
              setGistId(event.target.value);
              optionsStorage.set({ gistId: event.target.value, token: gistToken });
            }}
          />
        </InputGroup>
        <InputGroup>
          <InputLeftAddon>Gist Token</InputLeftAddon>
          <Input
            value={gistToken}
            onChange={event => {
              setGistToken(event.target.value);
              optionsStorage.set({ gistId, token: event.target.value });
            }}
          />
        </InputGroup>
      </div>
    </ChakraProvider>
  );
};

export default Options;
