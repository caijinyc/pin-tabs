import { Button, IconButton, useToast } from '@chakra-ui/react';
import { useStore } from '@pages/newtab/store/store';
import styles from '@pages/newtab/style.module.scss';
import { GroupContent } from '@pages/newtab/panel/right/comps/group-content';
import React from 'react';
import { GroupSetting } from '@pages/newtab/panel/right/comps/group-setting';
import { Actions } from '@pages/newtab/store/actions';
import { dialog } from '@pages/newtab/comps/global-dialog';
import { Icon } from '@iconify-icon/react';

export const RightContentPanel = () => {
  const toast = useToast();

  return (
    <div className={styles.rightPanel}>
      <GroupContent />

      <div className={'pb-4'}>
        <IconButton
          aria-label="Add SubSpace"
          icon={<Icon icon="material-symbols:add" width={'16'} height={'16'} />}
          size={'xs'}
          onClick={() => {
            Actions.addSubSpace(useStore.getState().selectedGroupId);
          }}></IconButton>

        {/*{<GroupSetting />}*/}

        <IconButton
          aria-label="Del Group"
          icon={<Icon icon="lets-icons:del-alt-fill" width={'16'} height={'16'} />}
          // colorScheme="red"
          size={'xs'}
          ml={2}
          onClick={() => {
            if (useStore.getState().groupsSort.length === 1) {
              toast({
                title: 'Must have at least one group.',
                status: 'error',
                isClosable: true,
              });

              return;
            }

            dialog.confirm({
              title: 'Delete Group',
              content: 'Are you sure to delete this group?',
              onOk: () => {
                Actions.removeGroup(useStore.getState().selectedGroupId);
              },
            });
          }}>
          DEL
        </IconButton>
      </div>
    </div>
  );
};
