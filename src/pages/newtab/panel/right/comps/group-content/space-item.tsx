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

  const [{ dragging }, drag, preview] = useDrag(() => {
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

  const [, sortDrop] = useDrop({
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
      className={cls(styles.spaceItem, 'p-3 mb-3 rounded-xl shadow-sm border border-app-border bg-app-card-bg transition-colors duration-300', spaceContentMaxWidth)}
      id={spaceId}>
      <div className={styles.titleWrapper} ref={dropRef}>
        <div
          ref={node => {
            preview(node);
          }}
          className={cls('flex items-center', {
            ['opacity-40']: dragging,
          })}>
          {searchText ? null : (
            <div ref={ref} className={'cursor-move mr-1 w-[16px] text-app-text-muted hover:text-app-text transition-colors'}>
              <Icon inline icon="akar-icons:drag-vertical" />
            </div>
          )}

          <Input
            style={{
              width: 200,
            }}
            className={'font-semibold text-[15px]'}
            size={'sm'}
            variant="flushed"
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
              'hover:bg-app-hover-bg cursor-pointer rounded-full w-[28px] h-[28px] flex items-center justify-center transition-colors'
            }>
            <Icon
              icon={'system-uicons:jump-down'}
              width={'20px'}
              height={'20px'}
              className={'cursor-pointer text-app-text-muted'}
              onClick={() => scrollToSpace(spaceId)}
            />
          </div>
        ) : null}
      </div>

      {tabs.length ? (
        <div className="flex flex-col gap-1 mt-2">
          {tabs.map(tab => <TabItem {...{ tab, allTabs, space, searchText }} key={tab.id} />)}
        </div>
      ) : (
        <div className="text-app-text-muted text-sm mt-4 px-2">No Pinned Tabs</div>
      )}
    </div>
  );
};
