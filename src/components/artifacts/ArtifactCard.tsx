import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Heart, ZoomIn, Calendar, MapPin, Clock } from "lucide-react";
import { ArtifactWithFavorite } from "../../types";
import { historyApi } from "../../lib/api";

interface ArtifactCardProps {
  artifact: ArtifactWithFavorite;
  onViewDetails: (artifact: ArtifactWithFavorite) => void;
  onToggleFavorite: (artifactId: number) => Promise<void>;
  variant?: "default" | "featured";
}

export function ArtifactCard({ 
  artifact, 
  onViewDetails, 
  onToggleFavorite,
  variant = "default"
}: ArtifactCardProps) {
  // Track when an artifact is viewed
  useEffect(() => {
    if (artifact?.id) {
      // Only track when the component mounts or artifact changes
      const trackView = async () => {
        try {
          await historyApi.addToHistory(artifact.id);
        } catch (error) {
          console.error('Error adding to history:', error);
        }
      };
      trackView();
    }
  }, [artifact?.id]);
  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await onToggleFavorite(artifact.id);
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
    }
  };

  if (variant === "featured") {
    return (
      <Card 
        className="w-full cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => onViewDetails(artifact)}
      >
        <div className="md:flex">
          <div className="md:w-2/5 h-64 md:h-auto">
            <img
              src={`/images/${artifact.image_path}?t=${Date.now()}`}
              alt={artifact.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="md:w-3/5 p-6">
            <div className="flex justify-between items-start mb-4">
              <CardTitle className="text-2xl font-bold">{artifact.title}</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleFavoriteClick}
              >
                <Heart
                  className={`h-5 w-5 ${artifact.is_favorite ? "fill-red-500 text-red-500" : "text-gray-400"}`}
                />
              </Button>
            </div>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1 text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>{artifact.dynasty}</span>
              </div>
              <div className="flex items-center gap-1 text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>{artifact.location}</span>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6">{artifact.description}</p>
            
            <div className="flex gap-2 mb-6">
              <Badge variant="secondary">{artifact.category}</Badge>
              <Badge variant="outline">{artifact.material}</Badge>
            </div>
            
            <Button 
              className="w-full"
              onClick={(e) => { e.stopPropagation(); onViewDetails(artifact); }}
            >
              <ZoomIn className="h-4 w-4 mr-2" />
              查看详情
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // 默认卡片 - 简单的卡片，高度由内容决定
  return (
    <Card 
      className="h-full cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onViewDetails(artifact)}
    >
      <div className="h-48 overflow-hidden">
        <img
          src={`/images/${artifact.image_path}?t=${Date.now()}`}
          alt={artifact.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>
      
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base font-semibold line-clamp-1">{artifact.title}</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 p-0"
            onClick={handleFavoriteClick}
          >
            <Heart
              className={`h-3.5 w-3.5 ${artifact.is_favorite ? "fill-red-500 text-red-500" : "text-gray-400"}`}
            />
          </Button>
        </div>
        
        <CardDescription className="flex items-center gap-1 text-sm">
          <Calendar className="h-3 w-3" />
          {artifact.dynasty}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-4 pt-0">
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{artifact.description}</p>
        
        <div className="flex justify-between items-center">
          <div className="flex gap-1">
            <Badge variant="secondary" className="text-xs">{artifact.category}</Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7"
            onClick={(e) => { e.stopPropagation(); onViewDetails(artifact); }}
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}