import { SpaceInfo, useStore } from '@pages/newtab/store/store';
import { useDrag, useDrop, XYCoord } from 'react-dnd';
import styles from '@pages/newtab/panel/right/comps/group-content/style.module.scss';
import { Icon } from '@iconify-icon/react';
import { Input } from '@chakra-ui/react';
import { AddTabToGetPopoverCurrentSpace } from './space-actions/add-tab';
import { SpaceMoreActions } from '@pages/newtab/panel/right/comps/group-content/space-actions';
import { TabItem } from '@pages/newtab/panel/right/comps/group-content/tab-item';
import React from 'react';
import { DropItem } from '@pages/newtab/panel/right/comps/group-content/index';
import { cls } from '@src/shared/kits';
import { produce } from 'immer';
import { useAllOpenedTabs } from '@pages/newtab/util/get-all-opened-tabs';
import { SPACE_TO_GROUP_DRAG_TYPE } from '@src/constant';
import { lowerMultiIncludes } from '@pages/newtab/util/common';
import { scrollToSpace } from '@pages/newtab/panel/right';

function updateSpaceName(spaceId: string, val: string) {
  useStore.setState(old => {
    return produce(old, draft => {
      draft.allSpacesMap[spaceId].name = val || '';
    });
  });
}

interface DragItem {
  index: number;
  id: string;
  type: string;
}

export const spaceContentMaxWidth = 'max-w-[638px]';
export const SpaceItem = ({ space, index, searchText }: { space: SpaceInfo; index: number; searchText?: string }) => {
  const spaceId = space.uuid;
  const tabs =
    searchText && !lowerMultiIncludes(searchText, space.name)
      ? space.tabs.filter(tab => lowerMultiIncludes(searchText, tab.title, tab.url))
      : space.tabs;
  const allTabs = useAllOpenedTabs();
  const ref = React.useRef<HTMLDivElement>(null);
  const dropRef = React.useRef<HTMLDivElement>(null);
  const isSearching = Boolean(searchText);

  const [{ opacity, dragging }, drag, preview] = useDrag(() => {
    const dropProps: DropItem = {
      spaceId,
      index,
    };
    return {
      type: SPACE_TO_GROUP_DRAG_TYPE,
      item: dropProps,
      collect: monitor => ({
        opacity: monitor.isDragging() ? 0.4 : 1,
        dragging: monitor.isDragging(),
      }),
    };
  });

  const [{ handlerId }, sortDrop] = useDrop({
    accept: SPACE_TO_GROUP_DRAG_TYPE,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: DragItem, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();

      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();

      // Get pixels to the top
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      // Time to actually perform the action
      useStore.setState(old => {
        const oldGroupId = Object.values(old.groupsMap).find(group => group.subSpacesIds.includes(spaceId))?.id;

        const newSpacesSort = [...old.groupsMap[oldGroupId].subSpacesIds];
        const [removed] = newSpacesSort.splice(dragIndex, 1);
        newSpacesSort.splice(hoverIndex, 0, removed);

        // const newGroupsSort = [...old.groupsSort];
        // const [removed] = newGroupsSort.splice(dragIndex, 1);
        // newGroupsSort.splice(hoverIndex, 0, removed);

        return produce(old, draft => {
          draft.groupsMap[oldGroupId].subSpacesIds = newSpacesSort;
        });
      });

      console.log('ddd', dragIndex, hoverIndex);

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
  });

  drag(ref);

  sortDrop(dropRef);

  return (
    <div
      key={spaceId}
      className={cls(
        styles.spaceItem,
        'p-2 bg-[#272727] mb-2 rounded-xl shadow-lg ' + spaceContentMaxWidth + '  ease-in-out duration-300',
      )}
      id={spaceId}>
      <div className={styles.titleWrapper} ref={dropRef}>
        <div
          ref={preview}
          className={cls('flex items-center', {
            ['opacity-40']: dragging,
          })}>
          {searchText ? null : (
            <div ref={ref} className={'cursor-move mr-1 w-[12px]'}>
              <Icon inline icon="akar-icons:drag-vertical" />
            </div>
          )}

          <Input
            style={{
              width: 200,
            }}
            className={'font-medium'}
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

        {isSearching ? (
          <div
            className={
              'hover:bg-zinc-600 cursor-pointer rounded-full w-[24px] h-[24px] flex items-center justify-center'
            }>
            <Icon
              icon={'system-uicons:jump-down'}
              width={'18px'}
              height={'18px'}
              className={'cursor-pointer'}
              onClick={() => scrollToSpace(spaceId)}
            />
          </div>
        ) : null}
      </div>

      {tabs.length ? (
        tabs.map(tab => <TabItem {...{ tab, allTabs, space, searchText }} key={tab.id} />)
      ) : (
        <div>No Pinned Tabs</div>
      )}
    </div>
  );
};
