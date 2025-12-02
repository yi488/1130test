import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Search, MapPin, Navigation, Layers, Info } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// 修复 Leaflet 图标在 React 中的问题
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface ArtifactLocation {
  id: number;
  title: string;
  category: string;
  dynasty: string;
  location: string;
  description: string;
  coordinates: {
    lng: number;
    lat: number;
  };
}

// 模拟文物位置数据
const mockArtifactLocations: ArtifactLocation[] = [
  {
    id: 1,
    title: "司母戊鼎",
    category: "青铜器",
    dynasty: "商代",
    location: "河南安阳殷墟",
    description: "中国现存最大的青铜器",
    coordinates: { lng: 114.3524, lat: 36.0671 }
  },
  {
    id: 2,
    title: "四羊方尊",
    category: "青铜器",
    dynasty: "商代",
    location: "湖南宁乡",
    description: "中国商代晚期青铜礼器",
    coordinates: { lng: 112.5459, lat: 28.2534 }
  },
  {
    id: 3,
    title: "马王堆汉墓帛画",
    category: "书画",
    dynasty: "汉代",
    location: "湖南长沙马王堆",
    description: "汉代绘画艺术珍品",
    coordinates: { lng: 112.9388, lat: 28.2282 }
  },
  {
    id: 4,
    title: "唐三彩骆驼载乐俑",
    category: "陶瓷",
    dynasty: "唐代",
    location: "陕西西安",
    description: "唐代陶瓷艺术代表作",
    coordinates: { lng: 108.9402, lat: 34.3416 }
  },
  {
    id: 5,
    title: "清明上河图",
    category: "书画",
    dynasty: "北宋",
    location: "河南开封",
    description: "中国十大传世名画之一",
    coordinates: { lng: 114.3479, lat: 34.7971 }
  },
  {
    id: 6,
    title: "金缕玉衣",
    category: "玉器",
    dynasty: "汉代",
    location: "河北满城汉墓",
    description: "汉代玉衣精品",
    coordinates: { lng: 115.4712, lat: 38.9537 }
  }
];

export default function MapExploration() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [selectedArtifact, setSelectedArtifact] = useState<ArtifactLocation | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [mapLoaded, setMapLoaded] = useState(false);

  // 初始化地图
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const initializeMap = () => {
      try {
        // 创建地图实例
        const mapInstance = L.map(mapContainer.current!).setView([34.3416, 108.9402], 5);

        // 添加 OpenStreetMap 图层
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(mapInstance);

        // 添加缩放控件
        L.control.zoom({
          position: 'topright'
        }).addTo(mapInstance);

        // 添加比例尺
        L.control.scale({
          imperial: false,
          metric: true
        }).addTo(mapInstance);

        mapRef.current = mapInstance;
        setMapLoaded(true);
        console.log('Leaflet 地图初始化成功');

        // 添加默认标记
        addArtifactMarkers();

        // 处理窗口大小变化
        const handleResize = () => {
          mapInstance.invalidateSize();
        };
        
        window.addEventListener('resize', handleResize);

        return () => {
          window.removeEventListener('resize', handleResize);
          if (mapInstance) {
            mapInstance.remove();
          }
        };
      } catch (error) {
        console.error('Leaflet 地图初始化失败:', error);
      }
    };

    initializeMap();
  }, []);

  // 添加文物标记
  const addArtifactMarkers = () => {
    if (!mapRef.current) return;

    // 清除现有标记
    markersRef.current.forEach(marker => {
      marker.remove();
    });
    markersRef.current = [];

    // 过滤文物
    const filteredArtifacts = mockArtifactLocations.filter(artifact => {
      const matchesSearch = artifact.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           artifact.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === 'all' || artifact.category === filterCategory;
      return matchesSearch && matchesCategory;
    });

    // 添加新标记
    filteredArtifacts.forEach(artifact => {
      const marker = L.marker([artifact.coordinates.lat, artifact.coordinates.lng])
        .addTo(mapRef.current!)
        .bindPopup(`
          <div style="padding: 10px; max-width: 200px;">
            <h4 style="margin: 0 0 8px 0; font-weight: bold;">${artifact.title}</h4>
            <p style="margin: 4px 0; font-size: 12px;"><strong>类别:</strong> ${artifact.category}</p>
            <p style="margin: 4px 0; font-size: 12px;"><strong>朝代:</strong> ${artifact.dynasty}</p>
            <p style="margin: 4px 0; font-size: 12px;"><strong>地点:</strong> ${artifact.location}</p>
            <p style="margin: 4px 0; font-size: 12px;">${artifact.description}</p>
          </div>
        `);

      marker.on('click', () => {
        setSelectedArtifact(artifact);
      });

      marker.on('popupopen', () => {
        setSelectedArtifact(artifact);
      });

      markersRef.current.push(marker);
    });

    // 调整地图视图以显示所有标记
    if (filteredArtifacts.length > 0) {
      const group = L.featureGroup(markersRef.current);
      mapRef.current.fitBounds(group.getBounds().pad(0.1));
    }
  };

  // 当搜索或过滤条件变化时更新标记
  useEffect(() => {
    if (mapRef.current) {
      addArtifactMarkers();
    }
  }, [searchQuery, filterCategory]);

  const categories = ['all', '青铜器', '陶瓷', '玉器', '书画'];

  const handleLocateArtifact = (artifact: ArtifactLocation) => {
    if (!mapRef.current) return;
    
    mapRef.current.setView([artifact.coordinates.lat, artifact.coordinates.lng], 12);
    setSelectedArtifact(artifact);
    
    // 打开对应的标记弹窗
    const targetMarker = markersRef.current.find(marker => {
      const latlng = marker.getLatLng();
      return latlng.lat === artifact.coordinates.lat && 
             latlng.lng === artifact.coordinates.lng;
    });
    
    if (targetMarker) {
      targetMarker.openPopup();
    }
  };

  const handleResetView = () => {
    if (!mapRef.current) return;
    mapRef.current.setView([34.3416, 108.9402], 5);
    setSelectedArtifact(null);
    
    // 关闭所有弹窗
    markersRef.current.forEach(marker => {
      marker.closePopup();
    });
  };

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      <div className="flex gap-4 flex-1">
        {/* 地图容器 */}
        <Card className="flex-1">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              文物地图探索
              <Badge variant="secondary" className="ml-auto">
                {mockArtifactLocations.length} 个文物地点
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div 
              ref={mapContainer} 
              className="w-full h-[500px] bg-gray-100"
              style={{ minHeight: '500px' }}
            >
              {!mapLoaded && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-500">正在加载地图...</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 侧边栏 - 保持不变 */}
        <div className="w-80 space-y-4">
          {/* 搜索和筛选 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">搜索筛选</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索文物名称或地点..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">文物类别</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map(category => (
                    <Button
                      key={category}
                      variant={filterCategory === category ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilterCategory(category)}
                    >
                      {category === 'all' ? '全部' : category}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 文物列表 */}
          <Card className="flex-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Layers className="h-5 w-5" />
                文物地点
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {mockArtifactLocations
                  .filter(artifact => {
                    const matchesSearch = artifact.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                     artifact.location.toLowerCase().includes(searchQuery.toLowerCase());
                    const matchesCategory = filterCategory === 'all' || artifact.category === filterCategory;
                    return matchesSearch && matchesCategory;
                  })
                  .map(artifact => (
                    <div
                      key={artifact.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors hover:bg-gray-50 ${
                        selectedArtifact?.id === artifact.id ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                      onClick={() => handleLocateArtifact(artifact)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{artifact.title}</h4>
                          <p className="text-xs text-gray-500 mt-1">{artifact.location}</p>
                          <div className="flex gap-1 mt-2">
                            <Badge variant="secondary" className="text-xs">
                              {artifact.category}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {artifact.dynasty}
                            </Badge>
                          </div>
                        </div>
                        <Navigation className="h-4 w-4 text-gray-400 flex-shrink-0 mt-1" />
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* 控制按钮 */}
          <Card>
            <CardContent className="pt-6">
              <Button onClick={handleResetView} className="w-full" variant="outline">
                <Navigation className="h-4 w-4 mr-2" />
                重置地图视图
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 说明信息 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Info className="h-4 w-4" />
            <span>
              💡 点击地图标记或文物列表查看详细信息。使用 OpenStreetMap 数据，无需 API 密钥。
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}