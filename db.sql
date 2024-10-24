/*
SQLyog Community v13.3.0 (64 bit)
MySQL - 10.4.11-MariaDB : Database - personal_budget
*********************************************************************
*/

/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
CREATE DATABASE /*!32312 IF NOT EXISTS*/`personal_budget` /*!40100 DEFAULT CHARACTER SET utf8mb4 */;

USE `personal_budget`;

/*Table structure for table `budgets` */

DROP TABLE IF EXISTS `budgets`;

CREATE TABLE `budgets` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `amount` decimal(10,2) NOT NULL,
  `category` enum('income','expense') NOT NULL,
  `description` varchar(255) NOT NULL,
  `date` date NOT NULL,
  `userId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  CONSTRAINT `budgets_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4;

/*Data for the table `budgets` */

insert  into `budgets`(`id`,`amount`,`category`,`description`,`date`,`userId`) values 
(14,1000.00,'expense','car fuel','2024-10-01',1),
(15,30000.00,'income','salary','2024-10-31',1),
(16,10000.00,'expense','asdsa','2024-10-02',1),
(17,10000.00,'expense','car repair','2024-10-29',1),
(18,10000.00,'expense','This is for exchange rate fact','2024-10-26',1),
(19,500.00,'income','donation','2024-02-21',1),
(20,1000.00,'expense','Petrol','2024-10-02',2),
(21,30000.00,'income','salary','2024-10-01',2),
(22,1000.00,'expense','jacket','2024-10-10',2),
(23,1000.00,'income','online','2024-10-19',2),
(24,30000.00,'income','salary','2024-09-30',3);

/*Table structure for table `categories` */

DROP TABLE IF EXISTS `categories`;

CREATE TABLE `categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `category_name` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4;

/*Data for the table `categories` */

insert  into `categories`(`id`,`category_name`) values 
(1,'income'),
(2,'expenses');

/*Table structure for table `user` */

DROP TABLE IF EXISTS `user`;

CREATE TABLE `user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(100) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4;

/*Data for the table `user` */

insert  into `user`(`id`,`username`,`password`) values 
(1,'tashi','$2b$10$1VMAVGfO1EhCV451S9lU7OF1Rkqx2NH1blKpKqUhlPL5FH.FCMpS.'),
(2,'yaez','$2b$10$OIoSPNQ4Zxrg8r4iOzgo8ego1hP5TEjmWWxmXzL0aOdkKadSU9Scm'),
(3,'tshering','$2b$10$Y3ucYjkq0nhJwcSWRSiDdOPcTu0d3zv/M8M/hLn8hKjvhpt2/CNGC');

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
