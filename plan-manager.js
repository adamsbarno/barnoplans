class BarnoCatalog {
    constructor(initialPlans = []) {
        this.plans = new Map();
        this.nextId = 1;

        initialPlans.forEach((plan) => {
            this.addPlan(plan);
        });
    }

    normalizePlan(planInput = {}, fallbackId = null) {
        const id = Number(planInput.id ?? fallbackId ?? this.nextId);

        return {
            id,
            name: String(planInput.name || '').trim(),
            category: String(planInput.category || '').trim(),
            bedrooms: Number(planInput.bedrooms || 0),
            bathrooms: Number(planInput.bathrooms || 0),
            floors: Number(planInput.floors || 0),
            garage: Number(planInput.garage || 0),
            price: Number(planInput.price || 0),
            createdAt: String(planInput.createdAt || '').trim(),
            description: String(planInput.description || '').trim(),
            image: String(planInput.image || planInput.mainImage || '').trim(),
            pdf: String(planInput.pdf || '').trim(),
            images: planInput.images ? { ...planInput.images } : undefined
        };
    }

    addPlan(planInput) {
        const normalized = this.normalizePlan(planInput);

        if (!normalized.name) {
            throw new Error('Plan name is required.');
        }

        const id = Number(normalized.id) || this.nextId;

        if (this.plans.has(id)) {
            const updatedPlan = { ...this.plans.get(id), ...normalized, id };
            this.plans.set(id, updatedPlan);
            this.nextId = Math.max(this.nextId, id + 1);
            return updatedPlan;
        }

        const newPlan = { ...normalized, id };
        this.plans.set(newPlan.id, newPlan);
        this.nextId = Math.max(this.nextId, newPlan.id + 1);
        return newPlan;
    }

    updatePlan(id, patch = {}) {
        const targetId = Number(id);
        const existingPlan = this.plans.get(targetId);

        if (!existingPlan) {
            return null;
        }

        const updatedPlan = {
            ...existingPlan,
            ...this.normalizePlan({ ...existingPlan, ...patch }, targetId),
            id: targetId
        };

        this.plans.set(targetId, updatedPlan);
        return updatedPlan;
    }

    deletePlan(id) {
        return this.plans.delete(Number(id));
    }

    getById(id) {
        return this.plans.get(Number(id)) || null;
    }

    getAll() {
        const featuredPlanIds = new Map([[6, 0], [7, 1]]);
        return Array.from(this.plans.values()).sort((first, second) => {
            const firstFeaturedPosition = featuredPlanIds.get(first.id);
            const secondFeaturedPosition = featuredPlanIds.get(second.id);
            if (firstFeaturedPosition !== undefined || secondFeaturedPosition !== undefined) {
                if (firstFeaturedPosition === undefined) return 1;
                if (secondFeaturedPosition === undefined) return -1;
                return firstFeaturedPosition - secondFeaturedPosition;
            }
            const firstDate = first.createdAt || '';
            const secondDate = second.createdAt || '';
            return secondDate.localeCompare(firstDate) || second.id - first.id;
        });
    }

    list(filters = {}) {
        let results = this.getAll();

        if (filters.category) {
            const categoryQuery = String(filters.category).trim().toLowerCase();
            results = results.filter((plan) => {
                const categoryName = String(plan.category || '').trim().toLowerCase();
                return categoryName === categoryQuery || categoryName.includes(categoryQuery);
            });
        }

        if (filters.bedrooms) {
            results = results.filter((plan) => Number(plan.bedrooms) === Number(filters.bedrooms));
        } else if (filters.minBedrooms) {
            results = results.filter((plan) => Number(plan.bedrooms) >= Number(filters.minBedrooms));
        }

        if (filters.maxPrice) {
            results = results.filter((plan) => Number(plan.price) <= Number(filters.maxPrice));
        }

        if (filters.search) {
            const searchValue = String(filters.search).trim().toLowerCase();
            results = results.filter((plan) => {
                const searchableText = `${plan.name} ${plan.category} ${plan.bedrooms} ${plan.bathrooms}`.toLowerCase();
                return searchableText.includes(searchValue);
            });
        }

        if (filters.sortBy === 'lowPrice') {
            results.sort((first, second) => first.price - second.price);
        } else if (filters.sortBy === 'highPrice') {
            results.sort((first, second) => second.price - first.price);
        }

        return results;
    }

    filter(filters = {}) {
        return this.list(filters);
    }

    count() {
        return this.plans.size;
    }

    getSummary() {
        const plans = this.getAll();

        if (!plans.length) {
            return {
                totalPlans: 0,
                averagePrice: 0,
                topCategory: null,
                bedroomRange: { min: 0, max: 0 }
            };
        }

        const totalPrice = plans.reduce((sum, plan) => sum + Number(plan.price || 0), 0);
        const categoryCounts = {};

        plans.forEach((plan) => {
            const key = plan.category || 'Uncategorized';
            categoryCounts[key] = (categoryCounts[key] || 0) + 1;
        });

        const topCategory = Object.entries(categoryCounts).sort((first, second) => second[1] - first[1])[0]?.[0] || null;
        const bedroomValues = plans.map((plan) => Number(plan.bedrooms || 0));

        return {
            totalPlans: plans.length,
            averagePrice: Math.round(totalPrice / plans.length),
            topCategory,
            bedroomRange: {
                min: Math.min(...bedroomValues),
                max: Math.max(...bedroomValues)
            }
        };
    }
}

if (typeof window !== 'undefined') {
    window.BarnoCatalog = BarnoCatalog;
    window.barnoCatalog = window.barnoCatalog || new BarnoCatalog();
}

if (typeof globalThis !== 'undefined') {
    globalThis.BarnoCatalog = BarnoCatalog;
}

export { BarnoCatalog };
