const express = require("express");
const Task = require("../models/Task");
const router = express.Router();

// Get all tasks for user
router.get("/", async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// Create task
router.post("/", async (req, res) => {
  try {
    const { title, description, dueDate, priority } = req.body;
    const task = new Task({
      user: req.user.id,
      title,
      description,
      dueDate: dueDate || null,
      priority: priority || "Medium",
    });
    await task.save();
    res.json(task);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// Update task
router.put("/:id", async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    if (task.user.toString() !== req.user.id)
      return res.status(401).json({ message: "Not authorized" });

    const { title, description, dueDate, priority, completed } = req.body;
    task.title = title ?? task.title;
    task.description = description ?? task.description;
    task.dueDate = dueDate === "" ? null : dueDate ?? task.dueDate;
    task.priority = priority ?? task.priority;
    if (typeof completed === "boolean") task.completed = completed;

    await task.save();
    res.json(task);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// Delete
router.delete("/:id", async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    if (task.user.toString() !== req.user.id)
      return res.status(401).json({ message: "Not authorized" });

    await task.remove();
    res.json({ message: "Task removed" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

module.exports = router;
