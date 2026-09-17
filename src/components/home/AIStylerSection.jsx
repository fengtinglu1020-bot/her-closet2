import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Loader2, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';

const STYLE_PRESETS = ['海边日落感', '城市复古风', '山野清冷感', '法式慵懒度假', '甜美花园风'];

const OUTFIT_SLOTS = [
  { label: '上衣', categories: ['上衣'] },
  { label: '下装 / 连衣裙', categories: ['下装', '连衣裙'] },
  { label: '配饰', categories: ['配饰', '包包'] },
  { label: '鞋子', categories: ['鞋子'] },
  { label: '其他单品', categories: ['其他', '外套'] },
];

const KEYWORD_MAP = {
  海边日落感: { styles: ['海边', '度假', 'Boho'], scenes: ['海边', '日落', '度假村'] },
  城市复古风: { styles: ['复古', 'Y2K', '港风'], scenes: ['城市街拍', '文艺街区'] },
  山野清冷感: { styles: ['山野', '清冷', '复古'], scenes: ['山野'] },
  法式慵懒度假: { styles: ['法式', '慵懒', 'Old Money'], scenes: ['度假村', '文艺街区'] },
  甜美花园风: { styles: ['甜美', '温柔', '花园'], scenes: ['城市街拍'] },
};

function inferKeywords(prompt) {
  const text = prompt.toLowerCase();
  const styles = [];
  const scenes = [];

  if (text.match(/海|沙滩|度假|海岛/)) scenes.push('海边');
  if (text.match(/山|森林|自然|清冷/)) scenes.push('山野');
  if (text.match(/城市|街拍|都市/)) scenes.push('城市街拍');
  if (text.match(/法式|慵懒/)) styles.push('法式');
  if (text.match(/复古|港风/)) styles.push('复古');
  if (text.match(/甜美|温柔|少女/)) styles.push('甜美');
  if (text.match(/y2k|辣妹|千禧/)) styles.push('Y2K');
  if (text.match(/boho|波西米亚/)) styles.push('Boho');

  return { styles, scenes };
}

function scoreItem(item, styles, scenes) {
  let score = 0;
  const st = item.style_tags || [];
  const sc = item.scene_tags || [];
  styles.forEach(s => { if (st.some(t => t.includes(s) || s.includes(t))) score += 3; });
  scenes.forEach(s => { if (sc.some(t => t.includes(s) || s.includes(t))) score += 3; });
  if (item.outfit_urls?.length) score += 1;
  if (item.photo_urls?.length) score += 1;
  return score;
}

export default function AIStylerSection() {
  const [selectedPreset, setSelectedPreset] = useState('');
  const [customInput, setCustomInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const handleGenerate = async () => {
    const prompt = selectedPreset || customInput;
    if (!prompt) return;

    setLoading(true);
    setResults(null);

    let styles = [];
    let scenes = [];

    if (KEYWORD_MAP[prompt]) {
      styles = KEYWORD_MAP[prompt].styles;
      scenes = KEYWORD_MAP[prompt].scenes;
    } else {
      ({ styles, scenes } = inferKeywords(prompt));
    }

    const { data } = await supabase
      .from('items')
      .select('id, name, price, photo_urls, outfit_urls, style_tags, scene_tags, category')
      .limit(200);

    const scored = (data || [])
      .map(item => ({ ...item, _score: scoreItem(item, styles, scenes) }))
      .sort((a, b) => b._score - a._score || Math.random() - 0.5);

    // Pick best match per slot category
    const usedIds = new Set();
    const slotResults = OUTFIT_SLOTS.map(slot => {
      const match = scored.find(item =>
        !usedIds.has(item.id) && slot.categories.includes(item.category)
      ) || null;
      if (match) usedIds.add(match.id);
      return { ...slot, item: match };
    });

    setResults(slotResults);
    setLoading(false);
  };

  return (
    <section id="ai-section" className="py-16 sm:py-20 scroll-mt-0">
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
              onChange={(e) => { setCustomInput(e.target.value); setSelectedPreset(''); }}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              className="flex-1 h-12 rounded-xl bg-background border-border/60 px-4 text-sm"
            />
            <button
              onClick={handleGenerate}
              disabled={loading || (!selectedPreset && !customInput)}
              className="h-12 px-6 rounded-xl bg-foreground text-background text-sm font-medium flex items-center gap-1.5 hover:bg-foreground/90 transition-colors disabled:opacity-40"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>帮我搭配 <ArrowUpRight className="w-4 h-4" /></>}
            </button>
          </div>
        </div>

        {(loading || results !== null) && (
          <div>
            <h3 className="font-display text-2xl font-black tracking-tight mb-6 uppercase">
              为你推荐的搭配单品
            </h3>

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-[3/4] rounded-2xl bg-secondary" />
                    <div className="mt-3 h-3 rounded bg-secondary w-1/2" />
                    <div className="mt-2 h-4 rounded bg-secondary w-3/4" />
                  </div>
                ))}
              </div>
            ) : results.every(s => !s.item) ? (
              <p className="text-sm text-muted-foreground">平台商品还在增长中，先去<Link to="/search" className="underline">逛逛全部单品</Link>吧～</p>
            ) : (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-2 sm:grid-cols-5 gap-4"
                >
                  {results.map((slot, i) => {
                    const { item, label } = slot;
                    const img = item?.photo_urls?.[0] || item?.outfit_urls?.[0];
                    if (!item) {
                      return (
                        <div key={i} className="opacity-40">
                          <div className="aspect-[3/4] rounded-2xl bg-secondary/60 border border-dashed border-border flex flex-col items-center justify-center text-center px-4">
                            <p className="text-xs text-muted-foreground">{label}</p>
                            <p className="text-sm text-muted-foreground mt-1">暂无商品</p>
                          </div>
                          <div className="mt-3 h-10" />
                        </div>
                      );
                    }
                    return (
                      <Link key={item.id} to={`/item/${item.id}`} className="group block">
                        <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-secondary">
                          {img ? (
                            <img src={img} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">暂无图片</div>
                          )}
                        </div>
                        <div className="mt-3 px-0.5">
                          <p className="text-xs text-muted-foreground">{label}</p>
                          <p className="text-sm font-medium text-foreground mt-0.5 truncate">{item.name}</p>
                          <p className="text-sm font-display font-bold text-accent mt-0.5">¥{item.price}</p>
                        </div>
                      </Link>
                    );
                  })}
                </motion.div>
                {results.some(s => !s.item) && (
                  <p className="mt-4 text-xs text-muted-foreground">部分品类暂无商品，随着平台成长会越来越完整～</p>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
