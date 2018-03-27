title: Hadoop(七)（HA高可用架构配置）
author: 小小冰弟
date: 2018-03-27 15:49:51
tags: study
categories: Hadoop
---
#### 一、Zookeeper集群
提供少量数据的存储和管理，类似树形目录，由很多node与data组成。解压安装后只需修改配置文件即可，conf目录下。

#### 二、搭建高可用的原因
###### 1.之前一个NameNode节点肯定不行，但如果我们需要两个节点，肯定不能使两个在同一时间点响应请求。响应请求的必须是active状态。
###### 2.另外一个standby状态的节点如何做到迅速切换到active状态呢，意味着两个NameNode必须保持元数据相同，所以我们需要将edits分离出去，这样两个NameNode就可以保持一致了，考虑到高可用的分布式，那么这个edits肯定不能一份，所以需要做数据同步，这里hadoop提供了一套框架Qjournal(依赖zookeeper实现)
###### 3.但要做到切换，在什么状态下切换，我们需要一个监控进程来监控NameNode，在hadoop中我们把这叫做zkfc,但有时候可能active的机器并没有真正死亡，这个时候如果切换了，便会发生“脑裂”。解决方法是发送一条指令，通过ssh来kill那个进程，获取返回值来确定，如果拿不到返回值可以执行自定义shell脚本程序关闭电源啊什么什么的，称为fencing机制。
###### 4.另外两个NameNode可以构建一个Federation,在core-site.xml里面就需要配置路径为hdfs://nameservice名称，系统可以有多个Federation来扩大集群规模。

#### 三、配置

1.修改core-site.xml

				<configuration>
					<!-- 指定hdfs的nameservice为ns1 -->
					<property>
						<name>fs.defaultFS</name>
						<value>hdfs://ns1/</value>
					</property>
					<!-- 指定hadoop临时目录 -->
					<property>
						<name>hadoop.tmp.dir</name>
						<value>/clould/hadoop-2.4.1/tmp</value>
					</property>
					
					<!-- 指定zookeeper地址 -->
					<property>
						<name>ha.zookeeper.quorum</name>
	    	       <value>hadoop05:2181,hadoop06:2181,hadoop07:2181</value>
					</property>
				</configuration>
			
            
2.修改hdfs-site.xml

				<configuration>
					<!--指定hdfs的nameservice为ns1，需要和core-site.xml中的保持一致 -->
					<property>
						<name>dfs.nameservices</name>
						<value>ns1</value>
					</property>
					<!-- ns1下面有两个NameNode，分别是nn1，nn2 -->
					<property>
						<name>dfs.ha.namenodes.ns1</name>
						<value>nn1,nn2</value>
					</property>
					<!-- nn1的RPC通信地址 -->
					<property>
						<name>dfs.namenode.rpc-address.ns1.nn1</name>
						<value>hadoop01:9000</value>
					</property>
					<!-- nn1的http通信地址 -->
					<property>
						<name>dfs.namenode.http-address.ns1.nn1</name>
						<value>hadoop01:50070</value>
					</property>
					<!-- nn2的RPC通信地址 -->
					<property>
						<name>dfs.namenode.rpc-address.ns1.nn2</name>
						<value>hadoop02:9000</value>
					</property>
					<!-- nn2的http通信地址 -->
					<property>
						<name>dfs.namenode.http-address.ns1.nn2</name>
						<value>hadoop02:50070</value>
					</property>
					<!-- 指定NameNode的元数据在JournalNode上的存放位置 -->
					<property>
						<name>dfs.namenode.shared.edits.dir</name>
						<value>qjournal://hadoop05:8485;hadoop06:8485;hadoop07:8485/ns1</value>
					</property>
					<!-- 指定JournalNode在本地磁盘存放数据的位置 -->
					<property>
						<name>dfs.journalnode.edits.dir</name>
						<value>/cloud/hadoop-2.4.1/journaldata</value>
					</property>
					<!-- 开启NameNode失败自动切换 -->
					<property>
						<name>dfs.ha.automatic-failover.enabled</name>
						<value>true</value>
					</property>
					<!-- 配置失败自动切换实现方式 -->
					<property>
						<name>dfs.client.failover.proxy.provider.ns1</name>
						<value>org.apache.hadoop.hdfs.server.namenode.ha.ConfiguredFailoverProxyProvider</value>
					</property>
					<!-- 配置隔离机制方法，多个机制用换行分割，即每个机制暂用一行-->
					<property>
						<name>dfs.ha.fencing.methods</name>
						<value>
							sshfence
							shell(/bin/true)(这样配置是为了测试返回的肯定是true)
						</value>
					</property>
					<!-- 使用sshfence隔离机制时需要ssh免登陆 -->
					<property>
						<name>dfs.ha.fencing.ssh.private-key-files</name>
						<value>/home/hadoop/.ssh/id_rsa</value>(根据自己位置定)
					</property>
					<!-- 配置sshfence隔离机制超时时间 -->
					<property>
						<name>dfs.ha.fencing.ssh.connect-timeout</name>
						<value>30000</value>
					</property>
				</configuration>
			
            
3.修改mapred-site.xml

				<configuration>
					<!-- 指定mr框架为yarn方式 -->
					<property>
						<name>mapreduce.framework.name</name>
						<value>yarn</value>
					</property>
				</configuration>	
			
4.修改yarn-site.xml

				<configuration>
						<!-- 开启RM高可用 -->
						<property>
						   <name>yarn.resourcemanager.ha.enabled</name>
						   <value>true</value>
						</property>
						<!-- 指定RM的cluster id -->
						<property>
						   <name>yarn.resourcemanager.cluster-id</name>
						   <value>yrc</value>
						</property>
						<!-- 指定RM的名字 -->
						<property>
						   <name>yarn.resourcemanager.ha.rm-ids</name>
						   <value>rm1,rm2</value>
						</property>
						<!-- 分别指定RM的地址 -->
						<property>
						   <name>yarn.resourcemanager.hostname.rm1</name>
						   <value>hadoop03</value>
						</property>
						<property>
						   <name>yarn.resourcemanager.hostname.rm2</name>
						   <value>hadoop04</value>
						</property>
						<!-- 指定zk集群地址 -->
						<property>
						   <name>yarn.resourcemanager.zk-address</name>
						   <value>hadoop05:2181,hadoop06:2181,hadoop07:2181</value>
						</property>
						<property>
						   <name>yarn.nodemanager.aux-services</name>
						   <value>mapreduce_shuffle</value>
						</property>
				</configuration>
			
				
5.修改slaves(slaves是指定子节点的位置，因为要在hadoop01上启动HDFS、在hadoop03启动yarn，所以hadoop01上的slaves文件指定的是datanode的位置，hadoop03上的slaves文件指定的是nodemanager的位置)

				weekend05
				weekend06
				weekend07

6.配置免密码登陆


	 #首先要配置hadoop01到hadoop02、hadoop03、hadoop04、hadoop05、hadoop06、hadoop07的免密码登陆
    #配置hadoop03到hadoop04、hadoop05、hadoop06、hadoop07的免密码登陆
    #注意：两个namenode之间要配置ssh免密码登陆，别忘了配置weekend02到weekend01的免登陆
							
		
7.将配置好的hadoop拷贝到其他节点

			
            
            
###注意：严格按照下面的步骤

		1.启动zookeeper集群（分别在hadoop05、hadoop06、hadoop07上启动zk）
			cd /weekend/zookeeper-3.4.5/bin/
			./zkServer.sh start
			#查看状态：一个leader，两个follower
			./zkServer.sh status
			
		2.启动journalnode（分别在在hadoop05、hadoop06、hadoop07上执行）
			cd /weekend/hadoop-2.4.1
			sbin/hadoop-daemon.sh start journalnode
			#运行jps命令检验，hadoop05、hadoop06、hadoop07上多了JournalNode进程
		
		3.格式化HDFS
			#在hadoop01上执行命令:
			hdfs namenode -format
			#格式化后会在根据core-site.xml中的hadoop.tmp.dir配置生成个文件，这里我配置的是/cloud/hadoop-2.4.1/tmp，然后将/cloud/hadoop-2.4.1/tmp拷贝到hadoop02的/cloud/hadoop-2.4.1/下。
			scp -r tmp/ hadoop02:/cloud/hadoop-2.4.1/
			##也可以这样，建议hdfs namenode -bootstrapStandby
		
		4.格式化ZKFC(在hadoop01上执行即可)
			hdfs zkfc -formatZK
		
		5.启动HDFS(在hadoop01上执行)
			sbin/start-dfs.sh

		6.启动YARN(#####注意#####：是在hadoop上执行start-yarn.sh，把namenode和resourcemanager分开是因为性能问题，因为他们都要占用大量资源，所以把他们分开了，他们分开了就要分别在不同的机器上启动)
			sbin/start-yarn.sh

		
8.到此，hadoop-2.4.1配置完毕，可以统计浏览器访问:


		http://192.168.1.201:50070
		NameNode 'hadoop01:9000' (active)
		http://192.168.1.202:50070
		NameNode 'hadoop02:9000' (standby)
	    验证HDFS HA
		首先向hdfs上传一个文件
		hadoop fs -put /etc/profile /profile
		hadoop fs -ls /
		然后再kill掉active的NameNode
		kill -9 <pid of NN>
		通过浏览器访问：http://192.168.1.202:50070
		NameNode 'hadoop02:9000' (active)
		这个时候hadoop02上的NameNode变成了active
		在执行命令：
		hadoop fs -ls /
		-rw-r--r--   3 root supergroup       1926 2014-02-06 15:36 /profile
		刚才上传的文件依然存在！！！
		手动启动那个挂掉的NameNode
		sbin/hadoop-daemon.sh start namenode
		通过浏览器访问：http://192.168.1.201:50070
		NameNode 'hadoop01:9000' (standby)
	
	    验证YARN：
		运行一下hadoop提供的demo中的WordCount程序：
		hadoop jar share/hadoop/mapreduce/hadoop-mapreduce-examples-2.4.1.jar wordcount /profile /out
	
	OK，大功告成！！！

	
			
		
9.测试集群工作状态的一些指令 ：

bin/hdfs dfsadmin -report	 查看hdfs的各节点状态信息


bin/hdfs haadmin -getServiceState nn1		 获取一个namenode节点的HA状态

sbin/hadoop-daemon.sh start namenode  单独启动一个namenode进程


./hadoop-daemon.sh start zkfc   单独启动一个zkfc进程
