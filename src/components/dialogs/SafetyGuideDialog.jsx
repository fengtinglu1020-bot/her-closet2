import React from 'react';
import { X, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TIPS = [
  {
    title: '交易前确认商品信息',
    body: '主动询问商品的真实状态、尺寸、瑕疵、购买来源等，必要时要求卖家提供更多实拍照片或视频。',
  },
  {
    title: '谨慎付款',
    body: '不要因为"有人抢""马上涨价"等理由被催促付款；对异常低价、要求大额预付款或可疑收款方式保持警惕。',
  },
  {
    title: '尽量保留交易记录',
    body: '保存聊天记录、商品页面、付款凭证以及物流信息，以便发生争议时核对。',
  },
  {
    title: '线下交易注意人身安全',
    body: 'HerCloset 建议面交，并建议在白天、人流较多的公共场所进行，并提前告知朋友。',
  },
  {
    title: '保护个人信息',
    body: '不要向陌生用户提供身份证件、银行卡密码、验证码或其他与交易无关的敏感信息。',
  },
];

export default function SafetyGuideDialog({ open, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-background rounded-2xl shadow-xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
        <div className="sticky top-0 bg-background border-b border-border/50 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-foreground" />
            <h2 className="font-display text-lg font-black uppercase tracking-tight">HerCloset 交易安全指南</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-secondary transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5">
          <p className="text-sm text-muted-foreground leading-relaxed mb-5">
            HerCloset 为用户提供二手服饰信息展示、发现与交流的平台。目前，HerCloset 不提供支付、托管、物流或交易担保服务，也不代替买卖双方完成交易。
          </p>

          <p className="text-xs font-semibold text-foreground mb-3 uppercase tracking-wide">为保护自己，请注意</p>

          <div className="space-y-4">
            {TIPS.map((tip, i) => (
              <div key={i} className="flex gap-3">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-foreground text-background text-xs flex items-center justify-center font-bold mt-0.5">
                  {i + 1}
                </span>
                <div>
                  <p className="text-sm font-medium text-foreground">{tip.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{tip.body}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 p-3 bg-secondary/60 rounded-xl">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <span className="font-medium text-foreground">注意：</span>HerCloset 不会在私聊中要求你提供银行卡密码、验证码或向指定账户转账。如果发现疑似诈骗、虚假商品或其他异常行为，请停止交易并向 HerCloset 举报。
            </p>
          </div>

          <Button onClick={onClose} className="w-full mt-5 h-11 rounded-xl bg-foreground text-background hover:bg-foreground/90 font-medium">
            我已了解，开始逛逛
          </Button>
        </div>
      </div>
    </div>
  );
}
