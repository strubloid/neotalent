import React, { Component } from 'react';
import { AuthModalsProps } from '../interfaces';

interface AuthModalsState {
  loginForm: { username: string; password: string };
  registerForm: { username: string; password: string; nickname: string; confirmPassword: string };
  loginLoading: boolean;
  registerLoading: boolean;
  loginError: string;
  registerError: string;
}

class AuthModals extends Component<AuthModalsProps, AuthModalsState> {
  constructor(props: AuthModalsProps) {
    super(props);
    this.state = {
      loginForm: { username: '', password: '' },
      registerForm: { username: '', password: '', nickname: '', confirmPassword: '' },
      loginLoading: false,
      registerLoading: false,
      loginError: '',
      registerError: ''
    };
  }

  handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!this.state.loginForm.username || !this.state.loginForm.password) {
      this.setState({ loginError: 'Please fill in all fields' });
      return;
    }
    
    this.setState({ loginLoading: true, loginError: '' });
    
    try {
      await this.props.onLogin({ username: this.state.loginForm.username, password: this.state.loginForm.password });
      // Reset form on success
      this.setState({ loginForm: { username: '', password: '' } });
      // Close modal (will be handled by Bootstrap)
      const modalElement = document.getElementById('loginModal');
      if (modalElement) {
        const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
        modal?.hide();
      }
    } catch (error: any) {
      this.setState({ loginError: error.message || 'Login failed' });
    } finally {
      this.setState({ loginLoading: false });
    }
  };

  handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!this.state.registerForm.username || !this.state.registerForm.password || !this.state.registerForm.nickname || !this.state.registerForm.confirmPassword) {
      this.setState({ registerError: 'Please fill in all fields' });
      return;
    }
    
    if (this.state.registerForm.password !== this.state.registerForm.confirmPassword) {
      this.setState({ registerError: 'Passwords do not match' });
      return;
    }

    if (this.state.registerForm.password.length < 6) {
      this.setState({ registerError: 'Password must be at least 6 characters long' });
      return;
    }
    
    this.setState({ registerLoading: true, registerError: '' });
    
    try {
      await this.props.onRegister({ 
        username: this.state.registerForm.username, 
        password: this.state.registerForm.password, 
        nickname: this.state.registerForm.nickname 
      });
      // Reset form on success
      this.setState({ registerForm: { username: '', password: '', nickname: '', confirmPassword: '' } });
      // Close modal
      const modalElement = document.getElementById('registerModal');
      if (modalElement) {
        const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
        modal?.hide();
      }
    } catch (error: any) {
      this.setState({ registerError: error.message || 'Registration failed' });
    } finally {
      this.setState({ registerLoading: false });
    }
  };

  override render() {
    const { loginForm, registerForm, loginLoading, registerLoading, loginError, registerError } = this.state;

    return (
      <>
        {/* Login Modal */}
        <div className="modal fade" id="loginModal" tabIndex={-1} aria-labelledby="loginModalLabel" aria-hidden="true">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h1 className="modal-title fs-5" id="loginModalLabel">
                  <i className="bi bi-box-arrow-in-right me-2"></i>
                  Login to Your Journey
                </h1>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <form onSubmit={this.handleLoginSubmit}>
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
                      onChange={(e) => this.setState({
                        loginForm: { ...loginForm, username: e.target.value }
                      })}
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
                      onChange={(e) => this.setState({
                        loginForm: { ...loginForm, password: e.target.value }
                      })}
                      disabled={loginLoading}
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-success" data-bs-dismiss="modal" disabled={loginLoading}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-success" disabled={loginLoading}>
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
                  Create Your Account
                </h1>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <form onSubmit={this.handleRegisterSubmit}>
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
                      onChange={(e) => this.setState({
                        registerForm: { ...registerForm, nickname: e.target.value }
                      })}
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
                      onChange={(e) => this.setState({
                        registerForm: { ...registerForm, username: e.target.value }
                      })}
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
                      onChange={(e) => this.setState({
                        registerForm: { ...registerForm, password: e.target.value }
                      })}
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
                      onChange={(e) => this.setState({
                        registerForm: { ...registerForm, confirmPassword: e.target.value }
                      })}
                      disabled={registerLoading}
                      placeholder="Re-enter your password"
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-success" data-bs-dismiss="modal" disabled={registerLoading}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-success" disabled={registerLoading}>
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
  }
}

export default AuthModals;
