

## Atualizar Depoimentos de Clientes

### Depoimentos Atuais vs Novos

| Atual | Novo |
|-------|------|
| Sandra Erstling | Josiane Bonamigo |
| Dienifer Paz | Thiago Ribeiro |
| Lazaro Valdes | Maira Giaretta |

### Novos Textos Extraidos das Imagens

**1. Josiane Bonamigo**
> "Fui atras de um presente para o meu noivo e o Cleverton me atendeu com muito profissionalismo e cuidado, conseguindo encontrar a peca perfeita que eu estava procurando! Super indico, pecas lindas, unicas e de muita qualidade e um atendimento nota mil. Gratidao!"

**2. Thiago Ribeiro**
> "Excelente! Como comentei com a vendedora Laura, que por sinal me atendeu super bem. A qualidade dos produtos e sem duvidas a melhor da regiao. Compro e recomendo. Obrigado Laura pelo atendimento, muito atenciosa aos detalhes e sempre disposta. Parabens."

**3. Maira Giaretta**
> "Sempre sou bem atendida pela equipe Davanti. A Loja sempre esta com novidades, produtos exclusivos e diferentes. Quando se trata de oculos de grau, gosto do cuidado e zelo pela informacao e qualidade do trabalho. Em especial a atencao do Clev que orienta a melhor escolha de acordo a minha necessidade. Nota 10!"

### Alteracao Necessaria

Atualizar o array `testimonials` no arquivo `src/components/Testimonials.tsx`:

```typescript
const testimonials = [
  {
    name: "Josiane Bonamigo",
    text: "Fui atrás de um presente para o meu noivo e o Cleverton me atendeu com muito profissionalismo e cuidado, conseguindo encontrar a peça perfeita que eu estava procurando! Super indico, peças lindas, únicas e de muita qualidade e um atendimento nota mil. Gratidão!",
  },
  {
    name: "Thiago Ribeiro",
    text: "Excelente! Como comentei com a vendedora Laura, que por sinal me atendeu super bem. A qualidade dos produtos é sem dúvidas a melhor da região. Compro e recomendo. Obrigado Laura pelo atendimento, muito atenciosa aos detalhes e sempre disposta. Parabéns.",
  },
  {
    name: "Maira Giaretta",
    text: "Sempre sou bem atendida pela equipe Davanti. A Loja sempre está com novidades, produtos exclusivos e diferentes. Quando se trata de óculos de grau, gosto do cuidado e zelo pela informação e qualidade do trabalho. Em especial a atenção do Clev que orienta a melhor escolha de acordo à minha necessidade. Nota 10!",
  },
];
```

### Arquivo a Modificar

| Arquivo | Alteracao |
|---------|-----------|
| `src/components/Testimonials.tsx` | Substituir array de depoimentos |

### Observacoes

- Os textos serao adaptados com acentuacao correta
- O emoji do ultimo depoimento sera removido para manter consistencia visual
- A estrutura do componente permanece a mesma (nome + texto + 5 estrelas)

