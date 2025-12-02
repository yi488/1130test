import { useState, useEffect } from 'react';
import { artifactApi } from '../lib/api';
import { ArtifactWithFavorite, SearchParams } from '../types';

export function useArtifacts(initialParams?: SearchParams) {
  const [artifacts, setArtifacts] = useState<ArtifactWithFavorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadArtifacts = async (params: SearchParams = {}) => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔍 Loading artifacts with params:', params); // Debug log
      const data = await artifactApi.getArtifacts(params);
      console.log('📦 Received artifacts:', data.length, 'items'); // Debug log
      console.log('📝 Artifacts details:', data.map(a => ({ id: a.id, title: a.title, is_favorite: a.is_favorite }))); // Debug log
      setArtifacts(data);
    } catch (err) {
      console.error('❌ Failed to load artifacts:', err);
      setError(err instanceof Error ? err.message : 'Failed to load artifacts');
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (artifactId: number) => {
    try {
      const newFavoriteStatus = await artifactApi.toggleFavorite(artifactId);
      setArtifacts(prev => 
        prev.map(artifact => 
          artifact.id === artifactId 
            ? { ...artifact, is_favorite: newFavoriteStatus }
            : artifact
        )
      );
      return newFavoriteStatus;
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
      throw err;
    }
  };

  // 使用字符串化的参数作为依赖
  useEffect(() => {
    console.log('🔄 useArtifacts useEffect triggered with params:', initialParams);
    loadArtifacts(initialParams || {});
  }, [JSON.stringify(initialParams)]);

  return {
    artifacts,
    loading,
    error,
    toggleFavorite,
  };
}