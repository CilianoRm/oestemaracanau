# Status do projeto

Versão corrigida com acesso administrativo visível para usuários comuns e painel completo para administradores.

## Correções desta versão

- Acesso administrativo agora aparece no menu lateral mesmo antes do usuário estar autenticado como admin.
- O acesso administrativo abre uma tela própria com e-mail + senha do Supabase Auth.
- Usuário não-admin é recusado com mensagem clara.
- Usuário com `profiles.role = admin` entra automaticamente no painel.
- O painel administrativo inclui territórios, áreas no mapa, grupos, membros, locais, programação e relatórios PNG.
- A área de mapa continua permitindo desenhar/salvar o polígono do território.
- Mantida a correção de datas nulas da programação semanal.

## Teste local

```bash
npm install
npm run dev
npm run build
```
