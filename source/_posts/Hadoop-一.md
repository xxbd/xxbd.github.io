title: Hadoop (一)（centos 6.8/hadoop 2.4.1版本）
author: 小小冰弟
tags: study
categories: Hadoop
date: 2018-02-03 16:52:44
---

#### Hadoop简介
##### 解决问题：
- 海量数据存储（HDFS）
- 海量数据分析(MapReduce)
- 资源管理调度(Yarn)


##### Hdfs实现思想
1. 通过分布式集群来存储文件
2. 文件存储到Hdfs集群中是以block为单位
3. 文件的block存放在若干个datanote节点上
4. 文件与block的映射存放在namenode上
5. 每个block还可以有多个副本存放在其他datanote上，提高数据可靠性

刚开始咱就一点一点搭建，后面熟练以后可以直接使用cdh(封装的hadoop).




#### Linux环境设置
###### 1.网络连接设置及主机映射配置

    虚拟机页面：edit->Virtual Network Editor->nat模式->nat settings->gateway ip设置为本机net8的ip加1


###### 2.虚拟机设置ip两种方式：

	第一种：通过Linux图形界面进行修改（强烈推荐）
			进入Linux图形界面 -> 右键点击右上方的两个小电脑 -> 点击Edit connections -> 选中当前网络 
            System eth0 -> 点击edit按钮 -> 选择IPv4 -> method选择为manual -> 点击add按钮 -> 
            添加 IP：192.168.1.101 子网掩码：255.255.255.0 网关：192.168.1.1 -> apply
	
		第二种：修改配置文件方式（屌丝程序猿专用）
			vim /etc/sysconfig/network-scripts/ifcfg-eth0
			DEVICE="eth0"
			BOOTPROTO="static"               
			HWADDR="00:0C:29:3C:BF:E7"
			IPV6INIT="yes"
			NM_CONTROLLED="yes"
			ONBOOT="yes"
			TYPE="Ethernet"
			UUID="ce22eeca-ecde-4536-8cc2-ef0dc36d4a8c"
			IPADDR="192.168.1.101"           
			NETMASK="255.255.255.0"          
			GATEWAY="192.168.1.1"  
         
 ###### 3.修改主机名
 
		vim /etc/sysconfig/network
		NETWORKING=yes
		HOSTNAME=ppj    ###   
        
 ###### 4.修改主机名和IP的映射关系
 
		vim /etc/hosts
			
		192.168.x.xxx	ppj
	
 ##### 5.关闭防火墙
 
		#查看防火墙状态
		service iptables status
		#关闭防火墙
		service iptables stop
		#查看防火墙开机启动状态
		chkconfig iptables --list
		#关闭防火墙开机启动
		chkconfig iptables off  
 
 
#### JDK安装
##### 1.jdk查看与卸载
    java -version (查看版本)
    rpm -qa |grep java (查看已经安装的java)
    rpm -e --nodeps java-1.6.0-openjdk-1.6.0.38-1.13.10.0.el6_7.x86_64 (卸载方式1)
    yum -y remove java-1.4.2-gcj-compat-1.4.2.0-40jpp.115 （卸载方式2）
    
##### 2.jdk安装(需要装32位的)
[jdk下载地址](http://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html)

下载压缩包上传至linux目录 /home/usr/  (个人习惯)
    
    cd /home/usr
    tar -zxvf jdk-8u161-linux-arm64-vfp-hflt.tar.gz
    mkdir /usr/java
    mv 1.8.0_72 /usr/java/
    
##### 3.配置java环境

    vim /etc/profile
    ##最后添加
    JAVA_HOME=/usr/java/jdk1.8.0_72
    JRE_HOME=$JAVA_HOME/jre
    PATH=$PATH:$JAVA_HOME/bin
    CLASSPATH=.:$JAVA_HOME/lib/dt.jar:$JAVA_HOME/lib/tools.jar




#### Hadoop搭建
##### 1.安装hadoop
[hadoop下载地址](http://hadoop.apache.org/releases.html)
下载压缩包上传至linux目录 /home/usr/  
	   
       
		mkdir /cloud （存放hadoop）
		tar -zxvf hadoop-2.4.1.tar.gz -C /cloud/
##### 2配置hadoop伪分布式（要修改4个文件）
**位置都在/cloud/hadoop-2.4.1/etc/hadoop目录下**

hadoop-env.sh

		vim hadoop-env.sh
		export JAVA_HOME=/usr/java/1.8.0_72
		
core-site.xml

		vim core-site.xml
			
			<configuration>
					<!-- 指定HDFS的namenode的通信地址 -->
					<property>
							<name>fs.default.name</name>
							<value>hdfs://ppj:9000</value>(可以不配，默认为28820)
					</property>
					<!-- 指定hadoop运行时产生文件的存放目录 -->
					<property>
							<name>hadoop.tmp.dir</name>
							<value>/cloud/hadoop-2.4.1/tmp</value>
					</property>
			</configuration>
			
hdfs-site.xml

		vim hdfs-site.xml
			<configuration>
				<!-- 配置HDFS副本的数量 -->
				<property>
						<name>dfs.replication</name>
						<value>1</value>
				</property>
			</configuration>
			
mapred-site.xml

		vim mapred-site.xml
			<configuration>
					<!-- 指定jobtracker地址 -->
					<property>
							<name>mapred.job.tracker</name>
							<value>ppj:9001</value>
					</property>
			</configuration>
			
将hadoop添加到环境变量

		vim /etc/profile
		export JAVA_HOME=/usr/java/jdk1.6.0_45
		export HADOOP_HOME=/cloud/hadoop-1.1.2
		export PATH=$PATH:$JAVA_HOME/bin:$HADOOP_HOME/bin:$HADOOP_HOME/sbin(因为待会用的命令在sbin)
		source /etc/profile
	
格式化HDFS

		hadoop namenode -format
	
启动hadoop

	  start-dfs.sh
      start-yarn.sh
	
验证集群是否启动成功

		jps(不包括jps应该有5个)
		NameNode
		SecondaryNameNode
		DataNode
		JobTracker
		TaskTracker
		还可以通过浏览器的方式验证
		http://192.168.1.110:50070 (hdfs管理界面)
		http://192.168.1.110:50030 (mr管理界面)
		
在这个文件中添加linux主机名和IP的映射关系：C:\Windows\System32\drivers\etc



#### 3.配置ssh免登陆
	##生成ssh免登陆密钥
	ssh-keygen -t rsa
	##执行完这个命令后，会生成两个文件id_rsa（私钥）、id_rsa.pub（公钥）默认在home用户目录下
	##将公钥拷贝到要免登陆的机器上
    scp id_rsa.pub 目标主机：目录（如果是本机，就直接追加了）
    先要生成authorized.keyswenjian,且权限为600（-rw------）,接着追加进去
	cat 存放的目录/id_rsa.pub >> ~/.ssh/authorized_keys
    注：我本来在xshell上配了，结果回虚拟机上没有了，当然也没实现免密登录，后来回虚拟机上重设才好。