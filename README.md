# 🖼️ 万象云影 - 基于通义万象的智能协作云相册系统

[![SpringBoot](https://img.shields.io/badge/SpringBoot-2.7.12-brightgreen)](https://spring.io/projects/spring-boot)
[![MyBatisPlus](https://img.shields.io/badge/MyBatisPlus-3.5.3.1-blue)](https://baomidou.com/)
[![通义万象](https://img.shields.io/badge/通义万象-API-9cf)](https://wanxiang.aliyun.com/)

> 本项目由[程序员鱼皮](https://github.com/liyupi)的[云图库项目](https://github.com/liyupi/yu-picture)改造而来，在原有基础上进行了重构和功能扩展。感谢鱼皮老师的开源贡献！

## 🌟 核心特性

### 👥 用户模块

- 注册/登录/登出
- 用户管理

### 🖼️ 图片模块

- 双模式上传（本地文件/URL直传）
- 图片编辑
- 图片分类
- 图片搜索
- 图片管理、审核
- **通义万象AI集成**：
  - 等比例扩图
  - ......

### 🏢 空间模块

- 空间创建
- 成员管理
- 空间管理
- 空间分析
- 团队协作

### ⚡ 项目特点

- 多级缓存策略：Caffeine本地缓存+Redis分布式缓存

- 多种设计模式的运用
- AI 绘图大模型接入
- WebSocket 双向通信

## 🛠️ 技术架构

#### 后端

| 层级       | 技术组件                                            |
| ---------- | --------------------------------------------------- |
| **接入层** | Spring Boot 2.7.6 / Knife4j 4.4.0 / Sa-Token /Jsoup |
| **服务层** | MyBatis Plus 3.5.3.1 / Hutool 5.8.21                |
| **存储层** | MySQL 8.0 / Redis 6.2 /  Caffeine/ 腾讯云COS        |
| **AI层**   | 通义万象大模型API                                   |
| **运维层** | Docker  / 1Panal                                    |

#### 前端

| 类别         | 技术组件                                                |
| :----------- | ------------------------------------------------------- |
| **框架**     | Vue 3                                                   |
| **打包工具** | Vite                                                    |
| **UI库**     | Ant Design Vue                                          |
| **请求库**   | Axios                                                   |
| **状态管理** | Pinia                                                   |
| **图片编辑** | [vue-cropper](https://github.com/xyxiao001/vue-cropper) |
| **代码生成** | OpenAPI                                                 |

## 🚀 快速启动

### 运行环境

#### 后端：

- JDK 11+ | Maven 3.8+ | MySQL 8.0+ | Redis 6.2+

#### 前端

- Node.js 18+ | npm 10+

### 项目启动

#### **后端：**

1. 编写配置文件：编辑`application.yml`中的mysql 、Redis 、腾讯云COS、阿里云apiKey等配置为自己的账号或tocken

2. 初始化数据库：运行`create_table.sql`，创建项目所需的库表

3. 运行`Application.class`启动项目

4. 访问接口文档：打开浏览器，访问 `http://localhost:8123/api/doc.html` 查看接口文档。

#### **前端：**

1. 安装依赖

 ```
npm install
 ```

3. 启动开发服务器** (`dev`): 使用Vite启动开发服务器。

 ```sh
npm run dev
 ```

5. 编译和类型检查** (`build`): 运行并行命令，先进行类型检查，然后构建生产环境的包。

 ```sh
npm run build
 ```

7. 生成TypeScript接口** (`openapi2ts`): 从OpenAPI规范生成TypeScript接口。

 ```sh
npm run openapi2ts
 ```

9. 预览生产构建** (`preview`): 预览生产构建的内容。

 ```sh
npm run preview
 ```



## 联系方式

如有问题或建议，请通过以下方式联系项目维护者：

- **开发者**: qingyu
- **邮箱**: liqingyu.dev@gmail.com
- **GitHub后端**: [qingyu-picture-backend](https://github.com/LiqingyuDev/qingyu-picture-backend)
- **GitHub前端**: [qingyu-picture-frontend](https://github.com/LiqingyuDev/qingyu-picture-frontend)



## 致谢



特别感谢程序员鱼皮的[云图库项目](https://github.com/liyupi/yu-auto-reply)，为本项目提供了重要的基础架构参考。