# BLACKPINK Fan Page

一个 BLACKPINK 粉丝主页，单页应用，包含视频 Hero、成员画廊、巡演、专辑、品牌合作等板块。

## 文件结构

```
.
├── index.html     主页面
├── style.css      所有样式（响应式）
├── script.js      交互逻辑（滚动动画 / i18n / 播放器）
├── video.mp4      首屏背景视频
├── .nojekyll      告知 GitHub Pages 跳过 Jekyll
└── README.md
```

## 本地预览

任意一种方式：

```bash
# Python（系统自带）
python3 -m http.server 8080

# Node
npx serve .
```

然后浏览器访问 `http://localhost:8080`。

> 直接双击 `index.html` 视频可能无法播放，必须用本地服务器。

## 部署到 GitHub Pages

1. 新建一个英文名仓库，例如 `blackpink-fan-page`
2. 把本目录内所有文件（含 `.nojekyll`）推送到仓库
3. 在仓库 Settings → Pages → Source 选择 `main` 分支 `/ (root)`
4. 等几分钟后访问 `https://<你的用户名>.github.io/blackpink-fan-page/`

## 国内外访问兼容性

- **字体**：使用 `fonts.loli.net` 国内镜像，自动回退到 Google Fonts
- **图片**：使用 Wikimedia Commons 公开图片
- **YouTube 播放器**：国内被墙时自动降级，音乐按钮禁用，其他功能不受影响

## 语言切换

右上角 `한국어` 按钮循环切换：한국어 → English → 中文 → 日本語

## 主要板块

| 板块 | 描述 |
|------|------|
| Hero | 全屏视频背景 + BLACKPINK 标题 |
| About | 四位成员介绍 |
| Tour | DEADLINE 世界巡演日程 |
| Gallery | 成员高清写真 |
| Discography | 专辑历程 |
| Stats | 数据成就 |
| Top Hits | 10 首热门曲目 |
| Partners | 品牌合作 |
| BLINK | 粉丝社区 |

---

*Unofficial fan project. All trademarks and copyrights belong to their respective owners.*
