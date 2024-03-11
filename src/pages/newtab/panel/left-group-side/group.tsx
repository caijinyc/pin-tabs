import { GroupInfo, useStore } from '@pages/newtab/store/store';
import React, { useEffect, useRef } from 'react';
import { useDrag, useDrop, XYCoord } from 'react-dnd';
import { DropItem } from '@pages/newtab/panel/right/comps/group-content';
import cls from 'classnames';
import styles from '@pages/newtab/style.module.scss';
import { produce } from 'immer';
import { Actions } from '@pages/newtab/store/actions';
import { GroupSortItemTypes, SPACE_TO_GROUP_DRAG_TYPE } from '@src/constant';
import { Input } from '@chakra-ui/react';
import { useComposition } from '@src/shared/kits';

const GroupItem = (props: { group: GroupInfo; groupIndex: number }) => {
  const { group, groupIndex } = props;
  const selectedGroupId = useStore(state => state.selectedGroupId);
  const [isInEdit, setIsInEdit] = React.useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = ref.current;
    if (!wrapper) {
      return;
    }
    const handleDoubleClick = () => {
      setIsInEdit(true);
    };
    wrapper.addEventListener('dblclick', handleDoubleClick);

    if (group.id === selectedGroupId) {
      wrapper.scrollIntoView({ block: 'center' });
    }
  }, []);

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: SPACE_TO_GROUP_DRAG_TYPE,
    drop: (item: DropItem) => {
      if (group.subSpacesIds.includes(item.spaceId)) {
        return;
      }
      Actions.moveSpaceToOtherGroup(item.spaceId, group.id);
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
        const newGroupsSort = [...old.groupsSort];
        const [removed] = newGroupsSort.splice(dragIndex, 1);
        newGroupsSort.splice(hoverIndex, 0, removed);

        return produce(old, draft => {
          draft.groupsSort = newGroupsSort;
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

  const { isComposing, inputUpdateCompositionStatusProps } = useComposition();

  drop(sortDrag(sortDrop(ref)));

  return (
    <div
      ref={ref}
      className={cls(
        styles.leftSpaceItem,
        { [styles.leftSpaceItemActive]: selectedGroupId === group.id },
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
            selectedGroupId: group.id,
          };
        });
      }}>
      {isInEdit ? (
        <Input
          {...inputUpdateCompositionStatusProps}
          variant="flushed"
          size={'sm'}
          autoFocus
          defaultValue={group.name}
          maxLength={20}
          onKeyDown={e => {
            if (isComposing) return;
            if (e.key === 'Enter' || e.key === 'Escape') {
              e.currentTarget.blur();
            }
          }}
          onBlur={e => {
            setIsInEdit(false);
            Actions.changeGroupName(group.id, e.target.value);
          }}
        />
      ) : (
        <div className={'truncate'}>{group.name}</div>
      )}
    </div>
  );
};

interface DragItem {
  index: number;
  id: string;
  type: string;
}

export const Groups = () => {
  const allGroups = useStore(state => {
    return state.groupsSort.map(id => state.groupsMap[id]);
  });

  return allGroups.map((item, index) => {
    return <GroupItem group={item} groupIndex={index} key={item.id} />;
  });
};
