CREATE TABLE transactions (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  transaction_id VARCHAR(50) NOT NULL UNIQUE,
  reference_id VARCHAR(50),

  transaction_type ENUM('VERIF','P2P','SQR','RTP','RETURN','QUERY') NOT NULL,
  channel ENUM('WEB','MOBILE') NOT NULL,
  payment_method ENUM('QR','CARD','BANK','WALLET') NOT NULL,

  status ENUM('PENDING','COMPLETED','FAILED','RECEIVED','PAID','REJECTED') NOT NULL,
  direction ENUM('D','C') NOT NULL COMMENT 'D=Debit, C=Credit, I=Initiator', 

  transaction_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  value_date DATE NOT NULL,

  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_txn_time (transaction_time),
  INDEX idx_status (status),
  INDEX idx_type (transaction_type)
) ENGINE=InnoDB;



CREATE TABLE transaction_parties (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  transaction_id BIGINT NOT NULL,

  party_role ENUM('DEBTOR','CREDITOR','INITIATOR') NOT NULL,
  account_number VARCHAR(34) NOT NULL,
  party_name VARCHAR(100),
  bank_code VARCHAR(20),
  address VARCHAR(100),
  
  FOREIGN KEY (transaction_id)
    REFERENCES transactions(id)
    ON DELETE CASCADE,

  INDEX idx_account (account_number),
  INDEX idx_role (party_role)
) ENGINE=InnoDB;


CREATE TABLE transaction_amounts (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  transaction_id BIGINT NOT NULL,

  amount DECIMAL(18,2) NOT NULL,
  fee DECIMAL(18,2) DEFAULT 0.00,
  tax DECIMAL(18,2) DEFAULT 0.00,
  tip DECIMAL(18,2) DEFAULT 0.00,
  total_amount DECIMAL(18,2) NOT NULL,

  currency CHAR(3) NOT NULL,

  FOREIGN KEY (transaction_id)
    REFERENCES transactions(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;


CREATE TABLE transaction_status_history (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  transaction_id BIGINT NOT NULL,

  old_status ENUM('PENDING','COMPLETED','FAILED','RECEIVED','PAID','REJECTED'),
  new_status ENUM('PENDING','COMPLETED','FAILED','RECEIVED','PAID','REJECTED') NOT NULL,
  reason VARCHAR(255),

  changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (transaction_id)
    REFERENCES transactions(id)
    ON DELETE CASCADE,

  INDEX idx_status_change (changed_at)
) ENGINE=InnoDB;


CREATE TABLE ledger_entries (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  transaction_id BIGINT NOT NULL,

  account_number VARCHAR(34) NOT NULL,
  entry_type ENUM('DEBIT','CREDIT','INITIATOR') NOT NULL,
  amount DECIMAL(18,2) NOT NULL,
  currency CHAR(3) NOT NULL,

  balance_after DECIMAL(18,2),

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (transaction_id)
    REFERENCES transactions(id)
    ON DELETE CASCADE,

  INDEX idx_account (account_number),
  INDEX idx_txn (transaction_id)
) ENGINE=InnoDB;



CREATE TABLE transaction_metadata (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  transaction_id BIGINT NOT NULL,

  metadata JSON,
  source_ip VARCHAR(45),
  device_id VARCHAR(100),

  FOREIGN KEY (transaction_id)
    REFERENCES transactions(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;



START TRANSACTION;

INSERT INTO transactions (
  transaction_id, transaction_type, channel,
  payment_method, status, direction, value_date
)
VALUES (
  'TXN20260122001','PAYMENT','MOBILE',
  'QR','PENDING','D', CURDATE()
);

SET @txn_id = LAST_INSERT_ID();

INSERT INTO transaction_parties
(transaction_id, party_role, account_number, party_name)
VALUES
(@txn_id,'INITIATOR','100001','Yitbarek'),
(@txn_id,'DEBTOR','100001','Yitbarek'),
(@txn_id,'CREDITOR','200002','Merchant A');

INSERT INTO transaction_amounts
(transaction_id, amount, fee, tax, total_amount, currency)
VALUES
(@txn_id, 150.00, 2.00, 0.00, 152.00, 'ETB');

INSERT INTO ledger_entries
(transaction_id, account_number, entry_type, amount, currency)
VALUES
(@txn_id,'100001','DEBIT',150.00,'ETB'),
(@txn_id,'200002','CREDIT',150.00,'ETB');

COMMIT;


/*
ALTER TABLE transactions
PARTITION BY RANGE (YEAR(transaction_time)) (
  PARTITION p2025 VALUES LESS THAN (2026),
  PARTITION p2026 VALUES LESS THAN (2027)
);



SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED;
*/

SELECT
  t.transaction_id,
  t.transaction_type,
  t.transaction_time,
  t.status,
  t.payment_method,
  t.channel,
  a.total_amount,
  a.currency,
  d.account_number AS debtor,
  d.bank_code AS debtor,
  c.account_number AS creditor,
  c.bank_code AS creditor
FROM transactions t
JOIN transaction_amounts a ON t.id = a.transaction_id
JOIN transaction_parties d ON t.id = d.transaction_id AND d.party_role='DEBTOR'
JOIN transaction_parties c ON t.id = c.transaction_id AND c.party_role='CREDITOR'
WHERE t.transaction_id = 'TXN20260122001';

