CREATE TABLE IF NOT EXISTS PROP_ViewMember (
    ViewID TEXT NOT NULL,
    UserID TEXT NOT NULL,
    UNIQUE (ViewID, UserID)
);