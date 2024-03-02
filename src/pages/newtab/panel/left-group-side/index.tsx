import styles from '@pages/newtab/style.module.scss';
import { Button } from '@chakra-ui/react';
import React from 'react';
import cls from 'classnames';
import { Groups } from '@pages/newtab/panel/left-group-side/group';
import { Actions } from '@pages/newtab/store/actions';
import { LeftPanelBottomActions } from '@pages/newtab/panel/left-group-side/left-panel-bottom-actions';

export const LeftPanel = () => {
  return (
    <div className={cls(styles.leftPanel, 'flex flex-col justify-between')}>
      <div className={styles.leftSpaceWrapper}>
        <Groups />
        <div>
          <Button
            className={'mt-1'}
            size={'xs'}
            onClick={() => {
              Actions.addNewGroup();
            }}>
            Add Group
          </Button>
        </div>
      </div>

      <LeftPanelBottomActions />
    </div>
  );
};
