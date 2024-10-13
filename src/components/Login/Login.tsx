import { useContext, useState } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import styles from './Login.module.scss';
import classnames from 'classnames';

export const Login = () => {
  const { loginWithGoogle, loginWithMagicLink } = useContext(AuthContext);
  const [email, setEmail] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleLoginWithEmail = async () => {
    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      await loginWithMagicLink(email);
    } catch (error) {
      setErrorMessage('Failed to send Magic Link. Please check your email.');
      console.error('Magic Link login error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setErrorMessage(null);
      await loginWithGoogle();
    } catch (error) {
      setErrorMessage('Google login failed.');
      console.error('Google login error:', error);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <h2>Login</h2>

      <div className={styles.form}>
        <h3>Login with your Email</h3>
        <input
          type="email"
          placeholder="Enter your email"
          disabled={isSubmitting}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={classnames(styles.input)}
        />
        {errorMessage && <span className={styles.errorMessage}>{errorMessage}</span>}

        <button onClick={handleLoginWithEmail} className={styles.buttonSubmit} disabled={isSubmitting || !email}>
          {isSubmitting ? 'Sending Magic Link...' : 'Login with Magic Link'}
        </button>
      </div>

      <div className={styles.divider}>OR</div>

      <button onClick={handleGoogleLogin} className={classnames(styles.googleButton, styles.buttonSubmit)}>
        Login with Google
      </button>
    </div>
  );
};
