import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import MapComponent from '@/components/map/MapComponent';

const MapPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate(-1)}
          className="mr-4"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-3xl font-bold">高德地图</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">文物位置展示</h2>
          <p className="text-gray-600">
            点击地图上的标记点可以查看文物详细信息
          </p>
        </div>
        
        <div className="rounded-lg overflow-hidden">
          <MapComponent 
            style={{ height: '600px' }}
            center={[116.397428, 39.90923]} // 北京中心点
            zoom={11}
          />
        </div>
      </div>
    </div>
  );
};

export default MapPage;
