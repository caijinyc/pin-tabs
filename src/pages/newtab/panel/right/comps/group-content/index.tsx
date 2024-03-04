import { useStore } from '@pages/newtab/store/store';
import styles from './style.module.scss';
import React from 'react';
import { SpaceItem } from '@pages/newtab/panel/right/comps/group-content/space-item';

export type DropItem = {
  spaceId: string;
};

export const GroupContent = () => {
  const allSpacesMap = useStore(state => state.allSpacesMap);
  const currentSpaceTabs = useStore(state => state.groupsMap[state.selectedGroupId]) || {
    subSpacesIds: [],
  };

  return (
    <>
      <div className={styles.tabsWrapper}>
        {currentSpaceTabs.subSpacesIds.map(spaceId => {
          const space = allSpacesMap[spaceId];
          if (!space) {
            return null;
          }
          return <SpaceItem space={space} key={spaceId} />;
        })}
      </div>
    </>
  );
};
