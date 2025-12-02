import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";


export default function AboutPage() {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold tracking-tight">关于 数字文物博物馆</h1>
        <p className="mt-2 text-muted-foreground">探索、发现、传承 - 让文物活起来</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>项目介绍</CardTitle>
            <CardDescription>关于数字文物博物馆</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              数字文物博物馆是一个致力于展示和传播中国丰富文化遗产的数字化平台。
              我们通过现代技术手段，将珍贵的文物以3D模型、高清图片和详实资料的形式呈现给公众。
            </p>
            <p>
              本项目旨在打破时间和空间的限制，让更多人能够近距离欣赏到珍贵的文物，
              了解其背后的历史文化价值，促进中华优秀传统文化的传承与发展。
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>主要功能</CardTitle>
            <CardDescription>探索数字文物的无限可能</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-medium">3D文物展示</h3>
              <p className="text-sm text-muted-foreground">
                360度全方位查看文物细节，支持缩放、旋转等交互操作。
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">地图探索</h3>
              <p className="text-sm text-muted-foreground">
                通过地图定位发现全国各地的文物分布，了解其出土地点和历史背景。
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">AI助手</h3>
              <p className="text-sm text-muted-foreground">
                智能问答系统，解答您关于文物的各类问题。
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>技术栈</CardTitle>
            <CardDescription>现代Web技术打造卓越体验</CardDescription>          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-4">
                <h3 className="font-medium">前端</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• React 18 + TypeScript</li>
                  <li>• Tauri 2.0 (跨平台桌面应用)</li>
                  <li>• Tailwind CSS + Shadcn/ui</li>
                  <li>• Three.js (3D渲染)</li>
                </ul>
              </div>
              <div className="space-y-4">
                <h3 className="font-medium">后端</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Rust (Tauri)</li>
                  <li>• SQLite (本地数据库)</li>
                  <li>• leaflet (地图)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>开发团队</CardTitle>
            <CardDescription>DBP230106</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h3 className="font-medium">核心开发者</h3>
                <p className="text-sm text-muted-foreground">
                  杨子涵
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium">特别鸣谢</h3>
                <p className="text-sm text-muted-foreground">
                  感谢所有提供文物数据和资料的文化机构
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      
      
    </div>
  );
}
