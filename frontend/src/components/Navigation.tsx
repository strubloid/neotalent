import React from 'react';
import { User } from '../types';

interface NavigationProps {
  user: User | null;
  isAuthenticated: boolean;
  onLogout: () => void;
  onDeleteAccount: () => void;
}

const Navigation = ({ user, isAuthenticated, onLogout, onDeleteAccount }: NavigationProps) => {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container">
        <a className="navbar-brand" href="/">
          <i className="bi bi-calculator me-2"></i>
          NeoTalent Calorie Tracker
        </a>
        
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <a className="nav-link active" href="/">
                <i className="bi bi-house me-1"></i>
                Home
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="/nutrition">
                <i className="bi bi-search me-1"></i>
                Analyze Food
              </a>
            </li>
          </ul>
          
          <ul className="navbar-nav">
            {isAuthenticated && user ? (
              <>
                <li className="nav-item dropdown">
                  <a 
                    className="nav-link dropdown-toggle" 
                    href="#" 
                    role="button" 
                    data-bs-toggle="dropdown"
                  >
                    <i className="bi bi-person-circle me-1"></i>
                    {user.nickname}
                  </a>
                  <ul className="dropdown-menu">
                    <li>
                      <button className="dropdown-item" onClick={onLogout}>
                        <i className="bi bi-box-arrow-right me-2"></i>
                        Logout
                      </button>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button 
                        className="dropdown-item text-danger" 
                        onClick={onDeleteAccount}
                      >
                        <i className="bi bi-trash me-2"></i>
                        Delete Account
                      </button>
                    </li>
                  </ul>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <button 
                    className="btn btn-outline-light me-2"
                    data-bs-toggle="modal"
                    data-bs-target="#loginModal"
                  >
                    <i className="bi bi-box-arrow-in-right me-1"></i>
                    Login
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className="btn btn-light"
                    data-bs-toggle="modal"
                    data-bs-target="#registerModal"
                  >
                    <i className="bi bi-person-plus me-1"></i>
                    Register
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
