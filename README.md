# 轻语云图库前端 (Qingyu Picture Frontend)

轻语云图库前端是基于Vue 3和Vite构建的单页面应用程序，用于管理图片的上传、展示和审核。本项目采用了Ant Design
Vue组件库，以提供一致且美观的用户界面。

## 推荐的IDE设置

- [VSCode](https://code.visualstudio.com/)
- [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar)（并禁用Vetur）

## 组件库

本项目使用了[Ant Design Vue](https://www.antdv.com/docs/vue)组件库，它是一套企业级的UI设计语言和Vue.js组件库。

## 项目设置

### 安装依赖

```sh
npm install
```

### 开发环境

以下命令用于开发环境：

- **启动开发服务器** (`dev`): 使用Vite启动开发服务器。
  ```sh
  npm run dev
  ```
- **编译和类型检查** (`build`): 运行并行命令，先进行类型检查，然后构建生产环境的包。
  ```sh
  npm run build
  ```
- **生成TypeScript接口** (`openapi2ts`): 从OpenAPI规范生成TypeScript接口。
  ```sh
  npm run openapi2ts
  ```
- **预览生产构建** (`preview`): 预览生产构建的内容。
  ```sh
  npm run preview
  ```

### 生产构建

以下命令用于生产环境：

- **仅构建** (`build-only`): 使用Vite构建生产环境的包，不进行类型检查。
  ```sh
  npm run build-only
  ```
- **类型检查** (`type-check`): 使用`vue-tsc`进行类型检查。
  ```sh
  npm run type-check
  ```

### 代码质量

以下命令用于维护代码质量：

- **代码检查和修复** (`lint`): 使用ESLint检查代码并尝试自动修复。
  ```sh
  npm run lint
  ```
- **代码格式化** (`format`): 使用Prettier格式化`src/`目录下的代码。
  ```sh
  npm run format
  ```

## 如何贡献

我们非常欢迎您的贡献！请遵循以下步骤：

1. Fork本项目
2. 创建您的特性分支 (`git checkout -b my-new-feature`)
3. 提交您的改动 (`git commit -am 'Add some feature'`)
4. 推送到您的分支 (`git push origin my-new-feature`)
5. 创建一个新的Pull Request

## 许可证

本项目采用[MIT许可证](https://opensource.org/licenses/MIT)，请确保您遵守相关条款。

## 联系方式

如有问题或建议，请通过以下方式联系项目维护者：

- **开发者**: 轻语
- **邮箱**: liqingyu.dev@gmail.com
- **GitHub后端**: [qingyu-picture-backend](https://github.com/LiqingyuDev/qingyu-picture-backend)
- **GitHub前端**: [qingyu-picture-frontend](https://github.com/username/qingyu-picture-frontend)

```