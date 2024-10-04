import { useContext } from 'react';
import { useForm } from 'react-hook-form';
import { AuthContext } from '../../contexts/AuthContext';
import styles from './Login.module.scss';
import classnames from 'classnames';

interface FormValues {
  email: string;
}

export const Login = () => {
  const { loginWithMagicLink, loginWithGoogle } = useContext(AuthContext);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>();

  const onSubmit = async (data: FormValues) => {
    await loginWithMagicLink(data.email);
  };

  return (
    <div className={styles.loginContainer}>
      <h2>Login</h2>

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <h3>Login with Magic Link</h3>
        <input
          type="email"
          placeholder="Enter your email"
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/,
              message: 'Invalid email address',
            },
          })}
          className={classnames(styles.input, {
            [styles.errorInput]: errors.email,
          })}
        />
        {errors.email && <span className={styles.errorMessage}>{errors.email.message}</span>}
        <button type="submit" className={styles.buttonSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'Logging in...' : 'Login with Magic Link'}
        </button>
      </form>

      <div className={styles.divider}>OR</div>

      <button onClick={loginWithGoogle} className={classnames(styles.googleButton, styles.buttonSubmit)}>
        Login with Google
      </button>
    </div>
  );
};
