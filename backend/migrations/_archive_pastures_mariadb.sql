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


-- Dumping database structure for pastures
CREATE DATABASE IF NOT EXISTS `pastures` /*!40100 DEFAULT CHARACTER SET armscii8 COLLATE armscii8_bin */;
USE `pastures`;

-- Dumping structure for table pastures.archive
CREATE TABLE IF NOT EXISTS `archive` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `createdAt` bigint(20) DEFAULT NULL,
  `fromModel` varchar(255) DEFAULT NULL,
  `originalRecord` longtext DEFAULT NULL,
  `originalRecordId` longtext DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Dumping data for table pastures.archive: ~0 rows (approximately)

-- Dumping structure for table pastures.pasture
CREATE TABLE IF NOT EXISTS `pasture` (
  `createdAt` bigint(20) DEFAULT NULL,
  `updatedAt` bigint(20) DEFAULT NULL,
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `pasture_size` decimal(12,4) DEFAULT NULL,
  `pasture_name` varchar(30) DEFAULT NULL,
  `latitude` int(11) DEFAULT NULL,
  `longitude` int(11) DEFAULT NULL,
  `pasture_map` varchar(255) DEFAULT NULL,
  `pasture_productivity` decimal(12,4) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Dumping data for table pastures.pasture: ~0 rows (approximately)
REPLACE INTO `pasture` (`createdAt`, `updatedAt`, `id`, `pasture_size`, `pasture_name`, `latitude`, `longitude`, `pasture_map`, `pasture_productivity`) VALUES
	(1689183056, 1689183056, 1, 2.5000, 'Paddock 1', NULL, NULL, NULL, NULL);

-- Dumping structure for table pastures.pasturegrazingevent
CREATE TABLE IF NOT EXISTS `pasturegrazingevent` (
  `createdAt` bigint(20) DEFAULT NULL,
  `updatedAt` bigint(20) DEFAULT NULL,
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `pasture_name` varchar(30) DEFAULT NULL,
  `start_of_grazing` date DEFAULT NULL,
  `end_of_grazing` date DEFAULT NULL,
  `initial_grass_height` decimal(12,4) DEFAULT NULL,
  `final_grass_height` decimal(12,4) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Dumping data for table pastures.pasturegrazingevent: ~0 rows (approximately)

-- Dumping structure for table pastures.pasturenutrient
CREATE TABLE IF NOT EXISTS `pasturenutrient` (
  `createdAt` bigint(20) DEFAULT NULL,
  `updatedAt` bigint(20) DEFAULT NULL,
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `pasture_name` varchar(30) DEFAULT NULL,
  `nutrient` varchar(20) DEFAULT NULL,
  `nutrient_target_level` decimal(12,4) DEFAULT NULL,
  `nutrient_level` decimal(12,4) DEFAULT NULL,
  `sample_id` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Dumping data for table pastures.pasturenutrient: ~0 rows (approximately)

-- Dumping structure for table pastures.pasturesoilsample
CREATE TABLE IF NOT EXISTS `pasturesoilsample` (
  `createdAt` bigint(20) DEFAULT NULL,
  `updatedAt` bigint(20) DEFAULT NULL,
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `pasture_name` varchar(30) DEFAULT NULL,
  `sample_date` date DEFAULT NULL,
  `sample_id` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Dumping data for table pastures.pasturesoilsample: ~0 rows (approximately)

-- Dumping structure for table pastures.pasturetask
CREATE TABLE IF NOT EXISTS `pasturetask` (
  `createdAt` bigint(20) DEFAULT NULL,
  `updatedAt` bigint(20) DEFAULT NULL,
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `pasture_name` varchar(30) DEFAULT NULL,
  `pasture_task` longtext DEFAULT NULL,
  `pasture_task_completed` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Dumping data for table pastures.pasturetask: ~0 rows (approximately)

-- Dumping structure for table pastures.pasturetreatment
CREATE TABLE IF NOT EXISTS `pasturetreatment` (
  `createdAt` bigint(20) DEFAULT NULL,
  `updatedAt` bigint(20) DEFAULT NULL,
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `pasture_name` varchar(30) DEFAULT NULL,
  `pasture_treatment` varchar(100) DEFAULT NULL,
  `chemical_or_mechanical` tinyint(4) DEFAULT NULL,
  `chemical_used` varchar(200) DEFAULT NULL,
  `mechanical_means_used` varchar(255) DEFAULT NULL,
  `rate_of_chem_application` decimal(12,4) DEFAULT NULL,
  `fuel_used` decimal(12,4) DEFAULT NULL,
  `date_treated` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Dumping data for table pastures.pasturetreatment: ~0 rows (approximately)

-- Dumping structure for table pastures.user
CREATE TABLE IF NOT EXISTS `user` (
  `createdAt` bigint(20) DEFAULT NULL,
  `updatedAt` bigint(20) DEFAULT NULL,
  `id` int(11) NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Dumping data for table pastures.user: ~0 rows (approximately)

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
