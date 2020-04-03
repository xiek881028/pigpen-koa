# piggen-koa

整合koa-app 与 piggen-vue

自用快拆脚手架

## 开发

### 普通模式

```sh
# 安装依赖
cnpm i

# 前端项目依赖资源包引入
npm run init

# 启动前台服务
npm start

# 启动node服务(默认运行在80端口)
npm run pm2
```

### docker模式

```sh
# 安装依赖
cnpm i

# 前端项目依赖资源包引入
npm run init

# 复制docker开发环境配置文件
cp docker-compose.development.yml docker-compose.yml

# 配置docker
vi docker-compose.yml

# 启动前台服务
npm start

# 启动node服务
npm run service
```

## 生产部署

### 普通模式

```sh
# 安装依赖
cnpm i

# 前端项目依赖资源包引入
npm run init

# 前端资源打包
npm run release

# 启动node服务
npm run pm2
```

### docker模式

```sh
# 复制docker生产环境配置文件
cp docker-compose.production.yml docker-compose.yml

# 打包生产镜像
docker build -f ./Dockerfile -t pigken-koa:latest .

# 配置docker
vi docker-compose.yml

# 启动镜像
npm run service
```

## 一些可能会用到的docker命令

```sh
# 查看redis数据库状态
docker exec -it [id] redis-cli

# 进入docker内部
docker exec -it [id] /bin/sh

# 查看容器列表
docker ps -a

# 停止容器
docker stop [id]

# 删除容器
docker rm [id]

# 查看镜像列表
docker images

# 生成镜像
docker build -f [dockerFile路径] -t [镜像名]:[镜像tag] [工程路径]

# 删除镜像
docker rmi [id]

# 启动容器组
docker-compose up -d

# 停止容器组
docker-compose down
```
