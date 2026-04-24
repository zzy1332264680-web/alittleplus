import { Post, Product, Contact } from './types';

export const MOCK_POSTS: Post[] = [
  {
    id: '1',
    title: '深入解析 Q3 财报：科技巨头的结构性转型与市场流动性重估',
    excerpt: '在经历了连续三个季度的波动后，全球主要科技公司的第三季度财报终于揭示了一个清晰的信号...',
    content: '在经历了连续三个季度的波动后，全球主要科技公司的第三季度财报终于揭示了一个清晰的信号：单纯依靠用户增长驱动估值的时代已经结束，市场正转向对资本效率和利润率的严苛审视。本周公布的几组核心数据，不仅打破了此前的市场共识，更为第四季度的资产配置指明了新的方向。\n\n首先，我们需要关注的是核心业务的营运利润率（Operating Margin）。通过对比前十名市值公司的自由现金流转化率，我们可以发现一个有趣的"剪刀差"现象：那些在基础设施（尤其是 AI 算力）上投入最大的公司，其短期利润率受到了明显挤压，但前瞻指引（Forward Guidance）却显示出远超同行的信心。\n\n"流动性并非消失了，而是被重新分配到了那些具备真正定价权和基础设施垄断力的资产中。这是一个典型的\'强者恒强\'周期。"\n\n从技术面上看，纳斯达克 100 指数在关键阻力位附近形成了典型的盘整形态。我们利用量价分布图（Volume Profile）可以清晰地看到，筹码正在向高价值区间密集转移。这意味着，短期的波动更多是机构资金调仓换股的结果，而非系统性风险的体现。',
    author: 'Alex Chen',
    authorHandle: '@alexc_macro',
    authorAvatar: 'https://picsum.photos/seed/alex/100/100',
    date: '2023年10月24日 09:30',
    readTime: '10 分钟阅读',
    category: '技术分析',
    likes: 342,
    comments: 28,
    views: '12.5k'
  },
  {
    id: '2',
    title: 'Analyzing the Q3 Tech Sector Rotation',
    excerpt: 'The recent shifts in capital allocation suggest a broader market restructuring...',
    content: 'Longer content here...',
    author: 'Sarah Jenkins',
    authorHandle: '@sarah_j',
    authorAvatar: 'https://picsum.photos/seed/sarah/100/100',
    date: '2h ago',
    readTime: '5 min read',
    category: 'Macro',
    likes: 245,
    comments: 42,
    views: '8.2k'
  }
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Leica M6 经典旁轴胶片相机 (银色)',
    price: '24,500',
    originalPrice: '28,000',
    description: '个人自用闲置，成色极佳，可以说是99新。无磕碰，无掉漆，取景器明亮无灰，黄斑对焦清晰准确。快门各档位精准，过片顺滑。',
    location: '上海市',
    time: '2小时前发布',
    condition: '99新',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=600',
    seller: {
      name: 'LensCrafter_99',
      avatar: 'https://picsum.photos/seed/lens/100/100',
      rating: '5.0 信用极好',
      sales: 12
    }
  },
  {
    id: '2',
    name: 'Sony FE 85mm f/1.4 GM Lens',
    price: '1,250',
    originalPrice: '1,600',
    description: 'Mint condition portrait lens.',
    location: 'San Francisco, CA',
    time: '2d ago',
    condition: 'Mint',
    image: 'https://images.unsplash.com/photo-1495707902641-75cac588d2e9?auto=format&fit=crop&q=80&w=600',
    seller: {
      name: 'OpticsGuru',
      avatar: 'https://picsum.photos/seed/optics/100/100',
      rating: '4.9 Great',
      sales: 45
    }
  }
];

export const MOCK_CONTACTS: Contact[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    avatar: 'https://picsum.photos/seed/sarahc/100/100',
    lastMessage: 'The Q3 models are looking solid...',
    lastTime: '10:42 AM',
    unread: 3,
    status: 'online'
  },
  {
    id: '2',
    name: 'Marcus Reynolds',
    avatar: 'https://picsum.photos/seed/marcus/100/100',
    lastMessage: 'Let\'s review the alpha decay...',
    lastTime: 'Yesterday',
    unread: 0,
    status: 'offline'
  }
];
