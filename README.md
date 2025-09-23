# 青龙面板脚本集合

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node.js-%3E%3D12.0.0-brightgreen.svg)](https://nodejs.org/)
[![青龙面板](https://img.shields.io/badge/青龙面板-2.8%2B-orange.svg)](https://github.com/whyour/qinglong)

> 🚀 专为青龙面板开发的自动化脚本集合，支持多种平台的自动签到和任务执行

## 📋 项目简介

本项目是一个专门为青龙面板开发的脚本集合，提供各种平台的自动化签到和任务执行功能。所有脚本都经过充分测试，支持多账号批量操作、智能重试机制和完善的通知推送。

## 🎯 支持平台

| 平台 | 脚本文件 | 功能描述 | 状态 |
|------|----------|----------|------|
| YBT | `script-docs/ybt_sign/ybt_sign.js` | YBT自动签到，支持多账号 | ✅ 稳定运行 |

## 🚀 快速开始

### 环境要求

- 青龙面板 2.8+
- Node.js 12.0.0+
- 网络连接正常

### 安装步骤

1. **克隆项目到青龙面板**
   ```bash
   # 方法一：使用青龙面板订阅功能
   # 在青龙面板 -> 订阅管理 -> 新建订阅
   # 名称: qinglong-scripts
   # 类型: 公开仓库
   # 链接: https://github.com/fuguang88/qinglong-scripts.git
   # 定时类型: crontab
   # 定时规则: 0 0 * * *
   
   # 方法二：手动下载
   # 下载项目文件并上传到青龙面板的脚本目录
   ```

2. **安装依赖**
   ```bash
   # 进入青龙容器
   docker exec -it qinglong bash
   
   # 安装必要依赖
   npm install axios
   ```

3. **配置环境变量**
   
   在青龙面板 `环境变量` 中添加相应的配置，具体配置请参考各脚本的说明文档。

4. **添加定时任务**
   
   在青龙面板 `定时任务` 中添加相应的任务，具体配置请参考各脚本的说明文档。

## 📁 项目结构

```
qinglong-scripts/
├── README.md                 # 项目说明文档
├── sendNotify.js            # 通知推送模块
├── notify.py                # Python通知推送模块
└── script-docs/             # 脚本文档目录
    └── ybt_sign/            # YBT相关脚本
        ├── YBT 签到脚本说明.md  # YBT脚本详细说明
        └── ybt_sign.js      # YBT自动签到脚本
```

## 🔧 脚本特性

### 🎯 核心功能
- ✅ **多账号支持** - 支持批量处理多个账号
- 🔄 **智能重试** - 网络异常时自动重试
- 📝 **详细日志** - 完整的执行日志记录
- 🔔 **通知推送** - 支持多种通知方式
- ⚙️ **灵活配置** - 支持自定义配置参数

### 🛡️ 安全特性
- 🔒 **环境变量存储** - 敏感信息安全存储
- 🚫 **错误处理** - 完善的异常处理机制
- ⏱️ **超时控制** - 防止请求长时间挂起
- 📊 **状态监控** - 实时监控脚本执行状态

## 📖 使用指南

### 基本使用流程

1. **选择需要的脚本** - 查看支持平台列表
2. **阅读脚本文档** - 每个脚本都有详细的README
3. **配置环境变量** - 按照文档配置必要的环境变量
4. **安装脚本依赖** - 安装脚本所需的Node.js依赖
5. **添加定时任务** - 在青龙面板中添加定时任务
6. **测试运行** - 手动执行一次确保配置正确
7. **查看日志** - 通过日志监控脚本执行情况

### 通用环境变量

大部分脚本都支持以下通用配置：

```bash
# 通知推送相关（可选）
PUSH_KEY=your_push_key          # Server酱推送Key
TG_BOT_TOKEN=your_bot_token     # Telegram Bot Token
TG_USER_ID=your_user_id         # Telegram User ID
```

## 🔔 通知支持

所有脚本都支持青龙面板内置的通知方式：

- 📱 **Telegram Bot** - 即时消息推送
- 💬 **微信推送** - 企业微信/微信测试号
- 📧 **邮件通知** - SMTP邮件推送
- 🤖 **钉钉机器人** - 钉钉群机器人
- 📢 **Server酱** - 微信公众号推送
- 🔔 **Bark推送** - iOS Bark应用
- ➕ **PushPlus** - 微信公众号推送
- 🏢 **企业微信** - 企业微信应用推送
- 🕊️ **飞书通知** - 飞书机器人推送

## 🐛 故障排除

### 常见问题

1. **脚本执行失败**
   - 检查Node.js依赖是否安装完整
   - 确认环境变量配置正确
   - 查看详细错误日志

2. **网络请求超时**
   - 检查服务器网络连接
   - 适当增加超时时间配置
   - 确认目标网站可正常访问

3. **通知推送失败**
   - 检查通知配置是否正确
   - 确认推送服务可正常使用
   - 查看通知发送日志

### 日志查看

1. 在青龙面板 `定时任务` 页面
2. 找到对应的任务
3. 点击 `日志` 查看执行记录

### 获取帮助

- 📖 查看各脚本的详细README文档
- 🔍 搜索已知问题和解决方案
- 💬 在Issues中提交问题反馈

## 🤝 贡献指南

欢迎贡献新的脚本或改进现有脚本！

### 贡献流程

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

### 脚本开发规范

- 📝 **完整文档** - 每个脚本都需要详细的README
- 🧪 **充分测试** - 确保脚本在各种情况下都能正常工作
- 🔒 **安全考虑** - 不在代码中硬编码敏感信息
- 📊 **日志记录** - 提供详细的执行日志
- 🔔 **通知支持** - 支持青龙面板的通知功能

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## ⚠️ 免责声明

- 本项目仅供学习和研究使用
- 使用者需遵守相关平台的服务条款
- 因使用本脚本产生的任何问题，开发者不承担责任
- 请合理使用，避免对目标服务器造成压力

## 📞 联系方式

- 项目地址: [GitHub Repository](https://github.com/fuguang88/qinglong-scripts)
- 问题反馈: [Issues](https://github.com/fuguang88/qinglong-scripts/issues)

---

<div align="center">

**⭐ 如果这个项目对你有帮助，请给个Star支持一下！**

Made with ❤️ by CodeBuddy

</div>