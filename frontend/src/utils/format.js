// Formata número como moeda BRL: 1234.5 -> "1.234,50"
// Devolve só o número formatado; o "R$ " continua escrito no template para manter o layout atual.
const formatter = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
})

export const formatBRL = (value) => formatter.format(Number(value) || 0)
