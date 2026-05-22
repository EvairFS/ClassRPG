DROP TABLE IF EXISTS achievements CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS missions CASCADE;
DROP TABLE IF EXISTS teams CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS teachers CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS student_achievements CASCADE;
DROP TABLE IF EXISTS team_members CASCADE;

-- USERS (for login)
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student','teacher','admin')),
  name TEXT NOT NULL
);

-- STUDENTS
CREATE TABLE students (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  avatar TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  classroom TEXT NOT NULL,
  xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  patent TEXT NOT NULL DEFAULT 'Novato',
  streak INTEGER NOT NULL DEFAULT 0,
  missions_completed INTEGER NOT NULL DEFAULT 0,
  activities_completed INTEGER NOT NULL DEFAULT 0,
  team_id TEXT
);

-- TEACHERS
CREATE TABLE teachers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  avatar TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  subject TEXT NOT NULL,
  classes TEXT[] NOT NULL DEFAULT '{}',
  students_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','pending'))
);

-- ACHIEVEMENTS
CREATE TABLE achievements (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  rarity TEXT NOT NULL CHECK (rarity IN ('common','rare','epic','legendary'))
);

-- STUDENT_ACHIEVEMENTS (many-to-many)
CREATE TABLE student_achievements (
  student_id TEXT REFERENCES students(id) ON DELETE CASCADE,
  achievement_id TEXT REFERENCES achievements(id) ON DELETE CASCADE,
  earned BOOLEAN NOT NULL DEFAULT FALSE,
  earned_at TEXT,
  progress INTEGER,
  PRIMARY KEY (student_id, achievement_id)
);

-- MISSIONS
CREATE TABLE missions (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('daily','weekly','special','event','challenge')),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy','Medium','Hard','Epic')),
  xp_reward INTEGER NOT NULL,
  deadline TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available','in_progress','completed','expired')),
  progress INTEGER NOT NULL DEFAULT 0,
  total INTEGER NOT NULL DEFAULT 1
);

-- ACTIVITIES
CREATE TABLE activities (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  subject TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy','Medium','Hard','Epic')),
  xp_reward INTEGER NOT NULL,
  deadline TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','submitted','graded')),
  grade INTEGER,
  instructions TEXT,
  submission TEXT,
  feedback TEXT,
  teacher TEXT
);

-- TEAMS
CREATE TABLE teams (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  emblem TEXT NOT NULL,
  members INTEGER NOT NULL DEFAULT 0,
  xp INTEGER NOT NULL DEFAULT 0,
  weekly_xp INTEGER NOT NULL DEFAULT 0,
  motto TEXT
);

-- TEAM_MEMBERS
CREATE TABLE team_members (
  team_id TEXT REFERENCES teams(id) ON DELETE CASCADE,
  student_id TEXT REFERENCES students(id) ON DELETE CASCADE,
  PRIMARY KEY (team_id, student_id)
);

-- NOTIFICATIONS
CREATE TABLE notifications (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('xp','mission','achievement','system','feedback')),
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TEXT NOT NULL
);