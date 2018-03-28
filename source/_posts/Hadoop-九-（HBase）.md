title: Hadoop(九)（HBase）
author: 小小冰弟
date: 2018-03-28 17:43:17
tags: study
categories: Hadoop
---
#### 一、HBase
&nbsp;&nbsp;与HDFS相比较，它是数据库，HDFS文件系统，普通文件不能支持快速读写，当你需要随机，实时读写访问便需要HBase了。另外HBase基本无事务特性，复杂的步骤也不适合，它的优势是可以hold住很大的表，几十亿行，几百万列。

#### 二、关系型数据库
相对于传统的关系型数据库，它建表时，不需要限定表中的字段，只需要指定若干个列族，插入数据时，列族中可以存储任意多个列，每一行有个唯一的行键，当要查询某一字段的值时（成为cell），需要指定坐标，表名>行键>列名>版本号（一个value可以有多个版本号，通过版本号区分）

#### 三、Hbase集群
每一个表在HBase中会被按照行键拆分，比如1~10000，10001~20000这样，每一个称为一个region,region存在region server上面，region的底层文件还是存在HDFS上面，众多的region server需要一个协调者，HMaser不负责存储数据，管理region server.

这里你会疑问，那么多的region,它怎么找到呢？先将1~10000，10001~20000，20001~30000，30001~40000的位置存放在META表中，分为1~~20000，20001~~40000两份，然后再合并为1~~~~40000存放在Root表上，而Root表放在Zookeeper上存储

#### 四、HBase命令行使用

    进入hbase命令行
    ./hbase shell

    显示hbase中的表
    list

    创建user表，包含info、data两个列族
    create 'user', 'info1', 'data1'
    create 'user', {NAME => 'info', VERSIONS => '3'}

    向user表中插入信息，row key为rk0001，列族info中添加name列标示符，值为zhangsan
    put 'user', 'rk0001', 'info:name', 'zhangsan'

    向user表中插入信息，row key为rk0001，列族info中添加gender列标示符，值为female
    put 'user', 'rk0001', 'info:gender', 'female'

    向user表中插入信息，row key为rk0001，列族info中添加age列标示符，值为20
    put 'user', 'rk0001', 'info:age', 20

    向user表中插入信息，row key为rk0001，列族data中添加pic列标示符，值为picture
    put 'user', 'rk0001', 'data:pic', 'picture'

    获取user表中row key为rk0001的所有信息
    get 'user', 'rk0001'

    获取user表中row key为rk0001，info列族的所有信息
    get 'user', 'rk0001', 'info'

    获取user表中row key为rk0001，info列族的name、age列标示符的信息
    get 'user', 'rk0001', 'info:name', 'info:age'

    获取user表中row key为rk0001，info、data列族的信息
    get 'user', 'rk0001', 'info', 'data'
    get 'user', 'rk0001', {COLUMN => ['info', 'data']}

    get 'user', 'rk0001', {COLUMN => ['info:name', 'data:pic']}

    获取user表中row key为rk0001，列族为info，版本号最新5个的信息
    get 'user', 'rk0001', {COLUMN => 'info', VERSIONS => 2}
    get 'user', 'rk0001', {COLUMN => 'info:name', VERSIONS => 5}
    get 'user', 'rk0001', {COLUMN => 'info:name', VERSIONS => 5, TIMERANGE => [1392368783980, 1392380169184]}

    获取user表中row key为rk0001，cell的值为zhangsan的信息
    get 'people', 'rk0001', {FILTER => "ValueFilter(=, 'binary:图片')"}

    获取user表中row key为rk0001，列标示符中含有a的信息
    get 'people', 'rk0001', {FILTER => "(QualifierFilter(=,'substring:a'))"}

    put 'user', 'rk0002', 'info:name', 'fanbingbing'
    put 'user', 'rk0002', 'info:gender', 'female'
    put 'user', 'rk0002', 'info:nationality', '中国'
    get 'user', 'rk0002', {FILTER => "ValueFilter(=, 'binary:中国')"}


    查询user表中的所有信息
    scan 'user'

    查询user表中列族为info的信息
    scan 'user', {COLUMNS => 'info'}
    scan 'user', {COLUMNS => 'info', RAW => true, VERSIONS => 5}
    scan 'persion', {COLUMNS => 'info', RAW => true, VERSIONS => 3}
    查询user表中列族为info和data的信息
    scan 'user', {COLUMNS => ['info', 'data']}
    scan 'user', {COLUMNS => ['info:name', 'data:pic']}


    查询user表中列族为info、列标示符为name的信息
    scan 'user', {COLUMNS => 'info:name'}

    查询user表中列族为info、列标示符为name的信息,并且版本最新的5个
    scan 'user', {COLUMNS => 'info:name', VERSIONS => 5}

    查询user表中列族为info和data且列标示符中含有a字符的信息
    scan 'user', {COLUMNS => ['info', 'data'], FILTER => "(QualifierFilter(=,'substring:a'))"}

    查询user表中列族为info，rk范围是[rk0001, rk0003)的数据
    scan 'people', {COLUMNS => 'info', STARTROW => 'rk0001', ENDROW => 'rk0003'}

    查询user表中row key以rk字符开头的
    scan 'user',{FILTER=>"PrefixFilter('rk')"}

    查询user表中指定范围的数据
    scan 'user', {TIMERANGE => [1392368783980, 1392380169184]}

    删除数据
    删除user表row key为rk0001，列标示符为info:name的数据
    delete 'people', 'rk0001', 'info:name'
    删除user表row key为rk0001，列标示符为info:name，timestamp为1392383705316的数据
    delete 'user', 'rk0001', 'info:name', 1392383705316


    清空user表中的数据
    truncate 'people'


    修改表结构
    首先停用user表（新版本不用）
    disable 'user'

    添加两个列族f1和f2
    alter 'people', NAME => 'f1'
    alter 'user', NAME => 'f2'
    启用表
    enable 'user'


    ###disable 'user'(新版本不用)
    删除一个列族：
    alter 'user', NAME => 'f1', METHOD => 'delete' 或 alter 'user', 'delete' => 'f1'

    添加列族f1同时删除列族f2
    alter 'user', {NAME => 'f1'}, {NAME => 'f2', METHOD => 'delete'}

    将user表的f1列族版本号改为5
    alter 'people', NAME => 'info', VERSIONS => 5
    启用表
    enable 'user'


    删除表
    disable 'user'
    drop 'user'


    get 'person', 'rk0001', {FILTER => "ValueFilter(=, 'binary:中国')"}
    get 'person', 'rk0001', {FILTER => "(QualifierFilter(=,'substring:a'))"}
    scan 'person', {COLUMNS => 'info:name'}
    scan 'person', {COLUMNS => ['info', 'data'], FILTER => "(QualifierFilter(=,'substring:a'))"}
    scan 'person', {COLUMNS => 'info', STARTROW => 'rk0001', ENDROW => 'rk0003'}

    scan 'person', {COLUMNS => 'info', STARTROW => '20140201', ENDROW => '20140301'}
    scan 'person', {COLUMNS => 'info:name', TIMERANGE => [1395978233636, 1395987769587]}
    delete 'person', 'rk0001', 'info:name'

    alter 'person', NAME => 'ffff'
    alter 'person', NAME => 'info', VERSIONS => 10


    get 'user', 'rk0002', {COLUMN => ['info:name', 'data:pic']}
    
    
#### 五、搭建HBase集群

1.上传hbase安装包

2.解压

3.配置hbase集群，要修改3个文件（首先zk集群已经安装好了）
	注意：要把hadoop的hdfs-site.xml和core-site.xml 放到hbase/conf下
	
	3.1修改hbase-env.sh
	export JAVA_HOME=/usr/java/jdk1.7.0_55
	//告诉hbase使用外部的zk
	export HBASE_MANAGES_ZK=false
	
	vim hbase-site.xml
	<configuration>
		<!-- 指定hbase在HDFS上存储的路径 -->
        <property>
                <name>hbase.rootdir</name>
                <value>hdfs://ns1/hbase</value>
        </property>
		<!-- 指定hbase是分布式的 -->
        <property>
                <name>hbase.cluster.distributed</name>
                <value>true</value>
        </property>
		<!-- 指定zk的地址，多个用“,”分割 -->
        <property>
                <name>hbase.zookeeper.quorum</name>
                <value>hadoop05:2181,hadoop06:2181,hadoop07:2181</value>
        </property>
	</configuration>
	
	vim regionservers
	hadoop03
	hadoop04
	hadoop05
	hadoop06
	
	3.2拷贝hbase到其他节点
		scp -r /weekend/hbase-0.96.2-hadoop2/ hadoop02:/weekend/
		scp -r /weekend/hbase-0.96.2-hadoop2/ hadoop03:/weekend/
		scp -r /weekend/hbase-0.96.2-hadoop2/ hadoop04:/weekend/
		scp -r /weekend/hbase-0.96.2-hadoop2/ hadoop05:/weekend/
		scp -r /weekend/hbase-0.96.2-hadoop2/ hadoop06:/weekend/
4.将配置好的HBase拷贝到每一个节点并同步时间。

5.启动所有的hbase
	分别启动zk
		./zkServer.sh start
	启动hbase集群
		start-dfs.sh
	启动hbase，在主节点上运行：
		start-hbase.sh
6.通过浏览器访问hbase管理页面
	192.168.1.201:60010
7.为保证集群的可靠性，要启动多个HMaster
	hbase-daemon.sh start master
	
#### 五、HBase的API操作


    package cn.itcast.bigdata.hbase;


    import java.util.List;

    import org.apache.hadoop.conf.Configuration;
    import org.apache.hadoop.hbase.Cell;
    import org.apache.hadoop.hbase.HBaseConfiguration;
    import org.apache.hadoop.hbase.HColumnDescriptor;
    import org.apache.hadoop.hbase.HTableDescriptor;
    import org.apache.hadoop.hbase.KeyValue;
    import org.apache.hadoop.hbase.TableName;
    import org.apache.hadoop.hbase.client.Delete;
    import org.apache.hadoop.hbase.client.Get;
    import org.apache.hadoop.hbase.client.HBaseAdmin;
    import org.apache.hadoop.hbase.client.HTable;
    import org.apache.hadoop.hbase.client.Put;
    import org.apache.hadoop.hbase.client.Result;
    import org.apache.hadoop.hbase.client.ResultScanner;
    import org.apache.hadoop.hbase.client.Scan;
    import org.apache.hadoop.hbase.filter.BinaryComparator;
    import org.apache.hadoop.hbase.filter.BinaryPrefixComparator;
    import org.apache.hadoop.hbase.filter.ByteArrayComparable;
    import org.apache.hadoop.hbase.filter.ColumnPrefixFilter;
    import org.apache.hadoop.hbase.filter.CompareFilter.CompareOp;
    import org.apache.hadoop.hbase.filter.FamilyFilter;
    import org.apache.hadoop.hbase.filter.Filter;
    import org.apache.hadoop.hbase.filter.MultipleColumnPrefixFilter;
    import org.apache.hadoop.hbase.filter.PrefixFilter;
    import org.apache.hadoop.hbase.filter.QualifierFilter;
    import org.apache.hadoop.hbase.filter.RegexStringComparator;
    import org.apache.hadoop.hbase.filter.RowFilter;
    import org.apache.hadoop.hbase.filter.SingleColumnValueFilter;
    import org.apache.hadoop.hbase.filter.SubstringComparator;
    import org.apache.hadoop.hbase.master.TableNamespaceManager;
    import org.apache.hadoop.hbase.util.Bytes;
    import org.junit.Before;
    import org.junit.Test;

    public class HbaseDemo {

	private Configuration conf = null;
	
	@Before
	public void init(){
		conf = HBaseConfiguration.create();
		conf.set("hbase.zookeeper.quorum", "hadoop05,hadoop06,hadoop07");
	}
	
	@Test
	public void testDrop() throws Exception{
		HBaseAdmin admin = new HBaseAdmin(conf);
		admin.disableTable("account");
		admin.deleteTable("account");
		admin.close();
	}
	
	@Test
	public void testPut() throws Exception{
		HTable table = new HTable(conf, "person_info");
		Put p = new Put(Bytes.toBytes("person_rk_bj_zhang_000002"));
		p.add("base_info".getBytes(), "name".getBytes(), "zhangwuji".getBytes());
		table.put(p);
		table.close();
	}
	
	@Test
	public void testGet() throws Exception{
		HTable table = new HTable(conf, "person_info");
		Get get = new Get(Bytes.toBytes("person_rk_bj_zhang_000001"));
		get.setMaxVersions(5);
		Result result = table.get(get);
		List<Cell> cells = result.listCells();
		
       //result.getValue(family, qualifier);  可以从result中直接取出一个特定的value
		
		//遍历出result中所有的键值对
		for(KeyValue kv : result.list()){
			String family = new String(kv.getFamily());
			System.out.println(family);
			String qualifier = new String(kv.getQualifier());
			System.out.println(qualifier);
			System.out.println(new String(kv.getValue()));
			
		}
		table.close();
	}
	
	/**
	 * 多种过滤条件的使用方法
	 * @throws Exception
	 */
	@Test
	public void testScan() throws Exception{
		HTable table = new HTable(conf, "person_info".getBytes());
		Scan scan = new Scan(Bytes.toBytes("person_rk_bj_zhang_000001"), Bytes.toBytes("person_rk_bj_zhang_000002"));
		
		//前缀过滤器----针对行键
		Filter filter = new PrefixFilter(Bytes.toBytes("rk"));
		
		//行过滤器
		ByteArrayComparable rowComparator = new BinaryComparator(Bytes.toBytes("person_rk_bj_zhang_000001"));
		RowFilter rf = new RowFilter(CompareOp.LESS_OR_EQUAL, rowComparator);
		
		/**
         * 假设rowkey格式为：创建日期_发布日期_ID_TITLE
         * 目标：查找  发布日期  为  2014-12-21  的数据
         */
        rf = new RowFilter(CompareOp.EQUAL , new SubstringComparator("_2014-12-21_"));
		
		
		//单值过滤器 1 完整匹配字节数组
		new SingleColumnValueFilter("base_info".getBytes(), "name".getBytes(), CompareOp.EQUAL, "zhangsan".getBytes());
		//单值过滤器2 匹配正则表达式
		ByteArrayComparable comparator = new RegexStringComparator("zhang.");
		new SingleColumnValueFilter("info".getBytes(), "NAME".getBytes(), CompareOp.EQUAL, comparator);

		//单值过滤器2 匹配是否包含子串,大小写不敏感
		comparator = new SubstringComparator("wu");
		new SingleColumnValueFilter("info".getBytes(), "NAME".getBytes(), CompareOp.EQUAL, comparator);

		//键值对元数据过滤-----family过滤----字节数组完整匹配
        FamilyFilter ff = new FamilyFilter(
                CompareOp.EQUAL , 
                new BinaryComparator(Bytes.toBytes("base_info"))   //表中不存在inf列族，过滤结果为空
                );
        //键值对元数据过滤-----family过滤----字节数组前缀匹配
        ff = new FamilyFilter(
                CompareOp.EQUAL , 
                new BinaryPrefixComparator(Bytes.toBytes("inf"))   //表中存在以inf打头的列族info，过滤结果为该列族所有行
                );
		
        
       //键值对元数据过滤-----qualifier过滤----字节数组完整匹配
        
        filter = new QualifierFilter(
                CompareOp.EQUAL , 
                new BinaryComparator(Bytes.toBytes("na"))   //表中不存在na列，过滤结果为空
                );
        filter = new QualifierFilter(
                CompareOp.EQUAL , 
                new BinaryPrefixComparator(Bytes.toBytes("na"))   //表中存在以na打头的列name，过滤结果为所有行的该列数据
        		);
		
        //基于列名(即Qualifier)前缀过滤数据的ColumnPrefixFilter
        filter = new ColumnPrefixFilter("na".getBytes());
        
        //基于列名(即Qualifier)多个前缀过滤数据的MultipleColumnPrefixFilter
        byte[][] prefixes = new byte[][] {Bytes.toBytes("na"), Bytes.toBytes("me")};
        filter = new MultipleColumnPrefixFilter(prefixes);
 
        //为查询设置过滤条件
        scan.setFilter(filter);
        
        
		scan.addFamily(Bytes.toBytes("base_info"));
		ResultScanner scanner = table.getScanner(scan);
		for(Result r : scanner){
			/**
			for(KeyValue kv : r.list()){
				String family = new String(kv.getFamily());
				System.out.println(family);
				String qualifier = new String(kv.getQualifier());
				System.out.println(qualifier);
				System.out.println(new String(kv.getValue()));
			}
			*/
			//直接从result中取到某个特定的value
			byte[] value = r.getValue(Bytes.toBytes("base_info"), Bytes.toBytes("name"));
			System.out.println(new String(value));
		}
		table.close();
	}
	
	
	@Test
	public void testDel() throws Exception{
		HTable table = new HTable(conf, "user");
		Delete del = new Delete(Bytes.toBytes("rk0001"));
		del.deleteColumn(Bytes.toBytes("data"), Bytes.toBytes("pic"));
		table.delete(del);
		table.close();
	}
	
	
	
	
	public static void main(String[] args) throws Exception {
		Configuration conf = HBaseConfiguration.create();
       //conf.set("hbase.zookeeper.quorum","hadoop05:2181,hadoop06:2181,hadoop07:2181");
            HBaseAdmin admin = new HBaseAdmin(conf);
		
		TableName tableName = TableName.valueOf("person_info");
		HTableDescriptor td = new HTableDescriptor(tableName);
		HColumnDescriptor cd = new HColumnDescriptor("base_info");
		cd.setMaxVersions(10);
		td.addFamily(cd);
		admin.createTable(td);
		
		admin.close();

	}
	
	

}

