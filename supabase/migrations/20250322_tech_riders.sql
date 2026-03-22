-- Tech Riders (Fiches Techniques) for bands
CREATE TABLE tech_riders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  band_id UUID NOT NULL REFERENCES bands(id) ON DELETE CASCADE,
  sound_engineer_name TEXT,
  sound_engineer_phone TEXT,
  musicians JSONB DEFAULT '[]'::jsonb,
  channels JSONB DEFAULT '[]'::jsonb,
  stage_elements JSONB DEFAULT '[]'::jsonb,
  general_notes TEXT,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(band_id)
);

ALTER TABLE tech_riders ENABLE ROW LEVEL SECURITY;

-- Band members can read tech riders
CREATE POLICY "Band members can read tech riders"
ON tech_riders FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM band_members
    WHERE band_members.band_id = tech_riders.band_id
    AND band_members.user_id = auth.uid()
  )
);

-- Band owner/admin can insert tech riders
CREATE POLICY "Band owner/admin can insert tech riders"
ON tech_riders FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM band_members
    WHERE band_members.band_id = tech_riders.band_id
    AND band_members.user_id = auth.uid()
    AND band_members.role IN ('owner', 'admin')
  )
);

-- Band owner/admin can update tech riders
CREATE POLICY "Band owner/admin can update tech riders"
ON tech_riders FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM band_members
    WHERE band_members.band_id = tech_riders.band_id
    AND band_members.user_id = auth.uid()
    AND band_members.role IN ('owner', 'admin')
  )
);

-- Band owner can delete tech riders
CREATE POLICY "Band owner can delete tech riders"
ON tech_riders FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM band_members
    WHERE band_members.band_id = tech_riders.band_id
    AND band_members.user_id = auth.uid()
    AND band_members.role = 'owner'
  )
);
