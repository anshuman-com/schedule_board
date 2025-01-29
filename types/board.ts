export interface Card {
  id: string
  title: string
  description: string
  status: string
}

export interface Column {
  id: string
  title: string
  cards: Card[]
}

export interface Board {
  columns: Column[]
}

