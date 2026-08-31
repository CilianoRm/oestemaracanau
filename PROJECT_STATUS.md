# Status — Território Oeste de Maracanaú

Atualização: sistema de ruas por território e geração de PNG 6–10 saídas.

## Alterações desta versão

- Cadastro administrativo de ruas em `territory_roads`.
- Cada rua fica vinculada a um território.
- Na programação, a seleção é em cascata: Território → Rua.
- Ao trocar o território, a lista de ruas é atualizada automaticamente.
- Se não houver rua cadastrada, existe fallback para digitação manual.
- Cadastro/edição de ruas inclui faixa de números e referência.
- Realtime agora também acompanha `territory_roads`.
- Consulta de membros usa a coluna atual `name`, mantendo fallback para `full_name` em registros antigos.
- Gerador de PNG refeito com Canvas nativo, evitando imagem vazia.
- PNG exige no mínimo 6 e permite no máximo 10 saídas.
- A tela administrativa permite escolher 6, 7, 8, 9 ou 10 quando houver quantidade suficiente.
- Layout do PNG foi desenhado para compartilhamento, com cabeçalho, tabela, período e rodapé.
- Schema foi atualizado para refletir `members.name` e os campos de programação usados pelo aplicativo.
