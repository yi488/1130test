import { Heart } from "lucide-react";
import { ArtifactWithFavorite } from "../../types";
import { useState, MouseEvent, KeyboardEvent } from "react";

interface CompactArtifactCardProps {
  artifact: ArtifactWithFavorite;
  onViewDetails: (artifact: ArtifactWithFavorite) => void;
  onToggleFavorite: (artifactId: number) => Promise<void>;
}

export function CompactArtifactCard({ 
  artifact, 
  onViewDetails, 
  onToggleFavorite 
}: CompactArtifactCardProps) {
  const [imageError, setImageError] = useState(false);
  
  const handleFavoriteClick = async (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    try {
      await onToggleFavorite(artifact.id);
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onViewDetails(artifact);
    }
  };

  const getImageUrl = () => {
    if (imageError || !artifact.image_path) {
      return "/placeholder-image.jpg";
    }
    return `/images/${artifact.image_path}?t=${Date.now()}`;
  };

  // 确保有默认值
  const title = artifact.title || "未命名文物";
  const dynasty = artifact.dynasty || "未知朝代";
  const location = artifact.location || "未知地点";
  const description = artifact.description || "暂无描述";
  const category = artifact.category || "未分类";

  return (
    <div 
      className="rounded-lg overflow-hidden border shadow-sm cursor-pointer hover:shadow-md transition-shadow h-full flex flex-col bg-white"
      onClick={() => onViewDetails(artifact)}
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {/* 图片区域 */}
      <div className="relative h-36 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
        <img
          src={getImageUrl()}
          alt={title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          onError={handleImageError}
          loading="lazy"
        />
        <button 
          className="absolute top-2 right-2 w-6 h-6 bg-white/80 rounded-full flex items-center justify-center hover:bg-white focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-300"
          onClick={handleFavoriteClick}
          aria-label={artifact.is_favorite ? "取消收藏" : "收藏"}
          title={artifact.is_favorite ? "取消收藏" : "收藏"}
          type="button"
        >
          {artifact.is_favorite ? (
            <Heart className="h-3 w-3 fill-red-500 text-red-500" />
          ) : (
            <Heart className="h-3 w-3 text-gray-400" />
          )}
        </button>
      </div>
      
      {/* 内容区域 */}
      <div className="p-3 flex-1 flex flex-col">
        <h3 className="font-medium text-sm line-clamp-1 mb-1 text-gray-800">
          {title}
        </h3>
        
        <div className="text-xs text-gray-500 mb-2 flex items-center">
          <span className="truncate">
            {dynasty} · {location}
          </span>
        </div>
        
        <p className="text-xs text-gray-600 line-clamp-2 flex-1 mb-2">
          {description}
        </p>
        
        <div className="flex justify-between items-center mt-auto">
          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded truncate max-w-[70%]">
            {category}
          </span>
          <button 
            className="text-xs text-blue-600 hover:text-blue-800 focus:outline-none focus:underline"
            onClick={(e: MouseEvent<HTMLButtonElement>) => { 
              e.stopPropagation(); 
              onViewDetails(artifact); 
            }}
            type="button"
          >
            查看
          </button>
        </div>
      </div>
    </div>
  );
}