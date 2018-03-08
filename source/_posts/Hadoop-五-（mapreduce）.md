title: Hadoop(五)（Mapreduce的操作）
author: 小小冰弟
date: 2018-03-02 16:46:03
tags:
---
#### 一.Mapreduce（用来解决海量数据的运算）
MapReduce由两个阶段组成：Map和Reduce，用户只需要实现map()和reduce()两个函数，即可实现分布式计算，非常简单。Map是对单个的运算，reduce是将他们的结果汇总。

#### 二、实现Map函数


   
    
 #####  1.继承hadoop的mapper类
 Mapper&lt;KEYIN, VALUEIN, KEYOUT, VALUEOUT&gt;</br>
 四个泛型是因为需要输入输出参数，且都为键值对key-value形式封装。又因为hadoop将其序列化更加精简，所以使用的是hadoop封装的类型，如 long->LongWrite,String->Text
 
 ##### 2.实现mapper的map方法（每读取一行就调用一次该方法）
    //默认情况下，框架传递给我们的mapper的输入数据中，key是要处理的文本中一行的起始偏移量，这一行的内容作为value
    public class PPJMap extends Mapper<LongWritable, Text, Text, LongWritable>{
	@Override
	protected void map(LongWritable key, Text value,Context context)throws IOException, InterruptedException {
		//具体业务逻辑就写在这个方法体中，而且我们业务要处理的数据已经被框架传递进来，在方法的参数中 key-value
		//key 是这一行数据的起始偏移量     value 是这一行的文本内容
		//将这一行的内容转换成string类型
		String line = value.toString();
		//对这一行的文本按特定分隔符切分
		String[] words = StringUtils.split(line, " ");
		//遍历这个单词数组输出为kv形式  k：单词   v ： 1
		for(String word : words){
			context.write(new Text(word), new LongWritable(1));
		}
	}
	}
 
 
 
 #### 三、实现Reduce函数
    public class PPJReducer extends Reducer<Text, LongWritable, Text, LongWritable>{
	//框架在map处理完成之后，将所有kv对缓存起来，进行分组，然后传递一个组<key,valus{}>，调用一次reduce方法
	//<hello,{1,1,1,1,1,1.....}>
	@Override
	protected void reduce(Text key, Iterable<LongWritable> values,Context context)
			throws IOException, InterruptedException {

		long count = 0;
		//遍历求和
		for(LongWritable value:values){
			
			count += value.get();
		}
		//输出这一个单词的统计结果
		context.write(key, new LongWritable(count));
	}
	}
    

#### 四、配置job类（选择操作的Mapper,Reduce，操作的文件路径，操作结果路径）
    
		Job wcjob = Job.getInstance(new Configuration());
		
		//设置整个job所用的那些类在哪个jar包
		wcjob.setJarByClass(this class);
		
		
		//本job使用的mapper和reducer的类
		wcjob.setMapperClass(PPJMapper.class);
		wcjob.setReducerClass(PPJReducer.class);
		
		
		//指定reduce的输出数据kv类型
		wcjob.setOutputKeyClass(Text.class);
		wcjob.setOutputValueClass(LongWritable.class);
		
		//指定mapper的输出数据kv类型
		wcjob.setMapOutputKeyClass(Text.class);
		wcjob.setMapOutputValueClass(LongWritable.class);
		
		
		//指定要处理的输入数据存放路径
		FileInputFormat.setInputPaths(wcjob, new Path("hdfs://ppj2:8020/ppj/src/"));
		
		//指定处理结果的输出数据存放路径
		FileOutputFormat.setOutputPath(wcjob, new Path("hdfs://ppj2:8020/ppj/output/"));
		
		//将job提交给集群运行 
		wcjob.waitForCompletion(true);
        
        
        
#### 五、在hadoop上运行
    先上传目标文件
    hadoop fs -put 123.txt /ppj/ (没有路径需要先创建)
    执行jar包
    hadoop jar ppj2.jar (执行方法所在的全类名，不包含,class)
    
另外输出的文件夹不需要创建，因为他会自动创建