CREATE TABLE user (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(150) UNIQUE,
  role ENUM('SUPER_ADMIN','ADMIN','USER') DEFAULT 'USER',
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP NULL
);

INSERT INTO `users` (`id`, `username`, `password`, `email`, `role`, `is_active`, `created_at`, `last_login`) VALUES ('1', 'yitbarek', '12345678', 'yitbarekwondatir@gmail.com', 'SUPER_ADMIN', '1', current_timestamp(), NULL);