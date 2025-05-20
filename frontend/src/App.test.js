import { render, screen } from '@testing-library/react';
import App from './App';
import { AuthProvider } from './AuthContext';

// Mock the child components to simplify testing
jest.mock('./components/Header', () => () => <div data-testid="mock-header">Header</div>);
jest.mock('./components/Footer', () => () => <div data-testid="mock-footer">Footer</div>);
jest.mock('./components/Home', () => () => <div data-testid="mock-home">Home</div>);

test('renders app with header, main content, and footer', () => {
  render(
    <AuthProvider>
      <App />
    </AuthProvider>
  );
  
  // Check for header and footer presence
  expect(screen.getByTestId('mock-header')).toBeInTheDocument();
  expect(screen.getByTestId('mock-footer')).toBeInTheDocument();
  
  // Check for the home component on initial render
  expect(screen.getByTestId('mock-home')).toBeInTheDocument();
});

// Test for authenticated routes - this is more of an integration test
test('authenticated routes are not rendered when user is not authenticated', () => {
  // Mock the useContext hook to return unauthenticated state
  jest.spyOn(require('react'), 'useContext').mockImplementation(() => ({
    auth: { isAuthenticated: false }
  }));
  
  render(
    <AuthProvider>
      <App />
    </AuthProvider>
  );
  
  // Verify that authenticated routes don't render when user is not authenticated
  expect(screen.queryByText('storage-chambers')).not.toBeInTheDocument();
  expect(screen.queryByText('user-management')).not.toBeInTheDocument();
}); 