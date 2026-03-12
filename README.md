# web-admin (Vue)

管理员页面，基于 Vue3 + Vite。

## 功能

1. 左侧菜单后台布局
2. `模型API配置` 页面
3. `生成C代码` 页面

## 启动

```bash
npm install
npm run dev
```

默认地址：`http://localhost:18081`

## API 地址

- `npm run dev` 默认读取 `.env.development` 中的 `VITE_API_BASE`
- `npm run build` 默认读取 `.env.production` 中的 `VITE_API_BASE`
- 如果浏览器里设置了 `localStorage.admin_api_base`，会优先使用这个值，便于临时联调
