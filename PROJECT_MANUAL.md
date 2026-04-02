# 项目说明书（Webcreate）

更新时间：2026-03-31

## 1. 项目定位

这是一个基于 Next.js App Router 的双语个人网站模板，用于：

- 个人主页展示
- 项目案例展示
- 简历与经历展示
- 联系方式展示

核心特性：

- 中英文双语路由（`/zh`、`/en`）
- 项目内容使用 MDX 管理
- 页面级 SEO（Metadata、`sitemap.xml`、`robots.txt`）
- 根路径自动跳转默认语言
- `www` 自动跳转裸域

## 2. 技术栈

- Next.js 16（App Router）
- React 19
- TypeScript
- Tailwind CSS 4
- MDX（`next-mdx-remote` + `gray-matter`）

## 3. 目录结构与职责

```text
app/                 路由与页面入口（UI 页面、SEO、全局样式）
components/          复用组件（导航壳、项目卡片、语言切换）
content/projects/    项目内容（MDX）
lib/                 业务数据与工具（i18n、site、profile、projects）
types/               类型定义
proxy.ts             语言前缀与域名跳转策略
```

关键文件：

- `app/layout.tsx`：全局布局与全站 Metadata
- `app/globals.css`：全局主题与样式变量
- `app/page.tsx`：`/` 重定向到默认语言
- `app/[locale]/layout.tsx`：语言级布局与静态参数
- `app/[locale]/page.tsx`：首页
- `app/[locale]/projects/page.tsx`：项目列表页
- `app/[locale]/projects/[slug]/page.tsx`：项目详情页
- `app/[locale]/about/page.tsx`：关于页/简历页
- `app/[locale]/contact/page.tsx`：联系页
- `app/sitemap.ts`：站点地图生成
- `app/robots.ts`：爬虫规则
- `components/site-shell.tsx`：导航、页脚、页面壳
- `components/project-card.tsx`：项目卡片样式与结构
- `components/locale-switcher.tsx`：语言切换按钮
- `lib/i18n.ts`：中英文文案字典与语言配置
- `lib/profile.ts`：简历数据（经历/教育/技能）
- `lib/projects.ts`：项目 MDX 读取与渲染
- `lib/site.ts`：站点信息与联系方式
- `content/projects/*.mdx`：项目正文与 frontmatter 元信息

## 4. 路由说明

- `/`：自动重定向到默认语言（默认是 `/zh`）
- `/{locale}`：首页（示例：`/zh`、`/en`）
- `/{locale}/projects`：项目列表
- `/{locale}/projects/{slug}`：项目详情
- `/{locale}/about`：关于/简历
- `/{locale}/contact`：联系

`locale` 目前只支持：

- `zh`
- `en`

## 5. 内容来源说明

### 5.1 文案字典（页面文案）

文件：`lib/i18n.ts`

用途：

- 导航文案
- 首页文案
- 项目页按钮文案
- About/Contact 文案
- 页脚文案

修改方式：

- 同时维护 `dictionaries.zh` 与 `dictionaries.en`

### 5.2 简历数据（About 页面）

文件：`lib/profile.ts`

用途：

- 个人简介
- 地点与目标岗位
- 经历、教育、技能

### 5.3 项目内容（Projects 页面）

目录：`content/projects/`

每个项目建议一对文件：

- `your-slug.zh.mdx`
- `your-slug.en.mdx`

最小 frontmatter 示例：

```mdx
---
slug: your-project
locale: zh
title: 项目标题
summary: 一句话概述
date: "2026-03-31"
stack:
  - Next.js
links:
  demo: https://example.com
  repo: https://github.com/you/repo
featured: true
---
```

字段说明：

- `slug`：详情页 URL 标识（需稳定）
- `locale`：`zh` 或 `en`
- `title`：项目标题
- `summary`：卡片和详情顶部简介
- `date`：用于排序和显示
- `stack`：技术标签
- `links.demo`：在线预览地址（可选）
- `links.repo`：仓库地址（可选）
- `featured`：是否进入首页精选

## 6. 如果要改界面，改哪里

### 6.1 全站视觉风格

文件：`app/globals.css`

可改内容：

- 主题色变量
- 字体变量
- 通用卡片样式（`.section-card`）
- MDX 内容排版（`.mdx-content`）

### 6.2 导航与页脚

文件：`components/site-shell.tsx`

可改内容：

- 顶部导航结构
- 页脚信息
- 背景装饰

### 6.3 首页布局与模块

文件：`app/[locale]/page.tsx`

可改内容：

- Hero 区块
- CTA 按钮
- 精选项目区块结构

### 6.4 项目卡片样式

文件：`components/project-card.tsx`

可改内容：

- 卡片布局
- 标签样式
- 按钮/链接样式

### 6.5 项目详情样式

文件：`app/[locale]/projects/[slug]/page.tsx`

可改内容：

- 详情页头部
- 技术栈标签展示
- MDX 内容容器

## 7. 如果要改内容，改哪里

- 改导航/按钮/页面文案：`lib/i18n.ts`
- 改 About 简历内容：`lib/profile.ts`
- 改项目内容：`content/projects/*.mdx`
- 改联系方式与站点信息：`.env.local`（参考 `.env.example`）

常用环境变量：

- `NEXT_PUBLIC_OWNER_NAME`
- `NEXT_PUBLIC_OWNER_TITLE_ZH`
- `NEXT_PUBLIC_OWNER_TITLE_EN`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_CONTACT_EMAIL`
- `NEXT_PUBLIC_GITHUB_URL`
- `NEXT_PUBLIC_LINKEDIN_URL`

## 8. SEO 与访问策略

### 8.1 页面 SEO

主要通过以下文件维护：

- `app/layout.tsx`：全站级 metadata
- 各页面 `generateMetadata`：页面级标题与描述

### 8.2 sitemap 与 robots

- `app/sitemap.ts`：生成静态页面和项目详情页链接
- `app/robots.ts`：声明爬虫规则与 sitemap 地址

### 8.3 域名与语言前缀跳转

文件：`proxy.ts`

策略：

- `www.xxx.com` -> `xxx.com`（301）
- 无语言前缀路径 -> 自动补默认语言（307）

## 9. 本地开发与发布

### 9.1 本地开发

```bash
npm install
cp .env.example .env.local
npm run dev
```

### 9.2 质量检查

```bash
npm run lint
npm run build
```

### 9.3 发布建议

- 推送到 GitHub
- 接入 Vercel
- 配置环境变量
- 绑定裸域与 `www` 域名

## 10. 常用操作清单

### 新增一个双语项目

1. 在 `content/projects/` 新建 `xxx.zh.mdx` 与 `xxx.en.mdx`
2. 填写 frontmatter 与正文
3. 确认 `slug` 在中英文文件一致
4. 运行 `npm run build` 验证

### 下线首页精选但保留项目详情

1. 找到对应 MDX 文件
2. 把 `featured` 改为 `false`
3. 重新构建并发布

### 修改默认语言

1. 打开 `lib/i18n.ts`
2. 修改 `defaultLocale` 为 `zh` 或 `en`
3. 本地验证 `/` 跳转是否符合预期

