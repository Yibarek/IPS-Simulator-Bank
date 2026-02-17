CREATE TABLE customers (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  customer_code VARCHAR(30) UNIQUE NOT NULL,

  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  phone_number VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(100),

  customer_type ENUM('INDIVIDUAL','BUSINESS') DEFAULT 'INDIVIDUAL',
  status ENUM('ACTIVE','SUSPENDED','CLOSED','BLOCKED') DEFAULT 'ACTIVE',

  national_id VARCHAR(30),
  date_of_birth DATE,

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;



CREATE TABLE merchants (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  merchant_code VARCHAR(30) UNIQUE NOT NULL,

  business_name VARCHAR(150) NOT NULL,
  business_type ENUM('RETAIL','SERVICE','ONLINE','UTILITY') NOT NULL,
  category_code VARCHAR(10), -- MCC

  contact_phone VARCHAR(20),
  contact_email VARCHAR(100),

  settlement_account VARCHAR(34) NOT NULL,
  settlement_cycle ENUM('T+0','T+1','T+2') DEFAULT 'T+1',

  status ENUM('ACTIVE','BLOCKED','CLOSED','INACTIVE','SUSPENDED','TIMEOUT','FOREIGN') DEFAULT 'ACTIVE',

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;



CREATE TABLE accounts (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  account_number VARCHAR(34) UNIQUE NOT NULL,

  owner_type ENUM('CUSTOMER','MERCHANT') NOT NULL,
  owner_id BIGINT NOT NULL,

  account_type ENUM('SAVINGS','CURRENT','WALLET') NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'ETB',

  balance DECIMAL(18,2) NOT NULL DEFAULT 0.00,
  status ENUM('ACTIVE','BLOCKED','CLOSED','INACTIVE','SUSPENDED','TIMEOUT','FOREIGN') DEFAULT 'ACTIVE',

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_owner (owner_type, owner_id)
) ENGINE=InnoDB;



SELECT
  a.account_number,
  a.owner_type,
  CASE
    WHEN a.owner_type='CUSTOMER'
      THEN CONCAT(c.first_name,' ',c.last_name)
    WHEN a.owner_type='MERCHANT'
      THEN m.business_name
  END AS owner_name
FROM accounts a
LEFT JOIN customers c ON a.owner_type='CUSTOMER' AND a.owner_id=c.id
LEFT JOIN merchants m ON a.owner_type='MERCHANT' AND a.owner_id=m.id;

 
CREATE TABLE merchant_terminals (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  merchant_id BIGINT NOT NULL,
  terminal_id VARCHAR(50) UNIQUE NOT NULL,
  terminal_type ENUM('QR','NOTIFICATION') NOT NULL,

  status ENUM('ACTIVE','DISABLED') DEFAULT 'ACTIVE',

  FOREIGN KEY (merchant_id)
    REFERENCES merchants(id)
    ON DELETE CASCADE
);



CREATE TABLE customer_kyc (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  customer_id BIGINT NOT NULL,
  kyc_level ENUM('BASIC','FULL','ENHANCED') NOT NULL,

  verified_at DATETIME,
  expiry_date DATE,

  FOREIGN KEY (customer_id)
    REFERENCES customers(id)
    ON DELETE CASCADE
);


INSERT INTO customers
(customer_code, first_name, last_name, phone_number, email, customer_type)
VALUES
('CUST001','Yitbarek','Wondatir','+251911000001','yitbarek@mail.com','INDIVIDUAL'),
('CUST002','Abel','Tesfaye','+251911000002','abel@mail.com','INDIVIDUAL');


INSERT INTO merchants
(merchant_code, business_name, business_type, category_code,
 contact_phone, contact_email, settlement_account)
VALUES
('MER001','Addis Coffee House','RETAIL','5812',
 '+251911100001','coffee@merchant.com','300001'),
('MER002','Ethio Utilities','UTILITY','4900',
 '+251911100002','utility@merchant.com','300002');
 
-- Customer accounts
INSERT INTO accounts
(account_number, owner_type, owner_id, account_type, currency, balance)
VALUES
('100001','CUSTOMER',1,'WALLET','ETB',5000.00),
('100002','CUSTOMER',2,'WALLET','ETB',3000.00);

-- Merchant accounts
INSERT INTO accounts
(account_number, owner_type, owner_id, account_type, currency, balance)
VALUES
('300001','MERCHANT',1,'CURRENT','ETB',0.00),
('300002','MERCHANT',2,'CURRENT','ETB',0.00);

 
SELECT
  t.transaction_id,
  t.transaction_time,
  a.total_amount,
  a.currency,
  c.first_name AS customer,
  m.business_name AS merchant
FROM transactions t
JOIN transaction_amounts a ON t.id = a.transaction_id
JOIN ledger_entries ld ON t.id = ld.transaction_id AND ld.entry_type='DEBIT'
JOIN accounts ac ON ld.account_number = ac.account_number
JOIN customers c ON ac.owner_id = c.id
JOIN merchants m ON EXISTS (
  SELECT 1 FROM ledger_entries lc
  JOIN accounts am ON lc.account_number = am.account_number
  WHERE lc.transaction_id=t.id
  AND lc.entry_type='CREDIT'
  AND am.owner_type='MERCHANT'
);


