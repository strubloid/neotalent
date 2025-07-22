interface AuthModalsProps {
  onLogin: (credentials: { username: string; password: string }) => void;
  onRegister: (userData: { username: string; password: string; nickname: string }) => void;
}

const AuthModals = ({ onLogin, onRegister }: AuthModalsProps) => {
  return null; // Temporary placeholder
};

export default AuthModals;
