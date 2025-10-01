-- Album Video Database Schema
-- Based on db-design.md specifications

USE album_video;

-- 1. users テーブル
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    line_user_id VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    profile_image_url VARCHAR(500),
    email VARCHAR(100),
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_line_user_id (line_user_id),
    INDEX idx_email (email)
);

-- 2. images テーブル
CREATE TABLE images (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    s3_key VARCHAR(500) NOT NULL,
    s3_bucket VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(50) NOT NULL,
    width INT,
    height INT,
    upload_status ENUM('uploading', 'completed', 'failed') DEFAULT 'uploading',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_upload_status (upload_status),
    INDEX idx_created_at (created_at)
);

-- 3. videos テーブル
CREATE TABLE videos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    s3_key VARCHAR(500),
    s3_bucket VARCHAR(100),
    file_size BIGINT,
    duration DECIMAL(10,2),
    resolution VARCHAR(20),
    frame_rate DECIMAL(5,2),
    processing_status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_processing_status (processing_status),
    INDEX idx_created_at (created_at)
);

-- 4. video_images テーブル
CREATE TABLE video_images (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    video_id BIGINT NOT NULL,
    image_id BIGINT NOT NULL,
    sequence_order INT NOT NULL,
    display_duration DECIMAL(5,2) DEFAULT 3.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE,
    FOREIGN KEY (image_id) REFERENCES images(id) ON DELETE CASCADE,
    INDEX idx_video_id (video_id),
    INDEX idx_image_id (image_id),
    INDEX idx_sequence_order (sequence_order),
    UNIQUE KEY uk_video_image_sequence (video_id, sequence_order)
);