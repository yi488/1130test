import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Newspaper } from "lucide-react";

export function NewsCard() {
  const news = [
    { title: "新展：丝绸之路文物展", time: "2小时前" },
    { title: "考古发现：汉墓新出土文物", time: "1天前" },
    { title: "博物馆夜间开放通知", time: "2天前" },
    { title: "文物修复成果展示", time: "3天前" },
  ];

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow border h-full">
      <CardHeader className="p-3 pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Newspaper className="h-4 w-4 text-red-500" />
          最新动态
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <div className="space-y-2">
          {news.map((item, i) => (
            <div key={i} className="group">
              <div className="text-xs font-medium text-gray-800 group-hover:text-blue-600 line-clamp-1">
                {item.title}
              </div>
              <div className="text-xs text-gray-400">{item.time}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}