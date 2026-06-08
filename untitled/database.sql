-- User Roles (admin, teacher, student)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'teacher', 'student')),
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    level VARCHAR(50), -- for students: 'bem', 'bac', etc.
    subject VARCHAR(50), -- for teachers
    status VARCHAR(20) DEFAULT 'active', -- 'pending', 'active', 'suspended'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Teacher CCP Information
CREATE TABLE teacher_ccp (
    teacher_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(100) NOT NULL,
    ccp_number VARCHAR(20) NOT NULL,
    ccp_key VARCHAR(2) NOT NULL,
    rip VARCHAR(20) NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Courses
CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    teacher_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    level VARCHAR(50) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    discount DECIMAL(5, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Course Enrollments
CREATE TABLE enrollments (
    student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (student_id, course_id)
);

-- Course Content (Documents)
CREATE TABLE course_documents (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    file_name VARCHAR(255),
    file_url VARCHAR(255) NOT NULL,
    file_size VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Course Content (Videos)
CREATE TABLE course_videos (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    video_url VARCHAR(255) NOT NULL,
    duration VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Course Content (Live Streams)
CREATE TABLE course_live_streams (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    stream_url VARCHAR(255),
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    status VARCHAR(20) DEFAULT 'upcoming', -- 'upcoming', 'live', 'ended'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Course Content (Exercises)
CREATE TABLE course_exercises (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    exercise_url VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Support/Admin Notifications
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER REFERENCES users(id) ON DELETE SET NULL, -- NULL if system/admin
    target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('all', 'students', 'teachers', 'single')),
    target_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Notification Read Status
CREATE TABLE notification_reads (
    notification_id INTEGER NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (notification_id, user_id)
);

-- Financial Transfers (Recharges/Payments)
CREATE TABLE transfers (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    teacher_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id INTEGER REFERENCES courses(id) ON DELETE SET NULL,
    amount DECIMAL(10, 2) NOT NULL,
    receipt_image_url VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'accepted', 'rejected'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP
);
