-- Remover políticas existentes que podem estar conflitando
DROP POLICY IF EXISTS "Users can create groups" ON groups;
DROP POLICY IF EXISTS "Group owners can manage members" ON group_members;
DROP POLICY IF EXISTS "User can add self to group_members" ON group_members;
DROP POLICY IF EXISTS "Group members can manage columns" ON columns;

-- Políticas para groups
CREATE POLICY "Users can create groups" ON groups 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can view groups they are members of" ON groups 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM group_members 
    WHERE group_members.group_id = groups.id 
    AND group_members.user_id = auth.uid()
  )
);

CREATE POLICY "Group owners can update groups" ON groups 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM group_members 
    WHERE group_members.group_id = groups.id 
    AND group_members.user_id = auth.uid() 
    AND group_members.role = 'owner'
  )
);

CREATE POLICY "Group owners can delete groups" ON groups 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM group_members 
    WHERE group_members.group_id = groups.id 
    AND group_members.user_id = auth.uid() 
    AND group_members.role = 'owner'
  )
);

-- Políticas para group_members
CREATE POLICY "Users can view group members of their groups" ON group_members 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM group_members gm 
    WHERE gm.group_id = group_members.group_id 
    AND gm.user_id = auth.uid()
  )
);

CREATE POLICY "Users can add themselves to groups" ON group_members 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Group owners can manage all members" ON group_members 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM group_members gm 
    WHERE gm.group_id = group_members.group_id 
    AND gm.user_id = auth.uid() 
    AND gm.role = 'owner'
  )
);

-- Políticas para columns
CREATE POLICY "Users can view columns of their groups" ON columns 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM group_members 
    WHERE group_members.group_id = columns.group_id 
    AND group_members.user_id = auth.uid()
  )
);

CREATE POLICY "Group members can insert columns" ON columns 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM group_members 
    WHERE group_members.group_id = columns.group_id 
    AND group_members.user_id = auth.uid()
  )
);

CREATE POLICY "Group members can update columns" ON columns 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM group_members 
    WHERE group_members.group_id = columns.group_id 
    AND group_members.user_id = auth.uid()
  )
);

CREATE POLICY "Group members can delete columns" ON columns 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM group_members 
    WHERE group_members.group_id = columns.group_id 
    AND group_members.user_id = auth.uid()
  )
);
