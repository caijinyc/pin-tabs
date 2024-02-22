import { SpaceInfo, useAllOpenedTabs, useStore } from '@pages/newtab/store/store';
import { useDrag } from 'react-dnd';
import { SPACE_TO_GROUP_DRAG_TYPE } from '@pages/newtab/panel/left-group-side/group';
import styles from '@pages/newtab/panel/right/comps/group-content/style.module.scss';
import { Icon } from '@iconify-icon/react';
import { Input } from '@chakra-ui/react';
import { AddTabToGetPopoverCurrentSpace } from '@pages/newtab/panel/right/comps/add-tab';
import { SpaceMoreActions } from '@pages/newtab/panel/right/comps/group-content/space-actions';
import { TabItem } from '@pages/newtab/panel/right/comps/group-content/tab-item';
import React from 'react';
import { DropItem } from '@pages/newtab/panel/right/comps/group-content/index';
import { cls } from '@src/shared/kits';
import { produce } from 'immer';

function updateSpaceName(spaceId: string, val: string) {
  useStore.setState(old => {
    return produce(old, draft => {
      draft.allSpacesMap[spaceId].name = val || '';
    });
  });
}
export const SpaceItem = ({ space }: { space: SpaceInfo }) => {
  const spaceId = space.uuid;
  const tabs = space.tabs;
  const allTabs = useAllOpenedTabs();

  const [{ opacity, dragging }, drag, preview] = useDrag(() => {
    const dropProps: DropItem = {
      spaceId,
    };
    return {
      type: SPACE_TO_GROUP_DRAG_TYPE,
      item: dropProps,
      collect: monitor => ({
        opacity: monitor.isDragging() ? 0.4 : 1,
        dragging: monitor.isDragging(),
      }),
    };
  }, [spaceId]);

  return (
    <div key={spaceId} className={styles.spaceItem}>
      <div className={styles.titleWrapper}>
        <div
          ref={preview}
          className={cls('flex items-center', {
            ['opacity-40']: dragging,
          })}>
          <div ref={drag} className={'cursor-move mr-1 w-[12px]'}>
            <Icon inline icon="akar-icons:drag-vertical" />
          </div>

          <Input
            style={{
              width: 200,
            }}
            size={'sm'}
            variant="unstyled"
            placeholder="Unstyled"
            value={space.name}
            onBlur={() => {
              if (!space.name) {
                updateSpaceName(spaceId, 'New Space');
              }
            }}
            onChange={e => {
              updateSpaceName(spaceId, e.target.value);
            }}
          />
        </div>

        <AddTabToGetPopoverCurrentSpace spaceId={spaceId} />

        {<SpaceMoreActions space={space} />}
      </div>

      {tabs.length ? tabs.map(tab => <TabItem {...{ tab, allTabs, space }} key={tab.id} />) : <div>No Pinned Tabs</div>}
    </div>
  );
};
