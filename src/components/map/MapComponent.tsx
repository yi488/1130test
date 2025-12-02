import React, { useEffect, useRef } from 'react';
import './MapComponent.css';

declare global {
  interface Window {
    AMap: any;
  }
}

interface MapComponentProps {
  center?: [number, number];
  zoom?: number;
  style?: React.CSSProperties;
}

const MapComponent: React.FC<MapComponentProps> = ({
  center = [116.397428, 39.90923], // 默认北京中心点
  zoom = 11,
  style = { width: '100%', height: '400px' },
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);

  useEffect(() => {
    // 检查是否已加载AMap脚本
    if (!window.AMap) {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.async = true;
      script.src = `https://webapi.amap.com/maps?v=2.0&key=${import.meta.env.VITE_AMAP_KEY}`;
      script.onload = initMap;
      document.head.appendChild(script);
    } else {
      initMap();
    }

    function initMap() {
      if (!mapContainer.current) return;
      
      // 初始化地图
      mapInstance.current = new window.AMap.Map(mapContainer.current, {
        viewMode: '3D',
        zoom,
        center,
      });

      // 添加控件
      mapInstance.current.addControl(new window.AMap.ToolBar());
      mapInstance.current.addControl(new window.AMap.Scale());
      mapInstance.current.addControl(new window.AMap.Geolocation());
    }

    return () => {
      // 清除地图实例
      if (mapInstance.current) {
        mapInstance.current.destroy();
        mapInstance.current = null;
      }
    };
  }, []);

  return <div ref={mapContainer} style={style} className="map-container" />;
};

export default MapComponent;
