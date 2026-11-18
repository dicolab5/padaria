# Roadmap — Pão & Gestão

Este documento orienta a evolução comercial e técnica do produto. A ordem pode ser ajustada conforme o retorno das primeiras padarias, mas nenhuma funcionalidade deve ser anunciada como disponível antes de estar implementada e validada.

## Modelo comercial aprovado

Todos os planos possuem 7 dias de degustação integral, sem cartão e sem cobrança automática. Não haverá limite de vendas, produtos ou clientes.

| Plano | Mensal | Anual | Perfil |
| --- | ---: | ---: | --- |
| Começo | R$ 69,90 | R$ 699 | Padaria pequena saindo do papel ou planilha |
| Gestão | R$ 129,90 | R$ 1.299 | Padaria em crescimento |
| Rede | R$ 249,90 | R$ 2.499 | Operação com mais de uma unidade |

Adicionais planejados para o plano Rede:

- Unidade adicional: R$ 59,90/mês.
- PDV adicional: R$ 19,90/mês.
- Treinamento remoto avulso: R$ 149.
- Implantação e importação assistida: de R$ 199 a R$ 499, conforme o trabalho.

Oferta de lançamento para os primeiros 20 a 30 clientes, com valor garantido por 12 meses:

- Começo: R$ 49,90/mês.
- Gestão: R$ 99,90/mês.
- Rede: R$ 199,90/mês.

## Escopo dos planos

### Começo

- 1 unidade, 1 PDV e até 3 usuários.
- Vendas, fechamento de caixa, produtos, categorias e estoque.
- Clientes, crediário, limite individual e contas a receber.
- Dashboard básico e aplicativo do cliente.
- Suporte em horário comercial.

### Gestão — plano recomendado

- Tudo do Começo.
- 1 unidade, até 3 PDVs e até 10 usuários.
- Compras, fornecedores, financeiro e relatórios avançados.
- Gráficos com filtros, exportação, permissões e auditoria.
- Aplicativo completo para o dono e atendimento prioritário.

### Rede

- Tudo do Gestão.
- Até 3 unidades, até 10 PDVs e usuários ilimitados sob uso justo.
- Estoque e operação separados por unidade.
- Dashboard, relatórios e administração consolidados.
- Auditoria ampliada, treinamento inicial e implantação assistida.

## Etapa 1 — comercialização inicial

- [x] Página pública e apresentação dos recursos.
- [x] Página de planos com valores mensais e anuais.
- [x] Cadastro autônomo de uma nova padaria.
- [x] Degustação integral por 7 dias.
- [x] Bloqueio de nova sessão quando a degustação termina.
- [x] Autorização de compras no crediário com PIN individual de 6 dígitos, hash e bloqueio de tentativas.
- [ ] Exibir dentro do sistema o plano, dias restantes e vencimento.
- [ ] Enviar avisos no 4º e no 6º dia da degustação.
- [ ] Criar jornada de escolha do plano ao final da degustação.
- [x] Permitir que o administrador global credite dias e escolha o plano de uma padaria, com motivo e auditoria.
- [ ] Preservar dados e permitir exportação após o vencimento.

## Etapa 2 — assinatura e cobrança

- [ ] Criar tabela de assinaturas, cobranças e histórico de pagamentos.
- [ ] Integrar provedor de cobrança com tokenização, sem armazenar cartão.
- [ ] Implementar pagamento mensal e anual.
- [ ] Implementar upgrade, downgrade, cancelamento e reativação.
- [ ] Definir período de tolerância e tratamento de inadimplência.
- [ ] Processar webhooks com assinatura, idempotência e auditoria.
- [ ] Criar painel financeiro da plataforma para o administrador global.

## Etapa 3 — controle efetivo dos planos

- [ ] Centralizar recursos e limites de cada plano no backend.
- [ ] Aplicar limites de usuários, PDVs e unidades no servidor.
- [ ] Bloquear alterações incompatíveis sem apagar dados existentes.
- [ ] Criar tela de uso e limites para o dono da padaria.
- [ ] Registrar alterações de plano na auditoria.
- [ ] Testar isolamento entre padarias, BOLA/IDOR e elevação de privilégios.

## Etapa 4 — amadurecimento do aplicativo

- [ ] Melhorar a área do cliente para listar todas as padarias em que possui conta.
- [ ] Permitir que o cliente selecione a padaria após entrar com e-mail e CPF.
- [ ] Evoluir autenticação do cliente sem usar CPF como senha permanente.
- [ ] Transformar o aplicativo em experiência Android nativa gradualmente.
- [ ] Adicionar notificações de compras, vencimentos e pagamentos.
- [ ] Preparar publicação e políticas da Google Play.

## Etapa 5 — plano Rede

- [ ] Modelar unidades, usuários, PDVs e estoques por estabelecimento.
- [ ] Permitir transferência de estoque entre unidades.
- [ ] Consolidar vendas, financeiro e relatórios da rede.
- [ ] Criar comparação de desempenho entre unidades.
- [ ] Implementar cobrança de unidade e PDV adicionais.
- [ ] Validar desempenho e concorrência em operações maiores.

## Etapa futura — somente após amadurecimento

Os itens abaixo ficam deliberadamente fora da oferta e da comunicação comercial atual:

- Emissão fiscal e NFC-e.
- Funcionamento offline e sincronização.
- Integração com balanças.
- TEF e automação de pagamentos presenciais.
- Suporte 24 horas.

Antes de iniciar esta etapa, o produto deve possuir uma base estável de clientes, monitoramento, backups testados, processos de suporte e validação contábil e fiscal.
