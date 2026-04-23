import React, { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Camera, Sparkles } from 'lucide-react';
import ItemCard from '@/components/home/ItemCard';

const INSPIRATION_POSTS = {
  'sanya-diary': {
    title: '三亚海边出片日记',
    subtitle: '买法式碎花裙之后，我带它去了海边，真的很适合傍晚和风大的时候拍照。',
    image:
      'https://media.base44.com/images/public/69e9a85f2f4419a5ac4fc769/05d384165_generated_d7ed6259.png',
    location: '三亚 · 海边',
    mood: '温柔、轻盈、适合海风和日落',
    sceneTag: '海边',
    content:
      '这套衣服最让我惊喜的是，它不是那种只能在照片里好看的裙子，而是真的穿起来会让人很想去旅行的那种。海边风一吹，裙摆会动，照片出来特别轻松，不用很刻意摆动作也很好看。',
  },
  'sunset-diary': {
    title: '日落海滩拍照灵感',
    subtitle: '白色吊带裙在夕阳下会很出片，尤其适合暖色调和逆光氛围。',
    image:
      'https://media.base44.com/images/public/69e9a85f2f4419a5ac4fc769/31b9194dc_generated_2da471ec.png',
    location: '海边 · 日落',
    mood: '暖调、松弛、很适合拍剪影',
    sceneTag: '日落',
    content:
      '如果是去海边看日落，我会优先选白色或者浅色系。因为夕阳本身已经很有颜色了，衣服越简单，越容易把整个人显得很干净。拍照的时候可以多拍走路、回头、侧脸，氛围会比直直站着更自然。',
  },
  'bali-diary': {
    title: '巴厘岛度假穿搭记录',
    subtitle: '热带植物、酒店花园、度假风套装，真的很适合这种目的地。',
    image:
      'https://media.base44.com/images/public/69e9a85f2f4419a5ac4fc769/b375de800_generated_fc505c93.png',
    location: '巴厘岛 · 度假村',
    mood: '热带、松弛、有一点精致感',
    sceneTag: '度假村',
    content:
      '这种度假场景里，我觉得最重要的不是穿得多复杂，而是颜色和材质要对。只要衣服本身足够轻盈，再配一点度假感配饰，整个人就会很像在“旅行故事”里面，而不是普通游客照。',
  },
};

export default function InspirationDetail() {
  const { slug } = useParams();
  const post = INSPIRATION_POSTS[slug];

  const allItems = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('items') || '[]');
    } catch (error) {
      console.error('读取商品失败:', error);
      return [];
    }
  }, []);

  const relatedItems = useMemo(() => {
    if (!post) return [];
    return allItems.filter((item) => item.scene_tags?.includes(post.sceneTag));
  }, [allItems, post]);

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">这篇晒单不存在</p>
          <Link to="/" className="text-accent underline mt-2 inline-block">
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
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
              src={post.image}
              alt={post.title}
              className="w-full aspect-[4/5] object-cover"
            />
          </div>

          <div className="pt-2">
            <div className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground mb-4">
              买家出片
            </div>

            <h1 className="font-display text-4xl sm:text-5xl font-black tracking-tight uppercase leading-tight">
              {post.title}
            </h1>

            <p className="mt-4 text-base text-muted-foreground font-serif italic leading-relaxed">
              {post.subtitle}
            </p>

            <div className="mt-6 space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{post.location}</span>
              </div>

              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>{post.mood}</span>
              </div>

              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4" />
                <span>适合旅行拍照、氛围感出片</span>
              </div>
            </div>

            <div className="mt-8 rounded-2xl bg-secondary/50 border border-border/50 p-5">
              <p className="text-sm leading-7 text-foreground/90">
                {post.content}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="font-display text-3xl sm:text-4xl font-black tracking-tight uppercase">
                同场景推荐
              </h2>
              <p className="mt-2 text-sm text-muted-foreground font-serif italic">
                这些商品也很适合类似场景出片
              </p>
            </div>
          </div>

          {relatedItems.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              <p className="text-lg">这个场景下暂时还没有可推荐的商品</p>
              <p className="text-sm mt-2">你可以先去发布一些相关场景的衣服</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedItems.map((item, index) => (
                <ItemCard key={item.id} item={item} index={index} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
