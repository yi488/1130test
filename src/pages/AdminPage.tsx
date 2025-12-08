import { useEffect, useState } from "react";
import { artifactApi } from "../lib/api";
import { ArtifactWithFavorite } from "../types";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Alert, AlertDescription } from "../components/ui/alert";

const emptyForm = {
  id: 0,
  title: "",
  image_path: "",
  period: "",
  dynasty: "",
  location: "",
  description: "",
  detailed_description: "",
  material: "",
  dimensions: "",
  discovery_location: "",
  collection: "",
  category: "",
};

export function AdminPage({ currentUser }: { currentUser: { email?: string } | null }) {
  const [artifacts, setArtifacts] = useState<ArtifactWithFavorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<typeof emptyForm>(emptyForm);
  const [isEditing, setIsEditing] = useState(false);
  const isAdmin = currentUser?.email === "yi@example.com";

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await artifactApi.getArtifacts();
      setArtifacts(data);
    } catch (err) {
      setError("加载文物列表失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const toForm = (a: ArtifactWithFavorite) => ({
    id: a.id,
    title: a.title,
    image_path: a.image_path,
    period: a.period,
    dynasty: a.dynasty,
    location: a.location,
    description: a.description,
    detailed_description: a.detailed_description,
    material: a.material,
    dimensions: a.dimensions,
    discovery_location: a.discovery_location,
    collection: a.collection,
    category: a.category,
  });

  const handleEdit = (artifact: ArtifactWithFavorite) => {
    setForm(toForm(artifact));
    setIsEditing(true);
  };

  const handleReset = () => {
    setForm(emptyForm);
    setIsEditing(false);
  };

  const handleSubmit = async () => {
    try {
      setError(null);
      const payload = {
        ...form,
        id: isEditing ? form.id : undefined,
      };
      if (isEditing) {
        await artifactApi.updateArtifact(payload as any);
      } else {
        await artifactApi.createArtifact(payload as any);
      }
      await loadData();
      handleReset();
    } catch (err) {
      setError("保存失败，请确认已登录管理员账号 (yi@example.com)");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("确定要删除该文物吗？")) return;
    try {
      await artifactApi.deleteArtifact(id);
      await loadData();
      if (form.id === id) handleReset();
    } catch (err) {
      setError("删除失败，请确认已登录管理员账号 (yi@example.com)");
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertDescription>当前账户无权限访问后台管理（需 yi@example.com）</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">后台管理</h1>
          <p className="text-muted-foreground text-sm">添加、修改、删除、查询文物卡片</p>
        </div>
        <Button variant="outline" onClick={loadData} disabled={loading}>
          刷新
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? "编辑文物" : "新增文物"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input name="title" placeholder="标题" value={form.title} onChange={handleChange} />
            <Input name="image_path" placeholder="图片文件名 (位于 public/images)" value={form.image_path} onChange={handleChange} />
            <Input name="period" placeholder="时期" value={form.period} onChange={handleChange} />
            <Input name="dynasty" placeholder="朝代" value={form.dynasty} onChange={handleChange} />
            <Input name="location" placeholder="出土地/地点" value={form.location} onChange={handleChange} />
            <Input name="material" placeholder="材质" value={form.material} onChange={handleChange} />
            <Input name="dimensions" placeholder="尺寸" value={form.dimensions} onChange={handleChange} />
            <Input name="collection" placeholder="收藏机构" value={form.collection} onChange={handleChange} />
            <Input name="category" placeholder="分类 (bronze/jade/ceramics/...)" value={form.category} onChange={handleChange} />
            <Input name="discovery_location" placeholder="发现地点" value={form.discovery_location} onChange={handleChange} />
          </div>
          <textarea
            name="description"
            placeholder="简介"
            value={form.description}
            onChange={handleChange}
            className="w-full border rounded-md p-2 text-sm"
            rows={2}
          />
          <textarea
            name="detailed_description"
            placeholder="详细描述"
            value={form.detailed_description}
            onChange={handleChange}
            className="w-full border rounded-md p-2 text-sm"
            rows={4}
          />
          <div className="flex gap-2">
            <Button onClick={handleSubmit} disabled={loading}>
              {isEditing ? "保存修改" : "新增文物"}
            </Button>
            {isEditing && (
              <Button variant="outline" onClick={handleReset}>
                取消编辑
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>文物列表（点击编辑，删除按钮可删除）</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {loading ? (
            <div className="text-sm text-muted-foreground">加载中...</div>
          ) : artifacts.length === 0 ? (
            <div className="text-sm text-muted-foreground">暂无数据</div>
          ) : (
            <div className="space-y-2">
              {artifacts.map((a) => (
                <div
                  key={a.id}
                  className="border rounded-md p-3 flex items-center justify-between hover:bg-muted cursor-pointer"
                  onClick={() => handleEdit(a)}
                >
                  <div>
                    <div className="font-medium">{a.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {a.dynasty} · {a.category} · {a.location}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(a);
                      }}
                    >
                      编辑
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(a.id);
                      }}
                    >
                      删除
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

