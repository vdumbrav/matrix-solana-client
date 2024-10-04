import { useContext } from 'react';
import styles from './LogoutButton.module.scss';
import { AuthContext } from '../../contexts/AuthContext';

interface IProps {
  matrixUserId: string;
}
export const LogoutButton = ({ matrixUserId }: IProps) => {
  const { logout } = useContext(AuthContext);

  return (
    <button onClick={logout} className={styles.logoutButton}>
      <span> {matrixUserId} </span>
      Logout
    </button>
  );
};
