import { useOutletContext } from "react-router-dom";
import { useState, useMemo } from "react";
import { ArtifactDialog } from "../components/artifacts/ArtifactDialog";
import { useArtifacts } from "../hooks/useArtifacts";
import { ArtifactWithFavorite } from "../types";

// 功能卡片
import { TrendingCard } from "../components/artifacts/TrendingCard";
import { TopicsCard } from "../components/artifacts/TopicsCard";
import { GuideCard } from "../components/artifacts/GuideCard";
import { NewsCard } from "../components/artifacts/NewsCard";
import { CompactArtifactCard } from "../components/artifacts/CompactArtifactCard";

interface HomePageContext {
  searchQuery: string;
}

type MixedCardItem = 
  | { 
      type: "featured"; 
      content: ArtifactWithFavorite; 
      colSpan: string;
      rowSpan: string;
    }
  | { 
      type: "artifact"; 
      content: ArtifactWithFavorite; 
      colSpan: string;
      rowSpan: string;
    }
  | { 
      type: "function"; 
      component: "trending" | "topics" | "guide" | "news"; 
      colSpan: string;
      rowSpan: string;
    };

export function HomePage() {
  const { searchQuery } = useOutletContext<HomePageContext>();
  const [selectedArtifact, setSelectedArtifact] = useState<ArtifactWithFavorite | null>(null);
  const [isArtifactDialogOpen, setIsArtifactDialogOpen] = useState(false);

  const { artifacts, loading, error, toggleFavorite } = useArtifacts({
    category: "all",
    query: searchQuery,
    favoritesOnly: false,
  });

  const handleViewDetails = (artifact: ArtifactWithFavorite) => {
    setSelectedArtifact(artifact);
    setIsArtifactDialogOpen(true);
  };

  const handleToggleFavorite = async (artifactId: number) => {
    await toggleFavorite(artifactId);
  };

  // 智能布局算法：使用跨越行和列来填充空白
  const mixedCards = useMemo<MixedCardItem[]>(() => {
    const cards: MixedCardItem[] = [];
    
    if (artifacts.length === 0) return cards;

    // 第1行：特色大卡片 - 跨越2列2行
    cards.push({
      type: "featured",
      content: artifacts[0],
      colSpan: "col-span-2",
      rowSpan: "row-span-2"
    });

    // 第1行右侧：一个小文物卡片
    if (artifacts.length > 1) {
      cards.push({
        type: "artifact",
        content: artifacts[1],
        colSpan: "col-span-1",
        rowSpan: "row-span-1"
      });
    }

    // 第2行右侧：一个功能卡片（趋势） - 跨越1列2行
    cards.push({
      type: "function",
      component: "trending",
      colSpan: "col-span-1",
      rowSpan: "row-span-2"
    });

    // 第3行：两个文物卡片
    if (artifacts.length > 2) {
      cards.push({
        type: "artifact",
        content: artifacts[2],
        colSpan: "col-span-1",
        rowSpan: "row-span-1"
      });
    }

    if (artifacts.length > 3) {
      cards.push({
        type: "artifact",
        content: artifacts[3],
        colSpan: "col-span-1",
        rowSpan: "row-span-1"
      });
    }

    // 第4行：一个功能卡片（话题）跨越2列
    cards.push({
      type: "function",
      component: "topics",
      colSpan: "col-span-2",
      rowSpan: "row-span-1"
    });

    // 第4行右侧：一个小文物卡片
    if (artifacts.length > 4) {
      cards.push({
        type: "artifact",
        content: artifacts[4],
        colSpan: "col-span-1",
        rowSpan: "row-span-1"
      });
    }

    // 第5行：一个文物卡片跨越2列
    if (artifacts.length > 5) {
      cards.push({
        type: "artifact",
        content: artifacts[5],
        colSpan: "col-span-2",
        rowSpan: "row-span-1"
      });
    }

    // 第6行：两个文物卡片
    if (artifacts.length > 6) {
      cards.push({
        type: "artifact",
        content: artifacts[6],
        colSpan: "col-span-1",
        rowSpan: "row-span-1"
      });
    }

    if (artifacts.length > 7) {
      cards.push({
        type: "artifact",
        content: artifacts[7],
        colSpan: "col-span-1",
        rowSpan: "row-span-1"
      });
    }

    // 第7行：功能卡片（指南）跨越2列
    cards.push({
      type: "function",
      component: "guide",
      colSpan: "col-span-2",
      rowSpan: "row-span-1"
    });

    // 第7行右侧：一个文物卡片
    if (artifacts.length > 8) {
      cards.push({
        type: "artifact",
        content: artifacts[8],
        colSpan: "col-span-1",
        rowSpan: "row-span-1"
      });
    }

    // 第8行：功能卡片（新闻）跨越1列2行
    cards.push({
      type: "function",
      component: "news",
      colSpan: "col-span-1",
      rowSpan: "row-span-2"
    });

    // 第8行：两个文物卡片
    if (artifacts.length > 9) {
      cards.push({
        type: "artifact",
        content: artifacts[9],
        colSpan: "col-span-1",
        rowSpan: "row-span-1"
      });
    }

    if (artifacts.length > 10) {
      cards.push({
        type: "artifact",
        content: artifacts[10],
        colSpan: "col-span-1",
        rowSpan: "row-span-2" // 这个卡片跨越2行，填充新闻卡片旁边的空间
      });
    }

    // 继续添加更多文物，创建更多跨越效果
    for (let i = 11; i < Math.min(20, artifacts.length); i++) {
      const position = i - 11;
      
      let colSpan = "col-span-1";
      let rowSpan = "row-span-1";
      
      // 创建规律性的跨越效果
      if (position % 7 === 0) {
        colSpan = "col-span-2";
        rowSpan = "row-span-1";
      } else if (position % 5 === 0) {
        colSpan = "col-span-1";
        rowSpan = "row-span-2";
      } else if (position % 3 === 0) {
        colSpan = "col-span-2";
        rowSpan = "row-span-2";
      }
      
      cards.push({
        type: "artifact",
        content: artifacts[i],
        colSpan,
        rowSpan
      });
    }

    return cards;
  }, [artifacts]);

  const renderCard = (item: MixedCardItem, index: number) => {
    switch (item.type) {
      case "featured":
        return (
          <div 
            className="relative rounded-lg overflow-hidden cursor-pointer group"
            onClick={() => handleViewDetails(item.content)}
            key={`featured-${index}`}
          >
            <img
              src={`/images/${item.content.image_path}?t=${Date.now()}`}
              alt={item.content.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent">
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-white font-bold text-lg mb-1">{item.content.title}</h3>
                <p className="text-white/90 text-sm">{item.content.dynasty} · {item.content.category}</p>
              </div>
              <button 
                className="absolute top-3 right-3 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30"
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleFavorite(item.content.id);
                }}
              >
                <span className={`text-sm ${item.content.is_favorite ? "text-red-500" : "text-white"}`}>
                  {item.content.is_favorite ? "♥" : "♡"}
                </span>
              </button>
            </div>
          </div>
        );

      case "artifact":
        return (
          <CompactArtifactCard
            key={`artifact-${item.content.id}-${index}`}
            artifact={item.content}
            onViewDetails={handleViewDetails}
            onToggleFavorite={handleToggleFavorite}
          />
        );

      case "function":
        const ComponentMap = {
          trending: TrendingCard,
          topics: TopicsCard,
          guide: GuideCard,
          news: NewsCard,
        };
        const Component = ComponentMap[item.component];
        return <Component key={`${item.component}-${index}`} />;

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="p-3">
        <div className="grid grid-cols-3 grid-rows-4 gap-3 h-screen">
          <div className="col-span-2 row-span-2 bg-gray-200 animate-pulse rounded-lg"></div>
          <div className="col-span-1 row-span-1 bg-gray-200 animate-pulse rounded-lg"></div>
          <div className="col-span-1 row-span-2 bg-gray-200 animate-pulse rounded-lg"></div>
          <div className="col-span-1 row-span-1 bg-gray-200 animate-pulse rounded-lg"></div>
          <div className="col-span-1 row-span-1 bg-gray-200 animate-pulse rounded-lg"></div>
          <div className="col-span-2 row-span-1 bg-gray-200 animate-pulse rounded-lg"></div>
          <div className="col-span-1 row-span-1 bg-gray-200 animate-pulse rounded-lg"></div>
          <div className="col-span-2 row-span-1 bg-gray-200 animate-pulse rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="text-center py-8">
          <p className="text-red-500">加载失败: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3">
      {/* 顶部标题 */}
      {/* <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-800">文物博物馆</h1>
        <p className="text-sm text-gray-600">探索中国古代艺术之美</p>
      </div> */}

      {/* 混合卡片网格 - 使用密集网格布局，允许跨越行和列 */}
      <div className="grid grid-cols-3 grid-rows-[repeat(auto-fill,minmax(150px,auto))] gap-3 auto-rows-min">
        {mixedCards.map((item, index) => (
          <div 
            key={index} 
            className={`${item.colSpan} ${item.rowSpan} h-full`}
          >
            {renderCard(item, index)}
          </div>
        ))}
      </div>

      {/* 热门排行 */}
      {artifacts.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-bold mb-3 text-gray-800">热门排行</h2>
          <div className="bg-white rounded-lg border divide-y">
            {artifacts.slice(0, 5).map((artifact, index) => (
              <div
                key={`hot-${artifact.id}`}
                className="flex items-center p-3 hover:bg-gray-50 cursor-pointer group"
                onClick={() => handleViewDetails(artifact)}
              >
                <div className={`w-8 h-8 flex items-center justify-center rounded-full mr-3 ${
                  index === 0 ? 'bg-yellow-100 text-yellow-600' :
                  index === 1 ? 'bg-gray-100 text-gray-600' :
                  index === 2 ? 'bg-orange-100 text-orange-600' :
                  'bg-blue-50 text-blue-600'
                } font-bold text-sm`}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm line-clamp-1 group-hover:text-blue-600">
                    {artifact.title}
                  </div>
                  <div className="text-xs text-gray-500">{artifact.dynasty} · {artifact.category}</div>
                </div>
                <div className="text-xs text-gray-400">
                  {index === 0 && "🔥"}
                  {index === 1 && "⭐"}
                  {index === 2 && "✨"}
                  {index >= 3 && "↑"}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 加载更多按钮 */}
      {artifacts.length > 20 && (
        <div className="text-center py-6">
          <button className="text-sm text-gray-600 hover:text-gray-800 px-4 py-2 border rounded-full hover:border-gray-400">
            加载更多文物
          </button>
        </div>
      )}

      {selectedArtifact && (
        <ArtifactDialog
          open={isArtifactDialogOpen}
          onOpenChange={setIsArtifactDialogOpen}
          artifact={selectedArtifact}
          onToggleFavorite={handleToggleFavorite}
        />
      )}
    </div>
  );
}