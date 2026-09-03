# byRaiMakes

Plataforma de e-commerce da **byRaiMakes** para catálogo, vendas, pedidos e gestão administrativa.

**Marca:** byRaiMakes — SUA BELEZA. SEU GLOW.

## Stack

- Ionic 8
- Angular 17
- TypeScript
- Firebase Authentication
- Cloud Firestore
- Firebase Storage
- Vercel

## Status

🟢 **Em produção**

O projeto está em operação e segue em evolução incremental, com foco em estabilidade, experiência do usuário e gestão administrativa.

## Funcionalidades

### Cliente

- Catálogo de produtos
- Categorias
- Destaques de produtos
- Carrinho
- Checkout
- Desconto de 10% para Pix e Dinheiro
- Integração com WhatsApp
- Consulta de pedidos
- Feedbacks

### Administrativo

- Login e autenticação
- Dashboard de métricas
- Gestão de produtos
- Controle de estoque
- Gestão de pedidos
- Confirmação e estorno de vendas
- Caixa
- Gestão de clientes
- Feedbacks e satisfação
- Gestão de banners
- Indicadores de vendas
- Indicadores de estoque
- Indicadores de clientes

## Regras de negócio

- Pedidos iniciam como `pendente`
- Apenas pedidos `confirmado` representam vendas efetivas
- Pedidos confirmados podem ser estornados
- Pedidos `estornado` ou `cancelado` não possuem nova operação financeira
- Confirmações de venda possuem proteção contra duplicidade
- Estornos respeitam a data original da venda
- O estoque é atualizado durante a confirmação da venda
- Descontos de pedidos estornados ou cancelados não entram nas métricas de vendas
- Desconto de 10% é aplicado para Pix e Dinheiro

## Arquitetura

### Frontend

Ionic + Angular + TypeScript

### Backend

Firebase:

- Authentication
- Firestore
- Storage

### Deploy

Vercel

**Produção:** `https://byraimakes.com.br`

## Desenvolvimento

Instalar dependências:

```bash
npm install
