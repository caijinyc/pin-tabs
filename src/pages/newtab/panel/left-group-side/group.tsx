import { GroupInfo, useStore } from '@pages/newtab/store/store';
import React, { useRef } from 'react';
import { useDrag, useDrop, XYCoord } from 'react-dnd';
import { DropItem } from '@pages/newtab/panel/right/comps/group-content';
import { moveSpaceToOtherGroup } from '@pages/newtab/store/actions/move-space-to-other-group';
import cls from 'classnames';
import styles from '@pages/newtab/style.module.scss';
import { produce } from 'immer';

export const SPACE_TO_GROUP_DRAG_TYPE = 'move_space_to_other_group';
const GroupItem = (props: { group: GroupInfo; groupIndex: number }) => {
  const { group, groupIndex } = props;
  const selectedIndex = useStore(state => state.selectedIndex);

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: SPACE_TO_GROUP_DRAG_TYPE,
    drop: (item: DropItem) => {
      if (group.subSpacesIds.includes(item.spaceId)) {
        return;
      }
      moveSpaceToOtherGroup(item.spaceId, groupIndex);
    },
    collect: monitor => {
      const { spaceId } = (monitor.getItem() || {}) as DropItem;

      return {
        isOver: monitor.isOver(),
        canDrop: spaceId && !group.subSpacesIds.includes(spaceId) && monitor.canDrop(),
      };
    },
  });

  const isActive = isOver && canDrop;

  const ref = useRef<HTMLDivElement>(null);
  const [{ handlerId }, sortDrop] = useDrop({
    accept: GroupSortItemTypes.CARD,
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
      const hoverIndex = groupIndex;

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
        const newGroups = [...old.groups];
        const [removed] = newGroups.splice(dragIndex, 1);
        newGroups.splice(hoverIndex, 0, removed);

        return produce(old, draft => {
          draft.groups = newGroups;
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

  const [{ isDragging }, sortDrag] = useDrag({
    type: GroupSortItemTypes.CARD,
    item: () => {
      return {
        id: group.id,
        index: groupIndex,
      };
    },
    collect: (monitor: any) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drop(sortDrag(sortDrop(ref)));

  return (
    <div
      ref={ref}
      className={cls(
        styles.leftSpaceItem,
        { [styles.leftSpaceItemActive]: selectedIndex === groupIndex },
        'group',
        {
          'bg-gray-200': isActive,
          ['opacity-0']: isDragging,
        },
        'transition-colors duration-300',
      )}
      onClick={() => {
        useStore.setState(() => {
          return {
            selectedIndex: groupIndex,
          };
        });
      }}>
      <div>{group.name}</div>
    </div>
  );
};

interface DragItem {
  index: number;
  id: string;
  type: string;
}

const GroupSortItemTypes = {
  CARD: 'card',
};

export const Groups = () => {
  const groups = useStore(state => state.groups);

  return groups.map((item, index) => {
    return <GroupItem group={item} groupIndex={index} key={item.id} />;
  });
};
