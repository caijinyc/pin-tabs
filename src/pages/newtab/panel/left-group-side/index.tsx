import styles from '@pages/newtab/style.module.scss';
import { Button } from '@chakra-ui/react';
import React from 'react';
import cls from 'classnames';
import { Groups } from '@pages/newtab/panel/left-group-side/group';
import { Actions } from '@pages/newtab/store/actions';
import { LeftPanelBottomActions } from '@pages/newtab/panel/left-group-side/left-panel-bottom-actions';
import Favicon from '@assets/favicon.svg';
import { Icon } from '@iconify-icon/react';

export const LeftPanel = () => {
  return (
    <div className={cls(styles.leftPanel, 'flex flex-col justify-between')}>
      <div className={cls(styles.leftSpaceWrapper)}>
        <div className={'flex justify-between items-center pb-1 border-b-1 border-[#2d2d2d] mb-1'}>
          <div className={'flex gap-2'}>
            <img src={Favicon} alt="Logo" width="14" height="14" />
            <span className={'text-sm font-serif font-bold'}>Spaces</span>
          </div>
          <div
            className={' cursor-pointer flex items-center justify-center hover:text-gray-100 text-gray-500'}
            onClick={() => {
              Actions.addNewGroup();
            }}>
            <Icon icon="carbon:add-filled" inline width={18} height={18} />
          </div>
        </div>

        <Groups />
      </div>

      <LeftPanelBottomActions />
    </div>
  );
};
