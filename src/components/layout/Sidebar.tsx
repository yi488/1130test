import { Button } from "../ui/button";
import { 
  Home, 
  Settings,
  Info,
  Heart,
  Bookmark,
  Box,
  Map,
  Bot,
  LogIn
} from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { getAuthToken } from '../../lib/api';
import { useState, useEffect } from 'react';

const utilityFeatures = [
  { id: '3d-artifacts', label: '3D文物', icon: Box },
  { id: 'map-exploration', label: '地图探索', icon: Map },
  { id: 'ai-assistant', label: 'AI助手', icon: Bot },
  { id: 'about', label: '关于应用', icon: Info },
  { id: 'settings', label: '系统设置', icon: Settings },
] as const;

interface SidebarProps {
  activeSection: 'home' | 'favorites' | 'browsing' | '3d-artifacts' | 'map-exploration' | 'ai-assistant' | 'about' | 'settings';
  className?: string;
  onClose?: () => void;
}

export function Sidebar({ 
  activeSection,
  className, 
  onClose 
}: SidebarProps) {
  const navigate = useNavigate();
  const navigationSections = [
    { id: 'home', label: '首页', icon: Home },
    // { id: 'history', label: '历史文物', icon: History },
    // { id: 'art', label: '艺术珍品', icon: Palette },
    // { id: 'architecture', label: '古代建筑', icon: Building },
  ];

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!getAuthToken());
  }, []);

  const personalSections = [
    { id: 'favorites', label: '收藏的文物', icon: Heart, requiresAuth: true },
    { id: 'browsing', label: '浏览历史', icon: Bookmark, requiresAuth: true },
    // { id: 'downloads', label: '下载内容', icon: Download, requiresAuth: true },
  ];

  return (
    <div className={className}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          {/* <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            数字文物博物馆
          </h2> */}
          <div className="space-y-1">
            <div className="text-xs font-semibold text-muted-foreground px-4 py-2">
              探索文物
            </div>
            {navigationSections.map((section) => {
              const IconComponent = section.icon;
              return (
                <Button
                  key={section.id}
                  variant={activeSection === section.id ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => {
                    if (section.id === 'home') {
                      navigate('/');
                    } else {
                      navigate(`/${section.id}`);
                    }
                    onClose?.();
                  }}
                >
                  <IconComponent className="mr-2 h-4 w-4" />
                  {section.label}
                </Button>
              );
            })}
          </div>
        </div>
        
        <div className="px-3 py-2">
          <div className="space-y-1">
            <div className="text-xs font-semibold text-muted-foreground px-4 py-2">
              实用功能
            </div>
            {utilityFeatures.map((feature) => {
              const IconComponent = feature.icon;
              return (
                <Button
                  key={feature.id}
                  variant={activeSection === feature.id ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => {
                    navigate(`/${feature.id}`);
                    onClose?.();
                  }}
                >
                  <IconComponent className="mr-2 h-4 w-4" />
                  {feature.label}
                </Button>
              );
            })}
          </div>
        </div>
        
        <div className="px-3 py-2">
          <div className="space-y-1">
            <div className="text-xs font-semibold text-muted-foreground px-4 py-2">
              我的收藏
            </div>
            {personalSections.map((section) => {
              const IconComponent = section.icon;
              const routePath = section.id === 'browsing' ? '/browsing-history' : `/${section.id}`;
              
              const handleClick = () => {
                if (section.requiresAuth && !isLoggedIn) {
                  // Show login dialog
                  const event = new CustomEvent('show-login-dialog', { 
                    detail: { 
                      message: `请先登录以${section.id === 'favorites' ? '查看收藏的文物' : '查看浏览历史'}`,
                      onSuccess: () => {
                        // After successful login, navigate to the requested page
                        navigate(routePath);
                        onClose?.();
                      }
                    } 
                  });
                  window.dispatchEvent(event);
                  return;
                }
                navigate(routePath);
                onClose?.();
              };

              return (
                <Button
                  key={section.id}
                  variant={activeSection === section.id ? "secondary" : "ghost"}
                  className="w-full justify-start group"
                  onClick={handleClick}
                >
                  {!isLoggedIn && section.requiresAuth ? (
                    <>
                      <LogIn className="mr-2 h-4 w-4 opacity-50" />
                      <span className="text-muted-foreground">{section.label}</span>
                    </>
                  ) : (
                    <>
                      <IconComponent 
                        className={`mr-2 h-4 w-4 ${
                          section.id === 'favorites' && activeSection === 'favorites' 
                            ? 'fill-current text-red-500' 
                            : ''
                        }`} 
                      />
                      {section.label}
                    </>
                  )}
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}