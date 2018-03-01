title: Bugs
author: 小小冰弟
date: 2018-03-01 10:47:20
tags: study
categories: bugs
---
##### 1.RPC模式下，由于客户端与服务端协议所在包名不一致导致的无法识别。
   Caused by: org.apache.hadoop.ipc.RemoteException(org.apache.hadoop.ipc.RpcServerException): Unknown protocol: com.ppj2.rp.LoginServiceInterface

这个就是因为我服务端放在com.ppj2.rpc包下，而客户端放在com.ppj2.rp包下导致的。