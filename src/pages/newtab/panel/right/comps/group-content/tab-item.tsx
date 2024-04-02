import { SpaceInfo, TabInfo, useCacheImgBase64, useStore } from '@pages/newtab/store/store';
import React, { useEffect } from 'react';
import styles from '@pages/newtab/panel/right/comps/group-content/style.module.scss';
import { Icon } from '@iconify-icon/react';
import { Input } from '@chakra-ui/react';
import { produce } from 'immer';
import { getImageBase64 } from '@pages/newtab/util/cache-images';
import { openTab } from '@root/src/pages/newtab/util/open-tab';
import { cls, useComposition } from '@src/shared/kits';
import { useSelectedSearchedTabIndex } from '@pages/newtab/panel/right';

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

const highlightSearchText = (title: string, searchText: string) => {
  // 用正则表达式创建一个动态的搜索模式，'gi' 表示全局搜索且不区分大小写
  const regex = new RegExp(searchText, 'gi');
  // 使用 replace 方法替换所有匹配的文本
  const highlightedTitle = title.replace(regex, match => `<span class="bg-amber-800">${match}</span>`);

  // 由于结果是一个字符串，我们需要使用 dangerouslySetInnerHTML 来渲染它
  // 这样可以避免 React 将其作为文本而不是 HTML 解析
  // 注意：使用 dangerouslySetInnerHTML 时要确保 searchText 不会引起 XSS 攻击
  return <span dangerouslySetInnerHTML={{ __html: highlightedTitle }}></span>;
};

export const TabItem = ({ tab, space, searchText }: { tab: TabInfo; space: SpaceInfo; searchText?: string }) => {
  const spaceId = space.uuid;
  const [isEdit, setIsEdit] = React.useState(false);
  const { isComposing, inputUpdateCompositionStatusProps } = useComposition();
  const searchCursorTabInfo = useSelectedSearchedTabIndex(state => state.tab);

  const isSearchCursorTab = searchCursorTabInfo?.space.uuid === spaceId && searchCursorTabInfo?.id === tab.id;

  // 使用方式
  // 假设 tab.title 是你要高亮的标题，searchText 是用户的搜索文本
  const searchRenderTitle = highlightSearchText(tab.title, searchText);

  return (
    <div
      className={cls(styles.tabListItem, {
        ['bg-amber-800']: isSearchCursorTab,
      })}
      key={tab.id}>
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
            {...inputUpdateCompositionStatusProps}
            onKeyDown={e => {
              if (isComposing) return;
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
          <div className={styles.tabTitle}>{searchText ? searchRenderTitle : tab.title}</div>
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

          {tab.openCount > 0 && <div className={'text-gray-400'}>⚡️{tab.openCount}</div>}
        </div>
      )}
    </div>
  );
};
