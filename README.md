# privacy-policy

4freedom 旗下应用的法律文档站点，托管于 GitHub Pages。

- 目录页：<https://kubmanong.github.io/privacy-policy/>
- 捷待办隐私政策：<https://kubmanong.github.io/privacy-policy/quicktodo/privacy.html>

## 目录结构

```
privacy-policy/
├── index.html              政策目录页（列出所有产品）
├── <产品名>/
│   └── privacy.html        该产品的隐私政策（以后可加 terms.html 等）
└── assets/                 所有产品页共享的样式 / 字体 / 脚本 / 图标
    ├── css/style.css
    ├── fonts/              Smiley Sans 子集化产物，勿手改
    ├── img/
    └── js/main.js
```

纯静态、无构建步骤，仓库根目录即站点根目录；`.nojekyll` 已关闭 Jekyll 处理。

## 新增一款产品的政策页

1. 新建 `<产品名>/` 目录（小写连字符），把 `quicktodo/privacy.html` 复制为 `<产品名>/privacy.html`。
2. 逐段替换：title / description / canonical / og:url（路径换成新目录名）、正文、`doc-meta` 中的「适用产品」。
3. 在根目录 `index.html` 的 `product-grid` 中复制一张产品卡，改图标、名称、简介和链接。
4. 提交并推送到 `main`，GitHub Pages 会自动重新部署（约 1 分钟生效）。

## 部署方式

GitHub Pages 部署源：`main` 分支根目录（`/`）。本地改动后：

```bash
git add -A
git commit -m "新增：……"
git push
```
