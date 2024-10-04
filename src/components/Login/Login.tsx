import { useContext, useState } from 'react';
import { useForm } from 'react-hook-form';
import { AuthContext } from '../../contexts/AuthContext';
import styles from './Login.module.scss';
import classnames from 'classnames';

interface FormValues {
  username: string;
  password: string;
}

export const Login = () => {
  const { loginWithPassword, loginWithGoogle } = useContext(AuthContext);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onSubmit = async (data: FormValues) => {
    try {
      setErrorMessage(null);
      await loginWithPassword(data.username, data.password);
    } catch (error) {
      setErrorMessage('Login failed. Please check your username and password.');
      console.error('Login error:', error);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <h2>Login</h2>

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <h3>Login with Username and Password</h3>
        <input
          type="text"
          placeholder="Enter your Matrix username"
          disabled={isSubmitting}
          {...register('username', { required: 'Username is required' })}
          className={classnames(styles.input, { [styles.errorInput]: errors.username })}
        />
        {errors.username && <span className={styles.errorMessage}>{errors.username.message}</span>}

        <input
          type="password"
          placeholder="Enter your password"
          disabled={isSubmitting}
          {...register('password', { required: 'Password is required' })}
          className={classnames(styles.input, { [styles.errorInput]: errors.password })}
        />
        {errors.password && <span className={styles.errorMessage}>{errors.password.message}</span>}

        {errorMessage && <span className={styles.errorMessage}>{errorMessage}</span>}

        <button type="submit" className={styles.buttonSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'Logging in...' : 'Login with Password'}
        </button>
      </form>

      <div className={styles.divider}>OR</div>

      <button onClick={loginWithGoogle} className={classnames(styles.googleButton, styles.buttonSubmit)}>
        Login with Google
      </button>
    </div>
  );
};
