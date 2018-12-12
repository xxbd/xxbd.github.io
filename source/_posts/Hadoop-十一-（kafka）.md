title: Hadoop(十一)（kafka）
author: 小小冰弟
tags: study
categories: Hadoop
date: 2018-03-29 17:25:29
---
#### 一、What is the Kafka?
###### 1/kafka是一个分布式的消息缓存系统
###### 2/kafka集群中的服务器都叫做broker
###### 3/kafka有两类客户端，一类叫producer（消息生产者），一类叫做consumer（消息消费者），客户端和broker服务器之间采用tcp协议连接
###### 4/kafka中不同业务系统的消息可以通过topic进行区分，而且每一个消息topic都会被分区，以分担消息读写的负载
###### 5/每一个分区都可以有多个副本，以防止数据的丢失
###### 6/某一个分区中的数据如果需要更新，都必须通过该分区所有副本中的leader来更新
###### 7/消费者可以分组，比如有两个消费者组A和B，共同消费一个topic：order_info,A和B所消费的消息不会重复比如 order_info 中有100个消息，每个消息有一个id,编号从0-99，那么，如果A组消费0-49号，B组就消费50-99号
###### 8/消费者在具体消费某个topic中的消息时，可以指定起始偏移量




#### 二、Kafka集群安装
###### 1、解压
###### 2、修改server.properties
broker.id=1(每一台kafka都要给个编号)
zookeeper.connect=hadoop01:2181,hadoop02:2181,hadoop03:2181

###### 3、将zookeeper集群启动

###### 4、在每一台节点上启动broker
bin/kafka-server-start.sh config/server.properties

###### 5、在kafka集群中创建一个topic
bin/kafka-topics.sh --create --zookeeper hadoop01:2181 --replication-factor 3 --partitions 1 --topic order

###### 6、用一个producer向某一个topic中写入消息
bin/kafka-console-producer.sh --broker-list hadoop01:9092 --topic order

###### 7、用一个comsumer从某一个topic中读取信息
bin/kafka-console-consumer.sh --zookeeper hadoop01:2181 --from-beginning --topic order

###### 8、查看一个topic的分区及副本状态信息
bin/kafka-topics.sh --describe --zookeeper hadoop01:2181 --topic order


#### 三、Kafka整合storm的Java客户端编写

##### 1.Topology
    public class KafkaTopo {

	public static void main(String[] args) throws Exception {
		
		String topic = "wordcount"; （配置主题名称）
		String zkRoot = "/kafka-storm";（设置zookeeper节点）
		String spoutId = "KafkaSpout";
		BrokerHosts brokerHosts = new ZkHosts("hadoop01:2181,hadoop02:2181,hadoop03:2181"); 
		SpoutConfig spoutConfig = new SpoutConfig(brokerHosts, "wordcount", zkRoot, spoutId);
		spoutConfig.forceFromStart = true;
		spoutConfig.scheme = new SchemeAsMultiScheme(new MessageScheme());（自己定义的）
		TopologyBuilder builder = new TopologyBuilder();
		//设置一个spout用来从kaflka消息队列中读取数据并发送给下一级的bolt组件，此处用的spout组件并非自定义的，而是storm中已经开发好的KafkaSpout
		builder.setSpout("KafkaSpout", new KafkaSpout(spoutConfig));
		builder.setBolt("word-spilter", new WordSpliter()).shuffleGrouping(spoutId);
		builder.setBolt("writer", new WriterBolt(), 4).fieldsGrouping("word-spilter", new Fields("word"));
		Config conf = new Config();
		conf.setNumWorkers(4);
		conf.setNumAckers(0);
		conf.setDebug(false);
		
		//LocalCluster用来将topology提交到本地模拟器运行，方便开发调试
		LocalCluster cluster = new LocalCluster();
		cluster.submitTopology("WordCount", conf, builder.createTopology());
		
		//提交topology到storm集群中运行
    // StormSubmitter.submitTopology("sufei-topo", conf, builder.createTopology());
	}

    }
    
    
##### 2.MessageScheme

    public class MessageScheme implements Scheme {
	
	private static final long serialVersionUID = 8423372426211017613L;

	@Override
	public List<Object> deserialize(byte[] bytes) {
			try {
				String msg = new String(bytes, "UTF-8");
				return new Values(msg); 
			} catch (UnsupportedEncodingException e) {
				e.printStackTrace();
			}
			return null;
	}

	@Override
	public Fields getOutputFields() {
		return new Fields("msg");
	}

    }
    
##### 3.Bolts

    public class WordSpliter extends BaseBasicBolt {

	private static final long serialVersionUID = -5653803832498574866L;

	@Override
	public void execute(Tuple input, BasicOutputCollector collector) {
		String line = input.getString(0);
		String[] words = line.split(" ");
		for (String word : words) {
			word = word.trim();
			if (StringUtils.isNotBlank(word)) {
				word = word.toLowerCase();
				collector.emit(new Values(word));
			}
		}
	}

	@Override
	public void declareOutputFields(OutputFieldsDeclarer declarer) {
		declarer.declare(new Fields("word"));

	}

    }
    
   
 将数据写入文件
 
 
    public class WriterBolt extends BaseBasicBolt {

	private static final long serialVersionUID = -6586283337287975719L;
	
	private FileWriter writer = null;
	
	@Override
	public void prepare(Map stormConf, TopologyContext context) {
		try {
			writer = new FileWriter("c:\\storm-kafka\\" + "wordcount"+UUID.randomUUID().toString());
		} catch (IOException e) {
			throw new RuntimeException(e);
		}
	}

	
	@Override
	public void declareOutputFields(OutputFieldsDeclarer declarer) {
	}
	
	
	@Override
	public void execute(Tuple input, BasicOutputCollector collector) {
		String s = input.getString(0);
		try {
			writer.write(s);
			writer.write("\n");
			writer.flush();
		} catch (IOException e) {
			throw new RuntimeException(e);
		}
	}
}