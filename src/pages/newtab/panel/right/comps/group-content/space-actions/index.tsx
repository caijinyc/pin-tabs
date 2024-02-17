import { SpaceInfo, useAllOpenedTabs, useStore } from '@pages/newtab/store';
import { produce } from 'immer';
import { dialog } from '@pages/newtab/comps/global-dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@chakra-ui/react';
import styles from '@pages/newtab/panel/right/comps/group-content/style.module.scss';
import { Icon } from '@iconify-icon/react';
import React from 'react';
import { openTab } from '@pages/newtab/panel/right/comps/group-content';

export const SpaceMoreActions = ({ space }: { space: SpaceInfo }) => {
  const spaceId = space.uuid;
  const currentGroupSpaces = useStore(state => state.groups[state.selectedIndex]);
  const currentSpace = useStore(state => state.allSpacesMap[spaceId]);
  const allOpenedTabs = useAllOpenedTabs();

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
      name: 'DEL SPACE',
      icon: 'lets-icons:del-alt-duotone-line',
      action: () => {
        const fn = () => {
          useStore.setState(old => {
            return produce(old, draft => {
              draft.groups[draft.selectedIndex].subSpacesIds = draft.groups[draft.selectedIndex].subSpacesIds.filter(
                id => id !== spaceId,
              );
              delete draft.allSpacesMap[spaceId];
            });
          });
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
            const index = draft.groups[draft.selectedIndex].subSpacesIds.findIndex(id => id === spaceId);
            const temp = draft.groups[draft.selectedIndex].subSpacesIds[index];
            draft.groups[draft.selectedIndex].subSpacesIds[index] =
              draft.groups[draft.selectedIndex].subSpacesIds[index - 1];
            draft.groups[draft.selectedIndex].subSpacesIds[index - 1] = temp;
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
            const index = draft.groups[draft.selectedIndex].subSpacesIds.findIndex(id => id === spaceId);
            const temp = draft.groups[draft.selectedIndex].subSpacesIds[index];
            draft.groups[draft.selectedIndex].subSpacesIds[index] =
              draft.groups[draft.selectedIndex].subSpacesIds[index + 1];
            draft.groups[draft.selectedIndex].subSpacesIds[index + 1] = temp;
          });
        });
      },
    },
  ];

  return (
    <Popover placement={'bottom-start'} matchWidth={true}>
      <PopoverTrigger>
        <div className={styles.moreActionIcon}>
          <Icon icon="material-symbols:more-horiz" width="18" height="18" inline />
        </div>
      </PopoverTrigger>

      <PopoverContent className={styles.spaceMoreActionWrapper} width={150}>
        {actionsList.map(item => (
          <div
            key={item.name}
            onClick={() => {
              item.action();
            }}>
            <Icon icon={item.icon} width="18" height="18" inline />
            <div>{item.name}</div>
          </div>
        ))}
      </PopoverContent>
    </Popover>
  );
};
