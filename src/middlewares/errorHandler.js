module.exports = (err, req, res, next) => {
  console.error("🔥 Error Handler:", err);

  const status = err.status || 500;
  const message = err.body?.message || err.message || "Unexpected error";

  return res.status(status).json({ error: message });
};
