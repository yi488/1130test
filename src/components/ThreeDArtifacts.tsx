import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Box, 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  Move3d,
  Eye,
  AlertCircle,
  Loader2,
  Info
} from 'lucide-react';

interface Model3D {
  id: string;
  name: string;
  file: string;
  description: string;
  category: string;
  dynasty?: string;
}

const models3D: Model3D[] = [
  {
    id: 'chinese_vase',
    name: '中国花瓶',
    file: '/3DModels/chinese_vase.glb',
    description: '精美的中国传统花瓶，展现了中国陶瓷工艺的精湛技艺',
    category: '陶瓷器',
    dynasty: '清代'
  },
  {
    id: 'dragon',
    name: '中国龙',
    file: '/3DModels/dragon.glb',
    description: '中国传统龙形象，象征着权力、智慧和吉祥',
    category: '雕塑',
    dynasty: '传统'
  },
  {
    id: 'nezha',
    name: '哪吒闹海',
    file: '/3DModels/nezha_conquers_the_dragon_king.glb',
    description: '哪吒闹海的经典场景，展现了中国神话传说的魅力',
    category: '雕塑',
    dynasty: '神话'
  }
];

export default function ThreeDArtifacts() {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const modelRef = useRef<THREE.Group | null>(null);
  const frameRef = useRef<number | null>(null);
  
  const [selectedModel, setSelectedModel] = useState<Model3D>(models3D[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [wireframe, setWireframe] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [modelError, setModelError] = useState<string | null>(null);

  // 初始化Three.js场景
  useEffect(() => {
    if (!mountRef.current || isInitialized) return;
    
    try {
      // 创建场景
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0xf0f0f0);
      scene.fog = new THREE.Fog(0xf0f0f0, 10, 50);
      sceneRef.current = scene;

      // 创建相机
      const camera = new THREE.PerspectiveCamera(
        45,
        mountRef.current.clientWidth / mountRef.current.clientHeight,
        0.1,
        1000
      );
      camera.position.set(0, 2, 5);
      cameraRef.current = camera;

      // 创建渲染器
      const renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: false,
        powerPreference: "high-performance"
      });
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2;
      
      // 清理可能的旧内容
      while (mountRef.current.firstChild) {
        mountRef.current.removeChild(mountRef.current.firstChild);
      }
      mountRef.current.appendChild(renderer.domElement);
      rendererRef.current = renderer;

      // 创建控制器
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.screenSpacePanning = false;
      controls.minDistance = 1;
      controls.maxDistance = 20;
      controls.maxPolarAngle = Math.PI / 2;
      controls.autoRotate = autoRotate;
      controls.autoRotateSpeed = 0.5;
      controlsRef.current = controls;

      // 设置光照
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
      scene.add(ambientLight);

      const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
      mainLight.position.set(5, 10, 5);
      mainLight.castShadow = true;
      mainLight.shadow.mapSize.width = 2048;
      mainLight.shadow.mapSize.height = 2048;
      mainLight.shadow.camera.near = 0.5;
      mainLight.shadow.camera.far = 50;
      mainLight.shadow.camera.left = -10;
      mainLight.shadow.camera.right = 10;
      mainLight.shadow.camera.top = 10;
      mainLight.shadow.camera.bottom = -10;
      scene.add(mainLight);

      const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
      fillLight.position.set(-5, 5, -5);
      scene.add(fillLight);

      const rimLight = new THREE.DirectionalLight(0xffffff, 0.2);
      rimLight.position.set(0, 5, -10);
      scene.add(rimLight);

      // 事件处理
      const handleResize = () => {
        if (!mountRef.current || !cameraRef.current || !rendererRef.current) return;
        
        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;
        
        cameraRef.current.aspect = width / height;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(width, height);
      };

      const handleDoubleClick = () => {
        if (cameraRef.current && controlsRef.current && modelRef.current) {
          const box = new THREE.Box3().setFromObject(modelRef.current);
          const size = box.getSize(new THREE.Vector3());
          const maxSize = Math.max(size.x, size.y, size.z);
          const distance = maxSize * 2.5;
          const height = size.y * 0.8;
          
          cameraRef.current.position.set(0, height, distance);
          controlsRef.current.target.set(0, 0, 0);
          controlsRef.current.update();
        }
      };

      window.addEventListener('resize', handleResize);
      renderer.domElement.addEventListener('dblclick', handleDoubleClick);
      handleResize();

      // 动画循环
      const animate = () => {
        frameRef.current = requestAnimationFrame(animate);
        
        if (controlsRef.current) {
          controlsRef.current.update();
        }
        
        if (rendererRef.current && sceneRef.current && cameraRef.current) {
          rendererRef.current.render(sceneRef.current, cameraRef.current);
        }
      };
      
      animate();
      setIsInitialized(true);

      return () => {
        window.removeEventListener('resize', handleResize);
        renderer.domElement.removeEventListener('dblclick', handleDoubleClick);
        
        if (frameRef.current) {
          cancelAnimationFrame(frameRef.current);
        }
        
        if (sceneRef.current) {
          sceneRef.current.traverse((object: any) => {
            if (object.geometry) object.geometry.dispose();
            if (object.material) {
              if (Array.isArray(object.material)) {
                object.material.forEach((mat: any) => mat.dispose());
              } else {
                object.material.dispose();
              }
            }
          });
        }
        
        if (rendererRef.current) {
          rendererRef.current.dispose();
        }
        
        sceneRef.current = null;
        rendererRef.current = null;
        cameraRef.current = null;
        controlsRef.current = null;
        modelRef.current = null;
        setIsInitialized(false);
      };
    } catch (err) {
      console.error('Three.js初始化失败:', err);
      setError('3D引擎初始化失败，请刷新页面重试');
      return undefined;
    }
  }, [autoRotate]);

  // 更新控制器设置
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = autoRotate;
    }
  }, [autoRotate]);

  // 加载模型
  useEffect(() => {
    if (!sceneRef.current || !isInitialized) return;

    // 清理之前的模型
    if (modelRef.current) {
      sceneRef.current.remove(modelRef.current);
      modelRef.current.traverse((child: any) => {
        if (child.isMesh) {
          if (child.geometry) child.geometry.dispose();
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach((mat: any) => mat.dispose());
            } else {
              child.material.dispose();
            }
          }
        }
      });
      modelRef.current = null;
    }

    setIsLoading(true);
    setModelError(null);
    setError(null);
    setLoadingProgress(0);

    const loader = new GLTFLoader();
    
    loader.load(
      selectedModel.file,
      (gltf: any) => {
        try {
          const model = gltf.scene;
          
          console.log(`🐉 模型加载: ${selectedModel.name}`);
          console.log('场景结构:', model);
          console.log('子对象数量:', model.children.length);
          
          // 递归打印模型结构
          model.traverse((child: any) => {
            if (child.isMesh) {
              console.log('Mesh:', child.name, {
                position: child.position,
                scale: child.scale,
                visible: child.visible,
                material: child.material?.type || 'unknown',
                geometry: child.geometry?.type || 'unknown'
              });
            }
          });
          
          // 计算边界框并调整
          const box = new THREE.Box3().setFromObject(model);
          const center = box.getCenter(new THREE.Vector3());
          const size = box.getSize(new THREE.Vector3());
          
          console.log('📦 边界框信息:', { center, size });
          console.log('边界框是否有效:', !box.isEmpty());
          
          // 检查边界框是否异常
          if (box.isEmpty() || (size.x === 0 && size.y === 0 && size.z === 0)) {
            console.warn('⚠️ 边界框为空，使用默认位置');
            model.position.set(0, 0, 0);
          } else {
            // 居中模型
            model.position.copy(center).negate();
            console.log('✅ 模型已居中，新位置:', model.position);
          }
          
          // 智能缩放
          const maxDim = Math.max(size.x, size.y, size.z);
          const scale = maxDim > 3 ? 2 / maxDim : maxDim < 0.5 ? 1 / maxDim : 1;
          model.scale.setScalar(scale);
          
          console.log('🔧 缩放信息:', { maxDim, scale, originalSize: size });
          
          // 特殊处理中国龙模型
          if (selectedModel.id === 'dragon') {
            console.log('🐲 应用中国龙特殊处理...');
            
            // 尝试不同的旋转 - 移除之前的旋转，保持水平
            model.rotation.set(0, 0, 0); // 重置所有旋转
            console.log('🔄 重置模型旋转到:', model.rotation);
            
            // 强制设置位置
            model.position.set(0, 0, 0);
            model.scale.setScalar(1); // 重置缩放
            
            // 重新计算边界框
            const newBox = new THREE.Box3().setFromObject(model);
            const newSize = newBox.getSize(new THREE.Vector3());
            console.log('📏 重新计算的边界框:', newSize);
            
            // 根据新尺寸调整缩放
            const newMaxDim = Math.max(newSize.x, newSize.y, newSize.z);
            const newScale = newMaxDim > 3 ? 2 / newMaxDim : newMaxDim < 0.5 ? 1 / newMaxDim : 1;
            model.scale.setScalar(newScale);
            
            console.log('🔧 中国龙最终设置:', { scale: newScale, position: model.position });
          }
          
          // 优化材质
          model.traverse((child: any) => {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
              
              if (child.material) {
                // 确保材质是MeshStandardMaterial
                if (!child.material.isMeshStandardMaterial) {
                  child.material = new THREE.MeshStandardMaterial({
                    map: child.material.map,
                    color: child.material.color,
                    metalness: 0.1,
                    roughness: 0.8
                  });
                } else {
                  child.material.metalness = 0.1;
                  child.material.roughness = 0.8;
                }
                
                if (wireframe) {
                  child.material.wireframe = true;
                }
                child.material.needsUpdate = true;
              }
            }
          });
          
          // 添加到场景
          if (sceneRef.current) {
            sceneRef.current.add(model);
          }
          modelRef.current = model;
          
          // 调整相机位置
          const scaledBox = new THREE.Box3().setFromObject(model);
          const scaledSize = scaledBox.getSize(new THREE.Vector3());
          const maxSize = Math.max(scaledSize.x, scaledSize.y, scaledSize.z);
          const distance = maxSize * 2.5;
          const height = scaledSize.y * 0.8;
          
          if (cameraRef.current && controlsRef.current) {
            cameraRef.current.position.set(0, height, distance);
            controlsRef.current.target.set(0, 0, 0);
            controlsRef.current.update();
          }
          
          setIsLoading(false);
        } catch (err) {
          console.error('模型处理失败:', err);
          setModelError('模型处理失败，请尝试其他模型');
          setIsLoading(false);
        }
      },
      (progress: any) => {
        const percentage = (progress.loaded / progress.total) * 100;
        setLoadingProgress(Math.round(percentage));
      },
      (error: any) => {
        console.error('模型加载失败:', error);
        setModelError(`模型加载失败: ${error.message || '文件不存在或损坏'}`);
        setIsLoading(false);
      }
    );
  }, [selectedModel, wireframe, isInitialized]);

  // 更新线框模式
  useEffect(() => {
    if (modelRef.current) {
      modelRef.current.traverse((child: any) => {
        if (child.isMesh && child.material) {
          const materials = Array.isArray(child.material) ? child.material : [child.material];
          materials.forEach((mat: any) => {
            mat.wireframe = wireframe;
            mat.needsUpdate = true;
          });
        }
      });
    }
  }, [wireframe]);

  // 视图控制函数
  const handleResetCamera = () => {
    if (modelRef.current && cameraRef.current && controlsRef.current) {
      const box = new THREE.Box3().setFromObject(modelRef.current);
      const size = box.getSize(new THREE.Vector3());
      const maxSize = Math.max(size.x, size.y, size.z);
      const distance = maxSize * 2.5;
      const height = size.y * 0.8;
      
      cameraRef.current.position.set(0, height, distance);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  };

  const handleZoomIn = () => {
    if (cameraRef.current && controlsRef.current) {
      const direction = new THREE.Vector3();
      direction.subVectors(cameraRef.current.position, controlsRef.current.target).normalize();
      const distance = cameraRef.current.position.distanceTo(controlsRef.current.target);
      const newDistance = Math.max(distance * 0.8, 1);
      
      cameraRef.current.position.copy(controlsRef.current.target).add(direction.multiplyScalar(newDistance));
      controlsRef.current.update();
    }
  };

  const handleZoomOut = () => {
    if (cameraRef.current && controlsRef.current) {
      const direction = new THREE.Vector3();
      direction.subVectors(cameraRef.current.position, controlsRef.current.target).normalize();
      const distance = cameraRef.current.position.distanceTo(controlsRef.current.target);
      const newDistance = Math.min(distance * 1.2, 20);
      
      cameraRef.current.position.copy(controlsRef.current.target).add(direction.multiplyScalar(newDistance));
      controlsRef.current.update();
    }
  };

  return (
    <div className="flex flex-col h-full p-4 gap-4 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
        {/* 3D视图区域 */}
        <Card className="flex-1 flex flex-col min-h-[500px] lg:min-h-0">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Box className="h-5 w-5 text-blue-600" />
              <span>3D文物展示</span>
              <Badge variant="secondary" className="ml-auto">
                {models3D.length} 个模型
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-0 flex flex-col">
            <div 
              ref={mountRef} 
              className="flex-1 relative min-h-[400px] bg-gradient-to-br from-gray-100 to-gray-200 rounded-b-lg"
            />
            
            {/* 加载指示器 */}
            {isLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm">
                <div className="text-center text-white p-6 rounded-xl bg-gray-900/80">
                  <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-400" />
                  <p className="text-lg font-medium mb-2">加载模型中...</p>
                  <div className="w-64 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                      style={{ width: `${loadingProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-300 mt-2">{loadingProgress}%</p>
                </div>
              </div>
            )}
            
            {/* 错误提示 */}
            {(error || modelError) && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                <div className="text-center text-white p-6 rounded-xl bg-red-900/80 max-w-md">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-300" />
                  <p className="text-lg font-medium mb-2">加载失败</p>
                  <p className="text-gray-200 mb-4">{modelError || error}</p>
                  <div className="flex gap-2 justify-center">
                    <Button
                      variant="destructive"
                      onClick={() => {
                        setError(null);
                        setModelError(null);
                      }}
                    >
                      关闭
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setError(null);
                        setModelError(null);
                        // 重新加载当前模型
                        const currentModel = selectedModel;
                        setSelectedModel(models3D.find(m => m.id !== currentModel.id) || models3D[0]);
                        setTimeout(() => setSelectedModel(currentModel), 100);
                      }}
                    >
                      重试
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            {/* 控制按钮工具栏 */}
            <div className="p-4 border-t bg-white/80 backdrop-blur-sm">
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant={autoRotate ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAutoRotate(!autoRotate)}
                  className="gap-2"
                >
                  <RotateCw className={`h-4 w-4 ${autoRotate ? 'animate-spin' : ''}`} />
                  {autoRotate ? '旋转中' : '自动旋转'}
                </Button>
                
                <Button
                  variant={wireframe ? "default" : "outline"}
                  size="sm"
                  onClick={() => setWireframe(!wireframe)}
                  className="gap-2"
                >
                  <Eye className="h-4 w-4" />
                  {wireframe ? '实体模式' : '线框模式'}
                </Button>
                
                <div className="flex gap-2 ml-auto">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleZoomOut}
                    title="缩小"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleResetCamera}
                    title="重置视角"
                  >
                    <Move3d className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleZoomIn}
                    title="放大"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 侧边栏 */}
        <div className="w-full lg:w-80 space-y-4">
          {/* 模型列表 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Box className="h-4 w-4" />
                模型列表
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {models3D.map(model => (
                  <button
                    key={model.id}
                    className={`w-full p-4 rounded-lg border transition-all duration-200 text-left hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${
                      selectedModel.id === model.id 
                        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-sm' 
                        : 'bg-white hover:bg-gray-50 border-gray-200'
                    }`}
                    onClick={() => setSelectedModel(model)}
                    disabled={isLoading}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-900">{model.name}</h4>
                          {model.dynasty && (
                            <Badge 
                              variant="secondary" 
                              className="text-xs font-normal"
                            >
                              {model.dynasty}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {model.description}
                        </p>
                        <div className="mt-2">
                          <Badge variant="outline" className="text-xs">
                            {model.category}
                          </Badge>
                        </div>
                      </div>
                      {selectedModel.id === model.id && (
                        <div className="ml-2 w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 当前模型信息 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Info className="h-4 w-4" />
                模型详情
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {selectedModel.name}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {selectedModel.description}
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="px-3 py-1">
                    {selectedModel.category}
                  </Badge>
                  {selectedModel.dynasty && (
                    <Badge variant="outline" className="px-3 py-1">
                      {selectedModel.dynasty}时期
                    </Badge>
                  )}
                </div>
                
                <div className="pt-4 border-t">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Move3d className="h-4 w-4" />
                    操作指南
                  </h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded">
                        🖱️
                      </div>
                      <span><strong>左键拖拽</strong> - 旋转模型</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded">
                        🔍
                      </div>
                      <span><strong>鼠标滚轮</strong> - 缩放模型</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded">
                        📐
                      </div>
                      <span><strong>右键拖拽</strong> - 平移视角</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded">
                        🎯
                      </div>
                      <span><strong>双击视图</strong> - 重置视角</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}