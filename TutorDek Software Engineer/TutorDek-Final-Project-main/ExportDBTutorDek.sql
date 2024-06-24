-- MySQL dump 10.13  Distrib 8.0.36, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: db_tutordek
-- ------------------------------------------------------
-- Server version	8.0.35

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `msadmin`
--

DROP TABLE IF EXISTS `msadmin`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `msadmin` (
  `AdminID` varchar(7) NOT NULL,
  `Department` varchar(255) DEFAULT NULL,
  `CreateAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdateAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`AdminID`),
  CONSTRAINT `msadmin_ibfk_1` FOREIGN KEY (`AdminID`) REFERENCES `msuser` (`UserID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `msadmin`
--

LOCK TABLES `msadmin` WRITE;
/*!40000 ALTER TABLE `msadmin` DISABLE KEYS */;
/*!40000 ALTER TABLE `msadmin` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `msbooking`
--

DROP TABLE IF EXISTS `msbooking`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `msbooking` (
  `BookingID` varchar(7) NOT NULL,
  `StudentID` varchar(7) NOT NULL,
  `TeacherID` varchar(7) NOT NULL,
  `SubjectID` varchar(7) NOT NULL,
  `MaterialID` varchar(7) NOT NULL,
  `BookingDate` date DEFAULT (curdate()),
  `StartTime` datetime NOT NULL,
  `EndTime` datetime NOT NULL,
  `Status` enum('pending','confirmed','completed','cancelled') NOT NULL,
  `CreateAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdateAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`BookingID`),
  KEY `StudentID` (`StudentID`),
  KEY `TeacherID` (`TeacherID`),
  KEY `SubjectID` (`SubjectID`),
  KEY `MaterialID` (`MaterialID`),
  CONSTRAINT `msbooking_ibfk_1` FOREIGN KEY (`StudentID`) REFERENCES `msstudent` (`StudentID`),
  CONSTRAINT `msbooking_ibfk_2` FOREIGN KEY (`TeacherID`) REFERENCES `msteacher` (`TeacherID`),
  CONSTRAINT `msbooking_ibfk_3` FOREIGN KEY (`SubjectID`) REFERENCES `mssubject` (`SubjectID`),
  CONSTRAINT `msbooking_ibfk_4` FOREIGN KEY (`MaterialID`) REFERENCES `msmaterial` (`MaterialID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `msbooking`
--

LOCK TABLES `msbooking` WRITE;
/*!40000 ALTER TABLE `msbooking` DISABLE KEYS */;
/*!40000 ALTER TABLE `msbooking` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mschat`
--

DROP TABLE IF EXISTS `mschat`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mschat` (
  `ChatID` varchar(7) NOT NULL,
  `StudentID` varchar(7) DEFAULT NULL,
  `TeacherID` varchar(7) DEFAULT NULL,
  `Message` text,
  `SentAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ChatID`),
  KEY `StudentID` (`StudentID`),
  KEY `TeacherID` (`TeacherID`),
  CONSTRAINT `mschat_ibfk_1` FOREIGN KEY (`StudentID`) REFERENCES `msstudent` (`StudentID`),
  CONSTRAINT `mschat_ibfk_2` FOREIGN KEY (`TeacherID`) REFERENCES `msteacher` (`TeacherID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mschat`
--

LOCK TABLES `mschat` WRITE;
/*!40000 ALTER TABLE `mschat` DISABLE KEYS */;
/*!40000 ALTER TABLE `mschat` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mschatbotinteraction`
--

DROP TABLE IF EXISTS `mschatbotinteraction`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mschatbotinteraction` (
  `InteractionID` varchar(7) NOT NULL,
  `UserID` varchar(7) DEFAULT NULL,
  `Question` text,
  `Response` text,
  `InteractionTime` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`InteractionID`),
  KEY `UserID` (`UserID`),
  CONSTRAINT `mschatbotinteraction_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `msuser` (`UserID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mschatbotinteraction`
--

LOCK TABLES `mschatbotinteraction` WRITE;
/*!40000 ALTER TABLE `mschatbotinteraction` DISABLE KEYS */;
/*!40000 ALTER TABLE `mschatbotinteraction` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `msmaterial`
--

DROP TABLE IF EXISTS `msmaterial`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `msmaterial` (
  `MaterialID` varchar(7) NOT NULL,
  `SubjectID` varchar(7) NOT NULL,
  `Title` varchar(50) NOT NULL,
  `Semester` enum('1','2') NOT NULL,
  `Content` text,
  `CreateAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdateAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`MaterialID`),
  KEY `SubjectID` (`SubjectID`),
  CONSTRAINT `msmaterial_ibfk_1` FOREIGN KEY (`SubjectID`) REFERENCES `mssubject` (`SubjectID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `msmaterial`
--

LOCK TABLES `msmaterial` WRITE;
/*!40000 ALTER TABLE `msmaterial` DISABLE KEYS */;
/*!40000 ALTER TABLE `msmaterial` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `msreview`
--

DROP TABLE IF EXISTS `msreview`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `msreview` (
  `ReviewID` varchar(7) NOT NULL,
  `BookingID` varchar(7) NOT NULL,
  `StudentID` varchar(7) NOT NULL,
  `TeacherID` varchar(7) NOT NULL,
  `RatingGiven` int NOT NULL,
  `Comment` text,
  `CreateAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdateAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`ReviewID`),
  KEY `BookingID` (`BookingID`),
  KEY `StudentID` (`StudentID`),
  KEY `TeacherID` (`TeacherID`),
  CONSTRAINT `msreview_ibfk_1` FOREIGN KEY (`BookingID`) REFERENCES `msbooking` (`BookingID`),
  CONSTRAINT `msreview_ibfk_2` FOREIGN KEY (`StudentID`) REFERENCES `msstudent` (`StudentID`),
  CONSTRAINT `msreview_ibfk_3` FOREIGN KEY (`TeacherID`) REFERENCES `msteacher` (`TeacherID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `msreview`
--

LOCK TABLES `msreview` WRITE;
/*!40000 ALTER TABLE `msreview` DISABLE KEYS */;
/*!40000 ALTER TABLE `msreview` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `msstudent`
--

DROP TABLE IF EXISTS `msstudent`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `msstudent` (
  `StudentID` varchar(7) NOT NULL,
  `EducationLevel` enum('SD','SMP','SMA') NOT NULL,
  `ClassLevel` varchar(50) NOT NULL,
  `PreferredSubjects` text,
  `CreateAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdateAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`StudentID`),
  CONSTRAINT `msstudent_ibfk_1` FOREIGN KEY (`StudentID`) REFERENCES `msuser` (`UserID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `msstudent`
--

LOCK TABLES `msstudent` WRITE;
/*!40000 ALTER TABLE `msstudent` DISABLE KEYS */;
/*!40000 ALTER TABLE `msstudent` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mssubject`
--

DROP TABLE IF EXISTS `mssubject`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mssubject` (
  `SubjectID` varchar(7) NOT NULL,
  `SubjectName` varchar(50) NOT NULL,
  `EducationLevel` enum('SD','SMP','SMA') NOT NULL,
  `ClassLevel` varchar(50) NOT NULL,
  `Description` text,
  `CreateAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdateAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`SubjectID`),
  UNIQUE KEY `SubjectName` (`SubjectName`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mssubject`
--

LOCK TABLES `mssubject` WRITE;
/*!40000 ALTER TABLE `mssubject` DISABLE KEYS */;
/*!40000 ALTER TABLE `mssubject` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `msteacher`
--

DROP TABLE IF EXISTS `msteacher`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `msteacher` (
  `TeacherID` varchar(7) NOT NULL,
  `Qualification` varchar(255) DEFAULT NULL,
  `ExperienceYear` int DEFAULT NULL,
  `Rating` decimal(2,2) DEFAULT NULL,
  `Bio` text,
  `CreateAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdateAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`TeacherID`),
  CONSTRAINT `msteacher_ibfk_1` FOREIGN KEY (`TeacherID`) REFERENCES `msuser` (`UserID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `msteacher`
--

LOCK TABLES `msteacher` WRITE;
/*!40000 ALTER TABLE `msteacher` DISABLE KEYS */;
/*!40000 ALTER TABLE `msteacher` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `msuser`
--

DROP TABLE IF EXISTS `msuser`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `msuser` (
  `UserID` varchar(7) NOT NULL,
  `Name` varchar(255) NOT NULL,
  `Email` varchar(255) NOT NULL,
  `Password` varchar(255) NOT NULL,
  `Role` enum('student','teacher','admin') NOT NULL,
  `CreateAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdateAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`UserID`),
  UNIQUE KEY `Email` (`Email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `msuser`
--

LOCK TABLES `msuser` WRITE;
/*!40000 ALTER TABLE `msuser` DISABLE KEYS */;
/*!40000 ALTER TABLE `msuser` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-06-11 21:17:44
