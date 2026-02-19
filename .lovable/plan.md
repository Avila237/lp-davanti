
## Atualização do Número de WhatsApp

### Números Encontrados

O novo número é **55 99116-6688**, que em formato internacional fica: `5555991166688`

Há dois tipos de números no código:

**Números que serão ALTERADOS (contato geral da loja):**
- `5555991372807` — aparece em: Header (desktop, mobile, menu mobile), Hero, Products, Testimonials
- `5555991068376` — aparece em: Footer, SpecialOffer, Benefits

**Números que serão MANTIDOS (lojas específicas em Locations.tsx):**
- `5555991372807` — Matriz
- `5555991068376` — Loja 2
- `5555997196834` — Loja 3

Também há o número de telefone no `handleCall` do Header (`tel:+5555991372807`), que será atualizado para o novo número.

### Arquivos a Modificar

| Arquivo | Ocorrências | Observação |
|---------|-------------|------------|
| `src/components/Header.tsx` | 3 (WhatsApp) + 1 (tel:) | Desktop, mobile icon, menu mobile e botão ligar |
| `src/components/Hero.tsx` | 1 | Botão principal do hero |
| `src/components/Products.tsx` | 1 | Botões dos produtos |
| `src/components/Testimonials.tsx` | 1 | CTA da seção de depoimentos |
| `src/components/SpecialOffer.tsx` | 1 | Oferta especial |
| `src/components/Footer.tsx` | 1 | Rodapé |
| `src/components/Benefits.tsx` | 1 | Seção de diferenciais |

**Arquivo que NÃO será alterado:**
- `src/components/Locations.tsx` — números das lojas individuais permanecem intactos

### Resultado

Todos os CTAs, textos, variante A/B e lógica de rastreamento permanecem exatamente iguais. Apenas o número de destino do WhatsApp é substituído pelo novo: `5555991166688`.
