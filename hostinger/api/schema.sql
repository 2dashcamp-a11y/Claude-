-- Dash of Digital waitlist (MySQL / MariaDB on Hostinger).
-- waitlist.php creates these tables automatically on first use. You can also
-- import this file once in hPanel → Databases → phpMyAdmin → Import.

CREATE TABLE IF NOT EXISTS dod_waitlist_entries (
  id                      BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  created_at              DATETIME NOT NULL,
  updated_at              DATETIME NOT NULL,
  full_name               VARCHAR(120) NOT NULL,
  email                   VARCHAR(254) NOT NULL,
  email_normalized        VARCHAR(254) NOT NULL,
  company_name            VARCHAR(160) NOT NULL,
  website_url             VARCHAR(300) NULL,
  service_interest        ENUM('digital_infrastructure_audit','technical_infrastructure_management','digital_experience_modernization','brand_creative_direction','not_sure') NOT NULL,
  business_stage          ENUM('pre_launch','early','established','scaling') NULL,
  biggest_challenge       TEXT NULL,
  budget_range            ENUM('under_2500','2500_4999','5000_9999','10000_plus','not_sure') NULL,
  timeline                ENUM('immediately','within_30_days','1_3_months','exploring') NULL,
  privacy_acknowledged_at DATETIME NOT NULL,
  privacy_policy_version  VARCHAR(32) NOT NULL,
  marketing_consent       TINYINT(1) NOT NULL DEFAULT 0,
  marketing_consent_at    DATETIME NULL,
  status                  ENUM('new','qualified','contacted','discovery','proposal','client','not_a_fit') NOT NULL DEFAULT 'new',
  internal_notes          TEXT NULL,
  source                  VARCHAR(40) NOT NULL DEFAULT 'landing_page',
  submission_count        INT UNSIGNED NOT NULL DEFAULT 1,
  last_submitted_at       DATETIME NOT NULL,
  founder_notified_at     DATETIME NULL,
  confirmation_sent_at    DATETIME NULL,
  email_delivery_error    VARCHAR(1000) NULL,
  external_crm_id         VARCHAR(120) NULL,
  synced_at               DATETIME NULL,
  UNIQUE KEY uq_email_normalized (email_normalized),
  KEY idx_created_at (created_at),
  KEY idx_status (status),
  KEY idx_service_interest (service_interest)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Short-lived rate-limit log: salted SHA-256 hash of the IP, pruned after 24 hours.
CREATE TABLE IF NOT EXISTS dod_waitlist_rate (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  ip_hash    CHAR(64) NOT NULL,
  created_at DATETIME NOT NULL,
  KEY idx_ip_time (ip_hash, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=ascii;
