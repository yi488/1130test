import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Hash } from "lucide-react";
import { Badge } from "../ui/badge";

export function TopicsCard() {
  const topics = [
    { name: "青铜器", color: "bg-blue-100 text-blue-700" },
    { name: "陶瓷", color: "bg-green-100 text-green-700" },
    { name: "书画", color: "bg-purple-100 text-purple-700" },
    { name: "玉器", color: "bg-yellow-100 text-yellow-700" },
    { name: "金银器", color: "bg-amber-100 text-amber-700" },
    { name: "佛像", color: "bg-red-100 text-red-700" },
  ];

  return (
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
              className={`text-xs px-2 py-1 ${topic.color} border-none`}
            >
              #{topic.name}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}