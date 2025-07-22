import { User } from '../types';

interface NavigationProps {
  user: User | null;
  isAuthenticated: boolean;
  onLogout: () => void;
  onDeleteAccount: () => void;
}

const Navigation = ({ user, isAuthenticated, onLogout, onDeleteAccount }: NavigationProps) => {
  return null; // Temporary placeholder
};

export default Navigation;
