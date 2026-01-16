-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               11.7.2-MariaDB - mariadb.org binary distribution
-- Server OS:                    Win64
-- HeidiSQL Version:             12.12.0.7122
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for cattlemax
CREATE DATABASE IF NOT EXISTS `cattlemax` /*!40100 DEFAULT CHARACTER SET armscii8 COLLATE armscii8_bin */;
USE `cattlemax`;

-- Dumping structure for table cattlemax.animals
CREATE TABLE IF NOT EXISTS `animals` (
  `Ear Tag` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_mysql500_ci DEFAULT NULL,
  `Name` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_mysql500_ci DEFAULT NULL,
  `Dam Ear Tag` varchar(50) DEFAULT NULL,
  `Dam Name` varchar(50) DEFAULT NULL,
  `Animal Type` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_mysql500_ci DEFAULT NULL,
  `Category` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_mysql500_ci DEFAULT NULL,
  `Breed` varchar(80) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_mysql500_ci DEFAULT NULL,
  `Color Markings` varchar(80) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_mysql500_ci DEFAULT NULL,
  `Ownership` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_mysql500_ci DEFAULT NULL,
  `Birth Date` datetime DEFAULT NULL,
  `Death Date` datetime DEFAULT NULL,
  `Purchase Date` datetime DEFAULT NULL,
  `Purchase Price` decimal(28,10) DEFAULT NULL,
  `Age In Years` decimal(28,10) DEFAULT NULL,
  `Status` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_mysql500_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_uca1400_ai_ci;

-- Dumping data for table cattlemax.animals: ~137 rows (approximately)
REPLACE INTO `animals` (`Ear Tag`, `Name`, `Dam Ear Tag`, `Dam Name`, `Animal Type`, `Category`, `Breed`, `Color Markings`, `Ownership`, `Birth Date`, `Death Date`, `Purchase Date`, `Purchase Price`, `Age In Years`, `Status`) VALUES
	('1Blue', 'Spot', NULL, NULL, 'Cow', 'Breeders', 'Angus x Hereford', 'Black bald face', 'Hood Farms ', '2019-04-15 00:00:00', NULL, '2019-11-16 00:00:00', 700.0000000000, 3.6000000000, 'Sold'),
	('1Orange', 'Left', NULL, NULL, 'Cow', 'Breeders', 'Angus x Hereford', 'Black bald face', 'Hood Farms ', '2019-04-15 00:00:00', NULL, '2019-11-23 00:00:00', 700.0000000000, 5.7000000000, 'Sold'),
	('1Yellow', NULL, NULL, NULL, 'Cow', 'Breeders', 'Angus x Hereford', 'Black bald face', 'Hood Farms ', '2019-04-15 00:00:00', NULL, '2019-11-23 00:00:00', 700.0000000000, 3.6000000000, 'Sold'),
	('3', 'Tweedle Dee', NULL, NULL, 'Cow', 'Breeders', 'Angus x Hereford', 'Black bald face', 'Hood Farms ', '2019-04-15 00:00:00', NULL, '2019-11-23 00:00:00', 700.0000000000, 3.6000000000, 'Sold'),
	('3-24', NULL, '190-19', 'Socks', 'Calf', 'For sale', 'Angus', 'Black', 'Hood Farms ', '2024-07-08 00:00:00', NULL, NULL, NULL, 0.6000000000, 'Active'),
	('4', NULL, NULL, NULL, 'Cow', 'Breeders', 'Angus x Hereford', 'Black bald face', 'Hood Farms ', '2019-04-15 00:00:00', NULL, '2019-11-23 00:00:00', 700.0000000000, 3.6000000000, 'Sold'),
	('20-192', NULL, '192', NULL, 'Calf', 'For sale', 'Angus x Hereford', 'Black', 'Hood Farms ', '2020-02-14 00:00:00', '2021-02-18 00:00:00', NULL, NULL, 1.0000000000, 'Dead'),
	('20-233', 'Vaquero', '233', NULL, 'Calf', 'Harvested', 'Angus x Hereford', 'Black bald face', 'Hood Farms ', '2020-03-11 00:00:00', '2021-09-09 00:00:00', NULL, NULL, 1.5000000000, 'Dead'),
	('20-279', NULL, '279', '305', 'Calf', 'For sale', 'Mashona', 'Black', 'Hood Farms ', '2020-09-10 00:00:00', NULL, NULL, NULL, 2.2000000000, 'Sold'),
	('20-29W', NULL, '29W', 'Stephanie', 'Calf', 'For sale', 'Angus-Mashona', 'Black', 'Hood Farms ', '2020-09-03 00:00:00', '2020-09-03 00:00:00', NULL, NULL, 0.0000000000, 'Dead'),
	('20-39', 'Easter', '39Blu', 'Old Girl', 'Cow', 'Breeders', 'Angus-Mashona', 'Brown', 'Bruce Miles ', '2020-04-12 00:00:00', NULL, NULL, NULL, 4.8000000000, 'Active'),
	('20-49', 'Snuggy', '49Blu', 'La Barge', 'Calf', 'Dead', 'Angus-Mashona', 'Black', 'Greyson Moriarty ', '2020-09-08 00:00:00', '2021-11-16 00:00:00', NULL, NULL, 1.2000000000, 'Dead'),
	('20-53', NULL, '53Blu', 'Skull Face', 'Calf', 'Harvested', 'Angus x Hereford x Mashona', 'Black', 'Hood Farms ', '2020-08-12 00:00:00', '2022-07-20 00:00:00', NULL, NULL, 1.9000000000, 'Dead'),
	('20-54', NULL, '54Blu', NULL, 'Calf', 'For sale', 'Angus-Mashona', 'Black', 'Keagan Hood ', '2020-08-13 00:00:00', NULL, NULL, NULL, 2.3000000000, 'Sold'),
	('20-61', 'Rambo', '61Blu', 'Gabby', 'Calf', 'Harvested', 'Angus-Mashona', 'Black', 'Hood Farms ', '2020-03-08 00:00:00', '2021-09-09 00:00:00', NULL, NULL, 1.5000000000, 'Dead'),
	('20-68', 'Summer', '68Blue', NULL, 'Calf', 'Harvested', 'Angus-Mashona', 'Black', 'Hood Farms ', '2020-07-12 00:00:00', '2022-07-20 00:00:00', NULL, NULL, 2.0000000000, 'Dead'),
	('20-70', 'Mocha', '70Blue', 'Speck', 'Calf', 'Breeders', 'Angus x Hereford x Mashona', 'Black', 'Hood Farms ', '2020-06-30 00:00:00', NULL, NULL, NULL, 2.4000000000, 'Sold'),
	('21-190', NULL, '190', 'Blaze', 'Calf', 'For sale', 'Angus x Hereford x Mashona', 'Black', 'Hood Farms ', '2021-01-05 00:00:00', NULL, NULL, NULL, 4.1000000000, 'Active'),
	('21-1B', 'Red Bull', '1Blue', 'Spot', 'Calf', 'For sale', 'Angus x Hereford x Mashona', 'Red', 'Hood Farms ', '2021-06-23 00:00:00', NULL, NULL, NULL, NULL, 'Dead'),
	('21-233', '38', '233', NULL, 'Cow', 'Breeders', 'Angus x Hereford x Mashona', 'Black', 'Hood Farms ', '2021-06-22 00:00:00', NULL, NULL, NULL, 3.6000000000, 'Active'),
	('21-279', NULL, '279', '305', 'Cow', 'Breeders', 'Mashona', 'Brown', 'Hood Farms ', '2021-05-21 00:00:00', NULL, NULL, NULL, 3.7000000000, 'Active'),
	('21-285', NULL, '285', '286', 'Cow', 'Breeders', 'Mashona', 'Brown-black', 'Hood Farms ', '2021-03-03 00:00:00', NULL, NULL, NULL, 3.9000000000, 'Active'),
	('21-292', NULL, '292', '292', 'Calf', 'For sale', 'Mashona', 'Black', 'Hood Farms ', '2021-05-22 00:00:00', NULL, NULL, NULL, 3.7000000000, 'Active'),
	('21-3', NULL, '3', 'Tweedle Dee', 'Calf', 'For sale', 'Angus x Hereford x Mashona', 'Black bald face', 'Hood Farms ', '2021-06-03 00:00:00', NULL, NULL, NULL, 3.7000000000, 'Active'),
	('21-54', 'BB', '54Blu', NULL, 'Calf', 'For sale', 'Angus-Mashona', 'Black', 'Hood Farms ', '2021-06-16 00:00:00', NULL, NULL, NULL, 3.6000000000, 'Active'),
	('21-68', NULL, '68Blue', NULL, 'Cow', 'Breeders', 'Angus-Mashona', 'Black', 'Hood Farms ', '2021-07-01 00:00:00', NULL, NULL, NULL, 3.5000000000, 'Sold'),
	('22-01', NULL, '192', NULL, 'Calf', 'Breeders', 'Angus x Hereford x Mashona', 'Black bald face', 'Hood Farms ', '2022-05-05 00:00:00', NULL, NULL, NULL, 0.6000000000, 'Sold'),
	('22-02', NULL, '4', NULL, 'Calf', 'For sale', 'Angus x Hereford x Mashona', 'Black bald face', 'Hood Farms ', '2022-05-13 00:00:00', NULL, NULL, NULL, 2.7000000000, 'Active'),
	('22-03', NULL, '53Blu', 'Skull Face', 'Calf', 'For sale', 'Angus x Hereford x Mashona', 'Red bald face', 'Hood Farms ', '2022-06-06 00:00:00', NULL, NULL, NULL, 2.7000000000, 'Active'),
	('22-04', NULL, '1Yellow', NULL, 'Calf', 'Breeders', 'Angus x Hereford x Mashona', 'Black', 'Hood Farms ', '2022-08-26 00:00:00', NULL, NULL, NULL, NULL, 'Sold'),
	('22-68', NULL, '68Blue', NULL, 'Calf', 'For sale', 'Angus', 'Black bald face', 'Hood Farms ', '2022-09-20 00:00:00', NULL, NULL, NULL, 0.1000000000, 'Sold'),
	('23-276', 'Little Red', '276', 'Red', 'Cow', 'Breeders', 'Mashona', 'Red', 'Hood Farms ', '2023-03-01 00:00:00', NULL, NULL, NULL, 1.9000000000, 'Active'),
	('24-01', NULL, '20-39', 'Easter', 'Calf', 'For sale', 'Angus-Mashona', 'Black', 'Hood Farms ', '2024-06-26 00:00:00', NULL, NULL, NULL, 0.6000000000, 'Active'),
	('24-276', NULL, '276', 'Red', 'Calf', 'For sale', 'Angus-Mashona', 'Black', 'Hood Farms ', '2024-07-16 00:00:00', NULL, NULL, NULL, 0.5000000000, 'Active'),
	('29W', 'Stephanie', NULL, NULL, 'Cow', 'Breeders', 'Angus', 'Black', 'Hood Farms ', '2017-12-04 00:00:00', NULL, '2018-06-02 00:00:00', 1200.0000000000, 2.9000000000, 'Sold'),
	('39', '39-1', '39Blu', 'Old Girl', 'Calf', 'For sale', 'Angus', 'Black', 'Hood Farms ', '2014-02-15 00:00:00', NULL, '2014-04-05 00:00:00', NULL, 0.7000000000, 'Sold'),
	('39', 'Janny', '39Blu', 'Old Girl', 'Calf', 'Breeders', 'Angus', 'Black', 'Hood Farms ', '2016-01-18 00:00:00', NULL, NULL, NULL, 0.7000000000, 'Sold'),
	('39-18', NULL, '39Blu', 'Old Girl', 'Calf', 'For sale', 'Angus x Charolais', 'Dusky white', 'Hood Farms ', '2018-10-27 00:00:00', NULL, NULL, NULL, 0.7000000000, 'Sold'),
	('39Blu', 'Old Girl', NULL, NULL, 'Cow', 'purchased', 'Angus', 'White splash on udder', 'Bruce Miles ', '2012-04-06 00:00:00', NULL, '2014-04-04 00:00:00', 1850.0000000000, 8.6000000000, 'Sold'),
	('39Yel', 'Little Bull', '39Blu', 'Old Girl', 'Bull', 'Breeders', 'Angus x Charolais', 'Dusky white', 'Hood Farms ', '2017-11-04 00:00:00', NULL, NULL, NULL, 1.8000000000, 'Sold'),
	('40', '40-1', NULL, NULL, 'Calf', 'For sale', 'Angus', 'Black', 'Hood Farms ', '2014-02-15 00:00:00', NULL, '2014-04-06 00:00:00', NULL, 0.7000000000, 'Sold'),
	('40Ora', 'Miss Aggie', NULL, NULL, 'Cow', 'purchased', 'Brangus', 'Black brindle', 'Hood Farms ', '2012-04-06 00:00:00', NULL, '2014-04-06 00:00:00', 1850.0000000000, 5.4000000000, 'Sold'),
	('40Yel', 'Bianca', '40Ora', 'Miss Aggie', 'Calf', 'Breeders', 'Angus x Charolais', 'Dusky white', 'Hood Farms ', '2016-11-18 00:00:00', NULL, NULL, NULL, 0.7000000000, 'Sold'),
	('41', NULL, NULL, NULL, 'Calf', 'For sale', 'Angus', 'Black', 'Hood Farms ', '2014-02-15 00:00:00', NULL, '2014-04-06 00:00:00', NULL, 0.7000000000, 'Sold'),
	('41Blu', 'Stupid', NULL, NULL, 'Cow', 'Breeders', 'Brangus', 'Black', 'Hood Farms ', '2012-04-06 00:00:00', NULL, '2014-04-06 00:00:00', 1850.0000000000, 3.5000000000, 'Sold'),
	('42', NULL, '42Blu', 'Miss Piggy', 'Calf', 'For sale', 'Angus', 'Black', 'Hood Farms ', '2012-02-15 00:00:00', NULL, '2014-04-06 00:00:00', NULL, 2.7000000000, 'Sold'),
	('42Blu', 'Miss Piggy', NULL, NULL, 'Cow', 'Breeders', 'Angus', 'Black', 'Hood Farms ', '2012-04-05 00:00:00', NULL, '2014-04-06 00:00:00', 1850.0000000000, 5.4000000000, 'Sold'),
	('42Yel', 'Piglet', '42Blu', 'Miss Piggy', 'Calf', 'Breeders', 'Angus x Charolais', 'Dusky white', 'Hood Farms ', '2016-11-27 00:00:00', NULL, NULL, NULL, 0.7000000000, 'Sold'),
	('43Whi', 'Kirkpatrick 43', NULL, NULL, 'Bull', 'Rented', 'Charolais', 'White', 'Hood Farms ', NULL, NULL, '2017-11-24 00:00:00', NULL, NULL, 'Reference'),
	('44', 'Spooky', '44Grn', NULL, 'Calf', 'Breeders', 'Angus', 'Black', 'Hood Farms ', '2015-10-26 00:00:00', NULL, NULL, NULL, 0.9000000000, 'Sold'),
	('44Grn', NULL, NULL, NULL, 'Cow', 'Breeders', 'Angus', 'Black', 'Hood Farms ', '2013-04-23 00:00:00', NULL, '2015-04-23 00:00:00', 2300.0000000000, 4.3000000000, 'Sold'),
	('44Yel', '44-2', '44Grn', NULL, 'Calf', 'For sale', 'Angus x Charolais', 'Dusky white', 'Hood Farms ', '2016-11-09 00:00:00', NULL, NULL, NULL, 0.8000000000, 'Sold'),
	('45', 'Smoke', '45Ora', NULL, 'Calf', 'For sale', 'Angus x Charolais', 'Dusky white', 'Hood Farms ', '2015-10-10 00:00:00', NULL, NULL, NULL, 1.0000000000, 'Sold'),
	('45', NULL, '45Ora', NULL, 'Calf', NULL, 'Angus x Charolais', 'Dusky white', 'Hood Farms ', '2016-11-24 00:00:00', '2016-11-24 00:00:00', NULL, NULL, 0.0000000000, 'Dead'),
	('45Ora', NULL, NULL, NULL, 'Cow', 'Breeders', 'Brangus', 'Black', 'John Miles ', '2013-04-23 00:00:00', NULL, '2015-04-23 00:00:00', 2300.0000000000, 4.3000000000, 'Sold'),
	('46', 'Daisy', '46Grn', NULL, 'Calf', 'Breeders', 'Angus', 'Black', 'Hood Farms ', '2015-09-08 00:00:00', NULL, NULL, NULL, 1.1000000000, 'Sold'),
	('46Grn', NULL, NULL, NULL, 'Cow', 'Breeders', 'Angus', 'Black', 'Bruce Miles ', '2010-04-23 00:00:00', NULL, '2015-04-23 00:00:00', 2300.0000000000, 7.3000000000, 'Sold'),
	('46Yel', '46-2', '46Grn', NULL, 'Calf', 'For sale', 'Angus x Charolais', 'Dusky white', 'Hood Farms ', '2016-11-09 00:00:00', NULL, NULL, NULL, 0.8000000000, 'Sold'),
	('47-18', 'Nina', '47Blu', NULL, 'Calf', NULL, 'Angus', 'Dusky white', 'Hood Farms ', '2018-10-23 00:00:00', NULL, NULL, NULL, 0.7000000000, 'Sold'),
	('47-19', NULL, '47Blu', NULL, 'Calf', 'For sale', 'Angus x Charolais', 'Dusky white', 'Hood Farms ', '2019-08-17 00:00:00', '2019-08-22 00:00:00', NULL, NULL, 0.0000000000, 'Dead'),
	('47Blu', NULL, NULL, NULL, 'Cow', 'purchased', 'Angus', 'Black', 'Hood Farms ', '2011-08-24 00:00:00', NULL, '2016-08-24 00:00:00', 1350.0000000000, 8.0000000000, 'Sold'),
	('47Y-18', NULL, '47Yel', '47-1', 'Calf', 'For sale', 'Angus x Charolais', 'Dusky white', 'Hood Farms ', '2018-12-18 00:00:00', NULL, NULL, NULL, 0.6000000000, 'Sold'),
	('47Yel', '47-1', '47Blu', NULL, 'Cow', 'Breeders', 'Angus', 'Black', 'Hood Farms ', '2017-02-21 00:00:00', NULL, NULL, NULL, 2.5000000000, 'Sold'),
	('48-18', NULL, '48Blu', NULL, 'Calf', 'Breeders', 'Angus x Charolais', 'Dusky white', 'Hood Farms ', '2018-10-05 00:00:00', NULL, NULL, NULL, 0.8000000000, 'Sold'),
	('48Blu', NULL, NULL, NULL, 'Cow', 'purchased', 'Angus', 'Black', 'Hood Farms ', '2011-08-24 00:00:00', NULL, '2016-08-24 00:00:00', 1350.0000000000, 8.0000000000, 'Sold'),
	('48Yel', '48-1', '48Blu', NULL, 'Calf', 'For sale', 'Angus', 'Black', 'Hood Farms ', '2017-04-18 00:00:00', NULL, NULL, NULL, 1.2000000000, 'Sold'),
	('49-18', 'Ferdinand', '49Blu', 'La Barge', 'Calf', 'For sale', 'Angus x Charolais', 'Dusky white', 'Hood Farms ', '2018-09-05 00:00:00', NULL, NULL, NULL, 0.9000000000, 'Sold'),
	('49-19', 'Hedda', '49Blu', 'La Barge', 'Calf', 'Harvested', 'Angus-Mashona', 'Black', 'Bruce Miles ', '2019-08-17 00:00:00', '2021-08-09 00:00:00', NULL, NULL, 2.0000000000, 'Dead'),
	('49Blu', 'La Barge', NULL, NULL, 'Cow', 'purchased', 'Angus', 'Black', 'Greyson Moriarty ', '2011-08-24 00:00:00', NULL, '2016-08-24 00:00:00', 1350.0000000000, 9.2000000000, 'Sold'),
	('49Yel', '49-1', '49Blu', 'La Barge', 'Calf', 'For sale', 'Angus', 'Black', 'Hood Farms ', '2017-04-14 00:00:00', NULL, NULL, NULL, 1.2000000000, 'Sold'),
	('50-18', 'Little 50', '50Blu', 'Big Mama', 'Calf', 'For sale', 'Angus x Charolais', 'Dusky white', 'Hood Farms ', '2018-09-22 00:00:00', NULL, NULL, NULL, 0.8000000000, 'Sold'),
	('50Blu', 'Big Mama', NULL, NULL, 'Cow', 'purchased', 'Angus', 'Black', 'Hood Farms ', '2011-08-24 00:00:00', NULL, '2016-08-24 00:00:00', 1350.0000000000, 8.0000000000, 'Sold'),
	('50Yel', '50-1', '50Blu', 'Big Mama', 'Cow', 'Breeders', 'Angus', 'Black', 'Hood Farms ', '2017-02-25 00:00:00', '2019-02-09 00:00:00', NULL, NULL, 2.0000000000, 'Dead'),
	('51Blu', '51Blu', NULL, NULL, 'Cow', 'purchased', 'Angus', 'Black', 'Hood Farms ', '2015-10-29 00:00:00', NULL, '2017-10-28 00:00:00', 1650.0000000000, 2.7000000000, 'Sold'),
	('51Yel', '51Yel', '51Blu', '51Blu', 'Calf', 'Breeders', 'Angus', 'Black', 'Hood Farms ', '2017-10-07 00:00:00', NULL, '2017-10-28 00:00:00', NULL, 1.8000000000, 'Sold'),
	('52Blu', NULL, NULL, NULL, 'Cow', 'purchased', 'Angus', 'Black brindle', 'Hood Farms ', '2015-10-29 00:00:00', NULL, '2017-10-28 00:00:00', 1650.0000000000, 2.7000000000, 'Sold'),
	('52Yel', NULL, '52Blu', NULL, 'Calf', 'purchased', 'Angus', 'Black', 'Hood Farms ', '2017-10-06 00:00:00', NULL, '2017-10-28 00:00:00', NULL, 0.7000000000, 'Sold'),
	('53-19', 'Emma', '53Blu', 'Skull Face', 'Cow', 'Breeders', 'Angus x Hereford x Mashona', 'Black', 'Keagan Hood ', '2019-05-24 00:00:00', NULL, NULL, NULL, 5.7000000000, 'Active'),
	('53Blu', 'Skull Face', NULL, NULL, 'Cow', 'purchased', 'Angus x Hereford', 'Black bald face', 'Hood Farms ', '2015-10-29 00:00:00', NULL, '2017-10-28 00:00:00', 1650.0000000000, 7.0000000000, 'Sold'),
	('53Yel ', NULL, '53Blu', 'Skull Face', 'Calf', 'purchased', 'Angus x Hereford', 'Black bald face', 'Hood Farms ', '2017-10-06 00:00:00', NULL, '2017-10-28 00:00:00', NULL, 0.7000000000, 'Sold'),
	('54-18', NULL, '54Blu', NULL, 'Calf', 'For sale', 'Angus x Charolais', 'Dusky white', 'Hood Farms ', '2018-11-02 00:00:00', NULL, NULL, NULL, 0.7000000000, 'Sold'),
	('54-19', 'Batman', '54Blu', NULL, 'Calf', 'Harvested', 'Angus-Mashona', 'Black', 'Hood Farms ', '2019-08-25 00:00:00', '2020-09-02 00:00:00', NULL, NULL, 1.0000000000, 'Dead'),
	('54Blu', NULL, NULL, NULL, 'Cow', 'purchased', 'Angus', 'Black', 'Keagan Hood ', '2013-10-29 00:00:00', NULL, '2017-10-28 00:00:00', 1650.0000000000, 9.0000000000, 'Sold'),
	('54Yel ', NULL, '54Blu', NULL, 'Calf', 'purchased', 'Angus', 'Black', 'Hood Farms ', '2017-10-06 00:00:00', NULL, '2017-10-28 00:00:00', NULL, 0.7000000000, 'Sold'),
	('55Blu', NULL, NULL, NULL, 'Cow', 'purchased', 'Angus', 'Black', 'Hood Farms ', '2012-10-29 00:00:00', NULL, '2017-10-28 00:00:00', 1650.0000000000, 5.7000000000, 'Sold'),
	('55Yel ', NULL, '55Blu', NULL, 'Calf', 'purchased', 'Angus', 'Black', 'Hood Farms ', '2017-10-06 00:00:00', NULL, '2017-10-28 00:00:00', NULL, 0.8000000000, 'Sold'),
	('56Blu', NULL, NULL, NULL, 'Cow', 'purchased', 'Angus', 'Black', 'Hood Farms ', '2012-10-29 00:00:00', NULL, '2017-10-28 00:00:00', 1650.0000000000, 5.7000000000, 'Sold'),
	('56Yel', NULL, '56Blu', NULL, 'Calf', 'purchased', 'Angus x Hereford', 'Black bald face', 'Hood Farms ', '2017-10-06 00:00:00', NULL, '2017-10-28 00:00:00', NULL, 0.7000000000, 'Sold'),
	('57Blu', '57Blu', NULL, NULL, 'Cow', 'Breeders', 'Angus', 'Black', 'Hood Farms ', '2016-03-10 00:00:00', NULL, '2018-03-10 00:00:00', 1600.0000000000, NULL, 'Sold'),
	('57Blu', '57Blu', '57Blu', '57Blu', 'Cow', 'Breeders', 'Angus', 'Black', 'Hood Farms ', '2018-02-15 00:00:00', NULL, '2018-03-10 00:00:00', NULL, 1.5000000000, 'Sold'),
	('58Blu', '58Blu', NULL, NULL, 'Cow', 'Breeders', 'Angus', 'Black', 'Hood Farms ', '2016-03-10 00:00:00', NULL, '2018-03-10 00:00:00', 1600.0000000000, 2.4000000000, 'Sold'),
	('58Blu', '58Blu', '58Blu', '58Blu', 'Calf', 'Breeders', 'Angus', 'Black', 'Hood Farms ', '2018-02-15 00:00:00', NULL, '2018-03-10 00:00:00', NULL, 1.4000000000, 'Sold'),
	('59Blu', '59Blu', NULL, NULL, 'Cow', 'Breeders', 'Angus', 'Black', 'Hood Farms ', '2016-03-10 00:00:00', NULL, '2018-03-10 00:00:00', 1600.0000000000, 2.4000000000, 'Sold'),
	('59Blu', '59Blu', '59Blu', '59Blu', 'Calf', 'purchased', 'Angus', 'Black', 'Hood Farms ', '2018-02-15 00:00:00', NULL, '2018-03-10 00:00:00', NULL, 0.4000000000, 'Sold'),
	('60Blu', '60Blu', NULL, NULL, 'Cow', 'Breeders', 'Angus', 'Black', 'Hood Farms ', '2016-03-10 00:00:00', NULL, '2018-03-10 00:00:00', 1600.0000000000, 2.4000000000, 'Sold'),
	('60Blu', '60Blu', '60Blu', '60Blu', 'Calf', 'purchased', 'Angus', 'Black', 'Hood Farms ', '2018-02-15 00:00:00', NULL, '2018-03-10 00:00:00', NULL, 0.4000000000, 'Sold'),
	('61-19', 'Audrey', '61Blu', '61Blu', 'Calf', NULL, 'Angus x Charolais', 'Dusky white', 'Hood Farms ', '2019-02-13 00:00:00', NULL, NULL, NULL, 0.4000000000, 'Sold'),
	('61Blu', '61Blu', NULL, NULL, 'Cow', 'Breeders', 'Angus', 'Black', 'Hood Farms ', '2016-03-10 00:00:00', '2018-03-15 00:00:00', '2018-03-10 00:00:00', 1600.0000000000, 2.0000000000, 'Dead'),
	('61Blu', 'Gabby', '61Blu', '61Blu', 'Cow', 'Breeders', 'Brangus', 'Black', 'Hood Farms ', '2018-02-23 00:00:00', NULL, '2018-03-10 00:00:00', NULL, 2.7000000000, 'Sold'),
	('62-18', NULL, '62Blue', NULL, 'Calf', 'For sale', 'Angus', 'Black', 'Hood Farms ', '2018-08-15 00:00:00', '2018-11-20 00:00:00', NULL, NULL, 0.3000000000, 'Dead'),
	('62Blue', NULL, NULL, NULL, 'Cow', 'Breeders', 'Angus', 'Black', 'Hood Farms ', NULL, NULL, '2018-10-05 00:00:00', 1475.0000000000, NULL, 'Sold'),
	('63-18', NULL, '63Blue', NULL, 'Calf', 'For sale', 'Angus', 'Black', 'Hood Farms ', '2018-08-15 00:00:00', NULL, NULL, NULL, 1.0000000000, 'Sold'),
	('63-19b', 'Andy', '63Blue', NULL, 'Calf', NULL, 'Hereford-Angus-Charolais', 'Red bald face', 'Hood Farms ', '2019-06-15 00:00:00', '2019-08-06 00:00:00', NULL, NULL, 0.1000000000, 'Dead'),
	('63-19h', 'Angie', '63Blue', NULL, 'Calf', 'For sale', 'Hereford-Angus-Charolais', 'White', 'Hood Farms ', '2019-06-15 00:00:00', NULL, NULL, NULL, 0.2000000000, 'Sold'),
	('63Blue', NULL, NULL, NULL, 'Cow', 'Breeders', 'Hereford', 'Red bald face', 'Hood Farms ', NULL, NULL, '2018-10-05 00:00:00', 1475.0000000000, NULL, 'Sold'),
	('64-18', NULL, '64Blue', NULL, 'Calf', 'For sale', 'Angus', 'Black', 'Hood Farms ', '2018-08-15 00:00:00', NULL, NULL, NULL, 0.5000000000, 'Sold'),
	('64Blue', NULL, NULL, NULL, 'Cow', 'Breeders', 'Angus', 'Black', 'Hood Farms ', NULL, NULL, '2018-10-05 00:00:00', 1475.0000000000, NULL, 'Sold'),
	('65-18', NULL, '65Blue', NULL, 'Calf', 'For sale', 'Angus', 'Black', 'Hood Farms ', '2018-08-15 00:00:00', NULL, NULL, NULL, 0.5000000000, 'Sold'),
	('65Blue', NULL, NULL, NULL, 'Cow', 'Breeders', 'Angus', 'Black', 'Hood Farms ', NULL, NULL, '2018-10-05 00:00:00', 1475.0000000000, NULL, 'Sold'),
	('66-18', NULL, '66Blue', NULL, 'Calf', 'Breeders', 'Angus', 'Black', 'Hood Farms ', '2018-08-15 00:00:00', NULL, NULL, NULL, 0.5000000000, 'Sold'),
	('66Blue', NULL, NULL, NULL, 'Cow', 'Breeders', 'Brangus', 'Black', 'Hood Farms ', '2014-10-26 00:00:00', NULL, '2018-10-26 00:00:00', 1290.0000000000, 4.8000000000, 'Sold'),
	('67-18', NULL, '67Blue', NULL, 'Calf', 'For sale', 'Angus', 'Black', 'Hood Farms ', '2018-08-15 00:00:00', NULL, NULL, NULL, 0.5000000000, 'Sold'),
	('67Blue', NULL, NULL, NULL, 'Cow', 'Breeders', 'Angus', 'Black', 'Hood Farms ', '2014-10-26 00:00:00', NULL, '2018-10-26 00:00:00', 1290.0000000000, 4.8000000000, 'Sold'),
	('68-18', NULL, '68Blue', NULL, 'Calf', 'For sale', 'Angus', 'Black', 'Hood Farms ', '2018-08-15 00:00:00', NULL, NULL, NULL, 0.9000000000, 'Sold'),
	('68-19', 'Dahlia', '68Blue', NULL, 'Calf', 'Harvested', 'Angus-Mashona', 'Black', 'Hood Farms ', '2019-08-28 00:00:00', '2021-08-09 00:00:00', NULL, NULL, 1.9000000000, 'Dead'),
	('68Blue', NULL, NULL, NULL, 'Cow', 'Breeders', 'Angus', 'Black', 'Hood Farms ', '2016-10-26 00:00:00', NULL, '2018-10-26 00:00:00', 1290.0000000000, 6.0000000000, 'Sold'),
	('69-18', NULL, '69Blue', NULL, 'Calf', 'For sale', 'Angus', 'Black', 'Hood Farms ', '2018-08-15 00:00:00', NULL, NULL, NULL, 0.5000000000, 'Sold'),
	('69Blue', NULL, NULL, NULL, 'Cow', 'Breeders', 'Angus', 'Black', 'Hood Farms ', '2013-10-26 00:00:00', NULL, '2018-10-26 00:00:00', 1290.0000000000, 5.8000000000, 'Sold'),
	('70-18', NULL, '70Blue', 'Speck', 'Calf', 'Breeders', 'Angus x Hereford', 'Black bald face', 'Hood Farms ', '2018-05-15 00:00:00', NULL, NULL, NULL, 0.7000000000, 'Sold'),
	('70-19', 'Jack', '70Blue', 'Speck', 'Calf', 'Harvested', 'Angus x Hereford x Mashona', 'Black', 'Hood Farms ', '2019-06-24 00:00:00', '2020-09-02 00:00:00', NULL, NULL, 1.2000000000, 'Dead'),
	('70Blue', 'Speck', NULL, NULL, 'Cow', 'Breeders', 'Angus x Hereford', 'Black bald face', 'Hood Farms ', '2014-10-26 00:00:00', NULL, '2018-10-26 00:00:00', 1290.0000000000, 8.0000000000, 'Sold'),
	('71-18', NULL, '71Blue', NULL, 'Calf', 'For sale', 'Brangus', 'Black brindle', 'Hood Farms ', '2018-06-25 00:00:00', NULL, NULL, NULL, 0.6000000000, 'Sold'),
	('71Blue', NULL, NULL, NULL, 'Cow', 'Breeders', 'Hereford', 'Red bald face', 'Zelenovic ', '2013-10-26 00:00:00', NULL, '2018-10-26 00:00:00', 1290.0000000000, 5.8000000000, 'Sold'),
	('190', 'Blaze', NULL, NULL, 'Cow', 'Breeders', 'Angus x Hereford', 'Black bald face', 'Hood Farms ', '2014-11-19 00:00:00', NULL, '2019-11-16 00:00:00', 1150.0000000000, 7.9000000000, 'Sold'),
	('190-19', 'Socks', '190', 'Blaze', 'Cow', 'Breeders', 'Angus x Hereford', 'Black bald face', 'Hood Farms ', '2019-11-19 00:00:00', NULL, NULL, NULL, 5.2000000000, 'Active'),
	('192', NULL, NULL, NULL, 'Cow', 'Breeders', 'Angus x Hereford', 'Black bald face', 'Hood Farms ', '2014-11-19 00:00:00', NULL, '2019-11-16 00:00:00', 1150.0000000000, 7.9000000000, 'Sold'),
	('233', NULL, NULL, NULL, 'Cow', 'Breeders', 'Angus x Hereford', 'Black bald face', 'Hood Farms ', '2014-11-19 00:00:00', NULL, '2019-11-19 00:00:00', 1150.0000000000, 7.9000000000, 'Sold'),
	('276', 'Red', NULL, NULL, 'Cow', 'Breeders', 'Mashona', 'Red', 'Hood Farms ', NULL, NULL, '2019-12-14 00:00:00', 1000.0000000000, NULL, 'Active'),
	('279', '305', NULL, NULL, 'Cow', 'Breeders', 'Mashona', 'Black', 'Hood Farms ', NULL, NULL, '2019-12-14 00:00:00', 1000.0000000000, NULL, 'Sold'),
	('285', '286', NULL, NULL, 'Cow', 'Breeders', 'Mashona', 'Black', 'Hood Farms ', NULL, NULL, '2019-12-14 00:00:00', 1000.0000000000, NULL, 'Sold'),
	('291', '345', NULL, NULL, 'Cow', 'Breeders', 'Mashona', 'Black', 'Hood Farms ', NULL, NULL, '2019-12-14 00:00:00', 1000.0000000000, NULL, 'Sold'),
	('292', '292', NULL, NULL, 'Cow', 'Breeders', 'Mashona', 'Black', 'Hood Farms ', NULL, NULL, '2019-12-14 00:00:00', 1000.0000000000, NULL, 'Sold'),
	('416 Kirkpatrick Charolais bull', '416 Curly', NULL, NULL, 'Bull', 'Rented', 'Charolais', 'White', 'Kirkpatrick Cattle Company ', NULL, NULL, NULL, NULL, NULL, 'Reference'),
	('510 Mashona', '510 Mashona', NULL, NULL, 'Bull', 'Breeders', 'Mashona', 'Black', 'Hood Farms ', '2016-08-11 00:00:00', NULL, '2018-08-11 00:00:00', 1800.0000000000, 6.3000000000, 'Sold'),
	('Unknown', 'Unknown', NULL, NULL, 'Bull', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Reference'),
	('Whisenhunt Angus Bull 23', 'Whisenhunt Angus Bull 23', NULL, NULL, 'Bull', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Reference'),
	('27', NULL, NULL, NULL, 'Cow', 'Breeders', 'Angus x Hereford', 'Black bald face', 'Hood Farms', '2025-02-01 15:37:37', NULL, NULL, NULL, NULL, 'Active');

-- Dumping structure for table cattlemax.archive
CREATE TABLE IF NOT EXISTS `archive` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `createdAt` bigint(20) DEFAULT NULL,
  `fromModel` varchar(255) DEFAULT NULL,
  `originalRecord` longtext DEFAULT NULL,
  `originalRecordId` longtext DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Dumping data for table cattlemax.archive: ~0 rows (approximately)

-- Dumping structure for view cattlemax.herd_history
-- Creating temporary table to overcome VIEW dependency errors
CREATE TABLE `herd_history` (
	`Ear Tag` VARCHAR(1) NULL COLLATE 'utf8mb3_general_mysql500_ci',
	`Animal Type` VARCHAR(1) NULL COLLATE 'utf8mb3_general_mysql500_ci',
	`Category` VARCHAR(1) NULL COLLATE 'utf8mb3_general_mysql500_ci',
	`Breed` VARCHAR(1) NULL COLLATE 'utf8mb3_general_mysql500_ci',
	`Color Markings` VARCHAR(1) NULL COLLATE 'utf8mb3_general_mysql500_ci',
	`Ownership` VARCHAR(1) NULL COLLATE 'utf8mb3_general_mysql500_ci',
	`Birth Date` DATETIME NULL,
	`Death Date` DATETIME NULL,
	`Purchase Date` DATETIME NULL,
	`Purchase Price` DECIMAL(28,10) NULL,
	`Sale Date` DATETIME NULL,
	`Sale Price` DECIMAL(28,10) NULL,
	`Age In Years` DECIMAL(28,10) NULL,
	`Status` VARCHAR(1) NULL COLLATE 'utf8mb3_general_mysql500_ci',
	`Year Sold` INT(5) NULL,
	`Year harvested` INT(5) NULL,
	`Class` VARCHAR(1) NULL COLLATE 'utf8mb4_uca1400_ai_ci',
	`Species` VARCHAR(1) NULL COLLATE 'utf8mb4_uca1400_ai_ci'
);

-- Dumping structure for table cattlemax.pasture
CREATE TABLE IF NOT EXISTS `pasture` (
  `createdAt` bigint(20) DEFAULT NULL,
  `updatedAt` bigint(20) DEFAULT NULL,
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `pasture_name` varchar(255) DEFAULT NULL,
  `pasture_size` float DEFAULT NULL,
  `pasture_location` varchar(255) DEFAULT NULL,
  `pasture_map` varchar(255) DEFAULT NULL,
  `pasture_productivity` float DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Dumping data for table cattlemax.pasture: ~0 rows (approximately)

-- Dumping structure for table cattlemax.pasture_grazing_event
CREATE TABLE IF NOT EXISTS `pasture_grazing_event` (
  `pasture_name` varchar(30) DEFAULT NULL,
  `start_of_grazing` date DEFAULT NULL,
  `end_of_grazing` date DEFAULT NULL,
  `initial_grass_height` decimal(10,2) DEFAULT NULL,
  `final_grass_height` decimal(10,2) DEFAULT NULL,
  `id` int(20) NOT NULL AUTO_INCREMENT,
  `createdAt` int(11) DEFAULT NULL,
  `updatedAt` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Dumping data for table cattlemax.pasture_grazing_event: ~0 rows (approximately)

-- Dumping structure for table cattlemax.pasture_nutrient
CREATE TABLE IF NOT EXISTS `pasture_nutrient` (
  `pasture_name` varchar(30) DEFAULT NULL,
  `nutrient` varchar(20) DEFAULT NULL,
  `nutrient_target_level` decimal(10,2) DEFAULT NULL,
  `nutrient_level` decimal(10,2) DEFAULT NULL,
  `sample_id` varchar(100) DEFAULT NULL,
  `id` int(20) NOT NULL AUTO_INCREMENT,
  `createdAt` int(11) DEFAULT NULL,
  `updatedAt` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Dumping data for table cattlemax.pasture_nutrient: ~0 rows (approximately)

-- Dumping structure for table cattlemax.pasture_soil_samples
CREATE TABLE IF NOT EXISTS `pasture_soil_samples` (
  `pasture_name` varchar(30) DEFAULT NULL,
  `sample_date` date DEFAULT NULL,
  `sample_id` varchar(100) NOT NULL,
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `createdAt` int(11) DEFAULT NULL,
  `updatedAt` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Dumping data for table cattlemax.pasture_soil_samples: ~0 rows (approximately)

-- Dumping structure for table cattlemax.pasture_tasks
CREATE TABLE IF NOT EXISTS `pasture_tasks` (
  `pasture_name` varchar(30) DEFAULT NULL,
  `pasture_task` longtext DEFAULT NULL,
  `pasture_task_completed` tinyint(1) DEFAULT NULL,
  `id` int(20) NOT NULL AUTO_INCREMENT,
  `createdAt` int(11) DEFAULT NULL,
  `updatedAt` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Dumping data for table cattlemax.pasture_tasks: ~0 rows (approximately)

-- Dumping structure for table cattlemax.pasture_treatment
CREATE TABLE IF NOT EXISTS `pasture_treatment` (
  `pasture_name` varchar(30) DEFAULT NULL,
  `pasture_treatment` varchar(100) DEFAULT NULL,
  `chemical_or_mechanical` tinyint(1) DEFAULT NULL,
  `chemical_used` varchar(200) DEFAULT NULL,
  `mechanical_means_used` varchar(200) DEFAULT NULL,
  `rate_of_chem_application` decimal(10,3) DEFAULT NULL,
  `fuel_used` decimal(10,2) DEFAULT NULL,
  `date_treated` varchar(20) DEFAULT NULL,
  `id` int(20) NOT NULL AUTO_INCREMENT,
  `createdAt` int(11) DEFAULT NULL,
  `updatedAt` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Dumping data for table cattlemax.pasture_treatment: ~0 rows (approximately)

-- Dumping structure for table cattlemax.sales
CREATE TABLE IF NOT EXISTS `sales` (
  `Ear Tag` varchar(50) DEFAULT NULL,
  `Purchase Date` datetime DEFAULT NULL,
  `Purchase Price` decimal(28,10) DEFAULT NULL,
  `Birth Date` datetime DEFAULT NULL,
  `Animal Type` varchar(70) DEFAULT NULL,
  `Sale Ticket Sold To Contact` varchar(100) DEFAULT NULL,
  `Sale Ticket Sale Date` datetime DEFAULT NULL,
  `Sale Price` decimal(28,10) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Dumping data for table cattlemax.sales: ~102 rows (approximately)
REPLACE INTO `sales` (`Ear Tag`, `Purchase Date`, `Purchase Price`, `Birth Date`, `Animal Type`, `Sale Ticket Sold To Contact`, `Sale Ticket Sale Date`, `Sale Price`) VALUES
	('1Orange', '2019-11-23 00:00:00', 700.0000000000, '2019-04-15 00:00:00', 'Cow', 'Tri-County Livestock Market, Inc.', '2024-12-14 00:00:00', 1500.0000000000),
	('21-68', NULL, NULL, '2021-07-01 00:00:00', 'Cow', 'Tri-County Livestock Market, Inc.', '2024-12-14 00:00:00', 1327.2000000000),
	('285', '2019-12-14 00:00:00', 1000.0000000000, NULL, 'Cow', 'Tri-County Livestock Market, Inc.', '2024-12-14 00:00:00', 1175.0000000000),
	('291', '2019-12-14 00:00:00', 1000.0000000000, NULL, 'Cow', 'Tri-County Livestock Market, Inc.', '2024-12-14 00:00:00', 1625.0000000000),
	('1Blue', '2019-11-16 00:00:00', 700.0000000000, '2019-04-15 00:00:00', 'Cow', 'Tri-County Livestock Market, Inc.', '2022-12-03 00:00:00', 650.0000000000),
	('1Yellow', '2019-11-23 00:00:00', 700.0000000000, '2019-04-15 00:00:00', 'Cow', 'Tri-County Livestock Market, Inc.', '2022-12-03 00:00:00', 800.0000000000),
	('3', '2019-11-23 00:00:00', 700.0000000000, '2019-04-15 00:00:00', 'Cow', 'Tri-County Livestock Market, Inc.', '2022-12-03 00:00:00', 264.0000000000),
	('4', '2019-11-23 00:00:00', 700.0000000000, '2019-04-15 00:00:00', 'Cow', 'Tri-County Livestock Market, Inc.', '2022-12-03 00:00:00', NULL),
	('20-279', NULL, NULL, '2020-09-10 00:00:00', 'Calf', 'Tri-County Livestock Market, Inc.', '2022-12-03 00:00:00', 792.0000000000),
	('20-54', NULL, NULL, '2020-08-13 00:00:00', 'Calf', 'Tri-County Livestock Market, Inc.', '2022-12-03 00:00:00', 789.6000000000),
	('20-70', NULL, NULL, '2020-06-30 00:00:00', 'Calf', 'Tri-County Livestock Market, Inc.', '2022-12-03 00:00:00', 375.0000000000),
	('22-01', NULL, NULL, '2022-05-05 00:00:00', 'Calf', 'Tri-County Livestock Market, Inc.', '2022-12-03 00:00:00', 0.0000000000),
	('40', '2019-08-10 00:00:00', 250.0000000000, '2019-04-15 00:00:00', 'Bull', 'Tri-County Livestock Market, Inc.', '2022-12-03 00:00:00', 100.0000000000),
	('279', '2019-12-14 00:00:00', 1000.0000000000, NULL, 'Cow', 'Tri-County Livestock Market, Inc.', '2022-12-03 00:00:00', 275.0000000000),
	('292', '2019-12-14 00:00:00', 1000.0000000000, NULL, 'Cow', 'Tri-County Livestock Market, Inc.', '2022-12-03 00:00:00', 275.0000000000),
	('510 Mashona', '2018-08-11 00:00:00', 1800.0000000000, '2016-08-11 00:00:00', 'Bull', 'Tri-County Livestock Market, Inc.', '2022-12-03 00:00:00', 920.1500000000),
	('22-68', NULL, NULL, '2022-09-20 00:00:00', 'Calf', 'Tri-County Livestock Market, Inc.', '2022-10-15 00:00:00', 190.0000000000),
	('53Blu', '2017-10-28 00:00:00', 1650.0000000000, '2015-10-29 00:00:00', 'Cow', 'Tri-County Livestock Market, Inc.', '2022-10-15 00:00:00', 514.5000000000),
	('54Blu', '2017-10-28 00:00:00', 1650.0000000000, '2013-10-29 00:00:00', 'Cow', 'Tri-County Livestock Market, Inc.', '2022-10-15 00:00:00', 332.5000000000),
	('68Blue', '2018-10-26 00:00:00', 1290.0000000000, '2016-10-26 00:00:00', 'Cow', 'Tri-County Livestock Market, Inc.', '2022-10-15 00:00:00', 687.3000000000),
	('70Blue', '2018-10-26 00:00:00', 1290.0000000000, '2014-10-26 00:00:00', 'Cow', 'Tri-County Livestock Market, Inc.', '2022-10-15 00:00:00', 755.5500000000),
	('190', '2019-11-16 00:00:00', 1150.0000000000, '2014-11-19 00:00:00', 'Cow', 'Tri-County Livestock Market, Inc.', '2022-10-15 00:00:00', 543.4000000000),
	('192', '2019-11-16 00:00:00', 1150.0000000000, '2014-11-19 00:00:00', 'Cow', 'Tri-County Livestock Market, Inc.', '2022-10-15 00:00:00', 649.6000000000),
	('233', '2019-11-19 00:00:00', 1150.0000000000, '2014-11-19 00:00:00', 'Cow', 'Tri-County Livestock Market, Inc.', '2022-10-15 00:00:00', 632.7000000000),
	('17-13', '2019-08-10 00:00:00', 150.0000000000, '2017-04-15 00:00:00', 'Cow', 'Scott & Nichole Smith', '2021-01-31 00:00:00', 175.0000000000),
	('29W', '2018-06-02 00:00:00', 1200.0000000000, '2017-12-04 00:00:00', 'Cow', 'Tri-County Livestock Market, Inc.', '2020-10-24 00:00:00', 435.0000000000),
	('39Blu', '2014-04-04 00:00:00', 1850.0000000000, '2012-04-06 00:00:00', 'Cow', 'Tri-County Livestock Market, Inc.', '2020-10-24 00:00:00', 189.9000000000),
	('49Blu', '2016-08-24 00:00:00', 1350.0000000000, '2011-08-24 00:00:00', 'Cow', 'Tri-County Livestock Market, Inc.', '2020-10-24 00:00:00', 750.6000000000),
	('61Blu', '2018-03-10 00:00:00', NULL, '2018-02-23 00:00:00', 'Cow', 'Tri-County Livestock Market, Inc.', '2020-10-24 00:00:00', 410.0000000000),
	('20-05-2', NULL, NULL, '2020-02-17 00:00:00', 'Calf', 'Juan SerrÃƒÂ­n', '2020-04-08 00:00:00', 45.0000000000),
	('20-07-2', NULL, NULL, '2020-02-17 00:00:00', 'Calf', 'Juan SerrÃƒÂ­n', '2020-04-08 00:00:00', 55.0000000000),
	('20-12-2', NULL, NULL, '2020-02-25 00:00:00', 'Calf', 'Juan SerrÃƒÂ­n', '2020-04-08 00:00:00', 45.0000000000),
	('39Yel', NULL, NULL, '2017-11-04 00:00:00', 'Bull', 'Tri-County Livestock Market, Inc.', '2019-08-31 00:00:00', 750.0000000000),
	('47Blu', '2016-08-24 00:00:00', 1350.0000000000, '2011-08-24 00:00:00', 'Cow', 'Tri-County Livestock Market, Inc.', '2019-08-31 00:00:00', 548.1000000000),
	('47Yel', NULL, NULL, '2017-02-21 00:00:00', 'Cow', 'Tri-County Livestock Market, Inc.', '2019-08-31 00:00:00', 875.0000000000),
	('48Blu', '2016-08-24 00:00:00', 1350.0000000000, '2011-08-24 00:00:00', 'Cow', 'Tri-County Livestock Market, Inc.', '2019-08-31 00:00:00', 700.0000000000),
	('50Blu', '2016-08-24 00:00:00', 1350.0000000000, '2011-08-24 00:00:00', 'Cow', 'Tri-County Livestock Market, Inc.', '2019-08-31 00:00:00', 725.0000000000),
	('57Blu', '2018-03-10 00:00:00', NULL, '2018-02-15 00:00:00', 'Cow', 'Tri-County Livestock Market, Inc.', '2019-08-31 00:00:00', 720.0000000000),
	('62Blue', '2018-10-05 00:00:00', 1475.0000000000, NULL, 'Cow', 'Tri-County Livestock Market, Inc.', '2019-08-31 00:00:00', 1075.0000000000),
	('63-18', NULL, NULL, '2018-08-15 00:00:00', 'Calf', 'Tri-County Livestock Market, Inc.', '2019-08-31 00:00:00', NULL),
	('63-19h', NULL, NULL, '2019-06-15 00:00:00', 'Calf', 'Tri-County Livestock Market, Inc.', '2019-08-31 00:00:00', 0.0000000000),
	('63Blue', '2018-10-05 00:00:00', 1475.0000000000, NULL, 'Cow', 'Tri-County Livestock Market, Inc.', '2019-08-31 00:00:00', 800.0000000000),
	('64Blue', '2018-10-05 00:00:00', 1475.0000000000, NULL, 'Cow', 'Tri-County Livestock Market, Inc.', '2019-08-31 00:00:00', 1100.0000000000),
	('65Blue', '2018-10-05 00:00:00', 1475.0000000000, NULL, 'Cow', 'Tri-County Livestock Market, Inc.', '2019-08-31 00:00:00', 382.5000000000),
	('66Blue', '2018-10-26 00:00:00', 1290.0000000000, '2014-10-26 00:00:00', 'Cow', 'Tri-County Livestock Market, Inc.', '2019-08-31 00:00:00', 925.0000000000),
	('67Blue', '2018-10-26 00:00:00', 1290.0000000000, '2014-10-26 00:00:00', 'Cow', 'Tri-County Livestock Market, Inc.', '2019-08-31 00:00:00', 750.0000000000),
	('69Blue', '2018-10-26 00:00:00', 1290.0000000000, '2013-10-26 00:00:00', 'Cow', 'Tri-County Livestock Market, Inc.', '2019-08-31 00:00:00', 900.0000000000),
	('71Blue', '2018-10-26 00:00:00', 1290.0000000000, '2013-10-26 00:00:00', 'Cow', 'Tri-County Livestock Market, Inc.', '2019-08-31 00:00:00', 725.0000000000),
	('39-18', NULL, NULL, '2018-10-27 00:00:00', 'Calf', 'Tri-County Livestock Market, Inc.', '2019-07-13 00:00:00', 717.7500000000),
	('47-18', NULL, NULL, '2018-10-23 00:00:00', 'Calf', 'Tri-County Livestock Market, Inc.', '2019-07-13 00:00:00', 448.5000000000),
	('47Y-18', NULL, NULL, '2018-12-18 00:00:00', 'Calf', 'Tri-County Livestock Market, Inc.', '2019-07-13 00:00:00', 313.5000000000),
	('48-18', NULL, NULL, '2018-10-05 00:00:00', 'Calf', 'Tri-County Livestock Market, Inc.', '2019-07-13 00:00:00', 648.0000000000),
	('49-18', NULL, NULL, '2018-09-05 00:00:00', 'Calf', 'Tri-County Livestock Market, Inc.', '2019-07-13 00:00:00', 670.0000000000),
	('50-18', NULL, NULL, '2018-09-22 00:00:00', 'Calf', 'Tri-County Livestock Market, Inc.', '2019-07-13 00:00:00', 737.5500000000),
	('51Yel', '2017-10-28 00:00:00', NULL, '2017-10-07 00:00:00', 'Calf', 'Tri-County Livestock Market, Inc.', '2019-07-13 00:00:00', 596.7500000000),
	('54-18', NULL, NULL, '2018-11-02 00:00:00', 'Calf', 'Tri-County Livestock Market, Inc.', '2019-07-13 00:00:00', 679.5000000000),
	('58Blu', '2018-03-10 00:00:00', NULL, '2018-02-15 00:00:00', 'Calf', 'Tri-County Livestock Market, Inc.', '2019-07-13 00:00:00', 487.5000000000),
	('61-19', NULL, NULL, '2019-02-13 00:00:00', 'Calf', 'Tri-County Livestock Market, Inc.', '2019-07-13 00:00:00', 320.0000000000),
	('68-18', NULL, NULL, '2018-08-15 00:00:00', 'Calf', 'Tri-County Livestock Market, Inc.', '2019-07-13 00:00:00', 584.3800000000),
	('64-18', NULL, NULL, '2018-08-15 00:00:00', 'Calf', 'Hunt Livestock Exchange', '2019-01-28 00:00:00', 505.0000000000),
	('65-18', NULL, NULL, '2018-08-15 00:00:00', 'Calf', 'Hunt Livestock Exchange', '2019-01-28 00:00:00', 700.0000000000),
	('66-18', NULL, NULL, '2018-08-15 00:00:00', 'Calf', 'Hunt Livestock Exchange', '2019-01-28 00:00:00', 226.1000000000),
	('67-18', NULL, NULL, '2018-08-15 00:00:00', 'Calf', 'Hunt Livestock Exchange', '2019-01-28 00:00:00', 448.2500000000),
	('69-18', NULL, NULL, '2018-08-15 00:00:00', 'Calf', 'Hunt Livestock Exchange', '2019-01-28 00:00:00', 595.3500000000),
	('70-18', NULL, NULL, '2018-05-15 00:00:00', 'Calf', 'Hunt Livestock Exchange', '2019-01-28 00:00:00', 530.7000000000),
	('71-18', NULL, NULL, '2018-06-25 00:00:00', 'Calf', 'Hunt Livestock Exchange', '2019-01-28 00:00:00', 707.8500000000),
	('51Blu', '2017-10-28 00:00:00', 1650.0000000000, '2015-10-29 00:00:00', 'Cow', 'Hunt Livestock Exchange', '2018-07-23 00:00:00', 600.0000000000),
	('52Blu', '2017-10-28 00:00:00', 1650.0000000000, '2015-10-29 00:00:00', 'Cow', 'Hunt Livestock Exchange', '2018-07-23 00:00:00', 500.0000000000),
	('55Blu', '2017-10-28 00:00:00', 1650.0000000000, '2012-10-29 00:00:00', 'Cow', 'Hunt Livestock Exchange', '2018-07-23 00:00:00', 520.0000000000),
	('55Yel', '2017-10-28 00:00:00', NULL, '2017-10-06 00:00:00', 'Calf', 'Hunt Livestock Exchange', '2018-07-23 00:00:00', 868.7500000000),
	('56Blu', '2017-10-28 00:00:00', 1650.0000000000, '2012-10-29 00:00:00', 'Cow', 'Hunt Livestock Exchange', '2018-07-23 00:00:00', 410.8800000000),
	('58Blu', '2018-03-10 00:00:00', 1600.0000000000, '2016-03-10 00:00:00', 'Cow', 'Hunt Livestock Exchange', '2018-07-23 00:00:00', 520.0000000000),
	('59Blu', '2018-03-10 00:00:00', 1600.0000000000, '2016-03-10 00:00:00', 'Cow', 'Hunt Livestock Exchange', '2018-07-23 00:00:00', 520.0000000000),
	('60Blu', '2018-03-10 00:00:00', 1600.0000000000, '2016-03-10 00:00:00', 'Cow', 'Hunt Livestock Exchange', '2018-07-23 00:00:00', 760.0000000000),
	('48Yel', NULL, NULL, '2017-04-18 00:00:00', 'Calf', 'Hunt Livestock Exchange', '2018-06-25 00:00:00', 1019.2500000000),
	('49Yel', NULL, NULL, '2017-04-14 00:00:00', 'Calf', 'Hunt Livestock Exchange', '2018-06-25 00:00:00', 853.0500000000),
	('52Yel', '2017-10-28 00:00:00', NULL, '2017-10-06 00:00:00', 'Calf', 'Hunt Livestock Exchange', '2018-06-25 00:00:00', 464.0000000000),
	('53Yel', '2017-10-28 00:00:00', NULL, '2017-10-06 00:00:00', 'Calf', 'Hunt Livestock Exchange', '2018-06-25 00:00:00', 542.5000000000),
	('54Yel', '2017-10-28 00:00:00', NULL, '2017-10-06 00:00:00', 'Calf', 'Hunt Livestock Exchange', '2018-06-25 00:00:00', 513.0000000000),
	('56Yel', '2017-10-28 00:00:00', NULL, '2017-10-06 00:00:00', 'Calf', 'Hunt Livestock Exchange', '2018-06-25 00:00:00', 490.0000000000),
	('59Blu', '2018-03-10 00:00:00', NULL, '2018-02-15 00:00:00', 'Calf', 'Hunt Livestock Exchange', '2018-06-25 00:00:00', 609.5500000000),
	('60Blu', '2018-03-10 00:00:00', NULL, '2018-02-15 00:00:00', 'Calf', 'Hunt Livestock Exchange', '2018-06-25 00:00:00', 635.8500000000),
	('40Ora', '2014-04-06 00:00:00', 1850.0000000000, '2012-04-06 00:00:00', 'Cow', 'Hunt Livestock Exchange', '2017-08-14 00:00:00', 990.0000000000),
	('40Yel', NULL, NULL, '2016-11-18 00:00:00', 'Calf', 'Hunt Livestock Exchange', '2017-08-14 00:00:00', 825.0000000000),
	('42Blu', '2014-04-06 00:00:00', 1850.0000000000, '2012-04-05 00:00:00', 'Cow', 'Hunt Livestock Exchange', '2017-08-14 00:00:00', 1000.0000000000),
	('42Yel', NULL, NULL, '2016-11-27 00:00:00', 'Calf', 'Hunt Livestock Exchange', '2017-08-14 00:00:00', 836.5500000000),
	('44Grn', '2015-04-23 00:00:00', 2300.0000000000, '2013-04-23 00:00:00', 'Cow', 'Hunt Livestock Exchange', '2017-08-14 00:00:00', 922.2500000000),
	('44Yel', NULL, NULL, '2016-11-09 00:00:00', 'Calf', 'Hunt Livestock Exchange', '2017-08-14 00:00:00', 857.8500000000),
	('45Ora', '2015-04-23 00:00:00', 2300.0000000000, '2013-04-23 00:00:00', 'Cow', 'Hunt Livestock Exchange', '2017-08-14 00:00:00', 1021.2000000000),
	('46Grn', '2015-04-23 00:00:00', 2300.0000000000, '2010-04-23 00:00:00', 'Cow', 'Hunt Livestock Exchange', '2017-08-14 00:00:00', 890.0000000000),
	('46Yel', NULL, NULL, '2016-11-09 00:00:00', 'Calf', 'Hunt Livestock Exchange', '2017-08-14 00:00:00', 756.2500000000),
	('39', NULL, NULL, '2016-01-18 00:00:00', 'Calf', 'Tri-County Livestock Market, Inc.', '2016-10-01 00:00:00', 527.2500000000),
	('44', NULL, NULL, '2015-10-26 00:00:00', 'Calf', 'Tri-County Livestock Market, Inc.', '2016-10-01 00:00:00', 678.3000000000),
	('45', NULL, NULL, '2015-10-10 00:00:00', 'Calf', 'Tri-County Livestock Market, Inc.', '2016-10-01 00:00:00', 824.2500000000),
	('46', NULL, NULL, '2015-09-08 00:00:00', 'Calf', 'Tri-County Livestock Market, Inc.', '2016-10-01 00:00:00', 764.4000000000),
	('41Blu', '2014-04-06 00:00:00', 1850.0000000000, '2012-04-06 00:00:00', 'Cow', 'Tri-County Livestock Market, Inc.', '2015-10-03 00:00:00', 975.0000000000),
	('39', '2014-04-05 00:00:00', NULL, '2014-02-15 00:00:00', 'Calf', 'Tri-County Livestock Market, Inc.', '2014-10-11 00:00:00', 1361.2500000000),
	('40', '2014-04-06 00:00:00', NULL, '2014-02-15 00:00:00', 'Calf', 'Tri-County Livestock Market, Inc.', '2014-10-11 00:00:00', 1214.4500000000),
	('41', '2014-04-06 00:00:00', NULL, '2014-02-15 00:00:00', 'Calf', 'Tri-County Livestock Market, Inc.', '2014-10-11 00:00:00', 1241.5500000000),
	('42', '2014-04-06 00:00:00', NULL, '2012-02-15 00:00:00', 'Calf', 'Tri-County Livestock Market, Inc.', '2014-10-11 00:00:00', 1269.9000000000),
	('22-04', NULL, NULL, '2022-08-26 00:00:00', 'Calf', NULL, NULL, NULL),
	('57Blu', '2018-03-10 00:00:00', 1600.0000000000, '2016-03-10 00:00:00', 'Cow', NULL, NULL, 530.0000000000);

-- Dumping structure for table cattlemax.user
CREATE TABLE IF NOT EXISTS `user` (
  `createdAt` bigint(20) DEFAULT NULL,
  `updatedAt` bigint(20) DEFAULT NULL,
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(255) DEFAULT NULL,
  `username` varchar(255) DEFAULT NULL,
  `encryptedPassword` varchar(255) DEFAULT NULL,
  `gravatarURL` varchar(255) DEFAULT NULL,
  `deleted` tinyint(1) DEFAULT NULL,
  `admin` tinyint(1) DEFAULT NULL,
  `banned` tinyint(1) DEFAULT NULL,
  `passwordRecoveryToken` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Dumping data for table cattlemax.user: ~0 rows (approximately)
REPLACE INTO `user` (`createdAt`, `updatedAt`, `id`, `email`, `username`, `encryptedPassword`, `gravatarURL`, `deleted`, `admin`, `banned`, `passwordRecoveryToken`) VALUES
	(1532312167282, 1532312167282, 1, 'rhood@firstmileenterprises.com', 'Chucky', '', '', 0, 0, 0, '');

-- Removing temporary table and create final VIEW structure
DROP TABLE IF EXISTS `herd_history`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `herd_history` AS select `a`.`Ear Tag` AS `Ear Tag`,`a`.`Animal Type` AS `Animal Type`,`a`.`Category` AS `Category`,`a`.`Breed` AS `Breed`,`a`.`Color Markings` AS `Color Markings`,`a`.`Ownership` AS `Ownership`,`a`.`Birth Date` AS `Birth Date`,`a`.`Death Date` AS `Death Date`,`a`.`Purchase Date` AS `Purchase Date`,`a`.`Purchase Price` AS `Purchase Price`,`s`.`Sale Ticket Sale Date` AS `Sale Date`,`s`.`Sale Price` AS `Sale Price`,`a`.`Age In Years` AS `Age In Years`,`a`.`Status` AS `Status`,year(`s`.`Sale Ticket Sale Date`) AS `Year Sold`,case when `a`.`Category` = 'Harvested' then year(`a`.`Death Date`) else NULL end AS `Year harvested`,case when (`a`.`Category` = 'Breeders' and `a`.`Status` = 'Active') then 'Current Asset' when (`a`.`Category` = 'Breeders' and `a`.`Status` <> 'Active') then 'Retired Asset' when (`a`.`Category` <> 'Breeders' and `a`.`Status` = 'Active') then 'Inventory' when (`a`.`Category` <> 'Breeders' and `a`.`Status` <> 'Active') then 'Disposed' else NULL end AS `Class`,case when `a`.`Breed` = 'Katahdin' then 'Sheep' when `a`.`Category` = 'Guard Dog' then 'Guard Dog' else 'Cattle' end AS `Species` from (`animals` `a` left join `sales` `s` on(`a`.`Ear Tag` = `s`.`Ear Tag`)) 
;

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
