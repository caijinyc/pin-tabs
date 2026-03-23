import styles from '@pages/newtab/style.module.scss';
import React from 'react';
import cls from 'classnames';
import { Groups } from '@pages/newtab/panel/left-group-side/group';
import { Actions } from '@pages/newtab/store/actions';
import { LeftPanelBottomActions } from '@pages/newtab/panel/left-group-side/left-panel-bottom-actions';
import Favicon from '@assets/favicon.svg';
import { Icon } from '@iconify-icon/react';

export const LeftPanel = () => {
  return (
    <div className={cls(styles.leftPanel, 'flex flex-col h-screen')}>
      <div className={'inline-flex justify-between items-center pb-2 border-b border-app-border mb-2'}>
        <div className={'flex gap-2 items-center'}>
          <img src={Favicon} alt="Logo" width="16" height="16" />
          <span className={'text-sm font-semibold tracking-wide'}>Spaces</span>
        </div>
        <div
          className={'cursor-pointer flex items-center justify-center text-app-text-muted hover:text-app-text transition-colors'}
          onClick={() => {
            Actions.addNewGroup();
          }}>
          <Icon icon="carbon:add-filled" inline width={18} height={18} />
        </div>
      </div>

      <div className={cls(styles.leftSpaceWrapper, 'flex-1 overflow-y-scroll flex flex-col pb-6')}>
        <Groups />
      </div>

      <LeftPanelBottomActions />
    </div>
  );
};
