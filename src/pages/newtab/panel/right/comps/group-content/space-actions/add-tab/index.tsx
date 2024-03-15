import { TabInfo, useAllBrowserGroups, useIsPopupStore, useStore } from '@pages/newtab/store/store';
import { Popover, PopoverBody, PopoverContent, PopoverTrigger, Portal } from '@chakra-ui/react';
import styles from './style.module.scss';
import { Icon } from '@iconify-icon/react';
import React, { HTMLProps } from 'react';
import { cls } from '@src/shared/kits';
import { Actions } from '@pages/newtab/store/actions';
import { useAllOpenedTabs } from '@pages/newtab/util/get-all-opened-tabs';

export const spaceActionIconHoverClassNameArgs = 'text-zinc-300 hover:text-zinc-50 hover:bg-zinc-600';

const PinIcon = (props: {} & HTMLProps<any>) => {
  console.log('props', props);
  return (
    <div className={cls(styles.addIconWrapper, spaceActionIconHoverClassNameArgs)} {...props} ref={props.ref}>
      <Icon icon="fluent:pin-12-filled" className={''} inline width="18" height="18" />
    </div>
  );
};

export const AddTabToGetPopoverCurrentSpace = (props: { spaceId: string }) => {
  const tabs = useAllOpenedTabs();
  const allBrowserGroups = useAllBrowserGroups();
  const currentSpaceTabs = useStore(state => state.allSpacesMap[props.spaceId].tabs);
  const isPopup = useIsPopupStore(state => state);

  const data: Array<
    | TabInfo
    | {
        groupId: string;
        tabs: TabInfo[];
      }
  > = tabs.reduce((acc, tab) => {
    if (!tab.groupId) {
      acc.push(tab);
    } else {
      const group = acc.find(t => t.groupId === tab.groupId);
      if (group) {
        group.tabs.push(tab);
      } else {
        acc.push({
          groupId: tab.groupId,
          tabs: [tab],
        });
      }
    }

    return acc;
  }, []);

  if (isPopup) {
    // popup 模式下，直接添加当前激活的 tab
    return (
      <div
        className={styles.addIconWrapper}
        onClick={() => {
          const currentActiveTab = tabs.find(tab => tab.active);
          if (currentActiveTab) {
            Actions.addTabToSpace(props.spaceId, currentActiveTab);
          }
        }}>
        <PinIcon />
      </div>
    );
  }

  return (
    <Popover placement={'bottom-start'}>
      <PopoverTrigger>
        <div className={cls(styles.addIconWrapper, 'text-zinc-500 hover:text-zinc-50 hover:bg-zinc-600')}>
          <Icon icon="fluent:pin-12-filled" className={''} inline width="18" height="18" />
        </div>
      </PopoverTrigger>

      <Portal>
        <PopoverContent
          style={{
            boxShadow: '0 0 10px 0 rgba(0,0,0,0.1)',
            // width: 500,
          }}>
          {/*<PopoverArrow />*/}
          {/*<PopoverHeader>Header</PopoverHeader>*/}
          {/*<PopoverCloseButton />*/}

          <PopoverBody
            style={{
              maxHeight: 500,
              overflowY: 'auto',
            }}>
            {data.map((item, index) => {
              const renderTab = (tab: TabInfo) => {
                const isSelect = currentSpaceTabs.some(t => t.id === tab.id);
                return (
                  <>
                    <div
                      className={cls(
                        styles.popoverTabListItem,
                        // `bg-[${tab.groupId ? groups[tab.groupId]?.color : 'white'}]`,
                      )}
                      // style={{
                      //   backgroundColor: tab.groupId ? groups[tab.groupId]?.color : 'white',
                      // }}
                      key={tab.id}
                      onClick={() => {
                        Actions.addTabToSpace(props.spaceId, tab);
                      }}>
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

                      <div className={styles.popoverTabListItemLeft}>
                        <img src={tab.favIconUrl} className={styles.favicon} alt="" />
                        <div className={'truncate max-w-md '}>{tab.title}</div>
                      </div>
                    </div>
                  </>
                );
              };

              if (item.groupId) {
                return (
                  <div
                    className={'border-l-2 pt-0 pl-2 pr-2 mb-2'}
                    style={{
                      borderColor: allBrowserGroups[item.groupId]?.color,
                    }}>
                    <div className={'mb-2 font-bold'}>{allBrowserGroups[item.groupId]?.name}</div>
                    {(
                      item as {
                        groupId: string;
                        tabs: TabInfo[];
                      }
                    ).tabs.map(tab => renderTab(tab))}
                  </div>
                );
              }

              return renderTab(item as TabInfo);
            })}

            {/*{tabs.map(tab => {*/}
            {/*  const isSelect = currentSpaceTabs.some(t => t.id === tab.id);*/}
            {/*  console.log('groups[tab.groupId]', groups[tab.groupId]);*/}
            {/*  return (*/}
            {/*    <>*/}
            {/*      <div*/}
            {/*        className={cls(*/}
            {/*          styles.popoverTabListItem,*/}
            {/*          `bg-[${tab.groupId ? groups[tab.groupId]?.color : 'white'}]`,*/}
            {/*        )}*/}
            {/*        style={{*/}
            {/*          backgroundColor: tab.groupId ? groups[tab.groupId]?.color : 'white',*/}
            {/*        }}*/}
            {/*        key={tab.id}*/}
            {/*        onClick={() => {*/}
            {/*          addPageToCurrentSpace(props.spaceId, tab);*/}
            {/*        }}>*/}
            {/*        <div*/}
            {/*          className={cls(styles.popoverTabListItemRight, {*/}
            {/*            [styles.popoverTabListItemSelected]: isSelect,*/}
            {/*          })}>*/}
            {/*          {isSelect ? (*/}
            {/*            <Icon inline icon="lets-icons:dell-duotone" style={{ color: '#ff0000' }} />*/}
            {/*          ) : (*/}
            {/*            <Icon inline icon="mdi:tag-outline" />*/}
            {/*          )}*/}
            {/*        </div>*/}

            {/*        <div className={styles.popoverTabListItemLeft}>*/}
            {/*          <img src={tab.favIconUrl} className={styles.favicon} alt="" />*/}
            {/*          <div className={'truncate max-w-md '}>{tab.title}</div>*/}
            {/*        </div>*/}
            {/*      </div>*/}
            {/*    </>*/}
            {/*  );*/}
            {/*})}*/}
          </PopoverBody>

          {/*<PopoverFooter>This is the footer</PopoverFooter>*/}
        </PopoverContent>
      </Portal>
    </Popover>
  );
};
