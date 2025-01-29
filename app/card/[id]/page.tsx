"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Trash } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Card, Board } from "@/types/board"
import { getBoard, saveBoard } from "@/utils/storage"

export default function CardDetails({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [card, setCard] = useState<Card | null>(null)
  const [board, setBoard] = useState<Board>(getBoard())

  useEffect(() => {
    const loadedBoard = getBoard()
    setBoard(loadedBoard)
    const foundCard = loadedBoard.columns.flatMap((col) => col.cards).find((c) => c.id === params.id)
    if (foundCard) setCard(foundCard)
  }, [params.id])

  const updateCard = (updates: Partial<Card>) => {
    if (!card) return

    const updatedCard = { ...card, ...updates }
    setCard(updatedCard)

    const newBoard = JSON.parse(JSON.stringify(board)) as Board
    newBoard.columns = newBoard.columns.map((col) => {
      if (col.title === card.status) {
        return {
          ...col,
          cards: col.cards.map((c) => (c.id === card.id ? updatedCard : c)),
        }
      }
      return col
    })

    if (updates.status && updates.status !== card.status) {
      const sourceCol = newBoard.columns.find((col) => col.title === card.status)
      const destCol = newBoard.columns.find((col) => col.title === updates.status)

      if (sourceCol && destCol) {
        sourceCol.cards = sourceCol.cards.filter((c) => c.id !== card.id)
        destCol.cards.push(updatedCard)
      }
    }

    setBoard(newBoard)
    saveBoard(newBoard)
  }

  const deleteCard = () => {
    const newBoard = JSON.parse(JSON.stringify(board)) as Board
    newBoard.columns = newBoard.columns.map((col) => ({
      ...col,
      cards: col.cards.filter((c) => c.id !== params.id),
    }))
    saveBoard(newBoard)
    router.push("/")
  }

  if (!card) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-8">
            <Button
              variant="ghost"
              onClick={() => router.push("/")}
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Board
            </Button>
            <Button variant="ghost" onClick={deleteCard} className="text-red-500 hover:text-red-600 hover:bg-red-50">
              <Trash className="h-4 w-4 mr-2" />
              Delete Card
            </Button>
          </div>
          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Title</label>
              <Input value={card.title} onChange={(e) => updateCard({ title: e.target.value })} className="text-xl" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
              <Select value={card.status} onValueChange={(value) => updateCard({ status: value })}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {board.columns.map((col) => (
                    <SelectItem key={col.id} value={col.title}>
                      {col.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Description</label>
              <Textarea
                value={card.description}
                onChange={(e) => updateCard({ description: e.target.value })}
                className="min-h-[200px] resize-none"
                placeholder="Add a more detailed description..."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

