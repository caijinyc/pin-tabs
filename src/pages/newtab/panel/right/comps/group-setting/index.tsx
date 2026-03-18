import { IconButton } from '@chakra-ui/react';
import { StoreHooks } from '@pages/newtab/store/hooks';
import { produce } from 'immer';
import { Icon } from '@iconify-icon/react';
import { useStore } from '@pages/newtab/store/store';

export function GroupSetting() {
  const currentGroup = StoreHooks.useCurrentGroup();

  return (
    <IconButton
      size={'xs'}
      className={'ml-2'}
      aria-label="Group Setting"
      onClick={() => {
        if (!currentGroup) {
          return;
        }

        const nextName = window.prompt('Group Name', currentGroup.name);
        if (!nextName) {
          return;
        }

        useStore.setState(old => {
          return produce(old, draft => {
            draft.groupsMap[currentGroup.id].name = nextName;
          });
        });
      }}
      type="button">
      <Icon icon="lets-icons:setting-line-duotone" width="16" height="16" />
    </IconButton>
  );
}
