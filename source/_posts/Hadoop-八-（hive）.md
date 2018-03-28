title: Hadoop(八)（hive）
author: 小小冰弟
date: 2018-03-28 16:45:12
tags: study
categories: Hadoop
---
#### 一、Hive
Hive是一个数据仓库基础工具在Hadoop中用来处理结构化数据。它架构在Hadoop之上，总归为大数据，并使得查询和分析方便。并提供简单的sql查询功能，可以将sql语句转换为MapReduce任务进行运行。简单点说就是你不需要会JAVA就可以使用，只要你会SQL语句就可以了。（一般存在mysql中，也可以使用自带的嵌入式的数据库derby）

#### 二、Hive配置 
 ###### 1.将conf下的hive-default.xml.template 改名为 hive-site.xml 
   
	修改hive-site.xml（删除所有内容，只留一个<property></property>）
	添加如下内容：
	<property>
	  <name>javax.jdo.option.ConnectionURL</name>
	 <value>jdbc:mysql://hadoop01:3306/hivecreateDatabaseIfNotExist=true</value>
	  <description>JDBC connect string for a JDBC metastore</description>
	</property>

	<property>
	  <name>javax.jdo.option.ConnectionDriverName</name>
	  <value>com.mysql.jdbc.Driver</value>
	  <description>Driver class name for a JDBC metastore</description>
	</property>

	<property>
	  <name>javax.jdo.option.ConnectionUserName</name>
	  <value>root</value>
	  <description>username to use against metastore database</description>
	</property>

	<property>
	  <name>javax.jdo.option.ConnectionPassword</name>
	  <value>root</value>
	  <description>password to use against metastore database</description>
	</property>
    
    
    
###### 2.安装hive和mysq

    将mysql的连接jar包拷贝到$HIVE_HOME/lib目录下
	如果出现没有权限的问题，在mysql授权(在安装mysql的机器上执行)
	mysql -uroot -p
	#(执行下面的语句  *.*:所有库下的所有表   %：任何IP地址或主机都可以连接)
	GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' IDENTIFIED BY '123' WITH GRANT OPTION;
	FLUSH PRIVILEGES;
    
###### 3.建表
row format delimited：表示一行代表一个数据
fileds terminated by '\t':表示这一行的数据按照分隔符切分作为字段属性

    建表(默认是内部表)
	create table trade_detail(id bigint, account string, income double, expenses double, time string) row format delimited fields terminated by '\t';
	建分区表（partitioned by (logdate string)表示在表文件夹下面会有个logdate文件夹）
	create table td_part(id bigint, account string, income double, expenses double, time string) partitioned by (logdate string) row format delimited fields terminated by '\t';
	建外部表（external 表示表的路径在hdfs与本地上可以是任何路径，方便共享，不需要复制）
	create external table td_ext(id bigint, account string, income double, expenses double, time string) row format delimited fields terminated by '\t' location '/td_ext';

###### 4.分区表

    普通表和分区表区别：有大量数据增加的需要建分区表
	create table book (id bigint, name string) partitioned by (pubdate string) row format delimited fields terminated by '\t'; 

	分区表加载数据
	load data local inpath './book.txt' overwrite into table book partition (pubdate='2010-08-22');
	
	load data local inpath '/root/data.am' into table beauty partition (nation="USA");

	
	select nation, avg(size) from beauties group by nation order by avg(size);
    
上面加载使用了local关键字是因为用了本地的，如果是hdfs上的就不要了。  


#### 三、Hive高阶
hive 还支持集合类型，如map,list等

###### 1.数组型（collection items terminated by）

    //array 
    create table tab_array(a array<int>,b array<string>)
    row format delimited
    fields terminated by '\t'
    collection items terminated by ',';

    select a[0] from tab_array;
    select * from tab_array where array_contains(b,'word');
    insert into table tab_array select array(0),array(name,ip) from tab_ext t; 

###### 2.Map型（collection items terminated by and map keys terminated by）
    //map
    create table tab_map(name string,info map<string,string>)
    row format delimited
    fields terminated by '\t'
    collection items terminated by ','
    map keys terminated by ':';

    load data local inpath '/home/hadoop/hivetemp/tab_map.txt' overwrite into table tab_map;
    insert into table tab_map select name,map('name',name,'ip',ip) from tab_ext; 

###### 3.结构型
    //struct
    create table tab_struct(name string,info struct<age:int,tel:string,addr:string>)
    row format delimited
    fields terminated by '\t'
    collection items terminated by ','

    load data local inpath '/home/hadoop/hivetemp/tab_st.txt' overwrite into table tab_struct;
    insert into table tab_struct select name,named_struct('age',id,'tel',name,'addr',country) from tab_ext;
    
###### 4.批量插入

    //insert from select   通过select语句批量插入数据到别的表
    create table tab_ip_like like tab_ip;
    insert overwrite table tab_ip_like select * from tab_ip;

    //write to hdfs  将结果写入到hdfs的文件中
    insert overwrite local directory '/home/hadoop/hivetemp/test.txt' select * from tab_ip_part where part_flag='part1';    
    insert overwrite directory '/hiveout.txt' select * from tab_ip_part where part_flag='part1';

    //cli shell  通过shell执行hive的hql语句（*这里表前面需要家数据库点）
    hive -S -e 'select country,count(*) from tab_ext' > /home/hadoop/hivetemp/e.txt  

    select * from tab_ext sort by id desc limit 5;

    select a.ip,b.book from tab_ext a join tab_ip_book b on(a.name=b.name);
    
###### 5. 用户自定义函数
因为虽然本身自带了avg,sum等等通用函数，但有的时候你还是希望自己写。

    0.要继承org.apache.hadoop.hive.ql.exec.UDF类实现evaluate

    自定义函数调用过程：
    1.添加jar包（在hive命令行里面执行）
    hive> add jar /root/NUDF.jar;

    2.创建临时函数（关了再开就没了）
    hive> create temporary function getNation as 'cn.itcast.hive.udf.NationUDF';

    3.调用
    hive> select id, name, getNation(nation) from beauty;

    4.将查询结果保存到HDFS中
    hive> create table result row format delimited fields terminated by '\t' as select * from beauty order by id desc;	
    hive> select id, getAreaName(id) as name from tel_rec;


    create table result row format delimited fields terminated by '\t' as select id, getNation(nation) from beauties;
    
    
    
