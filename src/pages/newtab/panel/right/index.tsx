import { Button } from '@chakra-ui/react';
import { useStore } from '@pages/newtab/store/store';
import styles from '@pages/newtab/style.module.scss';
import { GroupContent } from '@pages/newtab/panel/right/comps/group-content';
import { produce } from 'immer';
import { uuid } from '@src/shared/kits';
import React from 'react';
import { GroupSetting } from '@pages/newtab/panel/right/comps/group-setting';

export const RightContentPanel = () => {
  const selectedIndex = useStore(state => state.selectedIndex);

  return (
    <div className={styles.rightPanel}>
      <GroupContent />

      <div>
        <Button
          size={'xs'}
          onClick={() => {
            useStore.setState(old => {
              return produce(old, draft => {
                const id = uuid();
                draft.groups[selectedIndex].subSpacesIds.push(id);
                draft.allSpacesMap[id] = {
                  name: 'Untitled Sub Space',
                  tabs: [],
                  uuid: id,
                };
              });
            });
          }}>
          Add Sub Space
        </Button>

        {<GroupSetting />}
      </div>
    </div>
  );
};
