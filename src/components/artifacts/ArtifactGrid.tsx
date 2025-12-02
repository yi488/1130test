// src/components/artifacts/ArtifactGrid.tsx
import { ArtifactCard } from "./ArtifactCard";
import { Button } from "../ui/button";
import { Alert, AlertDescription } from "../ui/alert";
import { Loader2, SearchX, RefreshCw } from "lucide-react";
import { ArtifactWithFavorite } from "../../types";

interface ArtifactGridProps {
  artifacts: ArtifactWithFavorite[];
  loading: boolean;
  error: string | null;
  onViewDetails: (artifact: ArtifactWithFavorite) => void;
  onToggleFavorite: (artifactId: number) => Promise<void>;
  searchQuery: string;
  activeSection?: 'home' | 'favorites' | 'browsing';
  className?: string;
}

export function ArtifactGrid({ 
  artifacts, 
  loading, 
  error, 
  onViewDetails, 
  onToggleFavorite, 
  searchQuery, 
  activeSection, 
  className 
}: ArtifactGridProps) {
  // 添加调试信息
  console.log('🎯 ArtifactGrid render:', { 
    artifactsCount: artifacts.length, 
    loading, 
    error, 
    activeSection, 
    searchQuery, 
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          <p className="mt-2 text-muted-foreground">加载文物数据中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mx-auto max-w-md">
        <AlertDescription className="flex items-center gap-2">
          <span>加载失败: {error}</span>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-1" />
            重试
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (artifacts.length === 0) {
    return (
      <div className="text-center py-12">
        <SearchX className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">
          {activeSection === 'favorites' 
            ? '您还没有收藏任何文物' 
            : searchQuery 
            ? `没有找到包含"${searchQuery}"的文物`
            : '当前没有文物数据'
          }
        </h3>
        <p className="text-muted-foreground mb-4">
          {activeSection === 'favorites' 
            ? '点击文物卡片上的爱心图标来收藏您喜欢的文物'
            : searchQuery 
            ? '请尝试使用其他关键词搜索'
            : '请稍后再试'
          }
        </p>
        {searchQuery && (
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
          >
            显示全部文物
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            {activeSection === 'favorites' ? (
              <>
                <h1 className="text-3xl font-bold tracking-tight">我的收藏</h1>
                <p className="text-muted-foreground mt-2">
                  查看您收藏的所有文物
                </p>
              </>
            ) : activeSection === 'browsing' ? (
              <>
                <h1 className="text-3xl font-bold tracking-tight">浏览历史</h1>
                <p className="text-muted-foreground mt-2">
                  查看您最近浏览的文物
                </p>
              </>
            ) : (
              <>
                <h1 className="text-3xl font-bold tracking-tight">数字文物收藏</h1>
                <p className="text-muted-foreground mt-2">
                  探索千年文化遗产，感受中华文明魅力
                </p>
              </>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            共找到 {artifacts.length} 件文物
          </div>
        </div>
        
        {searchQuery && (
          <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
            <span>搜索条件:</span>
            <span className="bg-secondary px-2 py-1 rounded">"{searchQuery}"</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {artifacts.map(artifact => (
          <ArtifactCard
            key={artifact.id}
            artifact={artifact}
            onViewDetails={onViewDetails}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>
    </div>
  );
}