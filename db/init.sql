SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";
--
-- Database: `dislinkt-users`
--

-- --------------------------------------------------------

--
-- Table structure for table `user-roles`
--

CREATE TABLE `user-roles` (
  `id` int NOT NULL,
  `value` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

ALTER TABLE `user-roles`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_id` (`id`);

INSERT INTO `user-roles` (`id`, `value`) VALUES
(1, 'REGISTERED_USER'),
(2, 'ADMINISTRATOR');

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` char(38) NOT NULL,
  `username` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `lastPasswordResetTime` datetime NULL,
  `role` int NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `idx_username_unique` (`username`),
  ADD UNIQUE KEY `idx_email_unique` (`email`),
  ADD KEY `idx_username_email` (`username`, `email`),
  ADD CONSTRAINT `fk_user_user-roles` FOREIGN KEY (`role`) REFERENCES `user-roles`(`id`);

--
-- Inserting data for table `users`
--

-- password=password
INSERT INTO `users` (`id`, `username`, `email`, `password`, `role`) VALUES
('9ea8422b-1d1c-4471-a6f1-b6d33a00c707', 'admin', 'admin@dislinkt.com', '5baa61e4c9b93f3f0682250b6cf8331b7ee68fd8', 2);

COMMIT;