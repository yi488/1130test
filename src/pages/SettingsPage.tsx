import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  Moon, 
  Sun, 
  Monitor, 
  Trash2, 
  Database, 
  
  Palette,
  Settings as SettingsIcon,
  Download,
  Upload,
  Info,
  Check,
  
  AlertTriangle
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

type Theme = "light" | "dark" | "system";

interface Settings {
  theme: Theme;
  notifications: boolean;
  autoUpdate: boolean;
  autoSave: boolean;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(() => {
    // 从 localStorage 读取初始设置
    const savedTheme = localStorage.getItem('theme') as Theme;
    const savedNotifications = localStorage.getItem('notifications');
    const savedAutoUpdate = localStorage.getItem('autoUpdate');
    const savedAutoSave = localStorage.getItem('autoSave');
    
    return {
      theme: savedTheme || 'system',
      notifications: savedNotifications !== 'false',
      autoUpdate: savedAutoUpdate !== 'false',
      autoSave: savedAutoSave !== 'false',
    };
  });

  const [storageSize, setStorageSize] = useState("0 MB");
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  // 计算存储使用情况
  useEffect(() => {
    if (typeof window !== "undefined") {
      let totalSize = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const value = localStorage.getItem(key) || "";
          totalSize += key.length + value.length;
        }
      }
      setStorageSize(`${(totalSize / 1024 / 1024).toFixed(2)} MB`);
    }
  }, []);

  // 应用主题
  const applyTheme = (theme: Theme) => {
    const root = document.documentElement;
    
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.toggle('dark', systemTheme === 'dark');
    } else {
      root.classList.toggle('dark', theme === 'dark');
    }
    
    localStorage.setItem('theme', theme);
  };

  // 显示提示消息
  const showMessage = (message: string) => {
    setAlertMessage(message);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  // 更新设置
  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    // 保存到 localStorage
    localStorage.setItem(key, String(value));
    
    // 特殊处理主题
    if (key === 'theme') {
      applyTheme(value as Theme);
    }
    
    // 显示成功消息
    showMessage(`设置已保存`);
  };

  // 重置应用数据
  const resetAppData = () => {
    if (confirm("确定要重置所有应用数据吗？此操作不可撤销！")) {
      localStorage.clear();
      setStorageSize("0.00 MB");
      
      // 重置设置到默认值
      const defaultSettings: Settings = {
        theme: 'system',
        notifications: true,
        autoUpdate: true,
        autoSave: true,
      };
      
      setSettings(defaultSettings);
      Object.entries(defaultSettings).forEach(([key, value]) => {
        localStorage.setItem(key, String(value));
      });
      
      applyTheme('system');
      showMessage("应用数据已重置");
    }
  };

  // 导出设置
  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'settings-backup.json';
    link.click();
    URL.revokeObjectURL(url);
    
    showMessage("设置已导出");
  };

  // 导入设置
  const importSettings = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target?.result as string);
          const newSettings = {
            ...settings,
            ...imported,
          };
          setSettings(newSettings);
          
          // 保存到 localStorage
          Object.entries(newSettings).forEach(([key, value]) => {
            localStorage.setItem(key, String(value));
          });
          
          // 应用主题
          if (imported.theme) {
            applyTheme(imported.theme);
          }
          
          showMessage("设置已导入");
        } catch {
          alert("文件格式错误");
        }
      };
      reader.readAsText(file);
    };
    
    input.click();
  };

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      {/* 标题 */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <SettingsIcon className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold">设置</h1>
        </div>
        <p className="text-muted-foreground">
          管理应用的外观和行为
        </p>
      </div>

      {/* 提示消息 */}
      {showAlert && (
        <div className="mb-4 fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top-5">
          <Alert className="w-auto shadow-lg">
            <Check className="h-4 w-4" />
            <AlertDescription>{alertMessage}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* 主题设置 */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            外观设置
          </CardTitle>
          <CardDescription>选择您偏好的主题模式</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Button
              variant={settings.theme === "light" ? "default" : "outline"}
              size="sm"
              onClick={() => updateSetting("theme", "light")}
              className="flex-1"
            >
              <Sun className="mr-2 h-4 w-4" />
              浅色
            </Button>
            <Button
              variant={settings.theme === "dark" ? "default" : "outline"}
              size="sm"
              onClick={() => updateSetting("theme", "dark")}
              className="flex-1"
            >
              <Moon className="mr-2 h-4 w-4" />
              深色
            </Button>
            <Button
              variant={settings.theme === "system" ? "default" : "outline"}
              size="sm"
              onClick={() => updateSetting("theme", "system")}
              className="flex-1"
            >
              <Monitor className="mr-2 h-4 w-4" />
              系统
            </Button>
          </div>
          <div className="text-sm text-muted-foreground">
            当前主题：{settings.theme === "system" ? "跟随系统" : settings.theme === "light" ? "浅色" : "深色"}
          </div>
        </CardContent>
      </Card>

      {/* 常规设置 */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            常规设置
          </CardTitle>
          <CardDescription>配置应用的基础行为</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notifications">启用通知</Label>
              <p className="text-sm text-muted-foreground">
                接收应用通知和提醒
              </p>
            </div>
            <Switch
              id="notifications"
              checked={settings.notifications}
              onCheckedChange={(checked) => updateSetting("notifications", checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="autoUpdate">自动检查更新</Label>
              <p className="text-sm text-muted-foreground">
                自动检查应用更新
              </p>
            </div>
            <Switch
              id="autoUpdate"
              checked={settings.autoUpdate}
              onCheckedChange={(checked) => updateSetting("autoUpdate", checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="autoSave">自动保存</Label>
              <p className="text-sm text-muted-foreground">
                自动保存您的更改
              </p>
            </div>
            <Switch
              id="autoSave"
              checked={settings.autoSave}
              onCheckedChange={(checked) => updateSetting("autoSave", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* 数据管理 */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            数据管理
          </CardTitle>
          <CardDescription>管理应用数据和设置</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>本地存储使用情况</Label>
                <p className="text-sm text-muted-foreground">
                  已使用 {storageSize}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportSettings}
                >
                  <Download className="mr-2 h-4 w-4" />
                  导出
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={importSettings}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  导入
                </Button>
              </div>
            </div>

            <Separator />

            <div>
              <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  危险操作：重置数据将清除所有本地存储
                </AlertDescription>
              </Alert>
              
              <Button
                variant="destructive"
                onClick={resetAppData}
                className="w-full"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                重置所有应用数据
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 关于应用 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            关于应用
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold">文</span>
              </div>
              <div>
                <h3 className="font-semibold">数字文物</h3>
                <p className="text-sm text-muted-foreground">版本 1.0.0</p>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">数据库版本</span>
                <span>1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">最后更新</span>
                <span>2025年1月</span>
              </div>
            </div>
            
            <Separator />
            
            <p className="text-sm text-muted-foreground pt-2">
              © 2025 数字文物. 保留所有权利。
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 底部操作按钮 */}
      <div className="flex justify-center gap-2 mt-6 pt-4 border-t">
        <Button
          variant="outline"
          onClick={() => window.history.back()}
        >
          返回
        </Button>
        <Button
          onClick={() => window.location.reload()}
        >
          刷新应用
        </Button>
      </div>
    </div>
  );
}