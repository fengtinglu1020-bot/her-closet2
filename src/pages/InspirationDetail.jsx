import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ItemCard from '@/components/home/ItemCard';
import { Button } from '@/components/ui/button';

const INSPIRATION_CONFIG = {
  sanya: {
    title: '三亚海边穿搭分享',
    subtitle: '适合海边拍照、度假和轻松出片的单品',
    scene: '海边',
  },
  sunset: {
    title: '日落海滩拍照日记',
    subtitle: '适合夕阳、暖色氛围和海滩场景的穿搭',
    scene: '日落',
  },
  bali: {
    title: '巴厘岛度假穿搭日记',
    subtitle: '适合热带度假、酒店和花园场景的搭配',
    scene: '度假村',
  },
};

const CATEGORIES = ['全部', '裙子', '上衣', '下装', '鞋子', '配饰'];

function inferCategory(item) {
  const text = `${item.name || ''} ${(item.style_tags || []).join(' ')}`
    .toLowerCase();

  if (
    text.includes('裙') ||
    text.includes('dress')
  ) {
    return '裙子';
  }

  if (
    text.includes('上衣') ||
    text.includes('衬衫') ||
    text.includes('吊带') ||
    text.includes('背心') ||
    text.includes('t恤') ||
    text.includes('毛衣') ||
    text.includes('top')
  ) {
    return '上衣';
  }

  if (
    text.includes('裤') ||
    text.includes('半裙') ||
    text.includes('短裤') ||
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

export default function InspirationDetail() {
  const { slug } = useParams();
  const [activeCategory, setActiveCategory] = useState('全部');

  const config = INSPIRATION_CONFIG[slug];

  const allItems = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('items') || '[]');
    } catch (error) {
      console.error('读取商品失败:', error);
      return [];
    }
  }, []);

  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">专题不存在</p>
          <Link to="/" className="text-accent underline mt-2 inline-block">
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  const sceneItems = allItems.filter((item) =>
    item.scene_tags?.includes(config.scene)
  );

  const filteredItems =
    activeCategory === '全部'
      ? sceneItems
      : sceneItems.filter((item) => inferCategory(item) === activeCategory);

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

        <div className="mb-8">
          <h1 className="font-display text-4xl sm:text-5xl font-black tracking-tight uppercase">
            {config.title}
          </h1>
          <p className="mt-3 text-sm text-muted-foreground font-serif italic">
            {config.subtitle}
          </p>
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
            <p className="text-lg">这个专题下暂时还没有商品</p>
            <p className="text-sm mt-2">先去发布一些相关场景的衣服吧</p>
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
  );
}
