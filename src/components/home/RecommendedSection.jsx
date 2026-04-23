import React, { useEffect, useState } from 'react'
import ItemCard from './ItemCard'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'

export default function RecommendedSection() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  const loadItems = () => {
    try {
      const savedItems = JSON.parse(localStorage.getItem('items') || '[]')
      setItems(savedItems)
    } catch (err) {
      console.error('读取数据失败', err)
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadItems()
  }, [])

  return (
    <section className="py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="font-display text-4xl sm:text-5xl font-black tracking-tight uppercase">
              为你推荐
            </h2>
            <p className="mt-2 text-sm text-muted-foreground font-serif italic">
              每件都附直拍图 + 出片图
            </p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={loadItems}
            className="text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className="w-4 h-4 mr-1.5" />
            刷新
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] rounded-2xl bg-secondary" />
                <div className="mt-3 h-4 rounded bg-secondary w-3/4" />
                <div className="mt-2 h-4 rounded bg-secondary w-1/3" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg">暂无商品</p>
            <p className="text-sm mt-1">快来发布你的第一件闲置吧</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {items.map((item, i) => (
              <ItemCard key={item.id} item={item} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
