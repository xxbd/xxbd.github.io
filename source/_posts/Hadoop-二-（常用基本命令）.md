title: Hadoop(二)（HDFS部分常用基本命令）
author: 小小冰弟
tags: study
categories: Hadoop
date: 2018-02-05 13:59:48
---
#### 其实基本跟Linux下的命令差不多

#### 启动命令位于sbin目录下
     start-dfs.sh
     start-yarn.sh
     jps(查看有没有启动成功)
     访问ip地址：50070查看是否成功

#### 1、显示所有命令
    hadoop fs(以下命令都需要在前方加上hadoop fs且全路径如果为hdfs://ip:8020默认端口/ )

#### 2、上传文件（三种方式）

    -put 文件 hdfsdir（上传）
    -appendToFile(追加)
    -copyFromLocal localdir hdfsdir  (从本地复制)
    -moveFromLocal localdir hdfsdir（从本地移动）


#### 3、显示目录结构
    -ls 路径 （全展示，显示结果解释在下面）
    -lsr 路径 （递归显示文件）
    -du 路径 （统计文件大小）
    -dus路径 (汇总统计大小)
    -count (统计文件夹数量、文件数量、文件总大小信息)
显示结果代表：
1. 首字母表示文件类型（"d"是文件夹，"-"是文件）
2. 后面的字符与Linux一样表示权限
3. 后面的"-"或者数字表示副本，文件夹没有副本
4. 接着依次为 拥有者 所在组 文件大小 修改时间 路径

#### 4、移动复制与删除
    -mv(移动)
    -cp(复制)
    -rm(删除)
    -rmr(递归删除)
    
    
#### 5、创建
    -mkdir（创建空白文件夹）
    -touchz （创建空白文件）
#### 6、查看
    -cat()
    -tail()
    -text(显示最后1K字节内容，加上"-f" 便跟随查看)
 
#### 7、其他
    -setrep 数量 文件 (设置副本数量)
    -chmod(修改文件权限)
    -chown 属主 文件 (修改属主)
    -chgrp 所在组(新的) 文件(修改所在组)