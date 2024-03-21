CREATE TABLE IF NOT EXISTS PROP_Property (
    ID TEXT PRIMARY KEY,
    ObjectID TEXT NOT NULL,
    ObjectType TEXT NOT NULL,
    PropertyFieldID TEXT NOT NULL,
    ChannelID TEXT NOT NULL,
    TeamID TEXT NOT NULL,
    Value JSON NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_PROP_property_objectid ON PROP_Property (ObjectID);

CREATE VIEW PROP_Property_Query_View AS SELECT ObjectID, TeamID, ChannelID, json_object_agg(PropertyFieldID, Value) AS Properties from PROP_Property GROUP BY ObjectID, TeamID, ChannelID;
