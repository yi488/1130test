import { ArtifactGrid } from '../components/artifacts/ArtifactGrid';
import { ArtifactDialog } from '../components/artifacts/ArtifactDialog';
import { useArtifacts } from '../hooks/useArtifacts';
import { useState } from 'react';
import { ArtifactWithFavorite } from '../types';

export function FavoritesPage() {
  const [selectedArtifact, setSelectedArtifact] = useState<ArtifactWithFavorite | null>(null);
  const [isArtifactDialogOpen, setIsArtifactDialogOpen] = useState(false);

  const {
    artifacts,
    loading,
    error,
    toggleFavorite,
  } = useArtifacts({ 
    favoritesOnly: true
  });

  const handleViewDetails = (artifact: ArtifactWithFavorite) => {
    setSelectedArtifact(artifact);
    setIsArtifactDialogOpen(true);
  };

  const handleToggleFavorite = async (artifactId: number) => {
    await toggleFavorite(artifactId);
  };

  return (
    <div className="p-6">
      <ArtifactGrid
        artifacts={artifacts}
        loading={loading}
        error={error}
        onViewDetails={handleViewDetails}
        onToggleFavorite={handleToggleFavorite}
        searchQuery=""
        activeSection="favorites"
      />
      
      {/* Artifact Dialog */}
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
