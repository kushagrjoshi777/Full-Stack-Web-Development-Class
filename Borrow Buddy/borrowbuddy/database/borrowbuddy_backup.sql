-- MySQL dump 10.13  Distrib 9.4.0, for Win64 (x86_64)
--
-- Host: localhost    Database: borrowbuddy
-- ------------------------------------------------------
-- Server version	9.4.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `borrowbuddy`
--

/*!40000 DROP DATABASE IF EXISTS `borrowbuddy`*/;

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `borrowbuddy` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `borrowbuddy`;

--
-- Table structure for table `borrow_requests`
--

DROP TABLE IF EXISTS `borrow_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `borrow_requests` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `end_date` date NOT NULL,
  `message` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `start_date` date NOT NULL,
  `status` enum('ACTIVE','APPROVED','CANCELLED','PENDING','REJECTED','RETURNED') COLLATE utf8mb4_unicode_ci NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `borrower_id` bigint NOT NULL,
  `item_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_requests_status` (`status`),
  KEY `idx_requests_dates` (`item_id`,`start_date`,`end_date`),
  KEY `fk_requests_borrower` (`borrower_id`),
  CONSTRAINT `fk_requests_borrower` FOREIGN KEY (`borrower_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_requests_item` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `borrow_requests`
--

LOCK TABLES `borrow_requests` WRITE;
/*!40000 ALTER TABLE `borrow_requests` DISABLE KEYS */;
INSERT INTO `borrow_requests` VALUES (1,'2026-11-16 02:37:24.316487','2026-11-24','Need it for my cousin\'s engagement this weekend. Will take great care!','2026-11-22','PENDING','2026-11-17 02:37:24.316487',3,3),(2,'2026-11-17 02:37:24.324613','2026-11-20','Putting up shelves in my new flat in Anna Nagar.','2026-11-19','PENDING','2026-11-17 02:37:24.324613',2,1),(3,'2026-11-15 02:37:24.328546','2026-11-27','Planning a cricket screening for friends.','2026-11-26','PENDING','2026-11-17 02:37:24.328546',6,6),(4,'2026-11-14 02:37:24.328546','2026-12-02','Trip to Yelagiri with college friends.','2026-11-29','APPROVED','2026-11-17 02:37:24.328546',2,4),(5,'2026-11-15 02:37:24.328546','2026-11-25','Want to practise before buying my own.','2026-11-21','APPROVED','2026-11-17 02:37:24.328546',5,9),(6,'2026-11-12 02:37:24.334746','2026-11-20','Morning rides along ECR.','2026-11-15','ACTIVE','2026-11-17 02:37:24.334746',9,5),(7,'2026-11-13 02:37:24.334746','2026-11-19','Baking my mother\'s birthday cake.','2026-11-16','ACTIVE','2026-11-17 02:37:24.334746',2,7),(8,'2026-11-11 02:37:24.339850','2026-11-21','Going to Bengaluru for work.','2026-11-18','REJECTED','2026-11-17 02:37:24.339850',4,13),(9,'2026-11-12 02:37:24.341935','2026-11-21','Terrace party.','2026-11-20','REJECTED','2026-11-17 02:37:24.341935',10,12),(10,'2026-10-26 02:37:24.341935','2026-10-30','Changing ceiling lights.','2026-10-28','RETURNED','2026-11-17 02:37:24.344544',2,2),(11,'2026-10-31 02:37:24.344544','2026-11-07','Family game night.','2026-11-02','RETURNED','2026-11-17 02:37:24.344544',3,10),(12,'2026-11-03 02:37:24.344544','2026-11-09','Repotting my terrace plants.','2026-11-05','RETURNED','2026-11-17 02:37:24.344544',9,15),(13,'2026-10-16 02:37:24.349188','2026-10-21','Pre-Diwali cleaning.','2026-10-18','RETURNED','2026-11-17 02:37:24.349188',6,11),(14,'2026-10-06 02:37:24.349188','2026-11-07','Preparing for exams.','2026-10-08','RETURNED','2026-11-17 02:37:24.349188',4,16),(15,'2026-10-21 02:37:24.349188','2026-10-26','Mahabalipuram photoshoot.','2026-10-23','RETURNED','2026-11-17 02:37:24.354852',7,3),(16,'2026-11-14 02:37:24.354852','2026-11-24','Hemming curtains.','2026-11-23','CANCELLED','2026-11-17 02:37:24.354852',5,14);
/*!40000 ALTER TABLE `borrow_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `icon` varchar(40) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_categories_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'Drills, ladders and gear for home projects','wrench','Tools & DIY'),(2,'Cameras, projectors and speakers','camera','Electronics'),(3,'Tents and weekend-trip essentials','tent','Outdoors & Camping'),(4,'Mixers, cookers and appliances','chef-hat','Kitchen'),(5,'Rackets, bikes and workout gear','dumbbell','Sports & Fitness'),(6,'Instruments for practice and parties','music','Music'),(7,'Board games and reading material','book-open','Games & Books'),(8,'Suitcases and travel accessories','luggage','Travel'),(9,'Cleaning, sewing and garden tools','flower-2','Home & Garden');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `items`
--

DROP TABLE IF EXISTS `items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `items` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `item_condition` enum('FAIR','GOOD','LIKE_NEW','NEW') COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `daily_price` decimal(10,2) NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `image_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `location` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('AVAILABLE','BORROWED','UNAVAILABLE') COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `category_id` bigint NOT NULL,
  `owner_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_items_status` (`status`),
  KEY `idx_items_location` (`location`),
  KEY `fk_items_category` (`category_id`),
  KEY `fk_items_owner` (`owner_id`),
  CONSTRAINT `fk_items_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`),
  CONSTRAINT `fk_items_owner` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `items`
--

LOCK TABLES `items` WRITE;
/*!40000 ALTER TABLE `items` DISABLE KEYS */;
INSERT INTO `items` VALUES (1,'GOOD','2026-11-17 02:37:24.259093',0.00,'Panasonic 18V cordless drill with two batteries, charger and a 30-piece bit set. Perfect for putting up shelves, curtain rods and flat-pack furniture. Please return with batteries charged.','/seed/drill.jpg','Velachery, Chennai','AVAILABLE','Panasonic 18V Cordless Drill Driver','2026-11-17 02:37:24.259093',1,4),(2,'GOOD','2026-11-17 02:37:24.274864',50.00,'Sturdy foldable aluminium ladder with a safety lock. Ideal for painting, changing ceiling lights or reaching high shelves. Pick-up only - it fits in a hatchback with seats folded.','/seed/ladder.jpg','Guindy, Chennai','AVAILABLE','Aluminium Step Ladder (6 ft)','2026-11-17 02:37:24.274864',1,8),(3,'LIKE_NEW','2026-11-17 02:37:24.274864',300.00,'Canon DSLR with kit lens, two batteries, 64GB SD card and a padded bag. Great for family events or a weekend trip. Please treat it gently and return the batteries charged.','/seed/camera.jpg','Anna Nagar, Chennai','AVAILABLE','Canon EOS DSLR with 18-55mm Lens','2026-11-17 02:37:24.274864',2,2),(4,'GOOD','2026-11-17 02:37:24.282146',150.00,'Waterproof dome tent that pitches in ten minutes. Includes pegs, poles, carry bag and a footprint sheet. Used on trips to Yelagiri and Mahabalipuram beaches.','/seed/tent.jpg','Tambaram, Chennai','AVAILABLE','4-Person Camping Tent with Rainfly','2026-11-17 02:37:24.282146',3,7),(5,'GOOD','2026-11-17 02:37:24.284770',100.00,'Well-maintained 21-speed bike, medium frame, suits riders 5\'6\" to 6\'0\". Helmet and lock included. Great for ECR rides on a weekend morning.','/seed/bicycle.jpg','Porur, Chennai','BORROWED','Hybrid Mountain Bike (21-Speed)','2026-11-17 02:37:24.384871',5,6),(6,'LIKE_NEW','2026-11-17 02:37:24.286331',250.00,'Full HD projector with HDMI cable and a small tripod. Movie nights, presentations, or cricket match screenings on a wall. Works with laptops and Fire Stick.','/seed/projector.jpg','Sholinganallur, OMR, Chennai','AVAILABLE','Full HD Portable Projector','2026-11-17 02:37:24.286331',2,9),(7,'LIKE_NEW','2026-11-17 02:37:24.289458',0.00,'Powerful 7-speed hand mixer with two dough hooks and a whisk attachment. Cakes, bread dough and whipped cream with zero effort. Cleaned and sanitized after every loan.','/seed/mixer.jpg','T. Nagar, Chennai','BORROWED','Electric Hand Mixer with Dough Hooks & Whisk','2026-11-17 02:37:24.384871',4,3),(8,'GOOD','2026-11-17 02:37:24.291016',0.00,'Four Yonex rackets, a net, and a tube of shuttlecocks. Take them to the court or set up in the apartment car park.','/seed/badminton.jpg','Porur, Chennai','AVAILABLE','Yonex Badminton Rackets (Set of 4)','2026-11-17 02:37:24.291016',5,6),(9,'GOOD','2026-11-17 02:37:24.294281',80.00,'Full-size acoustic guitar with fresh strings, capo, picks and a soft gig bag. Perfect for beginners who want to try before buying.','/seed/guitar.jpg','Chromepet, Chennai','AVAILABLE','Acoustic Guitar with Gig Bag','2026-11-17 02:37:24.294281',6,10),(10,'LIKE_NEW','2026-11-17 02:37:24.296934',0.00,'Catan, Carcassonne and Ticket to Ride in one bundle. Everything is complete - cards counted before every loan. Great for long weekends.','/seed/boardgame.jpg','Mylapore, Chennai','AVAILABLE','Catan & Strategy Board Game Bundle','2026-11-17 02:37:24.296934',7,5),(11,'FAIR','2026-11-17 02:37:24.298507',40.00,'Strong-suction bagless vacuum with crevice tool and brush heads. Handy for deep-cleaning before festivals like Diwali or Pongal.','/seed/vacuum.jpg','Guindy, Chennai','AVAILABLE','Bagless Vacuum Cleaner','2026-11-17 02:37:24.298507',9,8),(12,'GOOD','2026-11-17 02:37:24.301172',120.00,'Loud and bassy, 12-hour battery, water-resistant. Terrace birthdays and beach picnics approved.','/seed/speaker.jpg','Sholinganallur, OMR, Chennai','AVAILABLE','Portable Bluetooth Party Speaker','2026-11-17 02:37:24.301172',2,9),(13,'LIKE_NEW','2026-11-17 02:37:24.304302',0.00,'Lightweight cabin-size hard-shell trolley with TSA lock and 360-degree wheels. Ideal for short trips and weekend getaways.','/seed/suitcase.jpg','Tambaram, Chennai','AVAILABLE','Hard-Shell Cabin Suitcase (55 cm)','2026-11-17 02:37:24.304302',8,7),(14,'GOOD','2026-11-17 02:37:24.305396',60.00,'Beginner-friendly electric sewing machine with 12 stitch patterns, spare needles and bobbins. Perfect for fixing curtains, hemming and tailoring experiments.','/seed/sewing.jpg','T. Nagar, Chennai','AVAILABLE','Tabletop Sewing Machine','2026-11-17 02:37:24.305396',9,3),(15,'GOOD','2026-11-17 02:37:24.308648',0.00,'Complete garden set - spade, hand fork, rake, pruning shears and gloves. Great for terrace gardening and repotting.','/seed/garden.jpg','Guindy, Chennai','AVAILABLE','Garden Tool Kit (Spade, Rake, Pruner)','2026-11-17 02:37:24.308648',9,8),(16,'GOOD','2026-11-17 02:37:24.308648',0.00,'Eight well-kept reference books for competitive exam preparation, lightly highlighted. Borrow for a month and save a few thousand rupees.','/seed/books.jpg','Chromepet, Chennai','AVAILABLE','Competitive Exam Prep Book Set','2026-11-17 02:37:24.308648',7,10),(17,'GOOD','2026-11-17 02:37:24.314700',0.00,'Big family-size cooker, ideal when you\'re hosting. Fresh gasket fitted. Free to borrow.','/seed/pressure.jpg','T. Nagar, Chennai','AVAILABLE','5-Litre Stainless Steel Pressure Cooker','2026-11-17 02:37:24.314700',4,3),(18,'LIKE_NEW','2026-11-17 02:37:24.316487',0.00,'Extra-thick non-slip yoga mat with two blocks and a strap. Perfect for trying yoga before committing.','/seed/yoga.jpg','Adyar, Chennai','AVAILABLE','Premium Yoga Mat & Block Set','2026-11-17 02:37:24.316487',5,1);
/*!40000 ALTER TABLE `items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `bio` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `enabled` bit(1) NOT NULL,
  `location` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` enum('ADMIN','USER') COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_users_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Community manager at BorrowBuddy Chennai.','2026-09-23 02:37:23.040442','admin@borrowbuddy.in',_binary '','Adyar, Chennai','Meera Krishnan','$2a$10$pLEtwqKtKDNXgfi5e3gBs.7Wty1Q3P9dpn1QnBqMWtgF8T4eAtEny','+91 98400 11001','ADMIN'),(2,'Weekend trekker and amateur photographer. Happy to lend gear to neighbours.','2026-09-09 02:37:23.211517','demo@borrowbuddy.in',_binary '','Anna Nagar, Chennai','Karthik Subramanian','$2a$10$4nnNtSo9mArEChdSIIR4oeqbUydS9v0N2VrXzzAJOjhiYvw3EpjYC','+91 98400 22002','USER'),(3,'Home baker. I love sharing kitchen tools.','2026-09-23 02:37:23.335551','priya.raman@example.in',_binary '','T. Nagar, Chennai','Priya Raman','$2a$10$qaNpY1LjFRH1C7KgQS4LFO3HnOZ4LPY4nPx7yG5o3vMCgdlCBcRcy','+91 98410 33003','USER'),(4,'DIY enthusiast with way too many power tools.','2026-09-23 02:37:23.457904','arjun.v@example.in',_binary '','Velachery, Chennai','Arjun Venkatesh','$2a$10$dllSzb5EO2xmGbhD8oTURe0UfmtujKpse0M.fPORkmdlXAAVOf/LS','+91 98410 44004','USER'),(5,'Carnatic music student and board-game host.','2026-09-23 02:37:23.584957','divya.n@example.in',_binary '','Mylapore, Chennai','Divya Narayanan','$2a$10$YImu5JAPP1XN8JtnEauhCeuHGdt0BsU5FDN7IhIxJQU4DFxBFEmk6','+91 98420 55005','USER'),(6,'Cyclist and badminton regular.','2026-09-23 02:37:23.710474','rohit.s@example.in',_binary '','Porur, Chennai','Rohit Sharma','$2a$10$iFP34WaOp6zcmHHNunsAkOYb9tF29OcGc/7pqBx4K5S/BVOa8Ok0K','+91 98420 66006','USER'),(7,'Travel blogger. Suitcases and camping gear to share.','2026-09-16 02:37:23.853896','fatima.s@example.in',_binary '','Tambaram, Chennai','Fatima Sheikh','$2a$10$RXhPLkjyn65wRhXhrsokYeUlg4Y0H2KB01tcs5edW8nuxEflv4ZUu','+91 98430 77007','USER'),(8,'Retired engineer, gardener, fixer of things.','2026-09-16 02:37:23.984684','suresh.b@example.in',_binary '','Guindy, Chennai','Suresh Babu','$2a$10$c6x/0utweJRG5iHJ3fAL/eeoAFZ7N6WhQr0lLJ.VbzYU6OBFLT8nC','+91 98430 88008','USER'),(9,'Software engineer working from home on OMR.','2026-09-16 02:37:24.109967','ananya.i@example.in',_binary '','Sholinganallur, OMR, Chennai','Ananya Iyer','$2a$10$FelC5VwjQcyB94w/p7S.gOzqBAlZWKo9puheKmydcYCpsT/7hwVwK','+91 98440 99009','USER'),(10,'Bookworm and weekend guitarist.','2026-09-16 02:37:24.239699','vikram.r@example.in',_binary '','Chromepet, Chennai','Vikram Rao','$2a$10$PautiBNMdmODwA6XXJJSD.1ezZ.LtwEzq0JXAIAkjPvrpHQg.FGum','+91 98440 10010','USER');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'borrowbuddy'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-17  8:19:21
