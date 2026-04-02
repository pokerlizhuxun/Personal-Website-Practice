# Personal Website (Next.js + Bilingual + MDX)

一个用于个人简历与项目发布的双语网站模板，基于 `Next.js App Router` 构建。

## Features

- `zh/en` 双语路由（默认重定向到 `/zh`）
- 四页结构：`/{locale}`、`/{locale}/projects`、`/{locale}/about`、`/{locale}/contact`
- 项目内容使用 MDX（`content/projects/*.mdx`）
- 页面级 SEO：metadata、`sitemap.xml`、`robots.txt`
- `www` 自动重定向到裸域（`proxy.ts`）
- 适配 Vercel 部署

## Local Development

1. 安装 Node.js 20（推荐使用 `.nvmrc`）
2. 安装依赖：

```bash
npm install
```

3. 复制环境变量并填写真实信息：

```bash
cp .env.example .env.local
```

`NEXT_PUBLIC_SITE_URL` 如果暂时留空，本地会回退到 `http://localhost:3000`，部署到 Vercel 时会优先使用项目的生产域名；如果你后续绑定了自定义域名，也可以手动填成正式域名。

4. 启动开发环境：

```bash
npm run dev
```

5. 质量检查：

```bash
npm run lint
npm run build
```

## Content Management

### 项目内容（MDX）

- 目录：`content/projects/`
- 文件示例：`uav-swarm-planning.zh.mdx`、`uav-swarm-planning.en.mdx`

Frontmatter 字段：

```yaml
slug: uav-swarm-planning
locale: zh # or en
title: 项目标题
summary: 一句话概述
date: "2025-03-01"
stack:
  - Next.js
  - TypeScript
links:
  demo: https://your-demo-url
  repo: https://github.com/your/repo
featured: true
```

说明：`links.demo` 和 `links.repo` 可选，若没有公开链接可省略。

### 简历内容

- 文件：`lib/profile.ts`
- 中英文内容分别维护在 `zh` / `en` 对象中。

## Deploy to Vercel

1. 将项目推送到你的 GitHub 仓库。
2. 在 Vercel 选择该仓库创建项目（Framework: Next.js）。
3. 在 Vercel Project Settings -> Environment Variables 中设置 `.env.local` 对应变量。
4. `NEXT_PUBLIC_SITE_URL` 可以先留空使用 Vercel 自动域名；如果后续绑定自定义域名，再改成正式域名即可。
5. 在 Domains 中添加：
   - 裸域（如 `yourdomain.com`）
   - `www` 子域（如 `www.yourdomain.com`）
6. DNS 按 Vercel 指引配置完成后，`www` 会通过 `proxy.ts` 自动 301 到裸域。

## Notes

- 若你希望根路径默认英文，可将 `lib/i18n.ts` 中 `defaultLocale` 改为 `en`。
- 若需要博客模块，可在现有 MDX 方案上新增 `content/blog` 与 `/[locale]/blog` 路由。
- 当前站点默认公开邮箱，不公开手机号、出生年月、籍贯、政治面貌等隐私字段。
- 本次简历内容同步基线：`李筑勋+简历（公开）.pdf`（提取日期：2026-03-31）。
