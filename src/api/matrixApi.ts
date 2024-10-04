interface MatrixLoginResponse {
  access_token: string;
  user_id: string;
  error?: string;
}

export const matrixLoginWithPassword = async (username: string, password: string): Promise<MatrixLoginResponse> => {
  const response = await fetch('https://matrix.org/_matrix/client/v3/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'm.login.password',
      user: username,
      password: password,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Matrix login failed');
  }
  return data;
};

export const matrixLoginWithToken = async (loginToken: string): Promise<MatrixLoginResponse> => {
  const response = await fetch('https://matrix.org/_matrix/client/v3/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'm.login.token',
      token: loginToken,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Matrix login failed');
  }
  return data;
};
