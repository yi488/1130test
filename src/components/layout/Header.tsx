import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Search, Menu, User, LogOut, Minus, Square, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "../ui/sheet";
import { Sidebar } from "./Sidebar";
import { useState } from "react";

interface HeaderProps {
  onSearch: (query: string) => void;
  onLoginClick: () => void;
  onLogoutClick: () => void;
  currentUser?: any;
  className?: string;
  showLogo?: boolean; // 新增：是否显示logo
}

export function Header({
  onSearch,
  onLoginClick,
  onLogoutClick,
  currentUser,
  className,
  showLogo = true
}: HeaderProps) {
  const [searchValue, setSearchValue] = useState("");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    onSearch(value);
  };

  // -------------------- Window Controls --------------------
  const minimize = () => window.__TAURI__?.invoke("minimize_window");
  const maximize = () => window.__TAURI__?.invoke("toggle_maximize");
  const close = () => window.__TAURI__?.invoke("close_window");
  // ----------------------------------------------------------

  return (
    <header
      className={`border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 ${className}`}
      data-tauri-drag-region
    >
      <div className="flex h-14 items-center px-4" data-tauri-drag-region>
        
        {/* Mobile sidebar button */}
        <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
          <SheetTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden h-10 w-10"
              data-tauri-drag-region="false"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>导航菜单</SheetTitle>
            </SheetHeader>
            <Sidebar
              activeSection={"home"}
              onClose={() => setMobileSidebarOpen(false)}
            />
          </SheetContent>
        </Sheet>

        {/* Logo (optional) */}
        {showLogo && (
          <div className="hidden md:flex items-center gap-2 mr-4" data-tauri-drag-region>
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">文</span>
            </div>
            <span className="font-semibold text-lg">数字文物</span>
          </div>
        )}

        {/* -------------------- Search Bar -------------------- */}
        <div 
          className="flex-1 max-w-2xl ml-2" 
          data-tauri-drag-region
          style={window.__TAURI__ ? { WebkitAppRegion: 'drag' } as any: {}}
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索文物、朝代或关键词..."
              className="pl-10 pr-4 h-10 text-sm"
              value={searchValue}
              onChange={handleSearchChange}
              style={window.__TAURI__ ? { WebkitAppRegion: 'no-drag' }as any : {}}
            />
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1 min-w-4" data-tauri-drag-region />

        {/* -------------------- User Area -------------------- */}
        <div
          className="flex items-center gap-2 select-none"
          data-tauri-drag-region="false"
          style={window.__TAURI__ ? { WebkitAppRegion: 'no-drag' }as any : {}}
        >
          {currentUser ? (
            <>
              <div className="hidden md:flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 flex items-center justify-center">
                  <span className="text-sm font-medium text-primary">
                    {currentUser.username?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium leading-tight">
                    {currentUser.username}
                  </span>
                  <span className="text-xs text-muted-foreground leading-tight">
                    欢迎回来
                  </span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={onLogoutClick}
                  className="h-9 w-9 ml-1"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>

              {/* Mobile user */}
              <div className="md:hidden flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-9 px-3"
                  onClick={onLogoutClick}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  退出
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="hidden md:flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="h-9 px-4"
                  onClick={onLoginClick}
                >
                  <User className="h-4 w-4 mr-2" />
                  登录/注册
                </Button>
              </div>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden h-10 w-10"
                onClick={onLoginClick}
              >
                <User className="h-5 w-5" />
              </Button>
            </>
          )}
        </div>

        {/* Divider before window controls */}
        {window.__TAURI__ && (
          <div className="h-6 w-px bg-border mx-2" data-tauri-drag-region="false" />
        )}

        {/* -------------------- Window Controls -------------------- */}
        {window.__TAURI__ && (
          <div
            className="flex items-center"
            data-tauri-drag-region="false"
            style={{ WebkitAppRegion: 'no-drag' }as any}
          >
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-none hover:bg-muted/80"
              onClick={minimize}
              title="最小化"
            >
              <Minus className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-none hover:bg-muted/80"
              onClick={maximize}
              title="最大化"
            >
              <Square className="h-3.5 w-3.5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-none hover:bg-destructive hover:text-destructive-foreground"
              onClick={close}
              title="关闭"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}