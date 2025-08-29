NeedleCareer 设计系统总结

核心品牌色彩:
主品牌色: #c8ffd2 (Needle 绿色 - 清新薄荷绿)
主背景色: #ffffff (纯白色)
文字主色: #000000 (纯黑色)

辅助灰色系:
深灰: #7b7f80

功能色:
成功绿: #4ade80
错误红: text-red-700
背景灰: #f9fafb (bg-gray-50)

字体系统
主字体: PT Sans (400, 700 weight)
应用: 全站统一使用 ${ptSans.className}

🔘 按钮设计系统
主要按钮 (Primary)
按钮颜色: #000000 (黑色)
文字: #c8ffd2 (品牌绿)
悬停: hover:bg-gray-800
直角
内边距: px-4 py-1 / px-6 py-2

次要按钮 (Secondary)
按钮颜色: #c8ffd2 (品牌绿)
文字: #000000 (深灰)
悬停: hover:bg-gray-100
直角
内边距: px-4 py-1 / px-6 py-2

功能按钮 (Action)
按钮颜色: #c8ffd2 (品牌绿)
文字: #000000 (黑色)
悬停: hover:bg-gray-100
直角

禁用状态
50% 透明度:opacity: 0.5;
禁止光标:cursor: not-allowed
禁用交互:pointer-events: none

表单设计系统
输入框样式
背景: #c8ffd2 (品牌绿背景)
边框: border-0 (无边框)
圆角: rounded-full (胶囊形)
焦点: focus:outline-none focus:ring-2 focus:ring-black
内边距: px-4 py-2
字体: text-sm

标签样式
css颜色: text-gray-800
字重: font-medium
字体: text-sm
间距: mb-2

卡片设计系统
基础卡片
css背景: bg-white
阴影: shadow-sm
边框: border-2 (颜色: #c8ffd2)
圆角: rounded-lg
内边距: p-8
悬停: hover:opacity-80
特色卡片 (Hero Cards)
css背景: bg-white
边框: border-2 (#c8ffd2)
圆形图标背景: #c8ffd2
图标容器: w-16 h-16 / w-20 h-20





响应式断点

手机端: 默认样式
平板端: md: (768px+)
桌面端: lg: (1024px+)
布局: grid md:grid-cols-2 lg:grid-cols-3

🎭 视觉层次
标题层次

主标题: text-3xl md:text-4xl lg:text-5xl font-bold
副标题: text-2xl md:text-2xl font-semibold
卡片标题: text-xl font-bold
小标题: text-sm font-medium

间距系统

页面间距: px-6 py-16 / px-6 py-20
组件间距: space-y-2 / gap-4 / gap-8
内容最大宽度: max-w-7xl mx-auto / max-w-4xl mx-auto

🌟 特殊元素样式
分割线
css样式: border-t border-gray-400
OR 标签背景: #c8ffd2
导航悬停效果
css悬停: hover:opacity-80
过渡: transition-colors
表情符号使用

广泛使用表情符号增加友好感
如: 👋 🎯 🏢 💼 📝 等

📐 布局特点

居中对齐: 大量使用 text-center 和 mx-auto
响应式网格: grid md:grid-cols-2 等
弹性布局: flex flex-col sm:flex-row
最大宽度限制: 保持内容可读性

🎨 品牌个性

现代简约: 简洁的线条和充足的留白
友好亲切: 圆角设计和柔和的品牌绿色
专业可信: 黑白配色的经典组合
年轻活力: 表情符号和轻松的文案语调

这套设计系统确保了整个网站的视觉一致性，建议您在后续页面开发中严格遵循这些规范。