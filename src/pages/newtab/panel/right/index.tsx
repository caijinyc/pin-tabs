import { Button } from '@chakra-ui/react';
import { useStore } from '@pages/newtab/store/store';
import styles from '@pages/newtab/style.module.scss';
import { GroupContent } from '@pages/newtab/panel/right/comps/group-content';
import React from 'react';
import { GroupSetting } from '@pages/newtab/panel/right/comps/group-setting';
import { Actions } from '@pages/newtab/store/actions/normal';

export const RightContentPanel = () => {
  return (
    <div className={styles.rightPanel}>
      <GroupContent />

      <div>
        <Button
          size={'xs'}
          onClick={() => {
            Actions.addSubSpace(useStore.getState().selectedGroupId);
          }}>
          Add Sub Space
        </Button>

        {<GroupSetting />}
      </div>
    </div>
  );
};
