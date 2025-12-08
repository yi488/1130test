// src/lib/api.ts
import { invoke } from '@tauri-apps/api/core';
import { 
  ArtifactWithFavorite, 
  SearchParams, 
  User, 
  LoginRequest, 
  RegisterRequest,
  CreateArtifactRequest,
  UpdateArtifactRequest,
  AuthResponse
} from '../types';

// Token 管理
let authToken: string | null = null;

export const setAuthToken = (token: string) => {
  authToken = token;
  localStorage.setItem('auth_token', token);
};

export const getAuthToken = (): string | null => {
  if (!authToken) {
    authToken = localStorage.getItem('auth_token');
  }
  return authToken;
};

export const clearAuthToken = () => {
  authToken = null;
  localStorage.removeItem('auth_token');
};

export const historyApi = {
  addToHistory: (artifactId: number): Promise<void> => {
    const token = getAuthToken();
    if (!token) {
      return Promise.reject(new Error('用户未登录'));
    }
    return invoke('add_to_history', { artifactId, token });
  },
  
  getBrowsingHistory: (): Promise<Array<{
    id: number;
    artifact: ArtifactWithFavorite;
    viewed_at: string;
  }>> => {
    const token = getAuthToken();
    if (!token) {
      return Promise.reject(new Error('用户未登录'));
    }
    return invoke('get_browsing_history', { token });
  },
  
  clearBrowsingHistory: (): Promise<void> => {
    const token = getAuthToken();
    if (!token) {
      return Promise.reject(new Error('用户未登录'));
    }
    return invoke('clear_browsing_history', { token });
  },
};

export const artifactApi = {
  getArtifacts: (params?: SearchParams): Promise<ArtifactWithFavorite[]> => {
    const token = getAuthToken();
    console.log('🚀 API call getArtifacts with params:', params); // Debug
    return invoke('get_artifacts', { 
      params: { ...params, favorites_only: params?.favoritesOnly },
      token
    });
  },
  
  getArtifactById: (id: number): Promise<ArtifactWithFavorite | null> => 
    invoke('get_artifact_by_id', { id }),
  
  searchArtifacts: (query: string): Promise<ArtifactWithFavorite[]> => 
    invoke('search_artifacts', { query }),
  
  toggleFavorite: (artifactId: number): Promise<boolean> => {
    const token = getAuthToken();
    if (!token) return Promise.reject(new Error('用户未登录'));
    return invoke('toggle_favorite', { artifactId, token });
  },
  
  createArtifact: (data: CreateArtifactRequest): Promise<ArtifactWithFavorite> => {
    const token = getAuthToken();
    if (!token) return Promise.reject(new Error('用户未登录'));
    return invoke('create_artifact', { artifact: data, token });
  },
  
  updateArtifact: (data: UpdateArtifactRequest): Promise<ArtifactWithFavorite> => {
    const token = getAuthToken();
    if (!token) return Promise.reject(new Error('用户未登录'));
    return invoke('update_artifact', { artifact: data, token });
  },
  
  deleteArtifact: (id: number): Promise<boolean> => {
    const token = getAuthToken();
    if (!token) return Promise.reject(new Error('用户未登录'));
    return invoke('delete_artifact', { id, token });
  },
};

export const authApi = {
  login: (request: LoginRequest): Promise<AuthResponse> => 
    invoke('login', { request }),
  
  register: (request: RegisterRequest): Promise<AuthResponse> => 
    invoke('register', { request }),
  
  getCurrentUser: (): Promise<User | null> => {
    const token = getAuthToken();
    if (!token) return Promise.resolve(null);
    return invoke('get_current_user', { token });
  },
  
  logout: (): Promise<void> => {
    const token = getAuthToken();
    if (!token) return Promise.resolve();
    return invoke('logout', { token }).then(() => {
      clearAuthToken();
    });
  },
  
  updateProfile: (data: Partial<User>): Promise<User> => 
    invoke('update_profile', { data }),
};

export const aiApi = {
  chatWithAI: async (message: string, conversationHistory: Array<{role: string, content: string}>): Promise<string> => {
    try {
      const response = await invoke('chat_with_ai', { 
        request: { 
          message, 
          conversation_history: conversationHistory 
        } 
      });
      return (response as any).response;
    } catch (error) {
      console.error('AI chat error:', error);
      throw error;
    }
  },
};