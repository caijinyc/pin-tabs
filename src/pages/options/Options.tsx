import React from 'react';
import '@pages/options/Options.css';
import { Button, Input, InputGroup, Textarea } from '@chakra-ui/react';
import { commonLocalStorage, optionsStorage } from '@src/shared/storages/optionsStorage';
import { useForm } from 'react-hook-form';
import { Icon } from '@iconify-icon/react';
import { UploadLocalHistory } from '@pages/options/upload-local-history';
import { AppProvider } from '@src/shared/ui/app-provider';
import { ThemeToggleButton } from '@src/shared/ui/theme-toggle-button';

const GithubAppendIcon = (props: { onClick: () => void }) => (
  <Icon inline icon="mdi:github" width="20" height="20" className={'cursor-pointer'} onClick={props.onClick} />
);

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <label className="mb-2 block text-sm font-medium" style={{ color: 'var(--app-text-muted)' }}>
    {children}
  </label>
);

const Options: React.FC = () => {
  const [showPassword, setShowPassword] = React.useState(false);
  const optionsSnapshot = optionsStorage.getSnapshot();
  const commonSnapshot = commonLocalStorage.getSnapshot();

  const { register, watch } = useForm<{
    name: string;
    syncGistId: string;
    backupGistId: string;
    token: string;
    deviceId: string;
    faviconSyncList: string;
    githubUsername: string;
  }>({
    defaultValues: {
      syncGistId: optionsSnapshot?.syncGistId ?? '',
      token: optionsSnapshot?.token ?? '',
      backupGistId: optionsSnapshot?.backupGistId ?? '',
      githubUsername: optionsSnapshot?.githubUsername ?? '',
      faviconSyncList: optionsSnapshot?.faviconSyncList ?? '',
      deviceId: commonSnapshot?.deviceId ?? '',
    },
  });

  React.useEffect(() => {
    const subscription = watch((value, { type }) => {
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
    <AppProvider>
      <div className={'m-12 max-w-lg'} style={{ color: 'var(--app-text)' }}>
        <div className={'mb-6'}>
          <ThemeToggleButton />
        </div>

        <FieldLabel>GitHub Username</FieldLabel>
        <Input {...register('githubUsername')} className={'mb-6'} />

        <FieldLabel>
          <div className={'flex items-center gap-2'}>
            <div>Sync Gist ID</div>
            <GithubAppendIcon
              onClick={() => {
                window.open(`https://gist.github.com/${watch('githubUsername')}/${watch('syncGistId')}`, '_blank');
              }}
            />
          </div>
        </FieldLabel>
        <Input {...register('syncGistId')} className={'mb-6'} />

        <FieldLabel>Gist Token</FieldLabel>
        <InputGroup
          className={'mb-6'}
          endElement={
            <Button
              h="1.75rem"
              size="sm"
              type="button"
              onClick={() => {
                setShowPassword(!showPassword);
              }}>
              {showPassword ? 'Hide' : 'Show'}
            </Button>
          }>
          <Input {...register('token')} type={showPassword ? 'text' : 'password'} />
        </InputGroup>

        <FieldLabel>Device Id</FieldLabel>
        <Input {...register('deviceId')} className={'mb-6'} />

        <FieldLabel>Favicon Sync List</FieldLabel>
        <Textarea {...register('faviconSyncList')} className={'mb-6'} />

        <FieldLabel>Other Actions</FieldLabel>

        <UploadLocalHistory />
      </div>
    </AppProvider>
  );
};

export default Options;
