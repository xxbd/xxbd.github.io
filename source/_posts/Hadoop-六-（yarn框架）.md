title: Hadoop(六)（yarn框架）
author: 小小冰弟
date: 2018-03-22 14:54:59
tags: study
categories: Hadoop
---
#### 一、YARN框架
主要就是将之前的资源管理与任务调度功能一分为二，降低系统的耦合度与单点故障的可能性（JobTracker之前是集中处理点）。

#### 二、工作机制
###### 1.在java主程序中最后调用的waitforcompletion()会提交任务，向ResourceManager申请执行一个job。
###### 2.ResourceManager返回给给job相关资源提交的路径和产生的job_id(一个staging dir)
###### 3.根据返回结果，将资源提交到staging dir上（默认在HDFS上面）
###### 4.向ResourceManager汇报提交信息
###### 5.ResourceManager将job加入任务队列，NodeManager从ResourceManager领取任务。
######  6.NodeManager给任务分配运行类资源的容器container(从HDFS和Resource两个地方拿资源)
######  7.启动MRAppMaster(MapReduce内部框架，分配谁是主进程)
######  8.向ResoourceManger注册，启动Maptask任务进程，启动Reducetask任务进程，执行完之后会自动回收。

（其中MRAppMaster与Yarnchild都是动态生成的）

#### 三、eclipse运行
在eclipse中运行，并不像我们之前使用命令行运行的那样，因为它调用的是本地的job而不是hadoop的，因为它并没有使用我们修改的配置文件，所以我们需要将mapred.site.xml与yarn.site.xml文件放入项目中让其读取，结果运行时我们会发现没有jar，所以我们还需要将项目本身打包放到项目中并且设置configuration

     Configuration conf = new Configuration();
     conf.set("mapreduce.job.jar","mc.jar")
     
#### 四、几种提交运行模式

##### 1.本地模式
###### windows版本：输出输出可以放在本地，也可以放在hdfs上，但是用的是localjobrunner.
###### linux版本：输出输出可以放在本地，也可以放在hdfs上，也是用的是localjobrunner.
##### 2.集群模式
###### windows版本还是放弃吧，贼麻烦，路径的符号不一样等等
###### linux上第一种 可以直接打包项目丢到服务器上运用hadoop jar jar包 运行。
###### 第二种是在eclipse中，需要将mapred.site.xml与yarn.site.xml文件放入项目中让其读取，另外在main方法中添加一个conf的参数conf.set("mapreduce.job.jar","mc.jar")
     
     
     
     
     
     
     
     