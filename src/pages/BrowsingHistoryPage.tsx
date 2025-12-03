import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Search, Clock, X, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { historyApi } from '../lib/api';
import { ArtifactWithFavorite } from '../types';

interface HistoryItem {
  id: number;
  artifact: ArtifactWithFavorite;
  viewed_at: string;
}

export function BrowsingHistoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Load browsing history
  useEffect(() => {
    let isMounted = true;
    
    const loadHistory = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await historyApi.getBrowsingHistory();
        if (isMounted) {
          setHistory(data);
        }
      } catch (err) {
        console.error('Failed to load browsing history:', err);
        if (isMounted) {
          setError('无法加载浏览历史，请稍后重试');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadHistory();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter history based on search term
  const filteredHistory = history.filter(item => 
    item.artifact.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.artifact.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.artifact.dynasty?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.artifact.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleClearHistory = async () => {
    if (!window.confirm('确定要清空所有浏览历史吗？此操作不可撤销。')) {
      return;
    }
    
    try {
      await historyApi.clearBrowsingHistory();
      setHistory([]);
    } catch (err) {
      console.error('Failed to clear history:', err);
      setError('清空历史记录失败，请重试');
    }
  };
  
  const handleRetry = () => {
    setError(null);
    // Trigger a reload of the history
    setHistory([]);
    const loadHistory = async () => {
      try {
        setIsLoading(true);
        const data = await historyApi.getBrowsingHistory();
        setHistory(data);
      } catch (err) {
        console.error('Failed to load browsing history:', err);
        setError('无法加载浏览历史，请稍后重试');
      } finally {
        setIsLoading(false);
      }
    };
    loadHistory();
  };

  const handleViewArtifact = (artifact: ArtifactWithFavorite) => {
    navigate(`/artifacts/${artifact.id}`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">浏览历史</h1>
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="h-48">
              <CardContent className="p-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <div className="flex space-x-2 mb-4">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-5/6" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">加载失败</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={handleRetry}>
            重试
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Clock className="h-6 w-6" />
            浏览历史
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            您最近查看的文物记录
          </p>
        </div>
        
        <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索文物名称、描述或朝代..."
              className="pl-10 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
                onClick={() => setSearchTerm('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          <Button 
            variant="outline" 
            onClick={handleClearHistory}
            disabled={history.length === 0}
            className="w-full sm:w-auto"
          >
            清空历史记录
          </Button>
        </div>
      </div>

      {error ? (
        <Card className="text-center p-8">
          <p className="text-red-500">{error}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            重试
          </Button>
        </Card>
      ) : history.length === 0 ? (
        <Card className="text-center p-12">
          <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">暂无浏览历史</h3>
          <p className="text-muted-foreground mt-1">
            您查看的文物将显示在这里
          </p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => navigate('/')}
          >
            去浏览文物
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredHistory.length === 0 ? (
            <Card className="text-center p-8">
              <p className="text-muted-foreground">
                没有找到匹配的浏览记录
              </p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setSearchTerm('')}
              >
                清空搜索
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredHistory.map((item) => (
                <Card 
                  key={item.id} 
                  className="hover:shadow-md transition-shadow cursor-pointer group"
                  onClick={() => handleViewArtifact(item.artifact)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg group-hover:text-primary line-clamp-1">
                        {item.artifact.title}
                      </CardTitle>
                      <Badge variant="outline" className="ml-2 shrink-0">
                        {item.artifact.dynasty}
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-2 h-10">
                      {item.artifact.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{formatDistanceToNow(new Date(item.viewed_at), { addSuffix: true })}</span>
                      <span className="mx-2">•</span>
                      <span>{item.artifact.category}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}