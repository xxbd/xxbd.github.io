title: Hadoop(六)（yarn框架）
author: 小小冰弟
tags: study
categories: Hadoop
date: 2018-03-22 14:54:59
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


#### 五、hadoop中的序列化
主要有4个接口，分别是Comparator（字节比较器）, Comparable（对象比较）, Writable（序列化）, Configurable（参数配置）。

hadoop的序列化的特点是： 
###### 1、节省资源：由于带宽和存储是集群中的最宝贵的资源所以我们必须想法设法缩小传递信息的大小和存储大小，hadoop的序列化就为了更好地坐到这一点而设计的。 
###### 2、对象可重用：JDK的反序列化会不断地创建对象，这肯定会造成一定的系统开销，但是在hadoop的反序列化中，能重复的利用一个对象的readField方法来重新产生不同的对象。 
###### 3、可扩展性：当前hadoop的序列化有多中选择可以利用实现hadoop的WritableComparable接口。 

也可使用开源的序列化框架protocol Buffers，Avro等框架。我们可以注意到的是hadoop2.X之后是实现一个YARN，所有应用（mapreduce，或者其他spark实时或者离线的计算框架都可以运行在YARN上），YARN还负责对资源的调度等等。YARN的序列化就是用Google开发的序列化框架protocol Buffers，proto目前支持支持三种语言C++，java，Python所以RPC这一层我们就可以利用其他语言来做文章，满足其他语言开发者的需求。

#### 六、shuffle过程
这其实就是mapreduce的细节问题
中间会经历 分组 排序 转发的过程

1.首先hadoop会根据PartitionerClass来进行归类。</n>

    job.setPartitionerClass(xxx.class);
    


2.设置reduce任务并发数，应该跟并发数，即分组数量一样

    job.setNumReduceTask();
    
或许你会问，为什么没有设置maptask的数量

1.maptask的并发数是由切片的数量决定的，多少个切片，多少个maptask.
2.切片就是一个逻辑概念，指的是文件中数据的偏移量范围。
3.切片的具体大小应该根据处理的文件大小来调整，一般64M这样（好像是）
     
