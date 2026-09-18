import { BarnoCatalog } from '../plan-manager.js';

const slugify = (value = '') => String(value)
    .trim()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const buildPlanAssetSet = (bedrooms, label) => {
    const slug = `${bedrooms}-bedroom-${slugify(label)}`;

    return {
        main: `images/${slug}-main.jpg`,
        exterior: `images/${slug}-exterior.jpg`,
        floor: `images/${slug}-floor-plan.jpg`,
        elevation: null,
        pdf: `pdfs/${slug}.pdf`
    };
};

export const housePlans = [
    {
        id: 1,
        createdAt: '2026-09-01',
        name: '4 Bedroom Bungalow',
        category: 'Bungalow',
        bedrooms: 4,
        bathrooms: 2,
        floors: 1,
        garage: 1,
        price: 2000,
        image: 'images/4-bedroom-bungalow-main.jpg',
        images: {
            main: 'images/4-bedroom-bungalow-main.jpg',
            exterior: 'images/4-bedroom-bungalow-exterior.jpg',
            floor: 'images/4-bedroom-bungalow-floor-plan.jpg',
            elevation: null
        },
        pdf: 'pdfs/4-bedroom-bungalow.pdf',
        description: 'A spacious four-bedroom bungalow with practical family living areas and a modern layout.'
    },
    {
        id: 2,
        createdAt: '2026-09-02',
        name: '3 Bedroom All Ensuite Plan 2',
        category: '3 Bedroom',
        bedrooms: 3,
        bathrooms: 4,
        floors: 1,
        garage: 1,
        price: 2000,
        image: 'images/3-bedroom-all-ensuite-plan-2-main.jpg',
        images: {
            main: 'images/3-bedroom-all-ensuite-plan-2-main.jpg',
            exterior: 'images/3-bedroom-all-ensuite-plan-2-exterior.jpg',
            floor: 'images/3-bedroom-all-ensuite-plan-2-floor-plan.jpg',
            elevation: null
        },
        pdf: 'pdfs/3-bedroom-all-ensuite-plan-2.pdf',
        description: 'A second three-bedroom all-ensuite home with private bathrooms and a practical modern family layout.'
    },
    {
        id: 3,
        createdAt: '2026-09-01',
        name: '3 Bedroom Bungalow',
        category: 'Bungalow',
        bedrooms: 3,
        bathrooms: 2,
        floors: 1,
        garage: 1,
        price: 2000,
        image: 'images/3-bedroom-bungalow-main.png',
        images: {
            main: 'images/3-bedroom-bungalow-main.png',
            exterior: 'images/3-bedroom-bungalow-exterior.png',
            floor: 'images/3-bedroom-bungalow-floor-plan.png',
            elevation: null
        },
        pdf: 'pdfs/3-bedroom-bungalow.pdf',
        description: 'A comfortable three-bedroom bungalow designed for practical family living.'
    },
    {
        id: 4,
        createdAt: '2026-08-30',
        name: '2 Bedroom Family Home',
        category: '2 Bedroom',
        bedrooms: 2,
        bathrooms: 2,
        floors: 1,
        garage: 1,
        price: 2000,
        image: 'images/2-bedroom-family-home-main.jpg',
        images: {
            main: 'images/2-bedroom-family-home-main.jpg',
            exterior: 'images/2-bedroom-family-home-exterior.jpg',
            floor: 'images/2-bedroom-family-home-floor-plan.jpg',
            elevation: null
        },
        pdf: 'pdfs/2-bedroom-family-home.pdf',
        description: 'A practical two-bedroom family home with a master bedroom featuring a walk-in closet, a second simple bedroom, a common WC, kitchen, living room, and dining area.'
    },
    {
        id: 5,
        createdAt: '2026-09-01',
        name: '3 Bedroom All Ensuite',
        category: '3 Bedroom',
        bedrooms: 3,
        bathrooms: 3,
        floors: 1,
        garage: 1,
        price: 2000,
        image: 'images/3-bedroom-all-ensuite-main.jpg',
        images: {
            main: 'images/3-bedroom-all-ensuite-main.jpg',
            exterior: 'images/3-bedroom-all-ensuite-exterior.jpg',
            floor: 'images/3-bedroom-all-ensuite-floor-plan.jpg',
            elevation: null
        },
        pdf: 'pdfs/3-bedroom-all-ensuite.pdf',
        description: 'A three-bedroom home designed around en-suite bedroom comfort, practical family living, and a clean modern layout.'
    },
    {
        id: 6,
        createdAt: '2026-09-03',
        name: '3 Bedroom House Plan 2',
        category: '3 Bedroom',
        bedrooms: 3,
        bathrooms: 2,
        floors: 1,
        garage: 1,
        price: 2000,
        image: 'images/3-bedroom-plan-2-main.png',
        images: {
            main: 'images/3-bedroom-plan-2-main.png',
            exterior: 'images/3-bedroom-plan-2-exterior.png',
            floor: 'images/3-bedroom-plan-2-floor-plan.png',
            elevation: null
        },
        pdf: 'pdfs/3-bedroom-plan-2.pdf',
        description: 'A three-bedroom house with practical living spaces, two bathrooms, and a balanced family-friendly layout.'
    },
    {
        id: 7,
        createdAt: '2026-09-03',
        name: '3 Bedroom House Plan 3',
        category: '3 Bedroom',
        bedrooms: 3,
        bathrooms: 2,
        floors: 1,
        garage: 1,
        price: 2000,
        image: 'images/3-bedroom-plan-3-main.jpg',
        images: {
            main: 'images/3-bedroom-plan-3-main.jpg',
            exterior: 'images/3-bedroom-plan-3-exterior.jpg',
            floor: 'images/3-bedroom-plan-3-floor-plan.jpg',
            elevation: null
        },
        pdf: 'pdfs/3-bedroom-plan-3.pdf',
        description: 'A three-bedroom house with a bright open living area, practical study space, and two bathrooms.'
    },
    {
        id: 8,
        createdAt: '2026-09-03',
        name: '3 Bedroom House Plan 4',
        category: '3 Bedroom',
        bedrooms: 3,
        bathrooms: 2,
        floors: 1,
        garage: 1,
        price: 2000,
        image: 'images/3-bedroom-plan-4-main.jpg',
        images: {
            main: 'images/3-bedroom-plan-4-main.jpg',
            exterior: 'images/3-bedroom-plan-4-exterior.jpg',
            floor: 'images/3-bedroom-plan-4-floor-plan.jpg',
            elevation: null
        },
        pdf: 'pdfs/3-bedroom-plan-4.pdf',
        description: 'A three-bedroom house with a master bedroom, open living areas, kitchen, dining space, and two bathroom facilities.'
    },
    {
        id: 9,
        createdAt: '2026-09-03',
        name: '2 Bedroom (No Dining)',
        category: '2 Bedroom',
        bedrooms: 2,
        bathrooms: 2,
        floors: 1,
        garage: 1,
        price: 2000,
        image: 'images/2-bedroom-(no dinning)-main.png',
        images: {
            main: 'images/2-bedroom-(no dinning)-main.png',
            exterior: 'images/2-bedroom-(no dinning)-exterior.png',
            floor: 'images/2-bedroom-(no dinning)-floor-plan.png',
            elevation: null
        },
        pdf: 'pdfs/2-bedroom-(no dinning).pdf',
        description: 'A compact two-bedroom home designed without a dedicated dining room, keeping the layout practical and family-friendly.'
    },
    {
        id: 10,
        createdAt: '2026-09-03',
        name: '2 Bedroom Hidden Roof',
        category: '2 Bedroom',
        bedrooms: 2,
        bathrooms: 2,
        floors: 1,
        garage: 1,
        price: 2000,
        image: 'images/2-bedroom-hidden roof-main.png',
        images: {
            main: 'images/2-bedroom-hidden roof-main.png',
            exterior: 'images/2-bedroom-hidden roof-exterior.png',
            floor: 'images/2-bedroom-hidden roof-floor-plan.png',
            elevation: null
        },
        pdf: 'pdfs/2-bedroom-hidden roof.pdf',
        description: 'A stylish two-bedroom design with a concealed roof profile, compact living zones, and a practical family layout.'
    }
];

export const planAssetPatterns = {
    slugify,
    buildPlanAssetSet
};

export const barnoPlanCatalog = new BarnoCatalog(housePlans);

if (typeof window !== 'undefined') {
    window.housePlans = housePlans;
    window.barnoPlanCatalog = barnoPlanCatalog;
    window.addPlanToCatalog = function(plan) {
        return barnoPlanCatalog.addPlan(plan);
    };
    window.getPlanCatalog = function() {
        return barnoPlanCatalog;
    };
}