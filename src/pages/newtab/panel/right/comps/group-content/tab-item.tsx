import { SpaceInfo, TabInfo, useCacheImgBase64, useStore } from '@pages/newtab/store/store';
import React, { useEffect } from 'react';
import styles from '@pages/newtab/panel/right/comps/group-content/style.module.scss';
import { Icon } from '@iconify-icon/react';
import { Input } from '@chakra-ui/react';
import { produce } from 'immer';
import { openTab } from '@pages/newtab/panel/right/comps/group-content/index';
import { getImageBase64 } from '@pages/newtab/util/cache-images';

const RenderFavicon = ({ tab }: { tab: TabInfo }) => {
  const initIconCacheData = useCacheImgBase64(state => state.init);

  const favIconBase64 = useCacheImgBase64(state => {
    if (!tab.favIconUrl?.startsWith('http')) return;

    return state.value[tab.favIconUrl];
  });

  useEffect(() => {
    if (initIconCacheData && tab.favIconUrl?.startsWith('http') && !favIconBase64) {
      getImageBase64(tab.favIconUrl)
        .then(val => {
          useCacheImgBase64.setState(old => {
            return {
              value: {
                ...old.value,
                [tab.favIconUrl]: val,
              },
            };
          });
        })
        .catch(e => {
          console.error('getImageBase64', tab.favIconUrl, e);
        });
    }
  }, [initIconCacheData]);

  return (
    <>
      {tab.url.startsWith('chrome://') || tab.url.startsWith('edge://extensions') ? (
        <Icon inline icon="fluent:extension-16-filled" width={16} height={16} />
      ) : (
        <img src={favIconBase64 || tab.favIconUrl} className={styles.favicon} alt="" />
      )}
    </>
  );
};
export const TabItem = ({ tab, space }: { tab: TabInfo; space: SpaceInfo }) => {
  const spaceId = space.uuid;
  const [isEdit, setIsEdit] = React.useState(false);

  return (
    <div className={styles.tabListItem} key={tab.id}>
      <div
        className={styles.tabItemWrapper}
        onMouseDown={e => {
          const isMiddleClick = e.button === 1;
          const isLeftClick = e.button === 0;

          if (![isLeftClick, isMiddleClick].some(Boolean)) return;

          if (isEdit) return;

          // get tab active status from tab url
          openTab({ tab, space, autoActiveOpenedTab: isLeftClick });
        }}>
        <RenderFavicon tab={tab} />

        {isEdit ? (
          <Input
            size={'xs'}
            autoFocus
            placeholder="Unstyled"
            defaultValue={tab.title}
            onKeyUp={e => {
              if (e.key === 'Enter' || e.key === 'Escape') {
                e.currentTarget.blur();
              }
            }}
            onBlur={e => {
              setIsEdit(false);
              if (e.target.value) {
                useStore.setState(old => {
                  return produce(old, draft => {
                    draft.allSpacesMap[spaceId].tabs = draft.allSpacesMap[spaceId].tabs.map(t => {
                      if (t.id === tab.id) {
                        t.title = e.target.value;
                      }
                      return t;
                    });
                  });
                });
              }
            }}
          />
        ) : (
          <div className={styles.tabTitle}>{tab.title}</div>
        )}
      </div>

      {isEdit ? null : (
        <div className={styles.tabActions}>
          <Icon
            onClick={() => {
              setIsEdit(true);
            }}
            inline
            icon="lets-icons:edit-duotone-line"
            width={'18px'}
            height={'18px'}
            className={styles.delTab}
          />
          <Icon
            onClick={() => {
              useStore.setState(old => {
                return produce(old, draft => {
                  draft.allSpacesMap[spaceId].tabs = draft.allSpacesMap[spaceId].tabs.filter(t => t.id !== tab.id);
                });
              });
            }}
            inline
            icon="lets-icons:dell-duotone"
            width={'18px'}
            height={'18px'}
            className={styles.delTab}
          />
        </div>
      )}
    </div>
  );
};
