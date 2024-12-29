import React, { useEffect, useState, useCallback } from 'react';
import { ModelType } from '../types/models';
import { useTheme } from '../context/ThemeContext';
import { googleDriveService } from '../services/googleDriveService';
import { indexedDBService } from '../services/indexedDBService';
import { useFileWatcher } from '../hooks/useFileWatcher';
import { useUser } from '../context/UserContext';
import { LuBrainCircuit } from "react-icons/lu";

interface HeaderProps {
  modelType: ModelType;
  onModelChange: (model: ModelType) => void;
}

export function Header({ modelType, onModelChange }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const { user, setUser } = useUser();
  const [showDropdown, setShowDropdown] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);

  const handleCredentialResponse = async (response: any) => {
    try {
      const responsePayload = decodeJwtResponse(response.credential);
      console.log('Google Sign-In successful:', responsePayload);

      const userData = {
        name: responsePayload.name,
        email: responsePayload.email,
        imageUrl: responsePayload.picture,
        accessToken: response.credential
      };

      // Set user data first
      setUser(userData);
      
      // Set user ID in both services
      indexedDBService.setUserId(responsePayload.email);
      googleDriveService.setUserId(responsePayload.email);
      googleDriveService.setAccessToken(response.credential);

      try {
        // Try to load chat history from IndexedDB first (faster)
        const localHistory = await indexedDBService.loadChatHistory();
        if (localHistory && localHistory.length > 0) {
          console.log('Loaded chat history from IndexedDB');
          setChatHistory(localHistory);
          localStorage.setItem('conversations', JSON.stringify([{
            id: 'default',
            title: 'Chat History',
            messages: localHistory
          }]));
        } else {
          // If no local history, try Google Drive
          await googleDriveService.initializeGoogleDriveAPI();
          const driveHistory = await googleDriveService.loadChatHistory();
          if (driveHistory && driveHistory.length > 0) {
            console.log('Loaded chat history from Google Drive');
            setChatHistory(driveHistory);
            // Save to IndexedDB for future use
            await indexedDBService.saveChatHistory(driveHistory);
            localStorage.setItem('conversations', JSON.stringify([{
              id: 'default',
              title: 'Chat History',
              messages: driveHistory
            }]));
          }
        }
      } catch (error) {
        console.error('Error loading chat history:', error);
      }
    } catch (error) {
      console.error('Error handling Google Sign-In:', error);
    }
  };

  const handleSignOut = async () => {
    console.log('Signing out...');
  
    try {
      // Store current user ID before clearing state
      const currentUserId = user?.id;

      // Clear only the UI state
      setChatHistory([]);
      setShowDropdown(false);
      
      // Handle Google Sign-In cleanup
      if (window.google) {
        window.google.accounts.id.disableAutoSelect();
        if (window.google.accounts.oauth2) {
          window.google.accounts.oauth2.revoke(user?.accessToken || '', () => {
            console.log('Token revoked');
          });
        }
      }

      // Clear user state
      setUser(null);

      // Reset current user session without clearing data
      indexedDBService.clearUserId();
      googleDriveService.setUserId('');

      // Reset UI to initial state
      onModelChange('chat');

      // Add event listener for beforeunload to clear localStorage on page reload
      window.addEventListener('beforeunload', () => {
        localStorage.removeItem(`conversations_${currentUserId}`);
      }, { once: true });

    } catch (error) {
      console.error('Error during sign out:', error);
    }
  };

  const initializeGoogleSignIn = useCallback(() => {
    const signInDiv = document.getElementById('googleSignInDiv');
    if (!signInDiv) return;

    // Clear existing content
    signInDiv.innerHTML = '';

    // Only initialize if we have the Google API and user is not signed in
    if (window.google && !user) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        scope: 'openid profile email https://www.googleapis.com/auth/drive.file'
      });

      window.google.accounts.id.renderButton(
        signInDiv,
        { 
          theme: theme === 'dark' ? 'filled_black' : 'filled_blue',
          size: 'large',
          type: 'standard',
          shape: 'rectangular',
          text: 'signin_with',
          logo_alignment: 'left'
        }
      );
    }
  }, [theme, user, handleCredentialResponse]);

  // Load Google APIs only once on mount
  useEffect(() => {
    if (document.querySelector('script[src="https://accounts.google.com/gsi/client"]')) {
      initializeGoogleSignIn();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      initializeGoogleSignIn();
    };
    document.head.appendChild(script);
    
    return () => {
      const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, [initializeGoogleSignIn]);

  // Re-initialize Google Sign-In when user state or theme changes
  useEffect(() => {
    if (window.google) {
      initializeGoogleSignIn();
    }
  }, [user, theme, initializeGoogleSignIn]);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const decodeJwtResponse = (token: string) => {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  };

  return (
    <header className="flex justify-between items-center p-2 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
      <div className="flex items-center">
        <LuBrainCircuit className="w-6 h-6 text-blue-500 me-2" />
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">Smart Chat</h1>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={toggleTheme}
          className={`
            p-2 rounded-lg
            ${theme === 'dark'
              ? 'hover:bg-gray-800 text-gray-300'
              : 'hover:bg-gray-100 text-gray-600'
            }
            transition-all duration-200
          `}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            </svg>
          )}
        </button>
        
        <div id="googleSignInDiv" className={user ? 'hidden' : ''}></div>
        
        {user && (
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center space-x-2 focus:outline-none"
            >
              {user.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt={user.name}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                  {getInitials(user.name)}
                </div>
              )}
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg py-1 z-10">
                <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 border-b dark:border-gray-600">
                  {user.name}
                </div>
                <button
                  onClick={() => {
                    console.log('Sign out button clicked');
                    handleSignOut();
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}