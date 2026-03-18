-- =============================================
-- Migration: Activity Reactions & Comments
-- Date: 2025-03-17
-- Description: Permet aux amis de réagir (emoji) et commenter les activités du feed
-- =============================================

-- =============================================
-- Table: activity_reactions
-- =============================================
CREATE TABLE IF NOT EXISTS activity_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Un seul emoji du même type par utilisateur par activité
  CONSTRAINT unique_user_emoji_per_activity UNIQUE (activity_id, user_id, emoji)
);

CREATE INDEX IF NOT EXISTS activity_reactions_activity_id_idx ON activity_reactions(activity_id);
CREATE INDEX IF NOT EXISTS activity_reactions_user_id_idx ON activity_reactions(user_id);

-- =============================================
-- Table: activity_comments
-- =============================================
CREATE TABLE IF NOT EXISTS activity_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) > 0 AND char_length(content) <= 500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS activity_comments_activity_id_idx ON activity_comments(activity_id);
CREATE INDEX IF NOT EXISTS activity_comments_user_id_idx ON activity_comments(user_id);
CREATE INDEX IF NOT EXISTS activity_comments_created_at_idx ON activity_comments(created_at);

-- =============================================
-- RLS: Activer
-- =============================================
ALTER TABLE activity_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_comments ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS Policies: activity_reactions
-- =============================================

-- Les utilisateurs peuvent voir les réactions sur les activités qu'ils peuvent voir
CREATE POLICY "Users can view reactions on visible activities"
  ON activity_reactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM activities a
      WHERE a.id = activity_reactions.activity_id
      AND (
        a.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM friendships
          WHERE status = 'accepted'
          AND (
            (requester_id = auth.uid() AND addressee_id = a.user_id)
            OR (addressee_id = auth.uid() AND requester_id = a.user_id)
          )
        )
      )
    )
  );

-- Les utilisateurs peuvent ajouter des réactions
CREATE POLICY "Users can add reactions"
  ON activity_reactions FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM activities a
      WHERE a.id = activity_reactions.activity_id
      AND (
        a.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM friendships
          WHERE status = 'accepted'
          AND (
            (requester_id = auth.uid() AND addressee_id = a.user_id)
            OR (addressee_id = auth.uid() AND requester_id = a.user_id)
          )
        )
      )
    )
  );

-- Les utilisateurs peuvent supprimer leurs propres réactions
CREATE POLICY "Users can delete own reactions"
  ON activity_reactions FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- RLS Policies: activity_comments
-- =============================================

-- Les utilisateurs peuvent voir les commentaires sur les activités qu'ils peuvent voir
CREATE POLICY "Users can view comments on visible activities"
  ON activity_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM activities a
      WHERE a.id = activity_comments.activity_id
      AND (
        a.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM friendships
          WHERE status = 'accepted'
          AND (
            (requester_id = auth.uid() AND addressee_id = a.user_id)
            OR (addressee_id = auth.uid() AND requester_id = a.user_id)
          )
        )
      )
    )
  );

-- Les utilisateurs peuvent ajouter des commentaires
CREATE POLICY "Users can add comments"
  ON activity_comments FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM activities a
      WHERE a.id = activity_comments.activity_id
      AND (
        a.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM friendships
          WHERE status = 'accepted'
          AND (
            (requester_id = auth.uid() AND addressee_id = a.user_id)
            OR (addressee_id = auth.uid() AND requester_id = a.user_id)
          )
        )
      )
    )
  );

-- Les utilisateurs peuvent supprimer leurs propres commentaires
CREATE POLICY "Users can delete own comments"
  ON activity_comments FOR DELETE
  USING (auth.uid() = user_id);
