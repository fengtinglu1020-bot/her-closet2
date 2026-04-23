import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Loader2, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const STYLE_PRESETS = ['海边日落感', '城市复古风', '山野清冷感', '法式慵懒度假', '甜美花园风'];

const OUTFIT_SLOTS = [
  { key: 'top', label: '上衣' },
  { key: 'bottom', label: '下装' },
  { key: 'accessory', label: '配饰' },
  { key: 'shoes', label: '鞋子' },
];

export default function AIStylerSection() {
  const [selectedPreset, setSelectedPreset] = useState('');
  const [customInput, setCustomInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [outfitResult, setOutfitResult] = useState(null);
  const [items, setItems] = useState([]);

  useEffect(() => {
    try {
      const savedItems = JSON.parse(localStorage.getItem('items') || '[]');
      setItems(savedItems);
    } catch (error) {
      console.error('读取商品失败：', error);
      setItems([]);
    }
  }, []);

  const getItemById = (id) => items.find((i) => String(i.id) === String(id)) || null;

  const normalizeText = (text) => (text || '').toLowerCase();

  const inferTagsFromPrompt = (prompt) => {
    const text = normalizeText(prompt);

    const styleKeywords = {
      法式: ['法式', '法风', '法式慵懒', '慵懒'],
      Y2K: ['y2k', '辣妹', '千禧'],
      Boho: ['boho', '波西米亚', '流浪感'],
      复古: ['复古', '港风', 'old money', 'oldmoney'],
      甜美: ['甜美', '温柔', '花园', '少女'],
      休闲: ['休闲', '日常', '轻松', '通勤'],
    };

    const sceneKeywords = {
      海边: ['海边', '海岛', '海边日落', '沙滩', '度假'],
      日落: ['日落', '夕阳'],
      城市街拍: ['城市', '街拍', '都市'],
      山野: ['山野', '山里', '自然', '清冷'],
      度假村: ['度假村', '度假', '酒店'],
      文艺街区: ['文艺', '街区', '复古街区'],
    };

    const seasonKeywords = {
      春: ['春', '春天'],
      夏: ['夏', '夏天', '海边', '度假', '清凉'],
      秋: ['秋', '秋天'],
      冬: ['冬', '冬天'],
    };

    const matchedStyles = Object.entries(styleKeywords)
      .filter(([, words]) => words.some((w) => text.includes(w)))
      .map(([tag]) => tag);

    const matchedScenes = Object.entries(sceneKeywords)
      .filter(([, words]) => words.some((w) => text.includes(w)))
      .map(([tag]) => tag);

    const matchedSeasons = Object.entries(seasonKeywords)
      .filter(([, words]) => words.some((w) => text.includes(w)))
      .map(([tag]) => tag);

    return {
      matchedStyles,
      matchedScenes,
      matchedSeasons,
    };
  };

  const scoreItem = (item, promptInfo) => {
    let score = 0;

    const styleTags = item.style_tags || [];
    const sceneTags = item.scene_tags || [];
    const seasonTags = item.season_tags || [];

    promptInfo.matchedStyles.forEach((tag) => {
      if (styleTags.includes(tag)) score += 3;
    });

    promptInfo.matchedScenes.forEach((tag) => {
      if (sceneTags.includes(tag)) score += 3;
    });

    promptInfo.matchedSeasons.forEach((tag) => {
      if (seasonTags.includes(tag)) score += 2;
    });

    if (item.outfit_urls?.length) score += 1;
    if (item.photo_urls?.length) score += 1;

    return score;
  };

  const getTipBySlot = (slotLabel, prompt) => {
    return `这套「${prompt}」风格里暂时还缺一件${slotLabel}，可以试试从你的衣柜里补一件颜色更协调的单品哦～`;
  };

  const handleGenerate = () => {
    const prompt = selectedPreset || customInput;
    if (!prompt) return;

    setLoading(true);
    setOutfitResult(null);

    setTimeout(() => {
      if (!items.length) {
        setOutfitResult({
          top: null,
          top_tip: '你还没有发布商品，先去上传几件衣服吧～',
          bottom: null,
          bottom_tip: '发布几件下装后，这里就能自动给你搭配啦。',
          accessory: null,
          accessory_tip: '配饰位先留给未来的你～',
          shoes: null,
          shoes_tip: '等你上传更多商品，这里会更完整。',
        });
        setLoading(false);
        return;
      }

      const promptInfo = inferTagsFromPrompt(prompt);

      const sortedItems = [...items]
        .map((item) => ({
          ...item,
          _score: scoreItem(item, promptInfo),
        }))
        .sort((a, b) => b._score - a._score);

      const uniqueItems = [];
      const usedIds = new Set();

      for (const item of sortedItems) {
        if (!usedIds.has(item.id)) {
          uniqueItems.push(item);
          usedIds.add(item.id);
        }
      }

      const result = {
        top: uniqueItems[0]?.id || null,
        top_tip: uniqueItems[0] ? null : getTipBySlot('上衣', prompt),
        bottom: uniqueItems[1]?.id || null,
        bottom_tip: uniqueItems[1] ? null : getTipBySlot('下装', prompt),
        accessory: uniqueItems[2]?.id || null,
        accessory_tip: uniqueItems[2] ? null : getTipBySlot('配饰', prompt),
        shoes: uniqueItems[3]?.id || null,
        shoes_tip: uniqueItems[3] ? null : getTipBySlot('鞋子', prompt),
      };

      setOutfitResult(result);
      setLoading(false);
    }, 600);
  };

  const showOutfit = !!outfitResult || items.length > 0 || loading;

  const displaySlots = OUTFIT_SLOTS.map((slot, index) => {
    const fallbackItem = items[index] || null;

    return {
      ...slot,
      item: outfitResult ? getItemById(outfitResult[slot.key]) : fallbackItem,
      tip: outfitResult?.[`${slot.key}_tip`] || null,
    };
  });

  return (
    <section className="py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-baseline gap-4 mb-8">
          <h2 className="font-display text-4xl sm:text-5xl font-black tracking-tight uppercase">
            AI 穿搭搭配
          </h2>
          <p className="text-sm text-muted-foreground font-serif italic hidden sm:block">
            告诉我你要去哪里
          </p>
        </div>

        <div className="bg-secondary/40 border border-border/50 rounded-2xl p-5 sm:p-6 mb-10">
          <p className="text-xs text-muted-foreground mb-3 tracking-wide">选择目的地氛围</p>

          <div className="flex flex-wrap gap-2 mb-4">
            {STYLE_PRESETS.map((preset) => (
              <button
                key={preset}
                onClick={() => {
                  setSelectedPreset(selectedPreset === preset ? '' : preset);
                  setCustomInput('');
                }}
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

          <div className="flex gap-2">
            <Input
              placeholder="或者直接描述你的目的地和想法..."
              value={customInput}
              onChange={(e) => {
                setCustomInput(e.target.value);
                setSelectedPreset('');
              }}
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
                <>
                  帮我搭配 <ArrowUpRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

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
        <div
          className="aspect-[3/4] cursor-pointer"
          style={{ perspective: '1000px' }}
          onClick={() => setFlipped((f) => !f)}
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
