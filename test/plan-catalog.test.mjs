import test from 'node:test';
import assert from 'node:assert/strict';

const { BarnoCatalog } = await import('../plan-manager.js');

test('BarnoCatalog adds, updates, filters and lists plans', () => {
  const catalog = new BarnoCatalog([
    { id: 1, name: 'Aster Villa', category: '3 Bedroom', bedrooms: 3, bathrooms: 2, floors: 1, garage: 1, price: 9000 },
    { id: 2, name: 'Mira Bungalow', category: 'Bungalow', bedrooms: 2, bathrooms: 2, floors: 1, garage: 1, price: 7000 }
  ]);

  catalog.addPlan({ name: 'Cedar House', category: '4 Bedroom', bedrooms: 4, bathrooms: 3, floors: 2, garage: 2, price: 12000 });
  catalog.updatePlan(1, { price: 9500, bathrooms: 3 });

  assert.equal(catalog.count(), 3);
  assert.equal(catalog.getById(1).price, 9500);
  assert.equal(catalog.getById(1).bathrooms, 3);
  assert.equal(catalog.filter({ category: '4 Bedroom' }).length, 1);
  assert.equal(catalog.filter({ minBedrooms: 3 }).length, 2);
  assert.equal(catalog.list({ sortBy: 'lowPrice' })[0].name, 'Mira Bungalow');
});
