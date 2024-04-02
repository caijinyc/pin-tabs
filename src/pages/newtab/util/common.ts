// toLowerCase diff

export const lowerMultiIncludes = (searchText: string, ...checkTexts: string[]) => {
  return checkTexts.some(b => (b || '').toLowerCase().includes((searchText || '').toLowerCase()));
};
