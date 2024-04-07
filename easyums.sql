-- MySQL dump 10.13  Distrib 5.7.34, for osx10.16 (x86_64)
--
-- Host: localhost    Database: easyums
-- ------------------------------------------------------
-- Server version	5.7.34

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `client`
--

DROP TABLE IF EXISTS `client`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `client` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `secret` varchar(50) DEFAULT NULL,
  `redirect_uris` varchar(255) DEFAULT NULL,
  `scope` varchar(255) DEFAULT NULL,
  `name` varchar(50) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `status` tinyint(4) DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8 COMMENT='oauth客户端';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `client`
--

LOCK TABLES `client` WRITE;
/*!40000 ALTER TABLE `client` DISABLE KEYS */;
INSERT INTO `client` VALUES (1,'123','http://localhost:9528/easyblog/admin/#/oauth2/callback','123','测试客户端1','123',1);
/*!40000 ALTER TABLE `client` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `token`
--

DROP TABLE IF EXISTS `token`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `token` (
  `id` varchar(32) NOT NULL,
  `access_token` varchar(300) DEFAULT NULL COMMENT '访问令牌（长度先限定为300）',
  `refresh_token` varchar(300) DEFAULT NULL COMMENT '刷新令牌',
  `client_id` int(11) DEFAULT NULL COMMENT '客户端id',
  `scope` varchar(255) DEFAULT NULL COMMENT '授权范围',
  `user_id` int(11) DEFAULT NULL COMMENT '用户id',
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id_pk` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `token`
--

LOCK TABLES `token` WRITE;
/*!40000 ALTER TABLE `token` DISABLE KEYS */;
INSERT INTO `token` VALUES ('3d5229a7edf1484d8898d40dcbaa8e62','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbGllbnRJZCI6MSwidXNlcklkIjo0LCJ0b2tlbklkIjoiM2Q1MjI5YTdlZGYxNDg0ZDg4OThkNDBkY2JhYThlNjIiLCJ0eXBlIjoiYWNjZXNzX3Rva2VuIiwiaWF0IjoxNzEyMzExMTg4LCJleHAiOjE3MTIzMTgzODgsImlzcyI6ImVhc3l1bXMgb2F1dGgifQ.rFKUnsP0gRdwewq3ADVHaLEv7B0rlrU0LjuJ91fANL4','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbGllbnRJZCI6MSwidXNlcklkIjo0LCJ0b2tlbklkIjoiM2Q1MjI5YTdlZGYxNDg0ZDg4OThkNDBkY2JhYThlNjIiLCJ0eXBlIjoicmVmcmVzaF90b2tlbiIsImlhdCI6MTcxMjMxMTE4OCwiZXhwIjoxNzEyOTE1OTg4LCJpc3MiOiJlYXN5dW1zIG9hdXRoIn0.Vor1W20jjtWq2RrPp2syOuIU9mnh9AE9CGBCepAGNeA',1,'openid profile email',4),('487278e595724ea9950a772e1b18e842','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbGllbnRJZCI6MSwidXNlcklkIjoxLCJ0b2tlbklkIjoiNDg3Mjc4ZTU5NTcyNGVhOTk1MGE3NzJlMWIxOGU4NDIiLCJ0eXBlIjoiYWNjZXNzX3Rva2VuIiwiaWF0IjoxNzExOTQwNTMyLCJleHAiOjE3MTE5NDc3MzIsImlzcyI6ImVhc3l1bXMgb2F1dGgifQ.XByF75-476_YHUN8Ilsjx02zIyhJd2yAfyhg--_dujM','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbGllbnRJZCI6MSwidXNlcklkIjoxLCJ0b2tlbklkIjoiNDg3Mjc4ZTU5NTcyNGVhOTk1MGE3NzJlMWIxOGU4NDIiLCJ0eXBlIjoicmVmcmVzaF90b2tlbiIsImlhdCI6MTcxMTk0MDUzMiwiZXhwIjoxNzEyNTQ1MzMyLCJpc3MiOiJlYXN5dW1zIG9hdXRoIn0.pL8arO_t6MJ8LMjLYtxhKOCy1qMemaK1t6nVNAFFN6U',1,'openid profile',1);
/*!40000 ALTER TABLE `token` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(100) DEFAULT NULL COMMENT '用户名',
  `password` varchar(64) NOT NULL COMMENT '密码',
  `avatar` varchar(500) DEFAULT NULL COMMENT '用户头像，为一串url地址，默认为空。',
  `created_at` datetime(3) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL COMMENT '邮箱',
  `state` tinyint(4) DEFAULT '1' COMMENT '1正常，2禁用',
  `introduction` mediumtext COMMENT '简介',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (4,'测试用户1','202cb962ac59075b964b07152d234b70','','2024-04-04 13:48:01.349','2444016558@qq.com',1,'');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-04-07  8:44:27
