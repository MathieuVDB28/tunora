-- =============================================
-- Album Wishlist - Albums à écouter
-- =============================================

CREATE TABLE IF NOT EXISTS album_wishlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  album_name TEXT NOT NULL,
  artist_name TEXT NOT NULL,
  cover_url TEXT,
  spotify_id TEXT,
  spotify_url TEXT,
  release_date TEXT,
  total_tracks INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unique constraint: un album par utilisateur (par spotify_id)
ALTER TABLE album_wishlist ADD CONSTRAINT album_wishlist_user_spotify_unique UNIQUE (user_id, spotify_id);

-- Index
CREATE INDEX idx_album_wishlist_user_id ON album_wishlist(user_id);
CREATE INDEX idx_album_wishlist_created_at ON album_wishlist(created_at DESC);

-- RLS
ALTER TABLE album_wishlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own album wishlist"
  ON album_wishlist FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own album wishlist"
  ON album_wishlist FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own album wishlist"
  ON album_wishlist FOR DELETE
  USING (auth.uid() = user_id);

-- Friends can view album wishlist
CREATE POLICY "Friends can view album wishlist"
  ON album_wishlist FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM friendships
      WHERE status = 'accepted'
      AND (
        (requester_id = auth.uid() AND addressee_id = album_wishlist.user_id)
        OR (addressee_id = auth.uid() AND requester_id = album_wishlist.user_id)
      )
    )
  );
