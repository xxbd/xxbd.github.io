title: SpringBoot
author: 小小冰弟
date: 2018-04-03 15:11:34
tags: study
categories: Spring Boot
---
#### 一、什么是Spring Boot?
###### Spring Boot是由Pivotal团队提供的全新框架，其设计目的是用来简化新Spring应用的初始搭建以及开发过程。该框架使用了特定的方式来进行配置，从而使开发人员不再需要定义样板化的配置。

特性：
- 创建独立的Spring应用程序
- 嵌入的Tomcat，无需部署WAR文件
- 简化Maven配置，自动配置Spring
- 提供生产就绪型功能，如指标，健康检查和外部配置
- 开箱即用，没有代码生成，也无需XML配置。


#### 二、Spring Boot完美使用FastJson解析JSON数据
##### 1.引入fastjson依赖库
           
           
           <dependency>
			<groupId>com.alibaba</groupId>
			<artifactId>fastjson</artifactId>
			<version>1.2.15</version>
          </dependency>

##### 2.启动类继承extends WebMvcConfigurerAdapter

##### 3.覆盖方法configureMessageConverters

    @SpringBootApplication
    public class ApiCoreApp  extends WebMvcConfigurerAdapter {
	
	@Override
	public void configureMessageConverters(List<HttpMessageConverter<?>> converters) {
    	super.configureMessageConverters(converters);
		
        FastJsonHttpMessageConverter fastConverter = new FastJsonHttpMessageConverter();
 
        FastJsonConfig fastJsonConfig = new FastJsonConfig();
        fastJsonConfig.setSerializerFeatures(
                SerializerFeature.PrettyFormat
        );
        fastConverter.setFastJsonConfig(fastJsonConfig);
		
    	converters.add(fastConverter);
	}
    }
    
 #### 三、Spring Boot热部署
 
 
为什么需要热部署呢，因为你会发现即使做了一点点的变更，你也许也需要重新部署，这在工作上简直太耽误时间了。
 
 解决方法：
          
     在pom.xml文件添加依赖包：
     <plugin>
	          		<groupId>org.springframework.boot</groupId>
	          		<artifactId>spring-boot-maven-plugin </artifactId>
	          		<dependencies>  
			           <!--springloaded  hot deploy -->  
			           <dependency>  
			               <groupId>org.springframework</groupId>  
			               <artifactId>springloaded</artifactId>  
			               <version>1.2.4.RELEASE</version>
			           </dependency>  
			        </dependencies>  
			        <executions>  
			           <execution>  
			               <goals>  
			                   <goal>repackage</goal>  
			               </goals>  
			               <configuration>  
			                   <classifier>exec</classifier>  
			               </configuration>  
			           </execution>  
		       		</executions>
    </plugin>
 
 使用spring-boot:run 作为 Goals（run as maven build）
 
 
#### 四、springboot + devtools（热部署）

- spring-boot-devtools 是一个为开发者服务的一个模块，其中最重要的功能就是自动应用代码更改到最新的App上面去。原理是在发现代码有更改之后，重新启动应用，但是速度比手动停止后再启动还要更快，更快指的不是节省出来的手工操作的时间。
- 其深层原理是使用了两个ClassLoader，一个Classloader加载那些不会改变的类（第三方Jar包），另一个ClassLoader加载会更改的类，称为  restart ClassLoader,这样在有代码更改的时候，原来的restart ClassLoader 被丢弃，重新创建一个restart ClassLoader，由于需要加载的类相比较少，所以实现了较快的重启时间（5秒以内）

 ###### 步骤说明
 
    添加依赖包： 
    <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-devtools</artifactId>
            <optional>true</optional>
           <scope>true</scope>
    </dependency>
      添加spring-boot-maven-plugin：
      <build>
		<plugins>
		    <plugin>
	            <groupId>org.springframework.boot</groupId>
	            <artifactId>spring-boot-maven-plugin</artifactId>
	            <configuration>
	          		<!--fork :  如果没有该项配置，肯呢个devtools不会起作用，即应用不会restart -->
	                <fork>true</fork>
	            </configuration>
	        </plugin>
		</plugins>
    </build>
    
###### 补充说明    
1. devtools会监听classpath下的文件变动，并且会立即重启应用（发生在保存时机），注意：因为其采用的虚拟机机制，该项重启是很快的。
2. devtools可以实现页面热部署（即页面修改后会立即生效，这个可以直接在application.properties文件中配置spring.thymeleaf.cache=false来实现(这里注意不同的模板配置不一样)
 
    
    
#### 五、Spring Data
*Spring Data是一个用于简化数据库访问，并支持云服务的开源框架。其主要目标是使得数据库的访问变得方便快捷，并支持map-reduce框架和云计算数据服务。此外，它还支持基于关系型数据库的数据服务，如Oracle RAC等。对于拥有海量数据的项目，可以用Spring Data来简化项目的开发，就如Spring Framework对JDBC、ORM的支持一样，Spring Data会让数据的访问变得更加方便*

*可以极大的简化JPA的写法，可以在几乎不用写实现的情况下，实现对数据的访问和操作。除了CRUD外，还包括如分页、排序等一些常用的功能。所以Spring Data JPA的出现就是为了简化JPA的写法，让你只需要编写一个接口继承一个类就能实现CRUD操作了*



步骤：
    
  >1.在pom.xml添加mysql,spring-data-jpa依赖;
  
  
  
  
    <dependency>
		<groupId>mysql</groupId>
		<artifactId>mysql-connector-java</artifactId>
    </dependency>


    <dependency>
		    <groupId>org.springframework.boot</groupId>
		    <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>


>2.在application.properties文件中配置mysql连接配置文件;

    spring.datasource.url = jdbc:mysql://localhost:3306/test
    spring.datasource.username = root
    spring.datasource.password = root
    spring.datasource.driverClassName = com.mysql.jdbc.Driver
    spring.datasource.max-active=20
    spring.datasource.max-idle=8
    spring.datasource.min-idle=8
    spring.datasource.initial-size=10

>3.在application.properties文件中配置JPA配置信息;

    spring.jpa.database = MYSQL
    #Show or not log for each sql query
    spring.jpa.show-sql = true
    #Hibernate ddl auto (create, create-drop, update)
    spring.jpa.hibernate.ddl-auto = update
    #Naming strategy
    #[org.hibernate.cfg.ImprovedNamingStrategy  #org.hibernate.cfg.DefaultNamingStrategy]
    spring.jpa.hibernate.naming-strategy = org.hibernate.cfg.ImprovedNamingStrategy
    #stripped before adding them to the entity manager)
    spring.jpa.properties.hibernate.dialect = org.hibernate.dialect.MySQL5Dialect


##### 重点：Repository接口

 有这么几点需要强调下：
1. Repository是一个空接口，即是一个标记接口；
2. 若我们定义的接口继承了Repository，则该接口会被IOC容器识别为一个Repository Bean纳入到IOC容器中，进而可以在该接口中定义满足一定规范的方法。
3. 实际上也可以通过@RepositoryDefinition,注解来替代继承Repository接口，查询方法以find | read | get开头；
4. 涉及查询条件时，条件的属性用条件关键字连接，要注意的是条件属性以首字母大写。
5. 使用@Query注解可以自定义JPQL语句实现更灵活的查询。








##### CrudRepository 接口提供了最基本的对实体类的添删改查操作

 --T save(T entity);//保存单个实体   
 --Iterable<T> save(Iterable<? extends T> entities);//保存集合         
 --T findOne(ID id);//根据id查找实体          
 --Iterable<T> findAll();//查询所有实体,不用或慎用!          
 --long count();//查询实体数量          
 --void delete(ID id);//根据Id删除实体          
 --void delete(T entity);//删除一个实体   
 --void delete(Iterable<? extends T> entities);//删除一个实体的集合          
 --void deleteAll();//删除所有实体,不用或慎用!   



#### 六、全局异常捕捉

##### 步骤：


    新建一个类GlobalDefaultExceptionHandler，
    在class注解上@ControllerAdvice,
    在方法上注解上@ExceptionHandler(value = Exception.class)
    根据返回值判断要不要添加@responsebody注解
    @ControllerAdvice
    public class GlobalDefaultExceptionHandler{
	
	@ExceptionHandler(value = Exception.class)
	public void defaultErrorHandler(HttpServletRequest req, Exception e)  {
    }

 #### 七、配置Server
 
 ##### 在application.properties进行配置：

    #server.port=8080  端口号
    #server.address= # bind to a specific NIC
    #server.session-timeout= # session timeout in seconds
    #the context path, defaults to '/'
    #server.context-path=/spring-boot  访问路径
    #server.servlet-path= # the servlet path, defaults to '/'
    #server.tomcat.access-log-pattern= # log pattern of the access log
    #server.tomcat.access-log-enabled=false # is access logging enabled
    #server.tomcat.protocol-header=x-forwarded-proto # ssl forward headers
    #server.tomcat.remote-ip-header=x-forwarded-for
    #server.tomcat.basedir=/tmp # base dir (usually not needed, defaults to tmp)
    #server.tomcat.background-processor-delay=30; # in seconds
    #server.tomcat.max-threads = 0 # number of threads in protocol handler
    #server.tomcat.uri-encoding = UTF-8 # character encoding to use for URL decoding


#### 八、thymeleaf的使用


##### 1.在pom.xml中引入thymeleaf


    <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-thymeleaf</artifactId>
    </dependency>


##### 2.如何关闭thymeleaf缓存
     ########################################################
     ###THYMELEAF (ThymeleafAutoConfiguration)
     ########################################################
     #spring.thymeleaf.prefix=classpath:/templates/
     #spring.thymeleaf.suffix=.html
     #spring.thymeleaf.mode=HTML5
     #spring.thymeleaf.encoding=UTF-8
     # ;charset=<encoding> is added
     #spring.thymeleaf.content-type=text/html 
     # set to false for hot refresh
     spring.thymeleaf.cache=false   关闭缓存

###### 3.编写模板文件.html

    编写模板文件src/main/resouces/templates/hello.html:

    <!DOCTYPE html>
    <html xmlns="http://www.w3.org/1999/xhtml" xmlns:th="http://www.thymeleaf.org"
          xmlns:sec="http://www.thymeleaf.org/thymeleaf-extras-springsecurity3">
        <head>
            <title>Hello World!</title>
        </head>
        <body>
            <h1 th:inline="text">Hello.v.2</h1>
            <p th:text="${hello}"></p>
        </body>
    </html>

##### 4.编写访问模板文件controller

    @Controller
    public class TemplateController {

        /**
         * 返回html模板.
         */
        @RequestMapping("/helloHtml")
        public String helloHtml(Map<String,Object> map){
            map.put("hello","from TemplateController.helloHtml");
            return "/helloHtml";
        }

    }

#### 九、freemarker的使用

##### 1.在pom.xml中引入freemarker

    <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-freemarker</artifactId>
    </dependency>

##### 2.如何关闭freemarker缓存


    ########################################################
    ###FREEMARKER (FreeMarkerAutoConfiguration)
    ########################################################
    spring.freemarker.allow-request-override=false
    spring.freemarker.cache=true
    spring.freemarker.check-template-location=true
    spring.freemarker.charset=UTF-8
    spring.freemarker.content-type=text/html
    spring.freemarker.expose-request-attributes=false
    spring.freemarker.expose-session-attributes=false
    spring.freemarker.expose-spring-macro-helpers=false
    #spring.freemarker.prefix=
    #spring.freemarker.request-context-attribute=
    #spring.freemarker.settings.*=
    #spring.freemarker.suffix=.ftl
    #spring.freemarker.template-loader-path=classpath:/templates/ #comma-separated list
    #spring.freemarker.view-names= # whitelist of view names that can be resolved


##### 3.编写模板文件.ftl


    <!DOCTYPE html>
    <html xmlns="http://www.w3.org/1999/xhtml" xmlns:th="http://www.thymeleaf.org"
          xmlns:sec="http://www.thymeleaf.org/thymeleaf-extras-springsecurity3">
        <head>
            <title>Hello World!</title>
        </head>
        <body>
            <h1>Hello.v.2</h1>
            <p>${hello}</p>
        </body>
    </html>


##### 4.编写访问文件的controller
  
  
     @RequestMapping("/helloFtl")
      public String helloFtl(Map<String,Object> map){
          map.put("hello","from TemplateController.helloFtl");
          return "/helloFtl";
      }


#### 十、jsp的使用


##### 1.创建Maven web project

##### 2.在pom.xml文件添加依赖


      <!-- web支持: 1、web mvc; 2、restful; 3、jackjson支持; 4、aop ........ -->
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-web</artifactId>
		</dependency>

     <!-- servlet 依赖. -->
		<dependency>
			<groupId>javax.servlet</groupId>
			<artifactId>javax.servlet-api</artifactId>
			<scope>provided</scope>
		</dependency>



    JSTL（JSP Standard Tag Library，JSP标准标签库)是一个不断完善的开放源代码的JSP标签库，是由apache的jakarta小组来维护的。
    <dependency>
                <groupId>javax.servlet</groupId>
                <artifactId>jstl</artifactId>
            </dependency>

    <!-- tomcat 的支持.-->
            <dependency>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-starter-tomcat</artifactId>
                <scope>provided</scope>
            </dependency>
            <dependency>
                <groupId>org.apache.tomcat.embed</groupId>
                <artifactId>tomcat-embed-jasper</artifactId>
                <scope>provided</scope>
            </dependency>

##### 3.application.properties配置

    添加src/main/resources/application.properties：

    # 页面默认前缀目录
    spring.mvc.view.prefix=/WEB-INF/jsp/
    # 响应页面默认后缀
    spring.mvc.view.suffix=.jsp
    # 自定义属性，可以在Controller中读取
    application.hello=Hello Angel From application

##### 4.编写controller


    @Controller
    public class HelloController {
    private String hello;    

        @RequestMapping("/helloJsp")
        public String helloJsp(Map<String,Object> map){
            System.out.println("HelloController.helloJsp().hello=hello");
            map.put("hello", hello);
            return "helloJsp";
        }
    }
##### 5.编写jsp页面

    在 src/main 下面创建 webapp/WEB-INF/jsp 目录用来存放我们的jsp页面：helloJsp.jsp:

    <%@ page language="java" contentType="text/html; charset=UTF-8"
        pageEncoding="UTF-8"%>
    <!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
    <html>
    <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <title>Insert title here</title>
    </head>
    <body>
        helloJsp
        <hr>
        ${hello}

    </body>
    </html>

#### 十一、Mybatis的引用


##### 1.在pom.xml文件中引入相关依赖


    （1）基本依赖，jdk版本号；
    （2）mysql驱动，mybatis依赖包，mysql分页PageHelper:

    <!-- mysql 数据库驱动. -->
        <dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
    </dependency>	
    
    
    <!-- 
    	MyBatis提供了拦截器接口，我们可以实现自己的拦截器，
    	将其作为一个plugin装入到SqlSessionFactory中。 
		Github上有位开发者写了一个分页插件，我觉得使用起来还可以，挺方便的。 
		Github项目地址： https://github.com/pagehelper/Mybatis-PageHelper
     -->	
    <dependency>
	    <groupId>com.github.pagehelper</groupId>
	    <artifactId>pagehelper</artifactId>
	    <version>4.1.0</version>
	</dependency>	

    
    
    


##### 2.在application.properties添加配置文件

    ########################################################
    ###datasource
    ########################################################
    spring.datasource.url = jdbc:mysql://localhost:3306/test
    spring.datasource.username = root
    spring.datasource.password = root
    spring.datasource.driverClassName = com.mysql.jdbc.Driver
    spring.datasource.max-active=20
    spring.datasource.max-idle=8
    spring.datasource.min-idle=8
    spring.datasource.initial-size=10



##### 3.编写Demo测试类


    public class Demo {
	private long id;
	private String name;
      //省略getter and setter….
    }



##### 4.编写demoMapper

    public interface DemoMappper {
	
	@Select("select *from Demo where name = #{name}")
	public List<Demo> likeName(String name);
	
	@Select("select *from Demo where id = #{id}")
	public Demo getById(long id);
	
	@Select("select name from Demo where id = #{id}")
	public String getNameById(long id);
    }


##### 5.编写demoService

    @Service
    public class DemoService {
        @Autowired
        private DemoMappper demoMappper;

        public List<Demo> likeName(String name){
            return demoMappper.likeName(name);
        }
    }


##### 6.编写demoController
    @RestController
    public class DemoController {
        @Autowired
        private DemoService demoService;

        @RequestMapping("/likeName")
        public List<Demo> likeName(String name){
            return demoService.likeName(name);
        }

    }

##### 7.加入PageHelper


    @Configuration
    public class MyBatisConfiguration {

        @Bean
        public PageHelper pageHelper() {
            System.out.println("MyBatisConfiguration.pageHelper()");
            PageHelper pageHelper = new PageHelper();
            Properties p = new Properties();
            p.setProperty("offsetAsPageNum", "true");
            p.setProperty("rowBoundsWithCount", "true");
            p.setProperty("reasonable", "true");
            pageHelper.setProperties(p);
            return pageHelper;
        }
    }



    @RequestMapping("/likeName")
    public List<Demo> likeName(String name){
             PageHelper.startPage(1,1);
             return demoService.likeName(name);
    }


##### 8.获取自增长ID


    @Insert("insert into Demo(name,password) values(#{name},#{password})")
    public long save(Demo name);
    
    
    @Options(useGeneratedKeys = true, keyProperty = "id", keyColumn = "id") 







