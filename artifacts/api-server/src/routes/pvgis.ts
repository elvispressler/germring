import { Router, type IRouter } from "express";

const router: IRouter = Router();

router.get("/pvgis", async (req, res) => {
  const { lat, lon } = req.query;
  if (!lat || !lon) {
    res.status(400).json({ error: "lat und lon erforderlich" });
    return;
  }
  try {
    const url = `https://re.jrc.ec.europa.eu/api/v5_2/PVcalc?lat=${lat}&lon=${lon}&peakpower=1&loss=14&outputformat=json`;
    const upstream = await fetch(url);
    if (!upstream.ok) {
      req.log.warn({ status: upstream.status }, "PVGIS upstream error");
      res.status(502).json({ error: "PVGIS nicht erreichbar" });
      return;
    }
    const data = await upstream.json();
    res.json(data);
  } catch (err) {
    req.log.error(err, "PVGIS proxy error");
    res.status(502).json({ error: "PVGIS nicht erreichbar" });
  }
});

export default router;
