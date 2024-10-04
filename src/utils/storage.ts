export const getMatrixAuthFromLocalStorage = () => {
  const matrixAccessToken = localStorage.getItem('matrixAccessToken');
  const matrixUserId = localStorage.getItem('matrixUserId');
  return {
    matrixAccessToken: matrixAccessToken ? JSON.parse(matrixAccessToken) : null,
    matrixUserId: matrixUserId ? JSON.parse(matrixUserId) : null,
  };
};

export const saveMatrixAuthToLocalStorage = (accessToken: string, userId: string) => {
  localStorage.setItem('matrixAccessToken', JSON.stringify(accessToken));
  localStorage.setItem('matrixUserId', JSON.stringify(userId));
};

export const clearMatrixAuthFromLocalStorage = () => {
  localStorage.removeItem('matrixAccessToken');
  localStorage.removeItem('matrixUserId');
};
