title: Bugs
author: 小小冰弟
tags: study
categories: bugs
date: 2018-03-01 10:47:20
---
##### 1.RPC模式下，由于客户端与服务端协议所在包名不一致导致的无法识别。
   Caused by: org.apache.hadoop.ipc.RemoteException(org.apache.hadoop.ipc.RpcServerException): Unknown protocol: com.ppj2.rp.LoginServiceInterface

这个就是因为我服务端放在com.ppj2.rpc包下，而客户端放在com.ppj2.rp包下导致的。

##### 2.之前没有卸载干净
[mysql装不上](https://www.cnblogs.com/qianzf/p/7078436.html)


##### 3.对于controller层中restTemplate无法autowired的情况

Description:
Field restTemplate in com.itmuch.cloud.controller.MovieController required a bean of type 'org.springframework.web.client.RestTemplate' that could not be found.

Action:
Consider defining a bean of type 'org.springframework.web.client.RestTemplate' in your configuration.
      
###### 这是因为没有找到RestTemplate的实例，因此为了解决该问题，我们在启动类中添加RestTemplate的Bean注解。

    @Bean
	public RestTemplate restTemplate(){
		return new RestTemplate();
	}