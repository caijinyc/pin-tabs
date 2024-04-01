// toLowerCase diff

export const lowerIncludes = (a: string, b: string) => {
  return (a || '').toLowerCase().includes((b || '').toLowerCase());
};
