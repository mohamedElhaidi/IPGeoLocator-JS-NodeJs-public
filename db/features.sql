/*
SQLyog Community v13.1.7 (64 bit)
MySQL - 10.4.20-MariaDB : Database - iplocator
*********************************************************************
*/

/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
CREATE DATABASE /*!32312 IF NOT EXISTS*/`iplocator` /*!40100 DEFAULT CHARACTER SET utf8mb4 */;

USE `iplocator`;

/*Table structure for table `features` */

DROP TABLE IF EXISTS `features`;

CREATE TABLE `features` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4;

/*Data for the table `features` */

insert  into `features`(`id`,`title`,`description`,`createdAt`,`updatedAt`) values 
(1,'Frequently updated database','','2022-09-13 10:06:11','2022-09-13 10:06:11'),
(2,'Commercial use allowed','','2022-09-13 10:06:11','2022-09-13 10:06:11'),
(3,'IPv4, IPv6 and domain queries','','2022-09-13 10:06:11','2022-09-13 10:06:11'),
(4,'API keys','','2022-09-13 10:06:11','2022-09-13 10:06:11'),
(5,'SSL (HTTPS)','','2022-09-13 10:06:11','2022-09-13 10:06:11'),
(6,'Usage statistics','','2022-09-13 10:06:11','2022-09-13 10:06:11'),
(7,'JSON(P), CSV, XML, Text, PHP, Batch','','2022-09-13 10:06:11','2022-09-13 10:06:11'),
(8,'Anycast network with 23 PoPs','','2022-09-13 10:06:11','2022-09-13 10:06:11'),
(9,'Customized support','','2022-09-13 10:06:11','2022-09-13 10:06:11'),
(10,'Access restrictions','','2022-09-13 10:06:11','2022-09-13 10:06:11'),
(11,'99.9% SLA','','2022-09-13 10:06:11','2022-09-13 10:06:11'),
(12,'Custom terms or agreements','','2022-09-13 10:06:11','2022-09-13 10:06:11');

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
