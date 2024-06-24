const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post("/activities", async (req, res) => {
  const { name, goalDaily, goalWeekly } = req.body;
  try {
    const activity = await prisma.activity.create({
      data: {
        name,
        goalDaily,
        goalWeekly,
      },
    });
    res.status(201).json(activity);
  } catch (err) {
    res.status(500).json({ error: err.message });
    //log the error
    console.log(err);
  }
});

app.post("/activity_logs", async (req, res) => {
  const { activityId, workedHours, workedMinutes, workedSeconds } = req.body;
  const date = new Date();
  try {
    const activityLog = await prisma.activityLog.create({
      data: {
        activityId,
        date,
        workedHours,
        workedMinutes,
        workedSeconds,
      },
    });

    const activity = await prisma.activity.update({
      where: { id: activityId },
      data: {
        workedHours: {
          increment: workedHours,
        },
        workedMinutes: {
          increment: workedMinutes,
        },
        workedSeconds: {
          increment: workedSeconds,
        },
      },
    });

    res.status(201).json(activityLog);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/activities", async (req, res) => {
  try {
    const activities = await prisma.activity.findMany();
    res.status(200).json(activities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/activities/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const activity = await prisma.activity.findUnique({
      where: { id: parseInt(id) },
      include: {
        activityLogs: {
          orderBy: { date: "desc" },
          take: 1,
        },
      },
    });
    res.status(200).json(activity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3333, () => {
  console.log(`Servidor rodando na porta 3333`);
});
