import cls from 'classnames';

export { cls };

export const uuid = () => {
  return 'xxxx-xxxx-xxxx-xxxx'.replace(/x/g, () => {
    return Math.floor(Math.random() * 16).toString(16);
  });
};
