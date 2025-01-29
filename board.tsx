"use client"
import type React from "react"
import { useState, useEffect } from "react"
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd"
import { Plus, MoreHorizontal } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Card, Column, Board } from "@/types/board"
import { getBoard, saveBoard, getNewCardId } from "@/utils/storage"

const columnColors = {
  "Not started": "bg-red-50 border-red-200",
  "In progress": "bg-yellow-50 border-yellow-200",
  Completed: "bg-green-50 border-green-200",
}

const BoardComponent: React.FC = () => {
  const [board, setBoard] = useState<Board>(getBoard())
  const [newColumnTitle, setNewColumnTitle] = useState("")
  const router = useRouter()

  useEffect(() => {
    saveBoard(board)
  }, [board])

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result
    if (!destination) return

    const newBoard = JSON.parse(JSON.stringify(board)) as Board
    const sourceCol = newBoard.columns.find((col) => col.id === source.droppableId)
    const destCol = newBoard.columns.find((col) => col.id === destination.droppableId)

    if (!sourceCol || !destCol) return

    const [movedCard] = sourceCol.cards.splice(source.index, 1)
    movedCard.status = destCol.title
    destCol.cards.splice(destination.index, 0, movedCard)

    setBoard(newBoard)
  }

  const addNewColumn = () => {
    if (!newColumnTitle.trim()) return
    const newColumn: Column = {
      id: newColumnTitle.toLowerCase().replace(/\s+/g, "-"),
      title: newColumnTitle,
      cards: [],
    }
    setBoard((prev) => ({ columns: [...prev.columns, newColumn] }))
    setNewColumnTitle("")
  }

  const addNewCard = (columnId: string) => {
    const newCard: Card = {
      id: getNewCardId(),
      title: "New Card",
      description: "",
      status: board.columns.find((col) => col.id === columnId)?.title || "",
    }
    setBoard((prev) => ({
      columns: prev.columns.map((col) => (col.id === columnId ? { ...col, cards: [...col.cards, newCard] } : col)),
    }))
    router.push(`/card/${newCard.id}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-6 overflow-x-auto pb-4">
          {board.columns.map((column) => (
            <div
              key={column.id}
              className={`flex-shrink-0 w-80 rounded-lg border ${
                columnColors[column.title as keyof typeof columnColors] || "bg-white border-gray-200"
              } shadow-sm`}
            >
              <div className="p-4 border-b border-inherit">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h2 className="font-medium text-sm text-gray-700">{column.title}</h2>
                    <span className="text-xs px-2 py-0.5 bg-white rounded-full text-gray-500 border border-gray-200">
                      {column.cards.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                      onClick={() => addNewCard(column.id)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`p-4 min-h-[150px] transition-colors ${snapshot.isDraggingOver ? "bg-gray-50" : ""}`}
                  >
                    {column.cards.map((card, index) => (
                      <Draggable key={card.id} draggableId={card.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={provided.draggableProps.style}
                            className={`
                              p-3 mb-2 bg-white rounded-md border border-gray-200
                              shadow-sm hover:shadow transition-shadow
                              cursor-grab active:cursor-grabbing
                              ${snapshot.isDragging ? "shadow-md ring-2 ring-blue-200" : ""}
                            `}
                            onClick={() => router.push(`/card/${card.id}`)}
                          >
                            <h3 className="text-sm font-medium text-gray-700">{card.title}</h3>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
              <div className="p-4 border-t border-inherit">
                <Button
                  variant="ghost"
                  className="w-full h-8 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  onClick={() => addNewCard(column.id)}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  New
                </Button>
              </div>
            </div>
          ))}
          <div className="flex-shrink-0 w-80">
            <Input
              value={newColumnTitle}
              onChange={(e) => setNewColumnTitle(e.target.value)}
              placeholder="Add new column..."
              className="mb-2"
            />
            <Button
              onClick={addNewColumn}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white"
              disabled={!newColumnTitle.trim()}
            >
              Add Column
            </Button>
          </div>
        </div>
      </DragDropContext>
    </div>
  )
}

export default BoardComponent

