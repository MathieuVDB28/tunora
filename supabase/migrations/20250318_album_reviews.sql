-- Migration: Album Reviews
-- Permet aux utilisateurs de noter et commenter les albums qu'ils ont écoutés

-- Ajouter 'album_reviewed' au type enum activity_type
ALTER TYPE activity_type ADD VALUE IF NOT EXISTS 'album_reviewed';

-- Table album_reviews
CREATE TABLE album_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  album_name text NOT NULL,
  artist_name text NOT NULL,
  cover_url text,
  spotify_id text,
  spotify_url text,
  release_date text,
  total_tracks integer,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 10),
  review text CHECK (char_length(review) <= 2000),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index pour les requêtes fréquentes
CREATE INDEX idx_album_reviews_user_id ON album_reviews(user_id);
CREATE INDEX idx_album_reviews_created_at ON album_reviews(created_at DESC);
CREATE INDEX idx_album_reviews_spotify_id ON album_reviews(spotify_id);

-- Trigger updated_at
CREATE TRIGGER set_album_reviews_updated_at
  BEFORE UPDATE ON album_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE album_reviews ENABLE ROW LEVEL SECURITY;

-- L'utilisateur peut voir ses propres reviews
CREATE POLICY "Users can view own album reviews"
  ON album_reviews FOR SELECT
  USING (auth.uid() = user_id);

-- Les amis peuvent voir les reviews
CREATE POLICY "Friends can view album reviews"
  ON album_reviews FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM friendships
      WHERE status = 'accepted'
      AND (
        (requester_id = auth.uid() AND addressee_id = album_reviews.user_id)
        OR (addressee_id = auth.uid() AND requester_id = album_reviews.user_id)
      )
    )
  );

-- L'utilisateur peut créer ses propres reviews
CREATE POLICY "Users can create own album reviews"
  ON album_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- L'utilisateur peut modifier ses propres reviews
CREATE POLICY "Users can update own album reviews"
  ON album_reviews FOR UPDATE
  USING (auth.uid() = user_id);

-- L'utilisateur peut supprimer ses propres reviews
CREATE POLICY "Users can delete own album reviews"
  ON album_reviews FOR DELETE
  USING (auth.uid() = user_id);
