import { addPageToCurrentSpace, useAllOpenedTabs, useStore } from '@pages/newtab/store';
import {
  Button,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverTrigger,
  Portal,
} from '@chakra-ui/react';
import styles from './style.module.scss';
import { Icon } from '@iconify-icon/react';
import React from 'react';
import { cls } from '@src/shared/kits';

export const AddTabToGetPopoverCurrentSpace = () => {
  const tabs = useAllOpenedTabs();
  const currentSpaceTabs = useStore(state => state.spaces[state.selectedId].tabs);

  return (
    <Popover placement={'right-end'}>
      <PopoverTrigger>
        <Button size={'sm'}>Add Tab</Button>
      </PopoverTrigger>

      <Portal>
        <PopoverContent
          style={{
            width: 700,
          }}>
          {/*<PopoverArrow />*/}
          {/*<PopoverHeader>Header</PopoverHeader>*/}
          {/*<PopoverCloseButton />*/}

          <PopoverBody
            style={{
              maxHeight: 500,
              overflowY: 'auto',
            }}>
            {tabs.map(tab => {
              const isSelect = currentSpaceTabs.some(t => t.id === tab.id);
              return (
                <div
                  className={styles.popoverTabListItem}
                  key={tab.id}
                  onClick={() => {
                    addPageToCurrentSpace(tab);
                  }}>
                  <div className={styles.popoverTabListItemLeft}>
                    <img src={tab.favIconUrl} className={styles.favicon} alt="" />
                    {tab.title}
                  </div>

                  <div
                    className={cls(styles.popoverTabListItemRight, {
                      [styles.popoverTabListItemSelected]: isSelect,
                    })}>
                    {isSelect ? (
                      <Icon inline icon="lets-icons:dell-duotone" style={{ color: '#ff0000' }} />
                    ) : (
                      <Icon inline icon="mdi:tag-outline" />
                    )}
                  </div>
                </div>
              );
            })}
          </PopoverBody>

          {/*<PopoverFooter>This is the footer</PopoverFooter>*/}
        </PopoverContent>
      </Portal>
    </Popover>
  );
};
