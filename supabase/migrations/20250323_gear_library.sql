-- =============================================
-- Gear Library (Bibliothèque de Matériel)
-- =============================================

-- Enums
CREATE TYPE gear_type AS ENUM ('guitar', 'bass', 'amp', 'effect', 'accessory', 'recording', 'other');
CREATE TYPE gear_condition AS ENUM ('mint', 'excellent', 'good', 'fair', 'poor');
CREATE TYPE gear_visibility AS ENUM ('private', 'friends', 'public');
CREATE TYPE gear_priority AS ENUM ('low', 'medium', 'high');

-- =============================================
-- Table : gear_items (Matériel)
-- =============================================
CREATE TABLE gear_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type gear_type NOT NULL,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER,
  color TEXT,
  serial_number TEXT,
  condition gear_condition,
  purchase_price NUMERIC,
  purchase_date DATE,
  image_url TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  visibility gear_visibility DEFAULT 'friends',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_gear_items_user_id ON gear_items(user_id);
CREATE INDEX idx_gear_items_type ON gear_items(user_id, type);

ALTER TABLE gear_items ENABLE ROW LEVEL SECURITY;

-- Owner can do everything
CREATE POLICY "Users can read own gear"
ON gear_items FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own gear"
ON gear_items FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own gear"
ON gear_items FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users can delete own gear"
ON gear_items FOR DELETE
USING (user_id = auth.uid());

-- Friends can see gear with visibility 'friends' or 'public'
CREATE POLICY "Friends can view friends gear"
ON gear_items FOR SELECT
USING (
  visibility IN ('friends', 'public')
  AND EXISTS (
    SELECT 1 FROM friendships
    WHERE status = 'accepted'
    AND (
      (requester_id = auth.uid() AND addressee_id = gear_items.user_id)
      OR (addressee_id = auth.uid() AND requester_id = gear_items.user_id)
    )
  )
);

-- Anyone can see public gear
CREATE POLICY "Anyone can view public gear"
ON gear_items FOR SELECT
USING (visibility = 'public');

-- =============================================
-- Table : gear_setups (Setups / combinaisons)
-- =============================================
CREATE TABLE gear_setups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  cover_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_gear_setups_user_id ON gear_setups(user_id);

ALTER TABLE gear_setups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own setups"
ON gear_setups FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own setups"
ON gear_setups FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own setups"
ON gear_setups FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users can delete own setups"
ON gear_setups FOR DELETE
USING (user_id = auth.uid());

-- =============================================
-- Table : gear_setup_items (Gear dans un setup)
-- =============================================
CREATE TABLE gear_setup_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  setup_id UUID NOT NULL REFERENCES gear_setups(id) ON DELETE CASCADE,
  gear_id UUID NOT NULL REFERENCES gear_items(id) ON DELETE CASCADE,
  position INTEGER DEFAULT 0,
  role TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(setup_id, gear_id)
);

CREATE INDEX idx_gear_setup_items_setup_id ON gear_setup_items(setup_id);

ALTER TABLE gear_setup_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own setup items"
ON gear_setup_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM gear_setups
    WHERE gear_setups.id = gear_setup_items.setup_id
    AND gear_setups.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert own setup items"
ON gear_setup_items FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM gear_setups
    WHERE gear_setups.id = gear_setup_items.setup_id
    AND gear_setups.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update own setup items"
ON gear_setup_items FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM gear_setups
    WHERE gear_setups.id = gear_setup_items.setup_id
    AND gear_setups.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete own setup items"
ON gear_setup_items FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM gear_setups
    WHERE gear_setups.id = gear_setup_items.setup_id
    AND gear_setups.user_id = auth.uid()
  )
);

-- =============================================
-- Table : gear_wishlist (Wishlist matériel)
-- =============================================
CREATE TABLE gear_wishlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type gear_type NOT NULL,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  estimated_price NUMERIC,
  image_url TEXT,
  url TEXT,
  notes TEXT,
  priority gear_priority DEFAULT 'medium',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_gear_wishlist_user_id ON gear_wishlist(user_id);

ALTER TABLE gear_wishlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own wishlist"
ON gear_wishlist FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own wishlist"
ON gear_wishlist FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own wishlist"
ON gear_wishlist FOR DELETE
USING (user_id = auth.uid());

-- =============================================
-- Table : favorite_gear (Gear favoris profil, 4 max)
-- =============================================
CREATE TABLE favorite_gear (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  gear_id UUID NOT NULL REFERENCES gear_items(id) ON DELETE CASCADE,
  position INTEGER NOT NULL CHECK (position >= 1 AND position <= 4),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, position)
);

CREATE INDEX idx_favorite_gear_user_id ON favorite_gear(user_id);

ALTER TABLE favorite_gear ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own favorite gear"
ON favorite_gear FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own favorite gear"
ON favorite_gear FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own favorite gear"
ON favorite_gear FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users can delete own favorite gear"
ON favorite_gear FOR DELETE
USING (user_id = auth.uid());

-- Friends/public can see favorite gear (for public profile)
CREATE POLICY "Anyone can view favorite gear"
ON favorite_gear FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = favorite_gear.user_id
    AND (
      profiles.is_private = false
      OR EXISTS (
        SELECT 1 FROM friendships
        WHERE status = 'accepted'
        AND (
          (requester_id = auth.uid() AND addressee_id = favorite_gear.user_id)
          OR (addressee_id = auth.uid() AND requester_id = favorite_gear.user_id)
        )
      )
    )
  )
);

-- =============================================
-- Table : cover_gear (Gear taggé sur une cover)
-- =============================================
CREATE TABLE cover_gear (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cover_id UUID NOT NULL REFERENCES covers(id) ON DELETE CASCADE,
  gear_id UUID NOT NULL REFERENCES gear_items(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(cover_id, gear_id)
);

CREATE INDEX idx_cover_gear_cover_id ON cover_gear(cover_id);

ALTER TABLE cover_gear ENABLE ROW LEVEL SECURITY;

-- Owner can manage cover gear tags
CREATE POLICY "Users can read cover gear"
ON cover_gear FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM covers
    WHERE covers.id = cover_gear.cover_id
    AND covers.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert cover gear"
ON cover_gear FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM covers
    WHERE covers.id = cover_gear.cover_id
    AND covers.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete cover gear"
ON cover_gear FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM covers
    WHERE covers.id = cover_gear.cover_id
    AND covers.user_id = auth.uid()
  )
);

-- Friends can see gear on visible covers
CREATE POLICY "Friends can view cover gear"
ON cover_gear FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM covers
    WHERE covers.id = cover_gear.cover_id
    AND covers.visibility IN ('friends', 'public')
  )
);

-- =============================================
-- Table : song_gear (Gear associé à un morceau)
-- =============================================
CREATE TABLE song_gear (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  song_id UUID NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
  gear_id UUID NOT NULL REFERENCES gear_items(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(song_id, gear_id)
);

CREATE INDEX idx_song_gear_song_id ON song_gear(song_id);

ALTER TABLE song_gear ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own song gear"
ON song_gear FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM songs
    WHERE songs.id = song_gear.song_id
    AND songs.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert own song gear"
ON song_gear FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM songs
    WHERE songs.id = song_gear.song_id
    AND songs.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete own song gear"
ON song_gear FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM songs
    WHERE songs.id = song_gear.song_id
    AND songs.user_id = auth.uid()
  )
);

-- =============================================
-- Storage bucket : gear (photos de matériel)
-- =============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'gear',
  'gear',
  true,
  10485760,  -- 10 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Users can upload gear images in their folder
CREATE POLICY "Users can upload gear images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'gear'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Anyone can view gear images (public bucket)
CREATE POLICY "Anyone can view gear images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'gear');

-- Users can delete their own gear images
CREATE POLICY "Users can delete own gear images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'gear'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can update their own gear images
CREATE POLICY "Users can update own gear images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'gear'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- =============================================
-- Add gear_added to activity type enum
-- =============================================
ALTER TYPE activity_type ADD VALUE IF NOT EXISTS 'gear_added';
