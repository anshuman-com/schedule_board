import { type Board, Card } from "@/types/board"

const STORAGE_KEY = "kanban-board"

export const defaultBoard: Board = {
  columns: [
    { id: "todo", title: "To Do", cards: [] },
    { id: "in-progress", title: "In Progress", cards: [] },
    { id: "done", title: "Done", cards: [] },
  ],
}

export function getBoard(): Board {
  if (typeof window === "undefined") return defaultBoard
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored ? JSON.parse(stored) : defaultBoard
}

export function saveBoard(board: Board) {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(board))
}

export function getNewCardId(): string {
  return Math.random().toString(36).substr(2, 9)
}

