import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { TrendingUp } from "lucide-react";
import { Hash } from "lucide-react";
import { Badge } from "../ui/badge";

// 修改功能卡片，让它们有自适应高度
// TrendingCard.tsx (更新版)
export function TrendingCard() {
  return (
    <div className="h-full flex flex-col">
      <Card className="cursor-pointer hover:shadow-md transition-shadow border h-full flex flex-col">
        <CardHeader className="p-3 pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-orange-500" />
            热门趋势
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0 flex-1">
          <div className="space-y-1.5 h-full">
            {["青铜器鉴赏热", "唐代文物展", "新考古发现", "数字博物馆", "文物保护技术"].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-1 hover:bg-gray-50 rounded">
                <span className="text-xs text-gray-700 truncate">{item}</span>
                <span className="text-xs text-gray-400">{["+256", "+189", "+142", "+98", "+76"][i]}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// TopicsCard.tsx (更新版)
export function TopicsCard() {
  const topics = [
    { name: "青铜器", color: "bg-blue-100 text-blue-700" },
    { name: "陶瓷", color: "bg-green-100 text-green-700" },
    { name: "书画", color: "bg-purple-100 text-purple-700" },
    { name: "玉器", color: "bg-yellow-100 text-yellow-700" },
    { name: "金银器", color: "bg-amber-100 text-amber-700" },
    { name: "佛像", color: "bg-red-100 text-red-700" },
    { name: "石刻", color: "bg-indigo-100 text-indigo-700" },
    { name: "漆器", color: "bg-pink-100 text-pink-700" },
  ];

  return (
    <div className="h-full">
      <Card className="cursor-pointer hover:shadow-md transition-shadow border h-full">
        <CardHeader className="p-3 pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Hash className="h-4 w-4 text-blue-500" />
            热门话题
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="flex flex-wrap gap-1.5">
            {topics.map((topic) => (
              <Badge 
                key={topic.name} 
                variant="outline" 
                className={`text-xs px-2 py-1 ${topic.color} border-none hover:scale-105 transition-transform`}
              >
                #{topic.name}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}