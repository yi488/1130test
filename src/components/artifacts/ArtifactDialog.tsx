// src/components/artifacts/ArtifactDialog.tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";
import { 
  Heart, 
  Calendar, 
  MapPin, 
  Ruler, 
  Box, 
  Building, 
  Share2
} from "lucide-react";
import { ArtifactWithFavorite } from "../../types";
import { useState } from "react";

interface ArtifactDialogProps {
  artifact: ArtifactWithFavorite | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onToggleFavorite: (artifactId: number) => Promise<void>;
}

export function ArtifactDialog({
  artifact,
  open,
  onOpenChange,
  onToggleFavorite
}: ArtifactDialogProps) {
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);

  if (!artifact) return null;
  
  // 调试信息
  console.log('ArtifactDialog artifact:', artifact);

  const handleToggleFavorite = async () => {
    setIsFavoriteLoading(true);
    try {
      await onToggleFavorite(artifact.id);
    } finally {
      setIsFavoriteLoading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: artifact.title,
          text: artifact.description,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${artifact.title} - ${artifact.description}`);
      // You could add a toast notification here
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-2xl leading-tight pr-12">
            {artifact.title}
          </DialogTitle>
          <DialogDescription>
            查看 {artifact.title} 的详细信息，包括年代、材质、尺寸等文物信息
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
            {/* Image section */}
            <div className="space-y-4">
              <div className="overflow-hidden rounded-lg border">
                <img
                  src={`/images/${artifact.image_path}?t=${Date.now()}`}
                  alt={artifact.title}
                  className="w-full h-auto object-contain"
                  style={{ maxHeight: '350px' }}
                />
              </div>
              
              {/* Action buttons */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleToggleFavorite}
                  disabled={isFavoriteLoading}
                >
                  <Heart 
                    className={`h-4 w-4 mr-2 ${
                      artifact.is_favorite ? 'fill-red-500 text-red-500' : ''
                    }`} 
                  />
                  {artifact.is_favorite ? '已收藏' : '收藏'}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleShare}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Details section */}
            <div className="space-y-6">
              {/* Basic info */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">基本信息</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">年代:</span>
                    <span>{artifact.dynasty} · {artifact.period}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">出土地:</span>
                    <span>{artifact.discovery_location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Ruler className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">尺寸:</span>
                    <span>{artifact.dimensions}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Box className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">材质:</span>
                    <span>{artifact.material}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">收藏:</span>
                    <span>{artifact.collection}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">文物描述</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {(() => {
                    console.log('Description data:', { 
                      detailed: artifact.detailed_description, 
                      simple: artifact.description 
                    });
                    return artifact.detailed_description || artifact.description;
                  })()}
                </p>
              </div>

              {/* Tags */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">分类标签</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">
                    {getCategoryLabel(artifact.category as any)}
                  </Badge>
                  <Badge variant="outline">
                    {artifact.material}
                  </Badge>
                  <Badge variant="outline">
                    {artifact.dynasty}
                  </Badge>
                </div>
              </div>

              {/* Additional info */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">补充信息</h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>发现地点: {artifact.discovery_location}</div>
                  <div>现藏于: {artifact.collection}</div>
                  <div>数据更新时间: {formatDate(artifact.updated_at)}</div>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    ceramics: '陶瓷器',
    bronze: '青铜器',
    jade: '玉器',
    calligraphy: '书画',
    sculpture: '雕塑'
  };
  return labels[category] || category;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}