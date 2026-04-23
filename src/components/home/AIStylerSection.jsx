import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Loader2, ArrowUpRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

const STYLE_PRESETS = ['海边日落感', '城市复古风', '山野清冷感', '法式慵懒度假', '甜美花园风'];

const OUTFIT_SLOTS = [
  { key: 'top', label: '上衣', scene_match: ['城市街拍', '海边', '山野'] },
  { key: 'bottom', label: '下装', scene_match: ['城市街拍', '海边', '山野'] },
  { key: 'accessory', label: '配饰', scene_match: [] },
  { key: 'shoes', label: '鞋子', scene_match: [] },
];

export default function AIStylerSection() {
  const [selectedPreset, setSelectedPreset] = useState('');
  const [customInput, setCustomInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [outfitResult, setOutfitResult] = useState(null);

  const { data: items = [] } = useQuery({
    queryKey: ['all-items'],
    queryFn: () => base44.entities.Item.list('-created_date', 20),
  });

  const handleGenerate = async () => {
    const prompt = selectedPreset || customInput;
    if (!prompt) return;
    setLoading(true);
    setOutfitResult(null);

    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `你是专业的旅行穿搭顾问。用户想要"${prompt}"风格的完整搭配。
请从以下商品列表中挑选最合适的4件，分别对应：上衣、下装、配饰、鞋子。
如果某个品类没有合适的商品，该槽位商品id返回null，同时给一条温柔俏皮的中文穿搭建议（比如"推荐搭配白色人字拖哦，快看看衣柜里有没有吧～"），放在对应的tip字段。有商品的槽位tip也可以不填。

商品列表：
${JSON.stringify(items.map(i => ({ id: i.id, name: i.name, style_tags: i.style_tags, scene_tags: i.scene_tags, price: i.price })))}

返回JSON，格式：{ top: "商品id或null", top_tip: "建议或null", bottom: "商品id或null", bottom_tip: "建议或null", accessory: "商品id或null", accessory_tip: "建议或null", shoes: "商品id或null", shoes_tip: "建议或null" }`,
      response_json_schema: {
        type: 'object',
        properties: {
          top: { type: ['string', 'null'] },
          top_tip: { type: ['string', 'null'] },
          bottom: { type: ['string', 'null'] },
          bottom_tip: { type: ['string', 'null'] },
          accessory: { type: ['string', 'null'] },
          accessory_tip: { type: ['string', 'null'] },
          shoes: { type: ['string', 'null'] },
          shoes_tip: { type: ['string', 'null'] },
        }
      }
    });

    setOutfitResult(res);
    setLoading(false);
  };

  const getItemById = (id) => items.find(i => i.id === id) || null;

  const showOutfit = outfitResult || (items.length > 0 && !loading);
  const displaySlots = OUTFIT_SLOTS.map(slot => ({
    ...slot,
    item: outfitResult
      ? getItemById(outfitResult[slot.key])
      : items[OUTFIT_SLOTS.indexOf(OUTFIT_SLOTS.find(s => s.key === slot.key))] || null,
    tip: outfitResult?.[`${slot.key}_tip`] || null,
  }));

  return (
    <section className="py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-baseline gap-4 mb-8">
          <h2 className="font-display text-4xl sm:text-5xl font-black tracking-tight uppercase">
            AI 穿搭搭配
          </h2>
          <p className="text-sm text-muted-foreground font-serif italic hidden sm:block">
            告诉我你要去哪里
          </p>
        </div>

        {/* Input card */}
        <div className="bg-secondary/40 border border-border/50 rounded-2xl p-5 sm:p-6 mb-10">
          <p className="text-xs text-muted-foreground mb-3 tracking-wide">选择目的地氛围</p>

          {/* Presets */}
          <div className="flex flex-wrap gap-2 mb-4">
            {STYLE_PRESETS.map((preset) => (
              <button
                key={preset}
                onClick={() => { setSelectedPreset(selectedPreset === preset ? '' : preset); setCustomInput(''); }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                  selectedPreset === preset
                    ? 'bg-foreground text-background border-foreground'
                    : 'bg-background border-border text-foreground hover:border-foreground/30'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>

          {/* Input row */}
          <div className="flex gap-2">
            <Input
              placeholder="或者直接描述你的目的地和想法..."
              value={customInput}
              onChange={(e) => { setCustomInput(e.target.value); setSelectedPreset(''); }}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              className="flex-1 h-12 rounded-xl bg-background border-border/60 px-4 text-sm"
            />
            <button
              onClick={handleGenerate}
              disabled={loading || (!selectedPreset && !customInput)}
              className="h-12 px-6 rounded-xl bg-foreground text-background text-sm font-medium flex items-center gap-1.5 hover:bg-foreground/90 transition-colors disabled:opacity-40"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>帮我搭配 <ArrowUpRight className="w-4 h-4" /></>
              )}
            </button>
          </div>
        </div>

        {/* Outfit result */}
        {(showOutfit || loading) && (
          <div>
            <h3 className="font-display text-2xl font-black tracking-tight mb-6 uppercase">
              为你推荐的完整搭配
            </h3>

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-[3/4] rounded-2xl bg-secondary" />
                    <div className="mt-3 h-3 rounded bg-secondary w-1/2" />
                    <div className="mt-2 h-4 rounded bg-secondary w-3/4" />
                  </div>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-4"
              >
                {displaySlots.map((slot) => (
                  <OutfitSlot key={slot.key} slot={slot} />
                ))}
              </motion.div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function OutfitSlot({ slot }) {
  const { item, label, tip } = slot;
  const [flipped, setFlipped] = useState(false);
  const mainImage = item?.photo_urls?.[0] || item?.outfit_urls?.[0];

  if (!item) {
    return (
      <div>
        {/* Flip card container */}
        <div
          className="aspect-[3/4] cursor-pointer"
          style={{ perspective: '1000px' }}
          onClick={() => setFlipped(f => !f)}
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              transformStyle: 'preserve-3d',
              transition: 'transform 0.55s cubic-bezier(0.4,0,0.2,1)',
              transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            }}
          >
            {/* Front */}
            <div
              style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
              className="absolute inset-0 rounded-2xl bg-secondary/60 border border-border/40 flex flex-col items-center justify-center text-center px-4"
            >
              <p className="text-xs text-muted-foreground mb-1">{label}</p>
              <p className="text-lg font-display font-black">暂无库存</p>
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                点击查看建议 ↗
              </p>
            </div>

            {/* Back */}
            <div
              style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
              }}
              className="absolute inset-0 rounded-2xl bg-foreground flex flex-col items-center justify-center text-center px-5"
            >
              <p className="text-xs text-background/60 mb-3 uppercase tracking-widest">{label}</p>
              <p className="text-background text-sm font-serif italic leading-relaxed">
                {tip || `衣柜里找找看有没有合适的${label}哦～`}
              </p>
              <p className="text-background/40 text-xs mt-4">点击翻回</p>
            </div>
          </div>
        </div>

        {/* Below card info placeholder */}
        <div className="mt-3 px-0.5 h-10" />
      </div>
    );
  }

  return (
    <Link to={`/item/${item.id}`} className="group block">
      <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-secondary">
        {mainImage ? (
          <img
            src={mainImage}
            alt={item.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
            暂无图片
          </div>
        )}
      </div>
      <div className="mt-3 px-0.5">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground mt-0.5 truncate">{item.name}</p>
        <p className="text-sm font-display font-bold text-accent mt-0.5">¥{item.price}</p>
      </div>
    </Link>
  );
}
