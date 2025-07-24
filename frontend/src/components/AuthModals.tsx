import React, { useState } from 'react';
import { AuthModalsProps } from '../interfaces';

const AuthModals = ({ onLogin, onRegister }: AuthModalsProps) => {
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ username: '', password: '', nickname: '', confirmPassword: '' });
  const [loginLoading, setLoginLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [registerError, setRegisterError] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginForm.username || !loginForm.password) {
      setLoginError('Please fill in all fields');
      return;
    }
    
    setLoginLoading(true);
    setLoginError('');
    
    try {
      await onLogin({ username: loginForm.username, password: loginForm.password });
      // Reset form on success
      setLoginForm({ username: '', password: '' });
      // Close modal (will be handled by Bootstrap)
      const modalElement = document.getElementById('loginModal');
      if (modalElement) {
        const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
        modal?.hide();
      }
    } catch (error: any) {
      setLoginError(error.message || 'Login failed');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerForm.username || !registerForm.password || !registerForm.nickname || !registerForm.confirmPassword) {
      setRegisterError('Please fill in all fields');
      return;
    }
    
    if (registerForm.password !== registerForm.confirmPassword) {
      setRegisterError('Passwords do not match');
      return;
    }

    if (registerForm.password.length < 6) {
      setRegisterError('Password must be at least 6 characters long');
      return;
    }
    
    setRegisterLoading(true);
    setRegisterError('');
    
    try {
      await onRegister({ 
        username: registerForm.username, 
        password: registerForm.password, 
        nickname: registerForm.nickname 
      });
      // Reset form on success
      setRegisterForm({ username: '', password: '', nickname: '', confirmPassword: '' });
      // Close modal
      const modalElement = document.getElementById('registerModal');
      if (modalElement) {
        const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
        modal?.hide();
      }
    } catch (error: any) {
      setRegisterError(error.message || 'Registration failed');
    } finally {
      setRegisterLoading(false);
    }
  };

  return (
    <>
      {/* Login Modal */}
      <div className="modal fade" id="loginModal" tabIndex={-1} aria-labelledby="loginModalLabel" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="loginModalLabel">
                <i className="bi bi-box-arrow-in-right me-2"></i>
                Login to NeoTalent
              </h1>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <form onSubmit={handleLoginSubmit}>
              <div className="modal-body">
                {loginError && (
                  <div className="alert alert-danger" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {loginError}
                  </div>
                )}
                
                <div className="mb-3">
                  <label htmlFor="loginUsername" className="form-label">Username</label>
                  <input
                    type="text"
                    className="form-control"
                    id="loginUsername"
                    value={loginForm.username}
                    onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
                    disabled={loginLoading}
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="loginPassword" className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    id="loginPassword"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                    disabled={loginLoading}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" disabled={loginLoading}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loginLoading}>
                  {loginLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Logging in...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-box-arrow-in-right me-2"></i>
                      Login
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Register Modal */}
      <div className="modal fade" id="registerModal" tabIndex={-1} aria-labelledby="registerModalLabel" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="registerModalLabel">
                <i className="bi bi-person-plus me-2"></i>
                Create NeoTalent Account
              </h1>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <form onSubmit={handleRegisterSubmit}>
              <div className="modal-body">
                {registerError && (
                  <div className="alert alert-danger" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {registerError}
                  </div>
                )}
                
                <div className="mb-3">
                  <label htmlFor="registerNickname" className="form-label">Display Name</label>
                  <input
                    type="text"
                    className="form-control"
                    id="registerNickname"
                    value={registerForm.nickname}
                    onChange={(e) => setRegisterForm({...registerForm, nickname: e.target.value})}
                    disabled={registerLoading}
                    placeholder="How should we call you?"
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="registerUsername" className="form-label">Username</label>
                  <input
                    type="text"
                    className="form-control"
                    id="registerUsername"
                    value={registerForm.username}
                    onChange={(e) => setRegisterForm({...registerForm, username: e.target.value})}
                    disabled={registerLoading}
                    placeholder="Choose a unique username"
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="registerPassword" className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    id="registerPassword"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})}
                    disabled={registerLoading}
                    placeholder="At least 6 characters"
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="registerConfirmPassword" className="form-label">Confirm Password</label>
                  <input
                    type="password"
                    className="form-control"
                    id="registerConfirmPassword"
                    value={registerForm.confirmPassword}
                    onChange={(e) => setRegisterForm({...registerForm, confirmPassword: e.target.value})}
                    disabled={registerLoading}
                    placeholder="Re-enter your password"
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" disabled={registerLoading}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={registerLoading}>
                  {registerLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-person-plus me-2"></i>
                      Create Account
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default AuthModals;
