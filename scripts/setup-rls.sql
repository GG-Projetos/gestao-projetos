-- Configurar Row Level Security (RLS) para segurança

-- Habilitar RLS em todas as tabelas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas para groups
CREATE POLICY "Users can view groups they are members of" ON groups FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM group_members 
    WHERE group_members.group_id = groups.id 
    AND group_members.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create groups" ON groups FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group owners can update groups" ON groups FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM group_members 
    WHERE group_members.group_id = groups.id 
    AND group_members.user_id = auth.uid() 
    AND group_members.role = 'owner'
  )
);

CREATE POLICY "Group owners can delete groups" ON groups FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM group_members 
    WHERE group_members.group_id = groups.id 
    AND group_members.user_id = auth.uid() 
    AND group_members.role = 'owner'
  )
);

-- Políticas para group_members
CREATE POLICY "Users can view group members of their groups" ON group_members FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM group_members gm 
    WHERE gm.group_id = group_members.group_id 
    AND gm.user_id = auth.uid()
  )
);

CREATE POLICY "Group owners can manage members" ON group_members FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM group_members gm 
    WHERE gm.group_id = group_members.group_id 
    AND gm.user_id = auth.uid() 
    AND gm.role = 'owner'
  )
);

-- Políticas para columns
CREATE POLICY "Users can view columns of their groups" ON columns FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM group_members 
    WHERE group_members.group_id = columns.group_id 
    AND group_members.user_id = auth.uid()
  )
);

CREATE POLICY "Group members can manage columns" ON columns FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM group_members 
    WHERE group_members.group_id = columns.group_id 
    AND group_members.user_id = auth.uid()
  )
);

-- Políticas para tasks
CREATE POLICY "Users can view tasks of their groups" ON tasks FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM group_members 
    WHERE group_members.group_id = tasks.group_id 
    AND group_members.user_id = auth.uid()
  )
);

CREATE POLICY "Group members can manage tasks" ON tasks FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM group_members 
    WHERE group_members.group_id = tasks.group_id 
    AND group_members.user_id = auth.uid()
  )
);
