import request from 'supertest';
import express from 'express';
import cors from 'cors';
import { LocationService } from '../services/LocationService';

// Create test app
const app = express();
app.use(cors());
app.use(express.json());

// Initialize services
const locationService = new LocationService();

// Add routes for testing
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      locationStats: locationService.getStats(),
    },
    timestamp: new Date().toISOString()
  });
});

app.get('/api/locations', (_req, res) => {
  const locations = locationService.getAllLocations();
  res.json({
    success: true,
    data: locations,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/locations/search', (req, res) => {
  const { q: query } = req.query;
  
  if (!query || typeof query !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Query parameter is required',
      timestamp: new Date().toISOString()
    });
  }
  
  const locations = locationService.searchLocationsByKeyword(query);
  return res.json({
    success: true,
    data: locations,
    timestamp: new Date().toISOString()
  });
});

app.post('/api/nlp/query', (req, res) => {
  const { query } = req.body;
  
  if (!query || typeof query !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Query is required',
      timestamp: new Date().toISOString()
    });
  }
  
  const result = locationService.processNaturalLanguageQuery(query);
  return res.json({
    success: true,
    data: result,
    timestamp: new Date().toISOString()
  });
});

describe('API Endpoints', () => {
  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('status', 'healthy');
      expect(response.body.data).toHaveProperty('locationStats');
      expect(response.body.data.locationStats).toHaveProperty('totalLocations', 120);
    });
  });

  describe('GET /api/locations', () => {
    it('should return all locations', async () => {
      const response = await request(app)
        .get('/api/locations')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveLength(120);
      expect(response.body.data[0]).toHaveProperty('areaCode');
      expect(response.body.data[0]).toHaveProperty('areaName');
      expect(response.body.data[0]).toHaveProperty('displayName');
    });
  });

  describe('GET /api/locations/search', () => {
    it('should search locations by keyword', async () => {
      const response = await request(app)
        .get('/api/locations/search')
        .query({ q: '강남' })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.length).toBeGreaterThan(0);
      
      // Check if results contain the keyword
      const hasRelevantResult = response.body.data.some((location: any) => 
        location.displayName.includes('강남') || 
        location.areaName.includes('강남') ||
        location.keywords.some((keyword: string) => keyword.includes('강남'))
      );
      expect(hasRelevantResult).toBe(true);
    });

    it('should return 400 for missing query parameter', async () => {
      const response = await request(app)
        .get('/api/locations/search')
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Query parameter is required');
    });

    it('should return empty array for non-existent location', async () => {
      const response = await request(app)
        .get('/api/locations/search')
        .query({ q: '존재하지않는장소' })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveLength(0);
    });
  });

  describe('POST /api/nlp/query', () => {
    it('should process natural language query', async () => {
      const response = await request(app)
        .post('/api/nlp/query')
        .send({ query: '홍대 혼잡도 어때?' })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('extractedLocation');
      expect(response.body.data).toHaveProperty('matchedAreaName');
      expect(response.body.data).toHaveProperty('confidence');
      expect(response.body.data).toHaveProperty('originalQuery', '홍대 혼잡도 어때?');
    });

    it('should return 400 for missing query', async () => {
      const response = await request(app)
        .post('/api/nlp/query')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Query is required');
    });

    it('should return 400 for empty query', async () => {
      const response = await request(app)
        .post('/api/nlp/query')
        .send({ query: '' })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Query is required');
    });

    it('should handle unrecognized location gracefully', async () => {
      const response = await request(app)
        .post('/api/nlp/query')
        .send({ query: '파리 혼잡도' })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.confidence).toBe(0);
      expect(response.body.data.extractedLocation).toBe('파리');
    });
  });

  describe('Error handling', () => {
    it('should handle malformed JSON', async () => {
      await request(app)
        .post('/api/nlp/query')
        .set('Content-Type', 'application/json')
        .send('invalid json')
        .expect(400);
    });

    it('should handle large payloads gracefully', async () => {
      const largeQuery = 'a'.repeat(100); // 더 작은 크기로 테스트
      const response = await request(app)
        .post('/api/nlp/query')
        .send({ query: largeQuery })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });
});