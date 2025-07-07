-- Desabilitar RLS temporariamente para debug
ALTER TABLE groups DISABLE ROW LEVEL SECURITY;
ALTER TABLE group_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE columns DISABLE ROW LEVEL SECURITY;
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;

-- Remover todas as políticas existentes
DROP POLICY IF EXISTS "Users can create groups" ON groups;
DROP POLICY IF EXISTS "Users can view groups they are members of" ON groups;
DROP POLICY IF EXISTS "Group owners can update groups" ON groups;
DROP POLICY IF EXISTS "Group owners can delete groups" ON groups;

DROP POLICY IF EXISTS "Users can view group members of their groups" ON group_members;
DROP POLICY IF EXISTS "Users can add themselves to groups" ON group_members;
DROP POLICY IF EXISTS "Group owners can manage all members" ON group_members;

DROP POLICY IF EXISTS "Users can view columns of their groups" ON columns;
DROP POLICY IF EXISTS "Group members can insert columns" ON columns;
DROP POLICY IF EXISTS "Group members can update columns" ON columns;
DROP POLICY IF EXISTS "Group members can delete columns" ON columns;

DROP POLICY IF EXISTS "Users can view tasks of their groups" ON tasks;
DROP POLICY IF EXISTS "Group members can insert tasks" ON tasks;
DROP POLICY IF EXISTS "Group members can update tasks" ON tasks;
DROP POLICY IF EXISTS "Group members can delete tasks" ON tasks;

-- Reabilitar RLS
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Políticas mais simples para groups
CREATE POLICY "Enable all for authenticated users on groups" ON groups
FOR ALL USING (auth.role() = 'authenticated');

-- Políticas mais simples para group_members
CREATE POLICY "Enable all for authenticated users on group_members" ON group_members
FOR ALL USING (auth.role() = 'authenticated');

-- Políticas mais simples para columns
CREATE POLICY "Enable all for authenticated users on columns" ON columns
FOR ALL USING (auth.role() = 'authenticated');

-- Políticas mais simples para tasks
CREATE POLICY "Enable all for authenticated users on tasks" ON tasks
FOR ALL USING (auth.role() = 'authenticated');
