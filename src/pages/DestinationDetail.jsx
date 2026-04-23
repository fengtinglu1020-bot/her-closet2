import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Sun, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ItemCard from '@/components/home/ItemCard';

const DESTINATION_CONFIG = {
  sanya: {
    title: '三亚 · 海边',
    subtitle: '适合海边度假、轻盈感和夏日出片的单品',
    mood: '轻盈、清爽、适合海风和阳光',
    sceneTags: ['海边'],
    styleTags: ['法式', '甜美', '休闲'],
    seasonTags: ['夏'],
    heroImage:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80',
  },
  dali: {
    title: '大理 · 日落',
    subtitle: '适合暖色夕阳、松弛感和安静氛围的穿搭',
    mood: '松弛、温柔、适合拍逆光和晚霞',
    sceneTags: ['日落'],
    styleTags: ['复古', '法式', '休闲'],
    seasonTags: ['春', '夏', '秋'],
    heroImage:
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1400&q=80',
  },
  bali: {
    title: '巴厘岛 · 度假',
    subtitle: '适合热带度假村、酒店泳池和精致松弛感',
    mood: '热带、度假、有一点精致感',
    sceneTags: ['度假村', '海边'],
    styleTags: ['Boho', '法式', '甜美'],
    seasonTags: ['夏'],
    heroImage:
      'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&w=1400&q=80',
  },
  xiamen: {
    title: '厦门 · 文艺',
    subtitle: '适合街区散步、咖啡店拍照和文艺氛围的穿搭',
    mood: '文艺、轻松、适合街拍和散步',
    sceneTags: ['文艺街区', '城市街拍'],
    styleTags: ['复古', '法式', '休闲'],
    seasonTags: ['春', '秋'],
    heroImage:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80',
  },
};

const CATEGORIES = ['全部', '裙子', '上衣', '下装', '鞋子', '配饰'];

function inferCategory(item) {
  const text = `${item.name || ''} ${(item.style_tags || []).join(' ')}`
    .toLowerCase();

  if (text.includes('裙') || text.includes('dress')) return '裙子';
  if (
    text.includes('上衣') ||
    text.includes('吊带') ||
    text.includes('衬衫') ||
    text.includes('背心') ||
    text.includes('t恤') ||
    text.includes('毛衣') ||
    text.includes('top')
  ) {
    return '上衣';
  }
  if (
    text.includes('裤') ||
    text.includes('短裤') ||
    text.includes('半裙') ||
    text.includes('牛仔裤') ||
    text.includes('下装')
  ) {
    return '下装';
  }
  if (
    text.includes('鞋') ||
    text.includes('凉鞋') ||
    text.includes('高跟') ||
    text.includes('靴')
  ) {
    return '鞋子';
  }
  if (
    text.includes('包') ||
    text.includes('耳环') ||
    text.includes('项链') ||
    text.includes('帽') ||
    text.includes('墨镜') ||
    text.includes('配饰')
  ) {
    return '配饰';
  }

  return '全部';
}

export default function DestinationDetail() {
  const { slug } = useParams();
  const [activeCategory, setActiveCategory] = useState('全部');
  const config = DESTINATION_CONFIG[slug];

  const allItems = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('items') || '[]');
    } catch (error) {
      console.error('读取商品失败:', error);
      return [];
    }
  }, []);

  const recommendedItems = useMemo(() => {
    if (!config) return [];

    const scored = allItems.map((item) => {
      let score = 0;

      config.sceneTags.forEach((tag) => {
        if (item.scene_tags?.includes(tag)) score += 4;
      });

      config.styleTags.forEach((tag) => {
        if (item.style_tags?.includes(tag)) score += 3;
      });

      config.seasonTags.forEach((tag) => {
        if (item.season_tags?.includes(tag)) score += 2;
      });

      if (item.outfit_urls?.length) score += 1;
      if (item.photo_urls?.length) score += 1;

      return { ...item, _score: score };
    });

    return scored
      .filter((item) => item._score > 0)
      .sort((a, b) => b._score - a._score);
  }, [allItems, config]);

  const filteredItems = useMemo(() => {
    if (activeCategory === '全部') return recommendedItems;
    return recommendedItems.filter(
      (item) => inferCategory(item) === activeCategory
    );
  }, [recommendedItems, activeCategory]);

  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">目的地不存在</p>
          <Link to="/" className="text-accent underline mt-2 inline-block">
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          返回首页
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          <div className="rounded-3xl overflow-hidden bg-secondary">
            <img
              src={config.heroImage}
              alt={config.title}
              className="w-full aspect-[4/5] object-cover"
            />
          </div>

          <div className="pt-2">
            <div className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground mb-4">
              智能推荐目的地
            </div>

            <h1 className="font-display text-4xl sm:text-5xl font-black tracking-tight uppercase leading-tight">
              {config.title}
            </h1>

            <p className="mt-4 text-base text-muted-foreground font-serif italic leading-relaxed">
              {config.subtitle}
            </p>

            <div className="mt-6 space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{config.title}</span>
              </div>

              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>{config.mood}</span>
              </div>

              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4" />
                <span>推荐场景：{config.sceneTags.join(' / ')}</span>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              {config.styleTags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full bg-secondary text-sm"
                >
                  {tag}
                </span>
              ))}
              {config.seasonTags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full bg-secondary text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="font-display text-3xl sm:text-4xl font-black tracking-tight uppercase">
                适合这个目的地的推荐
              </h2>
              <p className="mt-2 text-sm text-muted-foreground font-serif italic">
                已根据场景、风格和季节为你筛选
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            {CATEGORIES.map((category) => (
              <Button
                key={category}
                type="button"
                variant={activeCategory === category ? 'default' : 'outline'}
                onClick={() => setActiveCategory(category)}
                className="rounded-full"
              >
                {category}
              </Button>
            ))}
          </div>

          {filteredItems.length === 0 ? (
            <div className="py-20 text-center text-muted-foreground">
              <p className="text-lg">这个目的地下暂时还没有合适的商品</p>
              <p className="text-sm mt-2">你可以先发布一些相关场景的衣服</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {filteredItems.map((item, index) => (
                <ItemCard key={item.id} item={item} index={index} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
