import cls from 'classnames';
import { isEqual } from 'lodash';
import React from 'react';

export { cls };

export const uuid = () => {
  return 'xxxx-xxxx-xxxx-xxxx'.replace(/x/g, () => {
    return Math.floor(Math.random() * 16).toString(16);
  });
};

export const removeUrlHash = (url: string) => {
  return url.split('#')[0];
};

export const diffMapPickKeys = <T extends Record<string, unknown>>(a: T, b: T, keys: (keyof T)[]) => {
  return Boolean(
    keys.find(key => {
      if (!isEqual(a[key], b[key])) {
        return true;
      }
    }),
  );
};

export const useComposition = () => {
  const [onComposition, setOnComposition] = React.useState(false);
  return {
    isComposing: onComposition,
    inputUpdateCompositionStatusProps: {
      onCompositionStart: () => {
        setOnComposition(true);
      },
      onCompositionEnd: () => {
        setOnComposition(false);
      },
    },
  };
};
