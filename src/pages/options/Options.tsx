import React, { useEffect } from 'react';
import '@pages/options/Options.css';
import { ChakraProvider, FormLabel, Input, InputGroup, InputLeftAddon } from '@chakra-ui/react';
import { commonLocalStorage, optionsStorage } from '@src/shared/storages/optionsStorage';
import { useForm } from 'react-hook-form';
import { useStore } from '@pages/newtab/store/store';

const Options: React.FC = () => {
  const [gistId, setGistId] = React.useState('');
  const [gistToken, setGistToken] = React.useState('');
  const [deviceId, setDeviceId] = React.useState('');

  const { register, handleSubmit, watch, setValue } = useForm<{
    name: string;
    syncGistId: string;
    backupGistId: string;
    token: string;
    deviceId: string;
  }>({
    defaultValues: {
      syncGistId: optionsStorage.getSnapshot().syncGistId,
      token: optionsStorage.getSnapshot().token,
      backupGistId: optionsStorage.getSnapshot().backupGistId,
      deviceId: commonLocalStorage.getSnapshot()?.deviceId,
    },
  });

  React.useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      if (type === 'change') {
        optionsStorage.set({
          gistId: value.backupGistId,
          backupGistId: value.backupGistId,

          syncGistId: value.syncGistId,
          token: value.token,
        });
        commonLocalStorage.set({ deviceId: value.deviceId });
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  return (
    <ChakraProvider>
      <div className={'m-12'}>
        <FormLabel>Sync Gist ID</FormLabel>
        <Input {...register('syncGistId')} className={'mb-6'} />

        <FormLabel>Backup Gist ID</FormLabel>
        <Input {...register('backupGistId')} className={'mb-6'} />

        <FormLabel>Gist Token</FormLabel>
        <Input {...register('token')} className={'mb-6'} />

        <FormLabel>Device Id</FormLabel>
        <Input {...register('deviceId')} className={'mb-6'} />
      </div>
    </ChakraProvider>
  );
};

export default Options;
