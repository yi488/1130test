import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Search, Clock, Calendar, X, ExternalLink } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

interface HistoryItem {
  id: string;
  title: string;
  url: string;
  domain: string;
  timestamp: number;
  favicon: string;
}

export function BrowsingHistoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [timeRange, setTimeRange] = useState('all');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data - in a real app, this would come from a browser extension API or backend
  useEffect(() => {
    const mockHistory: HistoryItem[] = [
      {
        id: '1',
        title: 'Example Page 1',
        url: 'https://example.com/page1',
        domain: 'example.com',
        timestamp: Date.now() - 3600000 * 2, // 2 hours ago
        favicon: 'https://www.google.com/s2/favicons?domain=example.com',
      },
      {
        id: '2',
        title: 'Example Page 2',
        url: 'https://example.org/page2',
        domain: 'example.org',
        timestamp: Date.now() - 86400000, // 1 day ago
        favicon: 'https://www.google.com/s2/favicons?domain=example.org',
      },
    ];

    // Simulate API call
    const timer = setTimeout(() => {
      setHistory(mockHistory);
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const filteredHistory = history.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.url.toLowerCase().includes(searchTerm.toLowerCase());
    
    const now = Date.now();
    let matchesTimeRange = true;
    
    if (timeRange === 'today') {
      const oneDayAgo = now - 86400000;
      matchesTimeRange = item.timestamp > oneDayAgo;
    } else if (timeRange === 'week') {
      const oneWeekAgo = now - 604800000;
      matchesTimeRange = item.timestamp > oneWeekAgo;
    } else if (timeRange === 'month') {
      const oneMonthAgo = now - 2592000000;
      matchesTimeRange = item.timestamp > oneMonthAgo;
    }
    
    return matchesSearch && matchesTimeRange;
  });

  const clearHistory = () => {
    // In a real app, this would clear the actual browser history
    setHistory([]);
  };

  const openInNewTab = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 p-4 rounded-md">
          <p className="text-red-700">Error loading browsing history: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <h1 className="text-2xl font-bold">浏览历史</h1>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={clearHistory}>
              清除历史记录
            </Button>
          </div>
        </div>

        <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              placeholder="搜索历史记录..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue placeholder="时间范围" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">所有时间</SelectItem>
              <SelectItem value="today">今天</SelectItem>
              <SelectItem value="week">最近一周</SelectItem>
              <SelectItem value="month">最近一个月</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
            <Clock className="h-12 w-12 text-gray-400" />
            <h3 className="text-lg font-medium">没有找到历史记录</h3>
            <p className="text-gray-500">
              {searchTerm ? '尝试调整搜索词' : '您的浏览历史记录将显示在这里'}
            </p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <span className="sr-only">网站图标</span>
                  </TableHead>
                  <TableHead>标题</TableHead>
                  <TableHead>网址</TableHead>
                  <TableHead className="text-right">访问时间</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistory.map((item) => (
                  <TableRow key={item.id} className="hover:bg-gray-50">
                    <TableCell>
                      {item.favicon ? (
                        <img
                          src={item.favicon}
                          alt=""
                          className="h-5 w-5"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : null}
                    </TableCell>
                    <TableCell className="font-medium max-w-[300px] truncate">
                      {item.title}
                    </TableCell>
                    <TableCell className="text-gray-500 max-w-[300px] truncate">
                      {item.domain}
                    </TableCell>
                    <TableCell className="text-right text-gray-500">
                      {format(new Date(item.timestamp), 'yyyy-MM-dd HH:mm')}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openInNewTab(item.url)}
                        title="在新标签页中打开"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
