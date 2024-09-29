import { useContext } from 'react';
import { useForm } from 'react-hook-form';
import classNames from 'classnames';
import styles from './Login.module.scss';
import { AuthContext } from '../../contexts/AuthContext';

interface FormValues {
  email: string;
}

export const Login = () => {
  const { login } = useContext(AuthContext);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>();

  const onSubmit = async (data: FormValues) => {
    await login(data.email);
  };

  return (
    <div className={styles.loginContainer}>
      <h2>Login to the Application</h2>
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
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
          className={classNames(styles.input, {
            [styles.errorInput]: errors.email,
          })}
        />
        {errors.email && <span className={styles.errorMessage}>{errors.email.message}</span>}
        <button type="submit" className={styles.button} disabled={isSubmitting}>
          {isSubmitting ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};
