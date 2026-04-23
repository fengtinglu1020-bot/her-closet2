import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-border/50 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <h3 className="font-display text-2xl font-black text-foreground mb-3 uppercase tracking-tight">HerCloset</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              二手旅行穿搭平台
              <br />
              让每件衣服都有更多故事
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">浏览</h4>
            <ul className="space-y-2">
              {['全部商品', '海边穿搭', '城市街拍', '山野度假'].map((item) => (
                <li key={item}>
                  <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">关于</h4>
            <ul className="space-y-2">
              {['关于我们', '用户协议', '隐私政策', '帮助中心'].map((item) => (
                <li key={item}>
                  <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">联系</h4>
            <ul className="space-y-2">
              {['微信公众号', '小红书', '微博'].map((item) => (
                <li key={item}>
                  <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-border/50 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-muted-foreground">
            © 2026 HerCloset. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Made with ♡ for travelers
          </p>
        </div>
      </div>
    </footer>
  );
}
