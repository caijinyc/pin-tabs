import { SpaceInfo, useStore } from '@pages/newtab/store/store';
import { produce } from 'immer';
import { dialog } from '@pages/newtab/comps/global-dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@chakra-ui/react';
import styles from '@pages/newtab/panel/right/comps/group-content/style.module.scss';
import { Icon } from '@iconify-icon/react';
import React from 'react';
import { cls } from '@src/shared/kits';
import { openTab } from '@root/src/pages/newtab/util/open-tab';
import { Actions } from '@pages/newtab/store/actions';
import { ARCHIVE_GROUP_ID } from '@src/constant';
import copy from 'copy-to-clipboard';
import { globalToast } from '@pages/newtab/Newtab';

export const SpaceMoreActions = ({ space }: { space: SpaceInfo }) => {
  const spaceId = space.uuid;
  const currentGroupSpaces = useStore(state => state.groupsMap[state.selectedGroupId]);
  const currentSpace = useStore(state => state.allSpacesMap[spaceId]);
  const disableAutoGroup = currentSpace.disableAutoGroup;

  const actionsList = [
    {
      name: 'OPEN ALL',
      icon: 'ph:sun-duotone',
      action: () => {
        space.tabs.forEach((tab, index) => {
          const fn = () =>
            openTab({
              tab,
              space: {
                ...useStore.getState().allSpacesMap[spaceId],
              },
            });

          if (index >= 1) {
            setTimeout(fn, 200);
          } else {
            fn();
          }
        });
      },
    },
    {
      name: 'COPY ALL URLS',
      icon: 'icon-park-twotone:copy',
      iconSize: {
        width: 16,
        height: 16,
      },
      action: () => {
        copy(space.tabs.map(tab => tab.url).join('\n'));
        globalToast({
          title: 'Copied',
          description: 'All URLs copied to clipboard',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      },
    },
    {
      name: 'DEL SPACE',
      icon: 'lets-icons:del-alt-duotone-line',
      action: () => {
        const fn = () => {
          Actions.deleteSpace(spaceId);
        };

        if (currentSpace.tabs.length) {
          dialog.confirm({
            title: 'Confirm',
            content: 'Are you sure to delete this space?',
            onOk: () => {
              fn();
            },
          });
        } else {
          fn();
        }
      },
    },
    {
      name: 'MOVE UP',
      icon: 'mdi:arrow-up',
      action: () => {
        if (currentGroupSpaces.subSpacesIds[0] === spaceId) {
          return;
        }

        useStore.setState(old => {
          return produce(old, draft => {
            const currentGroup = draft.groupsMap[draft.selectedGroupId];
            const index = currentGroup.subSpacesIds.findIndex(id => id === spaceId);
            const temp = currentGroup.subSpacesIds[index];
            currentGroup.subSpacesIds[index] = currentGroup.subSpacesIds[index - 1];
            currentGroup.subSpacesIds[index - 1] = temp;
          });
        });
      },
    },
    {
      name: 'MOVE DOWN',
      icon: 'mdi:arrow-down',
      action: () => {
        if (currentGroupSpaces.subSpacesIds[currentGroupSpaces.subSpacesIds.length - 1] === spaceId) {
          return;
        }
        useStore.setState(old => {
          return produce(old, draft => {
            const currentGroup = draft.groupsMap[draft.selectedGroupId];
            const index = currentGroup.subSpacesIds.findIndex(id => id === spaceId);
            const temp = currentGroup.subSpacesIds[index];
            currentGroup.subSpacesIds[index] = currentGroup.subSpacesIds[index + 1];
            currentGroup.subSpacesIds[index + 1] = temp;
          });
        });
      },
    },
    {
      name: 'ARCHIVE',
      icon: 'material-symbols:archive',
      action: () => {
        useStore.setState(old => {
          return produce(old, draft => {
            draft.groupsMap[draft.selectedGroupId].subSpacesIds = draft.groupsMap[
              draft.selectedGroupId
            ].subSpacesIds.filter(id => id !== spaceId);
            if (!draft.groupsMap[ARCHIVE_GROUP_ID]) {
              draft.groupsMap[ARCHIVE_GROUP_ID] = {
                id: ARCHIVE_GROUP_ID,
                name: 'Archive',
                subSpacesIds: [],
              };
            }
            draft.groupsMap[ARCHIVE_GROUP_ID].subSpacesIds.push(spaceId);
          });
        });
      },
    },
  ];

  return (
    <>
      <div
        onClick={() => {
          useStore.setState(old => {
            return produce(old, draft => {
              draft.allSpacesMap[spaceId] = {
                ...draft.allSpacesMap[spaceId],
                disableAutoGroup: !disableAutoGroup,
              };
            });
          });
        }}
        className={
          'text-gray-500 hover:text-[#da74e1] hover:bg-[#ffdbfa] cursor-pointer rounded-full w-[24px] h-[24px] flex items-center justify-center'
        }>
        <Icon icon={disableAutoGroup ? 'uil:layer-group-slash' : 'uim:layer-group'} width="18" height="18" inline />
      </div>

      <Popover placement={'bottom-start'} matchWidth={true}>
        <PopoverTrigger>
          <div className={cls(styles.moreActionIcon, 'text-gray-500 hover:text-[#da74e1] hover:bg-[#ffdbfa]')}>
            <Icon icon="material-symbols:more-horiz" width="18" height="18" inline />
          </div>
        </PopoverTrigger>

        <PopoverContent
          className={styles.spaceMoreActionWrapper}
          width={150}
          style={{
            boxShadow: '0 0 10px 0 rgba(0,0,0,0.1)',
          }}>
          {actionsList.map(item => (
            <div
              key={item.name}
              onClick={() => {
                item.action();
              }}>
              <Icon icon={item.icon} width="18" height="18" {...item.iconSize} inline />
              <div>{item.name}</div>
            </div>
          ))}
        </PopoverContent>
      </Popover>
    </>
  );
};
