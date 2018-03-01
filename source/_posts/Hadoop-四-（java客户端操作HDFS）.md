title: Hadoop(四)（java客户端操作HDFS）
author: 小小冰弟
tags: study
categories: Hadoop
date: 2018-03-01 09:18:28
---
##### 1.导包
没有maven环境，自己导包的话，找到share/hadoop目录下commons与hdfs文件下的jar包与lib下的所有包导入工程。

##### 2.准备工作
    //配置
    Configuration conf = new Configuration(); 
    //构造一个hdfs的客户端  
    FileSystem fs=FileSystem.get(new URI("hdfs://192.168.145.102:8020"), conf, "root");  

##### 3.基本操作 
     
    //从本地上传文件到hdfs中   
    @Test  
    public void Upload() throws IllegalArgumentException, IOException{ 
        Path hpath = new Path("/");
        Path lpath = "/home/wujian/jdk-7u65-linux-i586.tar.gz"
        fs.copyFromLocalFile(lpath, hpath);  
        fs.close();  
    }  
    
    // 从hdfs中下载文件到本地 
    @Test  
    public void Download() throws IllegalArgumentException, IOException{  
        Path hpath = new Path("/jdk-7u65-linux-i586.tar.gz");
        Path lpath = "/home/wujian/"
        fs.copyToLocalFile(hpath, lpath, true);  
        fs.close();  
    }  
      
    
    //文件夹操作  
    @Test  
    public void Dir() throws IllegalArgumentException, IOException{  
        //创建文件夹
        fs.mkdirs(new Path("/aaa"));  
          
        //判断是否存在 
        boolean exists = fs.exists(new Path("/aaa"));  
 
        fs.close();  
    }  
      
    //文件信息查看   
    @Test  
    public void FileStatus() throws FileNotFoundException, IllegalArgumentException, IOException{  
        //只能列出文件信息  
        RemoteIterator<LocatedFileStatus> listFiles = fs.listFiles(new Path("/"), true);  
        while(listFiles.hasNext()){  
            LocatedFileStatus fileStatus = listFiles.next();  
            System.out.println(fileStatus.getPath().getName());  
        }  
          
        System.out.println("-----------------------");  
        //能列出文件和文件夹信息  
        FileStatus[] listStatus = fs.listStatus(new Path("/"));  
        for(FileStatus f:listStatus){  
            String type="-";  
            if(f.isDirectory()){
             type="d"; 
            }
            System.out.println(type+"\t"+f.getPath().getName());  
        }  
        fs.close();  
    }  