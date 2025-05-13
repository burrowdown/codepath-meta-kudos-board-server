const express = require("express")
const { PrismaClient } = require("./generated/prisma")

const prisma = new PrismaClient()
const app = express()
app.use(express.json())

// NOTE: Copilot wrote all of this, it worked on the first try
// and it freaks me out that that's possible.

// --- Board Endpoints ---

// Get all boards
app.get("/boards", async (req, res) => {
  try {
    const boards = await prisma.board.findMany({ include: { cards: true } })
    res.json(boards)
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch boards" })
  }
})

// Get a single board by ID
app.get("/boards/:id", async (req, res) => {
  try {
    const board = await prisma.board.findUnique({
      where: { id: Number(req.params.id) },
      include: { cards: true },
    })
    if (!board) return res.status(404).json({ error: "Board not found" })
    res.json(board)
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch board" })
  }
})

// Create a new board
app.post("/boards", async (req, res) => {
  try {
    const { title, category, author } = req.body
    const board = await prisma.board.create({
      data: {
        title,
        category,
        ...(author !== undefined && { author }), // Only include author if provided
      },
    })
    res.status(201).json(board)
  } catch (e) {
    res.status(400).json({ error: "Failed to create board" })
  }
})

// Update a board
app.put("/boards/:id", async (req, res) => {
  try {
    const { title, category, author } = req.body
    const updateData = { title, category }
    if (author !== undefined) updateData.author = author // Only update author if provided

    const board = await prisma.board.update({
      where: { id: Number(req.params.id) },
      data: updateData,
    })
    res.json(board)
  } catch (e) {
    res.status(400).json({ error: "Failed to update board" })
  }
})

// Delete a board
app.delete("/boards/:id", async (req, res) => {
  try {
    await prisma.board.delete({ where: { id: Number(req.params.id) } })
    res.status(204).end()
  } catch (e) {
    res.status(400).json({ error: "Failed to delete board" })
  }
})

// --- Card Endpoints ---

// Get all cards
app.get("/cards", async (req, res) => {
  try {
    const cards = await prisma.card.findMany({ include: { board: true } })
    res.json(cards)
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch cards" })
  }
})

// Get a single card by ID
app.get("/cards/:id", async (req, res) => {
  try {
    const card = await prisma.card.findUnique({
      where: { id: Number(req.params.id) },
      include: { board: true },
    })
    if (!card) return res.status(404).json({ error: "Card not found" })
    res.json(card)
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch card" })
  }
})

// Create a new card
app.post("/cards", async (req, res) => {
  try {
    const { text, gifUrl, boardId } = req.body
    const card = await prisma.card.create({
      data: { text, gifUrl, boardId },
    })
    res.status(201).json(card)
  } catch (e) {
    res.status(400).json({ error: "Failed to create card" })
  }
})

// Update a card
app.put("/cards/:id", async (req, res) => {
  try {
    const { text, gifUrl, voteCount } = req.body
    const card = await prisma.card.update({
      where: { id: Number(req.params.id) },
      data: { text, gifUrl, voteCount },
    })
    res.json(card)
  } catch (e) {
    res.status(400).json({ error: "Failed to update card" })
  }
})

// Delete a card
app.delete("/cards/:id", async (req, res) => {
  try {
    await prisma.card.delete({ where: { id: Number(req.params.id) } })
    res.status(204).end()
  } catch (e) {
    res.status(400).json({ error: "Failed to delete card" })
  }
})

// Graceful shutdown
process.on("SIGINT", async () => {
  await prisma.$disconnect()
  process.exit(0)
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
