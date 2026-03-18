-- =============================================
-- Migration: Personal Jam Sessions
-- Date: 2025-03-16
-- Description: Allow jam sessions without a band (personal practice)
-- =============================================

-- Make band_id nullable
ALTER TABLE jam_sessions ALTER COLUMN band_id DROP NOT NULL;

-- =============================================
-- Update helper function to handle personal jams
-- =============================================
CREATE OR REPLACE FUNCTION is_jam_session_band_member(p_session_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM jam_sessions js
    LEFT JOIN band_members bm ON bm.band_id = js.band_id
    WHERE js.id = p_session_id
    AND (
      -- Personal jam: host can access
      (js.band_id IS NULL AND js.host_id = p_user_id)
      -- Band jam: band member can access
      OR (js.band_id IS NOT NULL AND bm.user_id = p_user_id)
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- Update RLS Policies: jam_sessions
-- =============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Band members can view jam sessions" ON jam_sessions;
DROP POLICY IF EXISTS "Band members can create jam sessions" ON jam_sessions;
DROP POLICY IF EXISTS "Band members can update jam session" ON jam_sessions;

-- Recreate with personal jam support
CREATE POLICY "Users can view jam sessions"
  ON jam_sessions FOR SELECT
  USING (
    -- Personal jam: host can view
    (band_id IS NULL AND host_id = auth.uid())
    -- Band jam: band members can view
    OR (band_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM band_members
      WHERE band_members.band_id = jam_sessions.band_id
      AND band_members.user_id = auth.uid()
    ))
  );

CREATE POLICY "Users can create jam sessions"
  ON jam_sessions FOR INSERT
  WITH CHECK (
    host_id = auth.uid()
    AND (
      -- Personal jam: anyone can create
      band_id IS NULL
      -- Band jam: band member with band plan
      OR (
        EXISTS (
          SELECT 1 FROM band_members
          WHERE band_members.band_id = jam_sessions.band_id
          AND band_members.user_id = auth.uid()
        )
        AND EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
          AND profiles.plan = 'band'
        )
      )
    )
  );

CREATE POLICY "Users can update jam sessions"
  ON jam_sessions FOR UPDATE
  USING (
    -- Personal jam: host can update
    (band_id IS NULL AND host_id = auth.uid())
    -- Band jam: band members can update
    OR (band_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM band_members
      WHERE band_members.band_id = jam_sessions.band_id
      AND band_members.user_id = auth.uid()
    ))
  );

-- =============================================
-- Update RLS Policies: jam_session_participants
-- =============================================
DROP POLICY IF EXISTS "Band members can view session participants" ON jam_session_participants;
DROP POLICY IF EXISTS "Band members can join session" ON jam_session_participants;

CREATE POLICY "Users can view session participants"
  ON jam_session_participants FOR SELECT
  USING (is_jam_session_band_member(session_id, auth.uid()));

CREATE POLICY "Users can join session"
  ON jam_session_participants FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND is_jam_session_band_member(session_id, auth.uid())
  );

-- =============================================
-- Update RLS Policies: jam_session_messages
-- =============================================
DROP POLICY IF EXISTS "Participants can view messages" ON jam_session_messages;

CREATE POLICY "Users can view messages"
  ON jam_session_messages FOR SELECT
  USING (is_jam_session_band_member(session_id, auth.uid()));
