import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Upload, Loader2, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const STYLE_TAGS = ['法式', 'Y2K', 'Boho', '复古', '甜美', '休闲'];
const SCENE_TAGS = ['海边', '日落', '城市街拍', '山野', '度假村', '文艺街区'];
const SEASON_TAGS = ['春', '夏', '秋', '冬'];

export default function PostItemDialog({ open, onOpenChange }) {
  const [form, setForm] = useState({
    name: '', price: '', size: '', wear_count: '', wash_count: '',
    location: '', style_tags: [], scene_tags: [], season_tags: [],
    photo_urls: [], outfit_urls: [],
  });
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const toggleTag = (field, tag) => {
    setForm(prev => ({
      ...prev,
      [field]: prev[field].includes(tag)
        ? prev[field].filter(t => t !== tag)
        : [...prev[field], tag]
    }));
  };

  const handleUpload = async (field) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = async (e) => {
      setUploading(true);
      const files = Array.from(e.target.files);
      const urls = [];
      for (const file of files) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        urls.push(file_url);
      }
      setForm(prev => ({ ...prev, [field]: [...prev[field], ...urls] }));
      setUploading(false);
    };
    input.click();
  };

  const removeImage = (field, idx) => {
    setForm(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== idx)
    }));
  };

  const handleSubmit = async () => {
    if (!form.name || !form.price || !form.size) {
      toast.error('请填写必填项');
      return;
    }
    setSubmitting(true);
    await base44.entities.Item.create({
      ...form,
      price: parseFloat(form.price),
      wear_count: form.wear_count ? parseInt(form.wear_count) : 0,
      wash_count: form.wash_count ? parseInt(form.wash_count) : 0,
    });
    queryClient.invalidateQueries({ queryKey: ['recommended-items'] });
    toast.success('发布成功！');
    setSubmitting(false);
    onOpenChange(false);
    setForm({
      name: '', price: '', size: '', wear_count: '', wash_count: '',
      location: '', style_tags: [], scene_tags: [], season_tags: [],
      photo_urls: [], outfit_urls: [],
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">发布闲置商品</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          {/* Name */}
          <div>
            <Label className="text-sm font-medium">商品名称 *</Label>
            <Input
              placeholder="例如：法式碎花吊带裙"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1.5 h-11 rounded-xl"
            />
          </div>

          {/* Price + Size */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">价格 *</Label>
              <Input
                placeholder="¥"
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="mt-1.5 h-11 rounded-xl"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">尺码 *</Label>
              <Input
                placeholder="例如：S / M / L"
                value={form.size}
                onChange={(e) => setForm({ ...form, size: e.target.value })}
                className="mt-1.5 h-11 rounded-xl"
              />
            </div>
          </div>

          {/* Wear + Wash */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">穿着次数</Label>
              <Input
                placeholder="次"
                type="number"
                value={form.wear_count}
                onChange={(e) => setForm({ ...form, wear_count: e.target.value })}
                className="mt-1.5 h-11 rounded-xl"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">洗涤次数</Label>
              <Input
                placeholder="次"
                type="number"
                value={form.wash_count}
                onChange={(e) => setForm({ ...form, wash_count: e.target.value })}
                className="mt-1.5 h-11 rounded-xl"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <Label className="text-sm font-medium">出片地点</Label>
            <Input
              placeholder="例如：三亚、大理、巴厘岛"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="mt-1.5 h-11 rounded-xl"
            />
          </div>

          {/* Tags */}
          <TagGroup label="风格标签" tags={STYLE_TAGS} selected={form.style_tags} onToggle={(t) => toggleTag('style_tags', t)} />
          <TagGroup label="出片场景" tags={SCENE_TAGS} selected={form.scene_tags} onToggle={(t) => toggleTag('scene_tags', t)} />
          <TagGroup label="适合季节" tags={SEASON_TAGS} selected={form.season_tags} onToggle={(t) => toggleTag('season_tags', t)} />

          {/* Photo Upload */}
          <ImageUploadField
            label="直拍图 *（实物平铺或挂拍）"
            images={form.photo_urls}
            onUpload={() => handleUpload('photo_urls')}
            onRemove={(i) => removeImage('photo_urls', i)}
            uploading={uploading}
          />

          {/* Outfit Upload */}
          <ImageUploadField
            label="穿搭出片图（你的穿搭效果）"
            subtitle="帮助其他姐妹找到穿搭灵感"
            images={form.outfit_urls}
            onUpload={() => handleUpload('outfit_urls')}
            onRemove={(i) => removeImage('outfit_urls', i)}
            uploading={uploading}
          />

          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full h-12 rounded-xl bg-foreground text-background hover:bg-foreground/90 font-medium"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : '发布商品'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TagGroup({ label, tags, selected, onToggle }) {
  return (
    <div>
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex flex-wrap gap-2 mt-1.5">
        {tags.map((tag) => (
          <Badge
            key={tag}
            variant={selected.includes(tag) ? 'default' : 'outline'}
            className={`cursor-pointer rounded-full px-3.5 py-1.5 text-xs transition-all ${
              selected.includes(tag)
                ? 'bg-foreground text-background'
                : 'border-border hover:border-foreground/30'
            }`}
            onClick={() => onToggle(tag)}
          >
            {tag}
          </Badge>
        ))}
      </div>
    </div>
  );
}

function ImageUploadField({ label, subtitle, images, onUpload, onRemove, uploading }) {
  return (
    <div>
      <Label className="text-sm font-medium">{label}</Label>
      {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      <div className="flex flex-wrap gap-3 mt-2">
        {images.map((url, i) => (
          <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden group">
            <img src={url} alt="" className="w-full h-full object-cover" />
            <button
              onClick={() => onRemove(i)}
              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
        <button
          onClick={onUpload}
          disabled={uploading}
          className="w-20 h-20 rounded-xl border-2 border-dashed border-border hover:border-foreground/30 flex flex-col items-center justify-center text-muted-foreground transition-colors"
        >
          {uploading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Upload className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
}
