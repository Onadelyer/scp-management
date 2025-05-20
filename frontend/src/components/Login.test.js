import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import Login from './Login';
import AuthContext from '../AuthContext';

// Mock axios
jest.mock('axios');

// Mock navigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock the auth context
const mockSetAuth = jest.fn();
const renderLoginWithContext = () => {
  return render(
    <AuthContext.Provider value={{ setAuth: mockSetAuth }}>
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    </AuthContext.Provider>
  );
};

describe('Login Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders login form correctly', () => {
    renderLoginWithContext();
    
    // Check for form elements
    expect(screen.getByText('Вхід до системи')).toBeInTheDocument();
    expect(screen.getByLabelText(/Ім'я користувача:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Пароль:/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Увійти/i })).toBeInTheDocument();
    expect(screen.getByText(/Не маєте акаунта?/i)).toBeInTheDocument();
    expect(screen.getByText(/Зареєструватися/i)).toBeInTheDocument();
  });

  test('handles input changes', async () => {
    renderLoginWithContext();
    
    const usernameInput = screen.getByLabelText(/Ім'я користувача:/i);
    const passwordInput = screen.getByLabelText(/Пароль:/i);
    
    await userEvent.type(usernameInput, 'testuser');
    await userEvent.type(passwordInput, 'password123');
    
    expect(usernameInput).toHaveValue('testuser');
    expect(passwordInput).toHaveValue('password123');
  });

  test('successful login redirects to home page', async () => {
    renderLoginWithContext();
    
    // Mock successful API response
    axios.post.mockResolvedValueOnce({
      data: {
        access_token: 'fake-token',
        user_role: 'Security Personnel',
      },
    });
    
    // Fill in the form
    await userEvent.type(screen.getByLabelText(/Ім'я користувача:/i), 'testuser');
    await userEvent.type(screen.getByLabelText(/Пароль:/i), 'password123');
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Увійти/i }));
    
    // Wait for the promise to resolve
    await waitFor(() => {
      // Verify API was called with correct data
      expect(axios.post).toHaveBeenCalledWith('http://localhost:8001/login', {
        username: 'testuser',
        password: 'password123',
      });
      
      // Verify context updates
      expect(mockSetAuth).toHaveBeenCalledWith({
        isAuthenticated: true,
        role: 'Security Personnel',
        username: 'testuser',
        token: 'fake-token',
      });
      
      // Verify navigation
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  test('shows alert on login failure', async () => {
    renderLoginWithContext();
    
    // Mock API error
    const errorMessage = 'Invalid credentials';
    axios.post.mockRejectedValueOnce(new Error(errorMessage));
    
    // Mock window.alert
    const originalAlert = window.alert;
    window.alert = jest.fn();
    
    // Fill and submit form
    await userEvent.type(screen.getByLabelText(/Ім'я користувача:/i), 'baduser');
    await userEvent.type(screen.getByLabelText(/Пароль:/i), 'badpass');
    fireEvent.click(screen.getByRole('button', { name: /Увійти/i }));
    
    // Wait for alert to be called
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Невірні облікові дані');
    });
    
    // Restore original alert
    window.alert = originalAlert;
  });
}); 