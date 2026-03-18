-- Add tabs, BPM, and played sections to setlist items
ALTER TABLE setlist_items
  ADD COLUMN IF NOT EXISTS tabs_url TEXT,
  ADD COLUMN IF NOT EXISTS bpm INTEGER,
  ADD COLUMN IF NOT EXISTS played_sections JSONB DEFAULT '[]'::jsonb;

-- Comment for documentation
COMMENT ON COLUMN setlist_items.tabs_url IS 'URL to tab source (Songsterr, Ultimate Guitar, etc.)';
COMMENT ON COLUMN setlist_items.bpm IS 'BPM for this song in the setlist';
COMMENT ON COLUMN setlist_items.played_sections IS 'Array of played sections: [{name, startMeasure, endMeasure}]';
