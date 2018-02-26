title: Hadoop(三)（Hdfs的上传与存储机制防止宕机）
author: 小小冰弟
date: 2018-02-07 18:15:26
tags: study
categories: Hadoop
---

###### HDFS简介：HDFS主要由3个组件构成，分别是NameNode、SecondaryNameNode和DataNode，HSFS是以master/slave模式运行的，其中NameNode、SecondaryNameNode 运行在master节点，DataNode运行slave节点。


###### NameNode保存元信息的种类有：

* 文件名目录名及它们之间的层级关系
* 文件目录的所有者及其权限
* 每个文件块的名及文件有哪些块组成


###### Secondary用来进行fsimage与edit.log的合并操作

###### DataNode主要保存block即分割的块状文件

###### 简要分析HDFS的文件上传机制：

1. 客户端发送上传文件请求，通知NameNode,NameNode检查没有问题回传客户端OK.
2. 客户端开始上传文件，NameNode向edit.log文件中记录操作日志。
3. 客户端完成上传返回成功信息，NameNode便向内存中写入本次操作产生的元数据内容，方便读取。
4. 当edit.log满的时候，NameNode便会通知SecondaryNode进行checkPoint操作(为了不影响主机性能，因为转换需要消耗内存)。
5. SN同意操作便会通知NN让其停止忘edit.log中写入日志，但不能避免还有其它上传，所以NN便会生成一个newedit.log,来替代之前的满的edit.log的工作.
6. 接着SN下载fsimage(磁盘文件)与edit.log到本节点上进行合并操作，生成new_fsimage文件，再上传至NN上。
7. NN替换fsimage并且删除edit.log,并且将newedit.log更名为edit.log.