title: Hadoop(十)(Storm)
author: 小小冰弟
tags: study
categories: Hadoop
date: 2018-03-29 14:57:18
---
#### 一、Storm
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;进行实时的数据处理如实时分析，在线机器学习，持续计算，主要运用于流式计算，例如网上的实时数据要写入数据库，中间需要个处理过程，通常结合消息队列（消息源）和数据库（存储地）一起使用。

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;在Storm集群中真正运行topology的主要有三个实体：工作进程、线程和任务。Storm集群中的每台机器上都可以运行多个工作进程，每个 工作进程又可创建多个线程，每个线程可以执行多个任务，任务是真正进行数据处理的实体，我们开发的spout、bolt就是作为一个或者多个任务的方式执 行的。

因此，计算任务在多个线程、进程和服务器之间并行进行，支持灵活的水平扩展。



#### 二、Storm基本组件

##### 1、Topologies ： 拓扑，也俗称一个任务（与Hadoop的MapReduce job不同，不会终止）
 
 一个topology是spouts和bolts组成的图， 通过stream groupings将图中的spouts和bolts连接起来。
 
 ###### Topology运行机制
**(1)Storm提交后，会把代码首先存放到Nimbus节点的inbox目录下，之后，会把当前Storm运行的配置生成一个stormconf.ser文件放到Nimbus节点的stormdist目录中，在此目录中同时还有序列化之后的Topology代码文件；**

**(2)在设定Topology所关联的Spouts和Bolts时，可以同时设置当前Spout和Bolt的executor数目和task数目，默认情况下，一个Topology的task的总和是和executor的总和一致的。之后，系统根据worker的数目，尽量平均的分配这些task的执行。worker在哪个supervisor节点上运行是由storm本身决定的；**

**(3)任务分配好之后，Nimbes节点会将任务的信息提交到zookeeper集群，同时在zookeeper集群中会有workerbeats节点，这里存储了当前Topology的所有worker进程的心跳信息；**

**(4)Supervisor节点会不断的轮询zookeeper集群，在zookeeper的assignments节点中保存了所有Topology的任务分配信息、代码存储目录、任务之间的关联关系等，Supervisor通过轮询此节点的内容，来领取自己的任务，启动worker进程运行；**

**(5)一个Topology运行之后，就会不断的通过Spouts来发送Stream流，通过Bolts来不断的处理接收到的Stream流，Stream流是无界的。**

**最后一步会不间断的执行，除非手动结束Topology。**

 
 
 ##### 2、Spouts ： 拓扑的消息源
 
消息源spout是Storm里面一个topology里面的消息生产者；

Spouts可以是可靠的也可以是不可靠的：如果这个tuple没有被storm成功处理，可靠的消息源spouts可以重新发射一个tuple， 但是不可靠的消息源spouts一旦发出一个tuple就不能重发了；

消息源可以发射多条消息流stream：使用OutputFieldsDeclarer.declareStream来定义多个stream， 然后使用SpoutOutputCollector来发射指定的stream。

 
 
 ##### 3、Bolts ： 拓扑的处理逻辑单元
 
所有的消息处理逻辑被封装在bolts里面；

Bolts可以做很多事情：过滤，聚合，查询数据库等等。

Bolts可以简单的做消息流的传递，也可以通过多级Bolts的组合来完成复杂的消息流处理；比如求TopN、聚合操作等（如果要把这个过程做得更具有扩展性那么可能需要更多的步骤）。

Bolts可以发射多条消息流： 
     使用OutputFieldsDeclarer.declareStream定义stream；
     使用OutputCollector.emit来选择要发射的stream；

Bolts的主要方法是execute,：
     它以一个tuple作为输入，使用OutputCollector来发射tuple；
     通过调用OutputCollector的ack方法，以通知这个tuple的发射者spout；

Bolts一般的流程： 
     处理一个输入tuple,  发射0个或者多个tuple, 然后调用ack通知storm自己已经处理过这个tuple了；
    storm提供了一个IBasicBolt会自动调用ack。

 ##### 4、tuple：消息元组(用来固定消息的传递格式，几个字符串啊等等)
 ##### 5、Streams ： 流
 
消息流stream是storm里的关键抽象；
一个消息流是一个没有边界的tuple序列， 而这些tuple序列会以一种分布式的方式并行地创建和处理；
通过对stream中tuple序列中每个字段命名来定义stream；
在默认的情况下，tuple的字段类型可以是：integer，long，short， byte，string，double，float，boolean和byte array；
可以自定义类型（只要实现相应的序列化器）。

 ##### 6、Stream groupings ：流的分组策略
 
定义一个topology的关键一步是定义每个bolt接收什么样的流作为输入；

stream grouping就是用来定义一个stream应该如何分配数据给bolts；

Storm里面有7种类型的stream grouping：
Shuffle Grouping——随机分组， 随机派发stream里面的tuple，保证每个bolt接收到的tuple数目大致相同；
Fields Grouping——按字段分组， 比如按userid来分组， 具有同样userid的tuple会被分到相同的Bolts里的一个task， 而不同的userid则会被分配到不同的bolts里的task；

All Grouping——广播发送，对于每一个tuple，所有的bolts都会收到；

Global Grouping——全局分组， 这个tuple被分配到storm中的一个bolt的其中一个task。再具体一点就是分配给id值最低的那个task；

Non Grouping——不分组，这个分组的意思是说stream不关心到底谁会收到它的tuple。目前这种分组和Shuffle grouping是一样的效果， 有一点不同的是storm会把这个bolt放到这个bolt的订阅者同一个线程里面去执行；

Direct Grouping——直接分组， 这是一种比较特别的分组方法，用这种分组意味着消息的发送者指定由消息接收者的哪个task处理这个消息。 只有被声明为Direct Stream的消息流可以声明这种分组方法。而且这种消息tuple必须使用emitDirect方法来发射。
消息处理者可以通过TopologyContext来获取处理它的消息的task的id （OutputCollector.emit方法也会返回task的id）；

Local or shuffle grouping——如果目标bolt有一个或者多个task在同一个工作进程中，tuple将会被随机发生给这些tasks。否则，和普通的Shuffle Grouping行为一致。



 ##### 7、Tasks ： 任务处理单元
 
每一个spout和bolt会被当作很多task在整个集群里执行

每一个executor对应到一个线程，在这个线程上运行多个task

stream grouping则是定义怎么从一堆task发射tuple到另外一堆task

可以调用TopologyBuilder类的setSpout和setBolt来设置并行度（也就是有多少个task）

 ##### 8、Executor :工作线程
 ##### 9、Workers ：工作进程
 
 一个topology可能会在一个或者多个worker（工作进程）里面执行；

每个worker是一个物理JVM并且执行整个topology的一部分；

比如，对于并行度是300的topology来说，如果我们使用50个工作进程来执行，那么每个工作进程会处理其中的6个tasks；
Storm会尽量均匀的工作分配给所有的worker；

 ##### 10、Configuration ： topology的配置







#### 三、Storm集群管理架构

主要分为两部分：
1. Nimbus  负责协调管理
2. Supervisor 负责具体运算

具体配置：

###### 1、安装一个zookeeper集群

###### 2、上传storm的安装包，解压

###### 3、修改配置文件storm.yaml

      #所使用的zookeeper集群主机
      storm.zookeeper.servers:
           - "hadoop01"
           - "hadoop02"
           - "hadoop03"

      #nimbus所在的主机名
      nimbus.host: "hadoop01"

###### 4.占用的端口
    supervisor.slots.ports
    -6701
    -6702
    -6703
    -6704
    -6705


###### 5.启动storm

    在nimbus主机上
    nohup ./storm nimbus
    nohup ./storm ui （开启后便可以访问可视化页面管理，端口号8080）

    在supervisor主机上
    nohup ./storm supervisor 
    
    
**注意事项：
启动Storm后台进程时，需要对conf/storm.yaml配置文件中设置的storm.local.dir目录具有写权限。
storm后台进程被启动后，将在Storm安装部署目录下的logs/子目录下生成各个进程的日志文件。
经测试，Storm UI必须和Storm Nimbus部署在同一台机器上，否则UI无法正常工作，因为UI进程会检查本机是否存在Nimbus链接。
为了方便使用，可以将bin/storm加入到系统环境变量中。
至此，Storm集群已经部署、配置完毕，可以向集群提交拓扑运行了。**

    提交Topologies
    命令格式：storm jar 【jar路径】 【拓扑包名.拓扑类名】【stormIP地址】【storm端口】【拓扑名称】【参    数】
    eg：storm jar /home/storm/storm-starter.jar storm.starter.WordCountTopology wordcountTop;
    #提交storm-starter.jar到远程集群，并启动wordcountTop拓扑。
    
    停止Topologies
    查看当前运行的topo： storm list 
    命令格式：storm kill 【拓扑名称】
    样例：storm kill wordcountTop#     
    杀掉wordcountTop拓扑。





#### 四、Storm的JAVA开发

##### 1.编写Spout
    package cn.itcast.stormdemo;

    import java.util.Map;
    import java.util.Random;

    import backtype.storm.spout.SpoutOutputCollector;
    import backtype.storm.task.TopologyContext;
    import backtype.storm.topology.OutputFieldsDeclarer;
    import backtype.storm.topology.base.BaseRichSpout;
    import backtype.storm.tuple.Fields;
    import backtype.storm.tuple.Values;
    import backtype.storm.utils.Utils;

    public class RandomWordSpout extends BaseRichSpout{

	private SpoutOutputCollector collector;
	
	//模拟一些数据
	String[] words = {"iphone","xiaomi","mate","sony","sumsung","moto","meizu"};
	
	//不断地往下一个组件发送tuple消息
	//这里面是该spout组件的核心逻辑
	@Override
	public void nextTuple() {

		//可以从kafka消息队列中拿到数据,简便起见，我们从words数组中随机挑选一个商品名发送出去
		Random random = new Random();
		int index = random.nextInt(words.length);()保证不超过数组的大小
		
		//通过随机数拿到一个商品名
		String godName = words[index];
		
		
		//将商品名封装成tuple，发送消息给下一个组件（这里可以传进去一个数组，但之后的声明便也需要一一对应）
		collector.emit(new Values(godName));
		
		//每发送一个消息，休眠500ms
		Utils.sleep(500);
		
		
	}

	//初始化方法，在spout组件实例化时调用一次
	@Override
	public void open(Map conf, TopologyContext context, SpoutOutputCollector collector) {

		this.collector = collector;
		
		
	}

	//声明本spout组件发送出去的tuple中的数据的字段名
	@Override
	public void declareOutputFields(OutputFieldsDeclarer declarer) {

		declarer.declare(new Fields("orignname"));（
		
	}

    }


##### 2.编写转换大小写的Bolt


    public class UpperBolt extends BaseBasicBolt{

	
	//业务处理逻辑
	@Override
	public void execute(Tuple tuple, BasicOutputCollector collector) {
		
		//先获取到上一个组件传递过来的数据,数据在tuple里面
		String godName = tuple.getString(0);
		
		//将商品名转换成大写
		String godName_upper = godName.toUpperCase();
		
		//将转换完成的商品名发送出去
		collector.emit(new Values(godName_upper));
		
	}

	
	
	//声明该bolt组件要发出去的tuple的字段
	@Override
	public void declareOutputFields(OutputFieldsDeclarer declarer) {
		
		declarer.declare(new Fields("uppername"));
	}

    }

##### 3.编写添加后缀的Bolt


    public class SuffixBolt extends BaseBasicBolt{
	
	FileWriter fileWriter = null;
	
	
	//在bolt组件运行过程中只会被调用一次，因为这是最后一个bolt,分布式有很多个进程以此来区分
	@Override
	public void prepare(Map stormConf, TopologyContext context) {

		try {
			fileWriter = new FileWriter("/home/hadoop/stormoutput/"+UUID.randomUUID());
		} catch (IOException e) {
			throw new RuntimeException(e);
		}
		
	}
	
	
	
	//该bolt组件的核心处理逻辑
	//每收到一个tuple消息，就会被调用一次
	@Override
	public void execute(Tuple tuple, BasicOutputCollector collector) {

		//先拿到上一个组件发送过来的商品名称
		String upper_name = tuple.getString(0);
		String suffix_name = upper_name + "_itisok";
		
		
		//为上一个组件发送过来的商品名称添加后缀
		
		try {
			fileWriter.write(suffix_name);
			fileWriter.write("\n");
			fileWriter.flush();
			
		} catch (IOException e) {
			throw new RuntimeException(e);
		}
		
		
		
	}

	
	
	
	//本bolt已经不需要发送tuple消息到下一个组件，所以不需要再声明tuple的字段
	@Override
	public void declareOutputFields(OutputFieldsDeclarer arg0) {

		
	}

    }

##### 4.主程序编写

 
 * 组织各个处理组件形成一个完整的处理流程，就是所谓的topology(类似于mapreduce程序中的job)
 * 并且将该topology提交给storm集群去运行，topology提交到集群后就将永无休止地运行，除非人为或者异常退出
 * @author duanhaitao@itcast.cn
 
 
 
    public class TopoMain {

	
	public static void main(String[] args) throws Exception {
		
		TopologyBuilder builder = new TopologyBuilder();
		
		//将我们的spout组件设置到topology中去，并且取名为randomSpout  
		//parallelism_hint ：4  表示用4个excutor来执行这个组件
		//setNumTasks(8) 设置的是该组件执行时的并发task数量，也就意味着1个excutor会运行2个task
		builder.setSpout("randomspout", new RandomWordSpout(), 4).setNumTasks(8);
		
		//将大写转换bolt组件设置到topology，并且指定它接收randomspout组件的消息
		//.shuffleGrouping("randomspout")包含两层含义：
		//1、upperbolt组件接收的tuple消息一定来自于randomspout组件
		//2、randomspout组件和upperbolt组件的大量并发task实例之间收发消息时采用的分组策略是随机分组shuffleGrouping
		builder.setBolt("upperbolt", new UpperBolt(), 4).shuffleGrouping("randomspout");
		
		//将添加后缀的bolt组件设置到topology，并且指定它接收upperbolt组件的消息
		builder.setBolt("suffixbolt", new SuffixBolt(), 4).shuffleGrouping("upperbolt");
		
		//用builder来创建一个topology
		StormTopology demotop = builder.createTopology();
		
		
		//配置一些topology在集群中运行时的参数
		Config conf = new Config();
		//这里设置的是整个demotop所占用的槽位数，也就是worker的数量
		conf.setNumWorkers(4);
		conf.setDebug(true);
		conf.setNumAckers(0);
		
		
		//将这个topology提交给storm集群运行,名字叫demotopo
		StormSubmitter.submitTopology("demotopo", conf, demotop);
		
	}
   }
   
  
##### 5.运行程序

  
   