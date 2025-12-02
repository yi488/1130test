import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Compass } from "lucide-react";

export function GuideCard() {
  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow border h-full">
      <CardHeader className="p-3 pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Compass className="h-4 w-4 text-green-500" />
          参观指南
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">开放时间</span>
            <span className="text-xs font-medium">9:00-17:00</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">建议时长</span>
            <span className="text-xs font-medium">2-3小时</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">最佳路线</span>
            <span className="text-xs font-medium">历史线</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">热门展区</span>
            <span className="text-xs font-medium">青铜馆</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}