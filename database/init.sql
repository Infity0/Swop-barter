-- ============================================================
--  Swop — MySQL 8.0 Database Schema
--  Запускается автоматически при первом старте Docker-контейнера
--  Вручную: mysql -u swop -p swop_db < init.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS `swop_db`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `swop_db`;

-- ─────────────────────────────────────────────
--  categories
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `categories` (
  `id`          VARCHAR(36)  NOT NULL,
  `name`        VARCHAR(255) NOT NULL,
  `description` VARCHAR(255) NULL,
  `icon`        VARCHAR(255) NULL,
  `slug`        VARCHAR(255) NULL,
  `isActive`    TINYINT(1)   NOT NULL DEFAULT 1,
  `parentId`    VARCHAR(36)  NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_categories_name` (`name`),
  CONSTRAINT `FK_categories_parent`
    FOREIGN KEY (`parentId`) REFERENCES `categories` (`id`)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────
--  users
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `users` (
  `id`               VARCHAR(36)    NOT NULL,
  `email`            VARCHAR(255)   NOT NULL,
  `username`         VARCHAR(255)   NOT NULL,
  `password`         VARCHAR(255)   NOT NULL,
  `firstName`        VARCHAR(255)   NULL,
  `lastName`         VARCHAR(255)   NULL,
  `avatar`           VARCHAR(255)   NULL,
  `bio`              TEXT           NULL,
  `city`             VARCHAR(255)   NULL,
  `rating`           DECIMAL(3,2)   NOT NULL DEFAULT 0,
  `reviewsCount`     INT            NOT NULL DEFAULT 0,
  `successfulTrades` INT            NOT NULL DEFAULT 0,
  `role`             VARCHAR(10)    NOT NULL DEFAULT 'user'
                     COMMENT 'user | admin',
  `isActive`         TINYINT(1)     NOT NULL DEFAULT 1,
  `refreshToken`     TEXT           NULL,
  `createdAt`        DATETIME(6)    NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt`        DATETIME(6)    NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
                     ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_users_email`    (`email`),
  UNIQUE KEY `UQ_users_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────
--  items
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `items` (
  `id`             VARCHAR(36)  NOT NULL,
  `title`          VARCHAR(255) NOT NULL,
  `description`    TEXT         NOT NULL,
  `condition`      VARCHAR(20)  NOT NULL
                   COMMENT 'new | like_new | good | fair | poor',
  `status`         VARCHAR(20)  NOT NULL DEFAULT 'active'
                   COMMENT 'active | in_trade | traded | archived',
  `estimatedValue` INT          NULL,
  `city`           VARCHAR(255) NULL,
  `desiredItems`   TEXT         NULL
                   COMMENT 'comma-separated list (TypeORM simple-array)',
  `viewsCount`     INT          NOT NULL DEFAULT 0,
  `ownerId`        VARCHAR(36)  NOT NULL,
  `categoryId`     VARCHAR(36)  NULL,
  `createdAt`      DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt`      DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
                   ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `IDX_items_ownerId`    (`ownerId`),
  KEY `IDX_items_categoryId` (`categoryId`),
  CONSTRAINT `FK_items_owner`
    FOREIGN KEY (`ownerId`) REFERENCES `users` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `FK_items_category`
    FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────
--  item_images
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `item_images` (
  `id`        VARCHAR(36)  NOT NULL,
  `url`       VARCHAR(255) NOT NULL,
  `isPrimary` TINYINT(1)   NOT NULL DEFAULT 0,
  `order`     INT          NOT NULL DEFAULT 0,
  `itemId`    VARCHAR(36)  NOT NULL,
  `createdAt` DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `IDX_item_images_itemId` (`itemId`),
  CONSTRAINT `FK_item_images_item`
    FOREIGN KEY (`itemId`) REFERENCES `items` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────
--  trade_offers
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `trade_offers` (
  `id`          VARCHAR(36) NOT NULL,
  `status`      VARCHAR(20) NOT NULL DEFAULT 'pending'
                COMMENT 'pending | accepted | rejected | cancelled | completed',
  `message`     TEXT        NULL,
  `initiatorId` VARCHAR(36) NOT NULL,
  `receiverId`  VARCHAR(36) NOT NULL,
  `createdAt`   DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt`   DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
                ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `IDX_trade_offers_initiatorId` (`initiatorId`),
  KEY `IDX_trade_offers_receiverId`  (`receiverId`),
  CONSTRAINT `FK_trade_offers_initiator`
    FOREIGN KEY (`initiatorId`) REFERENCES `users` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `FK_trade_offers_receiver`
    FOREIGN KEY (`receiverId`) REFERENCES `users` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────
--  trade_offer_initiator_items  (ManyToMany)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `trade_offer_initiator_items` (
  `tradeOfferId` VARCHAR(36) NOT NULL,
  `itemId`       VARCHAR(36) NOT NULL,
  PRIMARY KEY (`tradeOfferId`, `itemId`),
  KEY `IDX_toi_tradeOfferId` (`tradeOfferId`),
  KEY `IDX_toi_itemId`       (`itemId`),
  CONSTRAINT `FK_toi_tradeOffer`
    FOREIGN KEY (`tradeOfferId`) REFERENCES `trade_offers` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `FK_toi_item`
    FOREIGN KEY (`itemId`) REFERENCES `items` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────
--  trade_offer_receiver_items  (ManyToMany)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `trade_offer_receiver_items` (
  `tradeOfferId` VARCHAR(36) NOT NULL,
  `itemId`       VARCHAR(36) NOT NULL,
  PRIMARY KEY (`tradeOfferId`, `itemId`),
  KEY `IDX_tor_tradeOfferId` (`tradeOfferId`),
  KEY `IDX_tor_itemId`       (`itemId`),
  CONSTRAINT `FK_tor_tradeOffer`
    FOREIGN KEY (`tradeOfferId`) REFERENCES `trade_offers` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `FK_tor_item`
    FOREIGN KEY (`itemId`) REFERENCES `items` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────
--  messages
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `messages` (
  `id`           VARCHAR(36) NOT NULL,
  `content`      TEXT        NOT NULL,
  `isRead`       TINYINT(1)  NOT NULL DEFAULT 0,
  `senderId`     VARCHAR(36) NOT NULL,
  `tradeOfferId` VARCHAR(36) NOT NULL,
  `createdAt`    DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `IDX_messages_senderId`     (`senderId`),
  KEY `IDX_messages_tradeOfferId` (`tradeOfferId`),
  CONSTRAINT `FK_messages_sender`
    FOREIGN KEY (`senderId`) REFERENCES `users` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `FK_messages_tradeOffer`
    FOREIGN KEY (`tradeOfferId`) REFERENCES `trade_offers` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────
--  reviews
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `reviews` (
  `id`           VARCHAR(36) NOT NULL,
  `rating`       INT         NOT NULL,
  `comment`      TEXT        NULL,
  `reviewerId`   VARCHAR(36) NOT NULL,
  `revieweeId`   VARCHAR(36) NOT NULL,
  `tradeOfferId` VARCHAR(36) NULL,
  `createdAt`    DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `IDX_reviews_reviewerId`   (`reviewerId`),
  KEY `IDX_reviews_revieweeId`   (`revieweeId`),
  KEY `IDX_reviews_tradeOfferId` (`tradeOfferId`),
  CONSTRAINT `FK_reviews_reviewer`
    FOREIGN KEY (`reviewerId`) REFERENCES `users` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `FK_reviews_reviewee`
    FOREIGN KEY (`revieweeId`) REFERENCES `users` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `FK_reviews_tradeOffer`
    FOREIGN KEY (`tradeOfferId`) REFERENCES `trade_offers` (`id`)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────
--  notifications
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `notifications` (
  `id`          VARCHAR(36)  NOT NULL,
  `type`        VARCHAR(30)  NOT NULL
                COMMENT 'trade_offer | trade_accepted | trade_rejected | trade_completed | new_message | new_review',
  `title`       VARCHAR(255) NOT NULL,
  `body`        TEXT         NOT NULL,
  `referenceId` VARCHAR(255) NULL,
  `isRead`      TINYINT(1)   NOT NULL DEFAULT 0,
  `userId`      VARCHAR(36)  NOT NULL,
  `createdAt`   DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `IDX_notifications_userId` (`userId`),
  CONSTRAINT `FK_notifications_user`
    FOREIGN KEY (`userId`) REFERENCES `users` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────
--  Seed: categories (стандартный набор)
-- ─────────────────────────────────────────────
INSERT IGNORE INTO `categories` (`id`, `name`, `slug`, `icon`, `isActive`) VALUES
  (UUID(), 'Электроника',              'electronics',   '📱', 1),
  (UUID(), 'Одежда',                   'clothing',      '👗', 1),
  (UUID(), 'Книги',                    'books',         '📚', 1),
  (UUID(), 'Мебель',                   'furniture',     '🪑', 1),
  (UUID(), 'Спорт',                    'sports',        '⚽', 1),
  (UUID(), 'Игрушки и игры',           'toys-games',    '🧸', 1),
  (UUID(), 'Музыка',                   'music',         '🎵', 1),
  (UUID(), 'Творчество и рукоделие',   'art-crafts',    '🎨', 1),
  (UUID(), 'Сад и огород',             'garden',        '🌱', 1),
  (UUID(), 'Прочее',                   'other',         '📦', 1);
