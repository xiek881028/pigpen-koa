#!/bin/bash
#backup MongoDB

#mongodump命令路径
DUMP=/usr/bin/mongodump
#临时备份目录
OUT_DIR=/data/backups/tmp
#备份存放路径
TAR_DIR=/data/backups
#获取当前系统时间
DATE=`date +%Y_%m_%d`
#删除n天前的备份，即只保留近n天的备份
DAYS=3
#最终保存的数据库备份文件
TAR_BAK="mongodb_bak_$DATE.tar.gz"
#环境变量
ENV="dev"
#name后缀
DOCKER_MODE=".dev"

# 设置环境变量
if [ $1 ]
then
  ENV=$1
fi
# 根据环境变量设置name后缀
if [ $ENV = "dev" ]
then
  DOCKER_MODE=".dev"
elif [ $ENV = "prod" ]
then
  DOCKER_MODE=""
else
  echo "环境变量env只能为 dev 或 prod"
  exit
fi
# 获取docker id
DOCKER_ID=`/usr/bin/docker ps -f name=^/com.pigpen.mongo$DOCKER_MODE$ -q`
/usr/bin/docker exec -i $DOCKER_ID bash -c "mkdir $OUT_DIR && cd $OUT_DIR && $DUMP -h 127.0.0.1 -d app -o $OUT_DIR/$DATE && /bin/tar -zcvPf $TAR_DIR/$TAR_BAK -C $OUT_DIR/$DATE . && rm -rf $OUT_DIR && find $TAR_DIR/ -mtime +$DAYS -delete && chmod 777 $TAR_DIR/$TAR_BAK"
exit
