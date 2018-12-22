title: idea使用技巧
author: 小小冰弟
date: 2018-12-14 11:39:27
tags:
---
### 快捷键介绍
##### 1.常用快捷键

[快捷键大全](https://github.com/judasn/IntelliJ-IDEA-Tutorial/blob/master/keymap-introduce.md)


##### 2.Alt + Enter 
- 智能辅助（如在 接口类 中，如果光标当前所在的方法，已经在 接口实现类 中生成了，则此快捷键的效果是跳转。在接口类中添加一个方法后，让该 接口实现类 也跟着生成）
- 光标停留类名上，创建实现类，实现测试类
- 删除无用属性
- 添加属性的set,get方法
- 给调用的方法生成返回值
- 根据返回值自动强转

### file-template

使用方法：
1. settings -> Editor ->File And Code Templates
2. 添加模板

```
    /**
    *  ${DESCRIPTION}
    * @author${USER} 
    * @create ${YEAR}-${MONTH}-${DAY}  ${TIME}
    */
   
   
```



### Debug

**常用快捷键**：

F7:进入下一步，如果当前行断点是一个方法，则进入当前方法体内，如果该方法体还有方法，则不会进入该内嵌的方法中 

F8：进入下一步，如果当前行断点是一个方法，则不进入当前方法体内

F9：恢复程序运行，但是如果该断点下面代码还有断点则停在下一个断点上

ALT+F8：选中对象，弹出可输入计算表达式调试框，查看该输入内容的调试结果

CTRL+F8：设置光标当前行为断点，如果当前已经是断点则去掉断点

Drop Frame：这个不是一个快捷键，而是一个 Debug 面板上的按钮。该按钮可以用来退回到当前停住的断点的上一层方法上，可以让过掉的断点重新来过


**特殊技能**

1.给断点设置进入的条件

Ctrl + Shift + F8

- Pass count:控制次数
- Remove Once hit:进入一次后就自动删除
- Disabled util selected breakpoint is hit:设定必须在某些端点之后执行


### 推荐设置
- code completion(修改大小写提示，默认是区分大小写)
- Auto Import (导包设置，可以删除无用包并且在使用时候自动导入，同名需要ALT+ENTER)
- key map(先搜basic,然后删除，然后add第一个，建议CTRL+, 因为原来的加空格容易被占用)
- 添加行数与方法线

![添加行数与方法线](/uploads/pasted-27.png)

### 远程调试
本机修改：
1. 添加 Remote Server
2. 复制 Remote Server 自动生成的 JVM 参数
3. 在 Host 添加服务器的 IP 地址
4. 把刚刚复制参数加个前缀，变成：
```
Linux（有单引号）：export JAVA_OPTS='-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=5005'
Windows（没有单引号）：set JAVA_OPTS=-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=5005



```

服务器Tomcat配置(以 Linux 环境为例)：

- Tomcat 安装在 /usr/program/tomcat7
- Tomcat 的执行程序：/usr/program/tomcat7/bin/catalina.sh
- 编辑 Tomcat 执行程序：vim /usr/program/tomcat7/bin/catalina.sh（Windows 是编辑：catalina.bat）
- 在该文件的最上面，添加我们刚刚复制的那句话：export JAVA_OPTS='-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=5005'。
- 如果你的项目有特殊 JVM 参数，那你就把你的那部分参数和这部分参数合并在一起。


服务器 Jetty 配置
- jetty 不像Tomcat那样需要安装，只要有jetty的jar包就可以启动我们想要启动的应用。
- 在启动应用的时候加入之前上边我们copy的-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=5005就可以了。
- 就像这样：java-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=5005 -jar {your jetty path} {your port} --path {your war} 1>/dev/null 2>&1 &

开始调试:
- 启动服务器 Tomcat
- 启动本地 Remote Server
- 如果可以看到如效果，表示已经连接成功了，接下里就是跟往常一样，在本地代码上设置断点，然后你访问远程的地址，触发到该代码自动就会在本地停住。

console中出现 connected to the target VM address : 你的远程服务器ip地址