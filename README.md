# MoodCorp

Plataforma responsiva de escuta e bem-estar para empresas, RH e colaboradores.

## Primeiro acesso

1. Selecione **Criar conta → Sou do RH / administrador**. Cadastre a empresa e seu perfil.
2. Compartilhe o código mostrado em **Minha empresa** com a equipe.
3. Cada colaborador escolhe **Criar conta → Sou colaborador**, informa o código e preenche nome completo, telefone com DDI/DDD, função, setor, nascimento, e-mail e senha.
4. Cada pessoa escolhe suas preferências em **Meu perfil**. Humor e IA vêm desativados para compartilhamento por padrão.

## Recursos

- Autenticação própria: senha com scrypt, botão mostrar/ocultar, manter conectado (30 dias) ou sessão de 8 horas, logout e alteração de senha com revogação de outras sessões.
- Empresa criada pelo RH, código renovável e acesso segregado no servidor.
- Check-in diário de 1 a 5 com nota privada e histórico pessoal. Um registro por pessoa e dia no fuso de Brasília.
- Painel de RH com pessoas, humor autodeclarado autorizado, tendência em 7 dias e distribuição do dia. Sem diagnóstico automatizado ou avaliação profissional.
- Feedback anônimo por padrão, com possibilidade de identificação expressa.
- Relatos sempre anônimos no painel do RH: sem nome, ID de usuário, e-mail, telefone ou IP no registro. Consulta por protocolo de capacidade aleatória, andamento e resposta do RH. Não armazenar o protocolo vinculado à conta.
- Assistente Flora no aplicativo e no WhatsApp, com chave Gemini ou OpenAI configurada pelo administrador. Conversas privadas, consentimento, histórico e exclusão pessoal. Teste real da chave salva.
- WhatsApp via Baileys com QR, sessão criptografada, reconexão e marco temporal. Não importa contatos ou mensagens antigas, ignora grupos e requer verificação do colaborador por código de uso único. PARAR desativa atendimento.
- Interface responsiva e acessível, menu móvel, teclado, foco em diálogos e preferência por movimento reduzido.

## WhatsApp

O RH conecta um número em **WhatsApp → Gerar QR Code**. O marco de início é gravado na primeira conexão bem-sucedida e preservado em reinícios. Pode ser redefinido expressamente pelo RH.

O colaborador salva a autorização em **Meu perfil**, gera um código de vínculo válido por 10 minutos e envia **VINCULAR CÓDIGO** ao número da empresa. Isso verifica posse do WhatsApp antes de associá-lo ao perfil. A partir daí, enviar um número de **1 a 5** registra o humor; outros textos vão para a Flora se a IA estiver ativa e autorizada. O número deve ser usado especificamente para o MoodCorp.

Não há envio de mensagens não solicitadas. Áudio, mídia, grupos e campanhas estão fora deste escopo. Relatos anônimos devem ser enviados pelo aplicativo, pois o WhatsApp identifica o remetente.

## Infraestrutura

Frontend React/Vite e API Express são servidos pela mesma aplicação Railway. `railway.json` configura build, verificação e healthcheck em `/api/health`.

Variáveis do serviço **MoodCorp**, no projeto já existente do Starsis:

| Variável | Configuração |
| --- | --- |
| `SUPABASE_URL` | Referência à variável do serviço `StartSys` |
| `SUPABASE_SERVICE_ROLE_KEY` | Referência protegida à variável do serviço `StartSys` |
| `MOODCORP_SECRET` | Segredo aleatório independente, mínimo 32 caracteres |
| `NODE_ENV` | `production` |
| `PORT` | `8080` |

Nenhuma chave é incluída no frontend. Segredos de IA, contas, dados pessoais e sessões WhatsApp são criptografados com AES-256-GCM antes da persistência.

### Reutilização do Supabase

A conexão Supabase disponível pelo Railway é reutilizada, sem migração ou alteração de políticas das aplicações existentes. O adaptador utiliza o contrato existente `startsys_companies`/`startsys_records` com **um carrier exclusivo** `owner_id=moodcorp:storage:v1`, tipos prefixados `moodcorp.v1.*`, chave de criptografia independente e filtros obrigatórios por empresa em cada operação. Não usa contas, sessões ou conversas do Starsis. Não deve ser reutilizado como um workspace do Starsis. Esses registros estão sob as restrições service-role já existentes; acesso de colaboradores passa exclusivamente pela API MoodCorp.

Os conectores Supabase desta sessão não disponibilizam o projeto Starsis para DDL; portanto, não foi criada migração em outro projeto. Para uma futura separação física, substitua o adaptador mantendo os testes de isolamento. A chave service-role compartilhada permanece uma credencial privilegiada da infraestrutura e deve ser administrada com acesso restrito.

Não altere ou apague `MOODCORP_SECRET` sem estratégia de recriptografia: isso inviabilizaria a leitura dos registros salvos. Use somente uma réplica do gateway por sessão de WhatsApp.

### Anonimato e consentimento

O conteúdo de um relato pode identificar seu autor se ele inserir detalhes pessoais. O painel RH não recebe metadados de autoria. Os provedores de hospedagem podem manter logs técnicos de acesso, portanto não há promessa de anonimato contra o operador da infraestrutura. Conversas com a Flora seguem também as políticas do provedor de IA escolhido pela empresa. Não há diagnóstico clínico ou classificação de saúde mental de colaboradores.

## Desenvolvimento e validação

```sh
npm ci --ignore-scripts
npm run dev
npm run check
npm test
npm run build
npm start
```

**`npm run dev` usa uma API local em memória apenas para desenvolvimento**, sem dados reais, sem IA e sem WhatsApp externo. Os registros desse ambiente são temporários. **Produção exige Supabase real e segredo**, nunca faz fallback para memória. `npm start` serve o build `dist`.

Os testes usam HTTP real contra a API com armazenamento em memória e verificam: cadastro, privilégios, dados obrigatórios, isolamento entre empresas, consentimento, ausência de autoria em relatos, capacidade de acompanhamento, revogação de sessões, rotação de código, proteção da chave de IA, troca de senha, vínculo por posse do WhatsApp e bloqueio de histórico anterior ao marco.

Integrações externas exigem o RH escanear o QR e cadastrar uma chave válida. Um teste sem esses passos não comprova entrega WhatsApp nem respostas do provedor em produção.
