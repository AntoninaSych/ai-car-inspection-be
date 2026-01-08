-- Create application role
CREATE ROLE ai_car WITH LOGIN PASSWORD '22Qyzr7qz5Bk23dD7JTR';

-- Create database owned by application role
CREATE DATABASE ai_car OWNER ai_car;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE ai_car TO ai_car;
