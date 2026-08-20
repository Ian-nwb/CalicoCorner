-- Supabase Row Level Security (RLS) Policies for Calico Corner Checklists (`todos`)

-- 1. Enable Row Level Security on the `todos` table
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- 2. READ ACCESS (SELECT): Both Tori and Motmot can view each other's checklists
CREATE POLICY "Allow authenticated users to read all todos"
ON todos
FOR SELECT
TO authenticated
USING (true);

-- 3. INSERT ACCESS: Users can only add items to their own checklist
CREATE POLICY "Allow users to create items in their own checklist"
ON todos
FOR INSERT
TO authenticated
WITH CHECK (
  owner = (
    CASE 
      WHEN auth.jwt() ->> 'email' LIKE '%tori%' THEN 'tori'
      WHEN auth.jwt() ->> 'email' LIKE '%motmot%' OR auth.jwt() ->> 'email' LIKE '%ian%' THEN 'motmot'
      ELSE (auth.jwt() -> 'user_metadata' ->> 'role')
    END
  )
);

-- 4. UPDATE ACCESS: Users can only update (complete/edit) items in their own checklist
CREATE POLICY "Allow users to update items in their own checklist"
ON todos
FOR UPDATE
TO authenticated
USING (
  owner = (
    CASE 
      WHEN auth.jwt() ->> 'email' LIKE '%tori%' THEN 'tori'
      WHEN auth.jwt() ->> 'email' LIKE '%motmot%' OR auth.jwt() ->> 'email' LIKE '%ian%' THEN 'motmot'
      ELSE (auth.jwt() -> 'user_metadata' ->> 'role')
    END
  )
);

-- 5. DELETE ACCESS: Users can only delete items from their own checklist
CREATE POLICY "Allow users to delete items from their own checklist"
ON todos
FOR DELETE
TO authenticated
USING (
  owner = (
    CASE 
      WHEN auth.jwt() ->> 'email' LIKE '%tori%' THEN 'tori'
      WHEN auth.jwt() ->> 'email' LIKE '%motmot%' OR auth.jwt() ->> 'email' LIKE '%ian%' THEN 'motmot'
      ELSE (auth.jwt() -> 'user_metadata' ->> 'role')
    END
  )
);
