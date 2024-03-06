import React from 'react';
import '@pages/options/Options.css';
import { Button, ChakraProvider, FormLabel, Input, InputGroup, InputRightElement, Textarea } from '@chakra-ui/react';
import { commonLocalStorage, optionsStorage } from '@src/shared/storages/optionsStorage';
import { useForm } from 'react-hook-form';
import { Icon } from '@iconify-icon/react';
import { UploadLocalHistory } from '@pages/options/upload-local-history';

const GithubAppendIcon = (props: { onClick: () => void }) => (
  <Icon inline icon="mdi:github" width="20" height="20" className={'cursor-pointer'} onClick={props.onClick} />
);

const Options: React.FC = () => {
  const [showPassword, setShowPassword] = React.useState(false);
  const { register, handleSubmit, watch, setValue } = useForm<{
    name: string;
    syncGistId: string;
    backupGistId: string;
    token: string;
    deviceId: string;
    faviconSyncList: string;
    githubUsername: string;
  }>({
    defaultValues: {
      syncGistId: optionsStorage.getSnapshot().syncGistId,
      token: optionsStorage.getSnapshot().token,
      backupGistId: optionsStorage.getSnapshot().backupGistId,
      githubUsername: optionsStorage.getSnapshot()?.githubUsername,
      faviconSyncList: optionsStorage.getSnapshot()?.faviconSyncList,
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
          faviconSyncList: value.faviconSyncList,
        });
        commonLocalStorage.set({ deviceId: value.deviceId });
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  return (
    <ChakraProvider>
      <div className={'m-12 max-w-lg'}>
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

        <FormLabel>Gist Token</FormLabel>
        <InputGroup>
          <Input {...register('token')} className={'mb-6'} type={showPassword ? 'text' : 'password'}/>
          <InputRightElement width='4.5rem'>
            <Button h='1.75rem' size='sm' onClick={()=>{
              setShowPassword(!showPassword);
            }}>
              {showPassword ? 'Hide' : 'Show'}
            </Button>
          </InputRightElement>
        </InputGroup>

        <FormLabel>Device Id</FormLabel>
        <Input {...register('deviceId')} className={'mb-6'} />

        <FormLabel>Favicon Sync List</FormLabel>
        <Textarea {...register('faviconSyncList')} className={'mb-6'} />

        <FormLabel>Other Actions</FormLabel>

        <UploadLocalHistory />
      </div>
    </ChakraProvider>
  );
};

export default Options;
