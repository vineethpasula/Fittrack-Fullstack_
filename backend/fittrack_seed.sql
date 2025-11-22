-- RESET (safe to run multiple times)
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS workout_logs;
DROP TABLE IF EXISTS class_registrations;
DROP TABLE IF EXISTS classes;
DROP TABLE IF EXISTS trainers;
DROP TABLE IF EXISTS memberships;
DROP TABLE IF EXISTS users;

-- =========================
-- USERS
-- =========================
CREATE TABLE users (
    user_id       INTEGER PRIMARY KEY,
    email         TEXT NOT NULL UNIQUE,
    first_name    TEXT NOT NULL,
    last_name     TEXT NOT NULL,
    role          TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    created_at    TEXT NOT NULL
);

INSERT INTO users (user_id, email, first_name, last_name, role, password_hash, created_at) VALUES
  (1,  'alice@example.com',        'Alice',  'Johnson',  'admin',   'test123',  '2024-01-05'),
  (2,  'bob.member@example.com',   'Bob',    'Smith',    'member',  'pass123',  '2024-01-10'),
  (3,  'carol.member@example.com', 'Carol',  'Davis',    'member',  'pass123',  '2024-01-12'),
  (4,  'dave.member@example.com',  'Dave',   'Miller',   'member',  'pass123',  '2024-01-15'),
  (5,  'erin.member@example.com',  'Erin',   'Wilson',   'member',  'pass123',  '2024-01-18'),
  (6,  'frank.trainer@example.com','Frank',  'Moore',    'trainer', 'trainer1', '2024-01-20'),
  (7,  'gina.trainer@example.com', 'Gina',   'Taylor',   'trainer', 'trainer2', '2024-01-22'),
  (8,  'henry.trainer@example.com','Henry',  'Anderson', 'trainer', 'trainer3', '2024-01-25'),
  (9,  'irene.member@example.com', 'Irene',  'Thomas',   'member',  'pass123',  '2024-01-27'),
  (10, 'jack.member@example.com',  'Jack',   'Lee',      'member',  'pass123',  '2024-01-30');

-- =========================
-- MEMBERSHIPS (10 rows)
-- =========================
CREATE TABLE memberships (
    membership_id INTEGER PRIMARY KEY,
    user_id       INTEGER NOT NULL,
    plan_type     TEXT NOT NULL,
    start_date    TEXT NOT NULL,
    end_date      TEXT,
    status        TEXT NOT NULL,
    price         REAL NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

INSERT INTO memberships (membership_id, user_id, plan_type, start_date, end_date, status, price) VALUES
  (1,  1,  'Basic',    '2024-02-01', '2024-05-01', 'expired', 99.0),
  (2,  2,  'Standard', '2024-03-01', NULL,         'active',  149.0),
  (3,  3,  'Premium',  '2024-03-10', NULL,         'active',  199.0),
  (4,  5,  'Standard', '2024-01-15', '2024-04-15', 'expired', 149.0),
  (5,  9,  'Basic',    '2024-04-01', NULL,         'active',  99.0),
  (6, 10,  'Premium',  '2024-02-20', NULL,         'active',  199.0),
  (7,  2,  'Standard', '2024-06-01', NULL,         'active',  149.0),
  (8,  3,  'Premium',  '2024-06-10', NULL,         'active',  199.0),
  (9,  5,  'Basic',    '2024-05-05', NULL,         'active',  99.0),
  (10, 5,  'Premium',  '2024-06-15', NULL,         'active',  199.0);

-- =========================
-- TRAINERS (10 rows, UNIQUE user_id)
-- =========================
CREATE TABLE trainers (
    trainer_id       INTEGER PRIMARY KEY,
    user_id          INTEGER NOT NULL UNIQUE,
    specialty        TEXT,
    experience_years INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

INSERT INTO trainers (trainer_id, user_id, specialty, experience_years) VALUES
  (1, 1,  'Strength Training', 5),
  (2, 2,  'Yoga & Mobility',   7),
  (3, 3,  'HIIT & Cardio',     4),
  (4, 4,  'Personal Training', 6),
  (5, 5,  'Pilates',           3),
  (6, 6,  'CrossFit',          4),
  (7, 7,  'Powerlifting',      5),
  (8, 8,  'Mindfulness Yoga',  6),
  (9, 9,  'Functional Fitness',4),
  (10,10, 'Group Classes',     5);

-- =========================
-- CLASSES (10 rows)
-- =========================
CREATE TABLE classes (
    class_id   INTEGER PRIMARY KEY,
    title      TEXT NOT NULL,
    description TEXT,
    trainer_id INTEGER,
    capacity   INTEGER,
    start_time TEXT,
    end_time   TEXT,
    location   TEXT,
    FOREIGN KEY (trainer_id) REFERENCES trainers(trainer_id)
);

INSERT INTO classes (class_id, title, description, trainer_id, capacity, start_time, end_time, location) VALUES
  (1, 'Morning Yoga',        'Gentle flexibility session',        2, 20, '2024-07-01 07:00', '2024-07-01 08:00', 'Studio A'),
  (2, 'HIIT Blast',          'High-intensity intervals',          3, 15, '2024-07-01 18:00', '2024-07-01 18:45', 'Studio B'),
  (3, 'Strength 101',        'Intro strength training',           1, 12, '2024-07-02 17:00', '2024-07-02 18:00', 'Gym Floor'),
  (4, 'Core Crusher',        'Core-focused workout',              3, 18, '2024-07-03 19:00', '2024-07-03 19:45', 'Studio C'),
  (5, 'Power Lifting',       'Advanced strength',                 7, 10, '2024-07-04 17:30', '2024-07-04 18:30', 'Gym Floor'),
  (6, 'Evening Yoga',        'Relaxing yoga session',             2, 22, '2024-07-04 20:00', '2024-07-04 21:00', 'Studio A'),
  (7, 'Cardio Burn',         'Circuit and treadmill',             3, 16, '2024-07-05 18:00', '2024-07-05 19:00', 'Studio B'),
  (8, 'Total Body Strength', 'Full body workout',                 1, 14, '2024-07-06 09:00', '2024-07-06 10:00', 'Gym Floor'),
  (9, 'Mobility Flow',       'Mobility and stretching',           8, 18, '2024-07-06 11:00', '2024-07-06 12:00', 'Studio C'),
  (10,'Saturday Bootcamp',   'Outdoor bootcamp',                 10, 25, '2024-07-06 08:00', '2024-07-06 09:00', 'Outdoor Area');

-- =========================
-- CLASS REGISTRATIONS (10 rows)
-- =========================
CREATE TABLE class_registrations (
    registration_id INTEGER PRIMARY KEY,
    class_id        INTEGER NOT NULL,
    user_id         INTEGER NOT NULL,
    registered_at   TEXT NOT NULL,
    status          TEXT NOT NULL,
    FOREIGN KEY (class_id) REFERENCES classes(class_id),
    FOREIGN KEY (user_id)  REFERENCES users(user_id)
);

INSERT INTO class_registrations (registration_id, class_id, user_id, registered_at, status) VALUES
  (1, 1, 2,  '2024-06-28 09:00', 'attended'),
  (2, 1, 3,  '2024-06-28 09:05', 'attended'),
  (3, 2, 4,  '2024-06-30 17:10', 'registered'),
  (4, 2, 5,  '2024-06-30 17:15', 'cancelled'),
  (5, 3, 2,  '2024-07-01 12:00', 'registered'),
  (6, 3, 4,  '2024-07-01 12:05', 'registered'),
  (7, 4, 10, '2024-07-02 13:20', 'attended'),
  (8, 5, 3,  '2024-07-03 10:00', 'registered'),
  (9, 6, 4,  '2024-07-03 10:10', 'registered'),
  (10,7, 5,  '2024-07-04 15:00', 'registered');

-- =========================
-- WORKOUT LOGS (10 rows)
-- =========================
CREATE TABLE workout_logs (
    log_id          INTEGER PRIMARY KEY,
    user_id         INTEGER NOT NULL,
    workout_date    TEXT NOT NULL,
    workout_type    TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL,
    calories_burned INTEGER NOT NULL,
    notes           TEXT,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

INSERT INTO workout_logs (log_id, user_id, workout_date, workout_type, duration_minutes, calories_burned, notes) VALUES
  (1,  2, '2024-06-20', 'Treadmill', 30, 250, 'Easy pace'),
  (2,  3, '2024-06-21', 'Yoga',      45, 150, 'Morning session'),
  (3,  4, '2024-06-22', 'Strength',  60, 400, 'Leg day'),
  (4,  5, '2024-06-23', 'Cycling',   40, 300, 'Spin bike'),
  (5,  9, '2024-06-24', 'HIIT',      25, 280, 'High intensity'),
  (6, 10,'2024-06-25', 'Rowing',    35, 260, 'Medium effort'),
  (7,  2, '2024-06-26', 'Strength',  50, 350, 'Upper body'),
  (8,  3, '2024-06-27', 'Yoga',      60, 180, 'Deep stretch'),
  (9,  4, '2024-06-28', 'Running',   30, 270, 'Intervals'),
  (10, 5,'2024-06-29', 'Core',       20, 120, 'Short workout');

-- =========================
-- PAYMENTS (10 rows)
-- =========================
CREATE TABLE payments (
    payment_id    INTEGER PRIMARY KEY,
    membership_id INTEGER NOT NULL,
    amount        REAL NOT NULL,
    payment_date  TEXT NOT NULL,
    method        TEXT NOT NULL,
    status        TEXT NOT NULL,
    FOREIGN KEY (membership_id) REFERENCES memberships(membership_id)
);

INSERT INTO payments (payment_id, membership_id, amount, payment_date, method, status) VALUES
  (1, 1,  99.0,  '2024-02-01', 'card',     'paid'),
  (2, 2, 149.0,  '2024-03-01', 'card',     'paid'),
  (3, 3, 199.0,  '2024-03-10', 'transfer', 'paid'),
  (4, 4, 149.0,  '2024-01-15', 'card',     'paid'),
  (5, 5,  99.0,  '2024-04-01', 'card',     'paid'),
  (6, 6, 199.0,  '2024-02-20', 'cash',     'paid'),
  (7, 7, 149.0,  '2024-06-01', 'card',     'paid'),
  (8, 8, 199.0,  '2024-06-10', 'card',     'paid'),
  (9, 9,  99.0,  '2024-05-05', 'transfer', 'paid'),
  (10,10,199.0, '2024-06-15', 'card',      'paid');
