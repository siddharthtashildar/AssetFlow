import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import 'dotenv/config';

const { PrismaClient } = await import('@prisma/client');
const { PrismaPg } = await import('@prisma/adapter-pg');

const app = express();
const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

app.get('/api/categories', async (_req, res) => {
  try {
    const categories = await prisma.assetCategory.findMany({ orderBy: { name: 'asc' } });
    res.json(categories);
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

app.get('/api/assets', async (_req, res) => {
  try {
    const assets = await prisma.asset.findMany({
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(assets);
  } catch (error) {
    console.error('Failed to fetch assets:', error);
    res.status(500).json({ error: 'Failed to fetch assets' });
  }
});

app.post('/api/assets', async (req, res) => {
  try {
    const asset = await prisma.asset.create({
      data: {
        assetTag: req.body.assetTag,
        name: req.body.name,
        categoryId: req.body.categoryId,
        condition: req.body.condition,
        status: req.body.status,
        location: req.body.location,
        serialNumber: req.body.serialNumber,
        acquisitionDate: req.body.acquisitionDate ? new Date(req.body.acquisitionDate) : null,
        acquisitionCost: req.body.acquisitionCost ? Number(req.body.acquisitionCost) : null,
        isBookable: Boolean(req.body.isBookable),
      },
      include: { category: true },
    });
    res.status(201).json(asset);
  } catch (error) {
    console.error('Failed to create asset:', error);
    res.status(500).json({ error: 'Failed to create asset' });
  }
});

app.use((_req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Asset API listening on port ${PORT}`);
});
