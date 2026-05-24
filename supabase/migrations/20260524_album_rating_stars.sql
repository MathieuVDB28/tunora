-- Migration: Album rating system change to 5 stars (0–10 integer, each unit = 0.5 star)
ALTER TABLE album_reviews
  DROP CONSTRAINT IF EXISTS album_reviews_rating_check;

ALTER TABLE album_reviews
  ADD CONSTRAINT album_reviews_rating_check CHECK (rating >= 0 AND rating <= 10);
