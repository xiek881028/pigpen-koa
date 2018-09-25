# piggen-koa

整合koa-app 与 piggen-vue

自用快拆脚手架

```sh
# 安装依赖
cnpm i

# 前端项目依赖资源包引入
npm run shell -- --init

# 复制docker配置文件（开发 or 生产）
cp docker-compose.development.yml docker-compose.yml
或
cp docker-compose.production.yml docker-compose.yml

# 配置docker
vi docker-compose.yml

# 配置nginx
vi nginx.conf

# 启动后台服务
npm run service

# 编译前台模板（开发 or 生产）
npm start
或
npm run release

# 查看redis数据库状态
docker exec -it [id] redis-cli
```
