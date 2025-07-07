-- -----------------------------------------------------------------------------
--  Adiciona política para permitir que o usuário se insira em group_members
--  (necessário quando se cria um grupo pela primeira vez).
-- -----------------------------------------------------------------------------

ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

-- Usuário pode se adicionar como membro/owner do grupo onde "user_id" = uid()
CREATE POLICY "User can add self to group_members"
ON group_members
FOR INSERT
WITH CHECK ( auth.uid() = user_id );
