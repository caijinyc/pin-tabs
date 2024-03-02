import { useStore } from '@pages/newtab/store/store';
import styles from './style.module.scss';
import React from 'react';
import { SpaceItem } from '@pages/newtab/panel/right/comps/group-content/space-item';

export type DropItem = {
  spaceId: string;
};

export const GroupContent = () => {
  const allSpacesMap = useStore(state => state.allSpacesMap);
  const currentSpaceTabs = useStore(state => state.groups.find(item => item.id === state.selectedGroupId)) || {
    subSpacesIds: [],
  };
  // const selectArchive = useStore(state => state.selectedIndex === SELECTED_INDEX_IS_ARCHIVE);
  // const archiveSpaces = useStore(state => state.archiveSpaces);

  return (
    <>
      <div className={styles.tabsWrapper}>
        {/*{selectArchive &&*/}
        {/*  archiveSpaces &&*/}
        {/*  archiveSpaces.subSpacesIds.map(spaceId => {*/}
        {/*    const space = allSpacesMap[spaceId];*/}
        {/*    return <SpaceItem space={space} key={spaceId} />;*/}
        {/*  })}*/}

        {currentSpaceTabs.subSpacesIds.map(spaceId => {
          const space = allSpacesMap[spaceId];
          return <SpaceItem space={space} key={spaceId} />;
        })}
      </div>
    </>
  );
};
