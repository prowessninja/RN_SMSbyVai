let lastAction = null;

export const cacheLastAction = (action) => {
  lastAction = action;
};

export const retryLastAction = () => {
  if (lastAction) {
    lastAction();
    lastAction = null;
  }
};
