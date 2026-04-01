# APIR - APIRequest

[![Docs site](https://img.shields.io/badge/docs-GitHub_Pages-blue?style=flat-square)](https://rooyca.github.io/obsidian-api-request/)
[![Obsidian plugin release](https://img.shields.io/badge/Obsidian%20plugin%20release-purple?logo=obsidian&style=flat-square)](https://obsidian.md/plugins?id=api-request)
[![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/rooyca/obsidian-api-request?logo=github&color=ee8449&style=flat-square)](https://github.com/rooyca/obsidian-api-request/releases/latest)
<img alt="GitHub Release" src="https://img.shields.io/github/downloads/rooyca/obsidian-api-request/total?logo=github&&color=ee8449&style=flat-square">

[![Español](https://img.shields.io/badge/Español-8A2BE2)](README.es.md)
[![English](https://img.shields.io/badge/English-8A2BE2)](README.md)


这个[Obsidian](https://obsidian.md/)插件能让用户直接在笔记中进行 API 请求，并在代码块中显示响应。

## 🔒 安全性

本插件实现了全面的安全措施，包括：
- URL、路径和用户数据的输入验证
- 通过 HTML 清理防止 XSS 攻击
- 防止目录遍历攻击
- 安全的 JSONPath 表达式评估
- 安全的 localStorage 处理

## 🚀 安装

该插件可以从 Obsidian 内部安装。

### Obsidian 社区插件浏览器

- 转到 `设置` -> `社区插件`
- 确保 `受限模式` 已 **关闭**
- 点击 `浏览`
- 搜索 `APIRequest`
- 点击 `安装`，然后点击 `启用`

## 🛠️ 使用

### [阅读文档](https://rooyca.github.io/obsidian-api-request/)

## ✅ 待办事项

> 查看 [TODOS-v2.md](TODOS-v2.md) 中的所有更改

- [x] 翻译（和更新）文档
- [x] 数据重用（`{{ls.UUID>JSONPath}}` 语法，其中 `ls` 代表 `localStorage`）
- [x] 支持使用 `#` 或 `//` 语法的注释
- [x] 从响应中进行内联查询（使用 **Dataview**）
- [ ] 添加测试（!!!）
- [ ] 重新实现 `repeat` 标志（重复请求 X 次或每 X 秒）
- [x] 安全改进（输入验证、XSS 防护、目录遍历保护）
- [x] TypeScript 类型安全改进
- [x] 全面的错误处理

## 🤝 贡献

欢迎贡献！在提交 pull request 之前，请阅读我们的[贡献指南](CONTRIBUTING.md)。

### 开发

```bash
# 安装依赖
npm install

# 构建
npm run build

# 开发模式（自动重建）
npm run dev
```

有关更多详细信息，请参阅 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 🔒 安全最佳实践

使用此插件时：

1. **使用 HTTPS**：进行 API 请求时始终使用 HTTPS URL
2. **保护 API 密钥**：将 API 密钥存储在全局变量中，而不是在笔记中
3. **审查缓存数据**：定期清除旧的缓存响应
4. **验证来源**：仅连接到受信任的 API 端点


## ❤️ 赞助商

<a href="https://github.com/tlwt"><img src="https://github.com/tlwt.png" width="40px" /></a>

## ✍️ 反馈和贡献

如果您遇到任何问题或对插件有反馈，请随时在 [GitHub 仓库](https://github.com/Rooyca/obsidian-api-request)上提出问题。

也欢迎贡献！
