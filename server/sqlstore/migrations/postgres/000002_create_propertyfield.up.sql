CREATE TABLE IF NOT EXISTS PROP_PropertyField (
    ID TEXT PRIMARY KEY,
    TeamID TEXT NOT NULL,
    UpdateAt BIGINT NOT NULL,
    UpdateBy TEXT NOT NULL,
    Name TEXT NOT NULL UNIQUE,
    Type TEXT NOT NULL,
    Values JSON
);
