// src/App.tsx
import { useEffect, useState } from 'react';
import { authApi } from './lib/api';
import { User } from './types';
import { AppRouter } from './router';
import { LoginDialog } from './components/auth/LoginDialog';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 检查用户登录状态
  useEffect(() => {
    const checkUser = async () => {
      try {
        const user = await authApi.getCurrentUser();
        setCurrentUser(user);
      } catch (error) {
        console.log('User not logged in');
      }
    };
    checkUser();
  }, []);

  const handleLogout = async () => {
    try {
      await authApi.logout();
      setCurrentUser(null);
      setSuccessMessage('您已成功退出登录');
      setTimeout(() => setSuccessMessage(null), 2000);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleLoginSuccess = async () => {
    setIsLoginDialogOpen(false);
    // 重新获取用户信息
    try {
      const user = await authApi.getCurrentUser();
      setCurrentUser(user);
      // 显示成功消息
      setSuccessMessage('登录成功！欢迎回到数字文物博物馆');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Failed to get current user after login:', error);
    }
  };

  return (
    <>
      <AppRouter currentUser={currentUser} onLoginClick={() => setIsLoginDialogOpen(true)} onLogoutClick={handleLogout} />
      
      {/* Login Dialog */}
      <LoginDialog 
        open={isLoginDialogOpen} 
        onOpenChange={setIsLoginDialogOpen}
        onSuccess={handleLoginSuccess}
      />
      
      {/* Success Message */}
      {successMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          {successMessage}
        </div>
      )}
    </>
  );
}

export default App;
