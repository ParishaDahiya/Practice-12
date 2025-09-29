const express = require("express");
const app = express();
const PORT = 3000;

app.use(express.json());

const seats = {};
const totalSeats = 20;

for (let i = 1; i <= totalSeats; i++) {
  seats[i] = { status: "available", lockedBy: null, lockTimer: null };
}

function clearLock(seatId) {
  if (seats[seatId].lockTimer) {
    clearTimeout(seats[seatId].lockTimer);
    seats[seatId].lockTimer = null;
  }
  seats[seatId].status = "available";
  seats[seatId].lockedBy = null;
}

app.get("/", (req, res) => {
  res.send("Welcome to the Ticket Booking API! Use /seats to view seats.");
});

app.get("/seats", (req, res) => {
  res.json(seats);
});

app.post("/lock/:seatId", (req, res) => {
  const { seatId } = req.params;
  const { userId } = req.body;

  if (!seats[seatId]) {
    return res.status(404).json({ error: "Seat not found" });
  }

  if (seats[seatId].status === "booked") {
    return res.status(400).json({ error: "Seat already booked" });
  }

  if (seats[seatId].status === "locked" && seats[seatId].lockedBy !== userId) {
    return res.status(400).json({ error: "Seat already locked by another user" });
  }

  seats[seatId].status = "locked";
  seats[seatId].lockedBy = userId;

  clearLock(seatId);
  seats[seatId].lockTimer = setTimeout(() => {
    clearLock(seatId);
    console.log(Lock expired for seat ${seatId});
  }, 60000);

  return res.json({ success: Seat ${seatId} locked for user ${userId} });
});

app.post("/confirm/:seatId", (req, res) => {
  const { seatId } = req.params;
  const { userId } = req.body;

  if (!seats[seatId]) {
    return res.status(404).json({ error: "Seat not found" });
  }

  if (seats[seatId].status !== "locked" || seats[seatId].lockedBy !== userId) {
    return res.status(400).json({ error: "Seat not locked by this user" });
  }

  clearLock(seatId);
  seats[seatId].status = "booked";
  seats[seatId].lockedBy = userId;

  return res.json({ success: Seat ${seatId} successfully booked by user ${userId} });
});

app.post("/release/:seatId", (req, res) => {
  const { seatId } = req.params;
  const { userId } = req.body;

  if (!seats[seatId]) {
    return res.status(404).json({ error: "Seat not found" });
  }

  if (seats[seatId].status === "locked" && seats[seatId].lockedBy === userId) {
    clearLock(seatId);
    return res.json({ success: Seat ${seatId} released by user ${userId} });
  }

  return res.status(400).json({ error: "Seat not locked by this user" });
});

app.listen(PORT, () => {
  console.log(Server running on http://localhost:${PORT});
});
