# Territórios — Oeste de Maracanaú

Aplicativo mobile-first para organização de territórios de pregação, programação do serviço de campo, mapa, histórico de paradas, continuidade e indicação inteligente de onde trabalhar primeiro.

## Stack

- React + Vite
- Supabase (Postgres, Auth e Realtime)
- Leaflet + OpenStreetMap
- Lucide Icons
- Canvas nativo do navegador para gerar PNG sem depender de renderização HTML

## 1. Supabase — banco de dados

1. Crie um projeto no Supabase.
2. No SQL Editor, execute `supabase/schema.sql`.
3. Se o banco já tiver sido criado por uma versão anterior do projeto, execute também `supabase/migration_fix.sql`.
4. Execute `supabase/seed.sql`.
5. Em Project Settings → API, copie a Project URL e a Publishable/anon key.

### Criar o administrador

1. Vá em **Authentication → Users → Add user**.
2. Crie o usuário com o e-mail que você deseja usar para administração.
3. Defina uma senha forte.
4. Abra `supabase/admin_setup.sql`.
5. Troque `SEU_EMAIL_AQUI` pelo e-mail real.
6. Execute o arquivo no SQL Editor.
7. A consulta final deve mostrar o usuário com `role = admin`.

O botão de administração só fica disponível para usuários autenticados cujo perfil tem `role = 'admin'`. As alterações também são protegidas pelo RLS do banco.

## 2. Configurar o computador

Crie `.env` na raiz do projeto a partir de `.env.example`:

```env
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=SUA_CHAVE_PUBLICA
```

Nunca coloque `service_role` ou uma Secret key no frontend.

Depois:

```bash
npm install
npm run dev
```

Abra o endereço mostrado pelo Vite, normalmente `http://localhost:5173/Oeste-de-Maracanau/`.

## 3. Acesso normal

### Onde abrir o painel administrativo

Depois de entrar com a senha normal, o menu lateral passa a mostrar **Acesso administrativo**. Clique nele e informe o e-mail e a senha do usuário criado em Supabase Authentication.

Se o usuário tiver `role = admin` na tabela `profiles`, o sistema abre automaticamente o **Painel Administrativo**. Em telas pequenas, a opção fica no menu **Mais**.


A tela inicial usa a senha de entrada definida no produto:

`OesteM131268`

Ela não é uma autenticação de produção. O acesso administrativo é separado e usa Supabase Auth + RLS.

## 4. Funcionalidades

### Usuário normal

- Início
- Mapa
- Territórios
- Grupos e membros
- Serviço de campo
- Histórico
- Indicação inteligente
- Continuidade do território
- Busca de rua

### Administrador

- Dashboard
- Criar, editar, ativar/desativar e excluir territórios
- Abrir qualquer território diretamente no mapa
- Desenhar e salvar o limite exato do território
- Limpar uma área desenhada
- Criar/editar/excluir grupos
- Criar/editar/excluir membros e definir dirigentes
- Criar/editar/excluir locais de saída
- Criar/editar/excluir programação
- Cadastro de ruas vinculadas a cada território
- Seleção automática de ruas ao escolher o território na programação
- Gerar imagem PNG profissional com 6 a 10 saídas de campo
- Atualizações em tempo real via Supabase Realtime

## 5. Programação semanal

O banco suporta programação recorrente por `weekday`/`weekday_name`/`time` e também datas específicas. O frontend entende os dois formatos, inclusive quando `service_date` é NULL.

## 6. Indicação inteligente

A prioridade considera principalmente:

- território nunca trabalhado;
- dias desde o último registro;
- quantidade de vezes trabalhado;
- ruas que possuem histórico e estão há mais tempo sem registro.

A indicação é calculada a partir dos dados reais salvos no Supabase.

## 7. Mapa

O administrador seleciona um território, abre o mapa e usa **Desenhar território**. Cada clique adiciona um ponto. Com pelo menos 3 pontos, clique em **Salvar área**. O polígono fica salvo na coluna `territories.polygon`.

## 8. PNG

Em **Painel Administrativo → Imagens / relatórios**, escolha de 6 a 10 saídas. A geração fica bloqueada com menos de 6. O PNG inclui dia, horário, local de saída, dirigente, território, rua, números inicial/final e período da programação. A geração usa Canvas nativo para evitar o problema de imagem vazia.

## 9. Realtime

As principais tabelas são inscritas no Supabase Realtime. Alterações feitas pelo administrador podem atualizar automaticamente as telas abertas.

## 10. GitHub Pages

O projeto usa:

```js
base: '/Oeste-de-Maracanau/'
```

No GitHub:

1. Settings → Pages.
2. Em Build and deployment, selecione **GitHub Actions**.
3. Faça push para `main`.
4. O workflow `.github/workflows/deploy.yml` executará o build e publicará `dist`.

No GitHub → Settings → Secrets and variables → Actions, configure as variáveis:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

O workflow aceita essas variáveis e também os secrets com os mesmos nomes para compatibilidade.

## 11. Teste antes de publicar

```bash
npm install
npm run dev
npm run build
```

O `npm run build` deve terminar sem erros.
