-- =============================================
-- Migration: Rehearsals & Band Chat
-- Date: 2025-03-19
-- Description: Planification des repetitions avec recurrence,
--   systeme RSVP, messagerie de groupe et fils de discussion
-- =============================================

-- =============================================
-- Types enum
-- =============================================
CREATE TYPE rehearsal_status AS ENUM ('scheduled', 'cancelled', 'completed');
CREATE TYPE rehearsal_rsvp_status AS ENUM ('invited', 'accepted', 'declined', 'maybe');
CREATE TYPE recurrence_type AS ENUM ('none', 'weekly', 'biweekly', 'monthly');

-- =============================================
-- Table: rehearsals
-- =============================================
CREATE TABLE IF NOT EXISTS rehearsals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  band_id UUID NOT NULL REFERENCES bands(id) ON DELETE CASCADE,
  setlist_id UUID REFERENCES setlists(id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  location_url TEXT,

  -- Scheduling
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  status rehearsal_status NOT NULL DEFAULT 'scheduled',

  -- Recurrence: parent stores the rule, children are generated occurrences
  recurrence recurrence_type NOT NULL DEFAULT 'none',
  recurrence_day_of_week INTEGER,          -- 0=Sun, 1=Mon, ..., 6=Sat
  recurrence_end_date DATE,                -- when the recurrence stops
  parent_rehearsal_id UUID REFERENCES rehearsals(id) ON DELETE CASCADE,

  -- Post-rehearsal notes
  notes TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS rehearsals_band_idx ON rehearsals(band_id);
CREATE INDEX IF NOT EXISTS rehearsals_date_idx ON rehearsals(date);
CREATE INDEX IF NOT EXISTS rehearsals_status_idx ON rehearsals(status);
CREATE INDEX IF NOT EXISTS rehearsals_parent_idx ON rehearsals(parent_rehearsal_id);
CREATE INDEX IF NOT EXISTS rehearsals_created_by_idx ON rehearsals(created_by);

-- =============================================
-- Table: rehearsal_participants (RSVP)
-- =============================================
CREATE TABLE IF NOT EXISTS rehearsal_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rehearsal_id UUID NOT NULL REFERENCES rehearsals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status rehearsal_rsvp_status NOT NULL DEFAULT 'invited',
  responded_at TIMESTAMP WITH TIME ZONE,

  CONSTRAINT unique_rehearsal_participant UNIQUE (rehearsal_id, user_id)
);

CREATE INDEX IF NOT EXISTS rehearsal_participants_rehearsal_idx ON rehearsal_participants(rehearsal_id);
CREATE INDEX IF NOT EXISTS rehearsal_participants_user_idx ON rehearsal_participants(user_id);
CREATE INDEX IF NOT EXISTS rehearsal_participants_status_idx ON rehearsal_participants(status);

-- =============================================
-- Table: band_messages (Group chat + rehearsal threads)
-- =============================================
CREATE TABLE IF NOT EXISTS band_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  band_id UUID NOT NULL REFERENCES bands(id) ON DELETE CASCADE,
  rehearsal_id UUID REFERENCES rehearsals(id) ON DELETE CASCADE,  -- NULL = general chat
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS band_messages_band_idx ON band_messages(band_id);
CREATE INDEX IF NOT EXISTS band_messages_rehearsal_idx ON band_messages(rehearsal_id);
CREATE INDEX IF NOT EXISTS band_messages_created_idx ON band_messages(created_at);

-- =============================================
-- Triggers: updated_at
-- =============================================
CREATE TRIGGER update_rehearsals_updated_at
  BEFORE UPDATE ON rehearsals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- RLS: Enable
-- =============================================
ALTER TABLE rehearsals ENABLE ROW LEVEL SECURITY;
ALTER TABLE rehearsal_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE band_messages ENABLE ROW LEVEL SECURITY;

-- =============================================
-- Helper: is band member (SECURITY DEFINER)
-- =============================================
CREATE OR REPLACE FUNCTION is_rehearsal_band_member(p_rehearsal_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM rehearsals r
    JOIN band_members bm ON bm.band_id = r.band_id
    WHERE r.id = p_rehearsal_id
    AND bm.user_id = p_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- RLS Policies: rehearsals
-- =============================================
CREATE POLICY "Band members can view rehearsals"
  ON rehearsals FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM band_members
      WHERE band_members.band_id = rehearsals.band_id
      AND band_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Band members can create rehearsals"
  ON rehearsals FOR INSERT
  WITH CHECK (
    created_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM band_members
      WHERE band_members.band_id = rehearsals.band_id
      AND band_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Band members can update rehearsals"
  ON rehearsals FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM band_members
      WHERE band_members.band_id = rehearsals.band_id
      AND band_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Creator or band owner can delete rehearsals"
  ON rehearsals FOR DELETE
  USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM bands
      WHERE bands.id = rehearsals.band_id
      AND bands.owner_id = auth.uid()
    )
  );

-- =============================================
-- RLS Policies: rehearsal_participants
-- =============================================
CREATE POLICY "Band members can view rehearsal participants"
  ON rehearsal_participants FOR SELECT
  USING (is_rehearsal_band_member(rehearsal_id, auth.uid()));

CREATE POLICY "Band members can add participants"
  ON rehearsal_participants FOR INSERT
  WITH CHECK (is_rehearsal_band_member(rehearsal_id, auth.uid()));

CREATE POLICY "Participant can update own RSVP"
  ON rehearsal_participants FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Creator or band owner can remove participants"
  ON rehearsal_participants FOR DELETE
  USING (
    user_id = auth.uid()
    OR is_rehearsal_band_member(rehearsal_id, auth.uid())
  );

-- =============================================
-- RLS Policies: band_messages
-- =============================================
CREATE POLICY "Band members can view messages"
  ON band_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM band_members
      WHERE band_members.band_id = band_messages.band_id
      AND band_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Band members can send messages"
  ON band_messages FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM band_members
      WHERE band_members.band_id = band_messages.band_id
      AND band_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Author can delete own messages"
  ON band_messages FOR DELETE
  USING (user_id = auth.uid());

-- =============================================
-- Enable Realtime for band_messages
-- =============================================
ALTER PUBLICATION supabase_realtime ADD TABLE band_messages;
