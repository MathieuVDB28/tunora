-- =========================================
-- Migration: Custom Exercises & Sharing with Friends
-- Description: Permettre aux utilisateurs de créer des exercices personnalisés
--              et de les partager avec leurs amis
-- =========================================

-- 1. Ajouter la colonne shared_with_friends à exercises
ALTER TABLE exercises
ADD COLUMN IF NOT EXISTS shared_with_friends BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN exercises.shared_with_friends IS 'Si true, l''exercice est visible par les amis du créateur';

-- 2. Index pour les requêtes de partage
CREATE INDEX IF NOT EXISTS exercises_created_by_idx ON exercises(created_by);
CREATE INDEX IF NOT EXISTS exercises_shared_with_friends_idx ON exercises(shared_with_friends) WHERE shared_with_friends = TRUE;

-- 3. Mettre à jour la politique SELECT pour inclure les exercices partagés par les amis
DROP POLICY IF EXISTS "Anyone can view system exercises" ON exercises;
CREATE POLICY "Users can view accessible exercises"
    ON exercises FOR SELECT
    USING (
        -- Exercices système visibles par tous
        is_system = TRUE
        -- Exercices créés par l'utilisateur
        OR auth.uid() = created_by
        -- Exercices partagés par des amis
        OR (
            shared_with_friends = TRUE
            AND EXISTS (
                SELECT 1 FROM friendships f
                WHERE f.status = 'accepted'
                AND (
                    (f.requester_id = auth.uid() AND f.addressee_id = exercises.created_by)
                    OR (f.addressee_id = auth.uid() AND f.requester_id = exercises.created_by)
                )
            )
        )
    );

-- 4. Politique UPDATE pour les exercices personnels
DROP POLICY IF EXISTS "Users can update own exercises" ON exercises;
CREATE POLICY "Users can update own exercises"
    ON exercises FOR UPDATE
    USING (auth.uid() = created_by AND is_system = FALSE)
    WITH CHECK (auth.uid() = created_by AND is_system = FALSE);

-- 5. Politique DELETE pour les exercices personnels
DROP POLICY IF EXISTS "Users can delete own exercises" ON exercises;
CREATE POLICY "Users can delete own exercises"
    ON exercises FOR DELETE
    USING (auth.uid() = created_by AND is_system = FALSE);
