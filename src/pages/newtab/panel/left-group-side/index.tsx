import { GroupInfo, useStore } from '@pages/newtab/store/store';
import styles from '@pages/newtab/style.module.scss';
import { Button } from '@chakra-ui/react';
import { produce } from 'immer';
import { Icon } from '@iconify-icon/react';
import React from 'react';
import cls from 'classnames';
import { getGistData } from '@pages/newtab/api';
import { dialog } from '@pages/newtab/comps/global-dialog';
import { useDrop } from 'react-dnd';
import { DropItem } from '@pages/newtab/panel/right/comps/group-content';
import { moveSpaceToOtherGroup } from '@pages/newtab/store/actions/move-space-to-other-group';

const UploadLocalHistory = () => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  return (
    <>
      <input
        ref={inputRef}
        type={'file'}
        accept={'application/json'}
        className={'hidden'}
        onChange={e => {
          console.log('click', e);
          const file = e.currentTarget.files?.[0];
          // e.currentTarget.value = '';
          if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
              const content = e.target?.result;
              if (content) {
                const data = JSON.parse(content as string);
                const keys = Object.keys(data).sort();
                if (keys.includes('groups') && keys.includes('selectedIndex') && keys.includes('allSpacesMap')) {
                  useStore.setState(old => ({
                    ...old,
                    ...data,
                  }));
                } else {
                  dialog.confirm({
                    title: 'Upload Error',
                    content: 'The file is not a valid backup file',
                    onOk: () => {},
                  });
                }
              }
            };
            reader.readAsText(file);
          }
        }}
      />

      <Icon
        onClick={() => {
          inputRef.current?.click();
        }}
        icon="material-symbols-light:drive-folder-upload"
        width="18"
        height="18"
        className={'text-gray-400 hover:text-gray-900 cursor-pointer'}
      />
    </>
  );
};

export const DRAG_TYPE = 'move_space_to_other_group';

const GroupItem = (props: { group: GroupInfo; groupIndex: number }) => {
  const { group, groupIndex } = props;
  const selectedIndex = useStore(state => state.selectedIndex);

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: DRAG_TYPE,
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

  return (
    <div
      ref={drop}
      className={cls(styles.leftSpaceItem, { [styles.leftSpaceItemActive]: selectedIndex === groupIndex }, 'group', {
        'bg-gray-200': isActive,
      })}
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

export const LeftPanel = () => {
  const groups = useStore(state => state.groups);

  return (
    <div className={cls(styles.leftPanel, 'flex flex-col justify-between')}>
      {/*<h1 className={styles.leftTitle}>SAVING TABS</h1>*/}
      {/*<div className={styles.search}></div>*/}
      <div className={styles.leftSpaceWrapper}>
        {groups.map((item, index) => {
          return <GroupItem group={item} groupIndex={index} />;
        })}
        <div>
          <Button
            className={'mt-1'}
            size={'xs'}
            onClick={() => {
              useStore.setState(old => {
                return produce(old, draft => {
                  draft.groups.push({
                    name: 'Untitled Group',
                    subSpacesIds: [],
                  });
                });
              });
            }}>
            Add Group
          </Button>
        </div>
      </div>

      <div>
        <UploadLocalHistory />

        {/*<Icon*/}
        {/*  icon="uim:history"*/}
        {/*  width="24"*/}
        {/*  height="24"*/}
        {/*  onClick={() => {*/}
        {/*    getGistData();*/}
        {/*  }}*/}
        {/*  className={'text-gray-400 hover:text-gray-900 cursor-pointer'}*/}
        {/*/>*/}

        <Icon
          icon="material-symbols-light:settings"
          width="18"
          height="18"
          onClick={() => {
            // open options page
            chrome.runtime.openOptionsPage();
          }}
          className={'text-gray-400 hover:text-gray-900 cursor-pointer'}
        />

        <Icon
          icon="material-symbols-light:save-rounded"
          width="18"
          height="18"
          onClick={() => {
            chrome.runtime.openOptionsPage();
          }}
          className={'text-gray-400 hover:text-gray-900 cursor-pointer'}
        />
      </div>
    </div>
  );
};
