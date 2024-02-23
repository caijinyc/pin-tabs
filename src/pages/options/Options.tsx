import React from 'react';
import '@pages/options/Options.css';
import { ChakraProvider, FormLabel, Input } from '@chakra-ui/react';
import { commonLocalStorage, optionsStorage } from '@src/shared/storages/optionsStorage';
import { useForm } from 'react-hook-form';
import { Icon } from '@iconify-icon/react';

const GithubAppendIcon = (props: { onClick: () => void }) => (
  <Icon inline icon="mdi:github" width="20" height="20" className={'cursor-pointer'} onClick={props.onClick} />
);

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
    githubUsername: string;
  }>({
    defaultValues: {
      syncGistId: optionsStorage.getSnapshot().syncGistId,
      token: optionsStorage.getSnapshot().token,
      backupGistId: optionsStorage.getSnapshot().backupGistId,
      githubUsername: optionsStorage.getSnapshot()?.githubUsername,
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
          githubUsername: value.githubUsername,
        });
        commonLocalStorage.set({ deviceId: value.deviceId });
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  return (
    <ChakraProvider>
      <div className={'m-12'}>
        <FormLabel>GitHub Username</FormLabel>
        <Input {...register('githubUsername')} className={'mb-6'} />

        <FormLabel>
          <div className={'flex items-center gap-2'}>
            <div>Sync Gist ID</div>
            <GithubAppendIcon
              onClick={() => {
                window.open(`https://gist.github.com/${watch('githubUsername')}/${watch('syncGistId')}`, '_blank');
              }}
            />
          </div>
        </FormLabel>
        <Input {...register('syncGistId')} className={'mb-6'} />

        <FormLabel>
          <div className={'flex items-center gap-2'}>
            <div>Backup Gist ID</div>
            <GithubAppendIcon
              onClick={() => {
                window.open(`https://gist.github.com/${watch('githubUsername')}/${watch('backupGistId')}`, '_blank');
              }}
            />
          </div>
        </FormLabel>
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
