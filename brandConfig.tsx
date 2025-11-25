/**
 * Third Wave Coffee - Brand Product Catalog
 * This file contains the brand-specific product knowledge for accurate detection
 */

export const TWC_PRODUCTS = {
    // Signature Hot Beverages
    hotBeverages: [
        {
            name: "Orange Zest Mocha",
            category: "Hot Beverage",
            description: "Mocha with orange zest garnish",
            keywords: ["mocha", "orange", "chocolate", "hot drink"]
        },
        {
            name: "Sea Salt Mocha",
            category: "Hot Beverage",
            description: "Mocha topped with sea salt foam",
            keywords: ["mocha", "sea salt", "chocolate", "hot drink"]
        },
        {
            name: "Peppermint Hot Chocolate",
            category: "Hot Beverage",
            description: "Hot chocolate with peppermint flavor",
            keywords: ["hot chocolate", "peppermint", "chocolate", "hot drink"]
        },
        {
            name: "Cappuccino",
            category: "Hot Beverage",
            description: "Classic espresso with steamed milk and foam",
            keywords: ["cappuccino", "espresso", "coffee", "hot drink"]
        },
        {
            name: "Latte",
            category: "Hot Beverage",
            description: "Espresso with steamed milk",
            keywords: ["latte", "espresso", "coffee", "hot drink"]
        },
        {
            name: "Flat White",
            category: "Hot Beverage",
            description: "Espresso with microfoam milk",
            keywords: ["flat white", "espresso", "coffee", "hot drink"]
        }
    ],

    // Cold Beverages
    coldBeverages: [
        {
            name: "Tiramisu Frappe",
            category: "Cold Beverage",
            description: "Blended coffee frappe with tiramisu flavor",
            keywords: ["frappe", "tiramisu", "iced", "blended", "cold drink"]
        },
        {
            name: "Cold Brew",
            category: "Cold Beverage",
            description: "Slow-steeped cold brew coffee",
            keywords: ["cold brew", "iced coffee", "cold drink"]
        },
        {
            name: "Iced Latte",
            category: "Cold Beverage",
            description: "Espresso with cold milk over ice",
            keywords: ["iced latte", "iced coffee", "cold drink"]
        },
        {
            name: "Nitro Cold Brew",
            category: "Cold Beverage",
            description: "Cold brew infused with nitrogen",
            keywords: ["nitro", "cold brew", "iced coffee", "cold drink"]
        }
    ],

    // Add more categories as needed
    pastries: [
        {
            name: "Croissant",
            category: "Pastry",
            description: "Buttery flaky croissant",
            keywords: ["croissant", "pastry", "baked goods"]
        },
        {
            name: "Muffin",
            category: "Pastry",
            description: "Fresh baked muffin",
            keywords: ["muffin", "pastry", "baked goods"]
        }
    ]
};

// Generate a comprehensive product list for prompts
export function getTWCProductList(): string {
    const allProducts = [
        ...TWC_PRODUCTS.hotBeverages,
        ...TWC_PRODUCTS.coldBeverages,
        ...TWC_PRODUCTS.pastries
    ];

    return allProducts.map(p => p.name).join(", ");
}

// Generate detailed product context for AI
export function getTWCProductContext(): string {
    const allProducts = [
        ...TWC_PRODUCTS.hotBeverages,
        ...TWC_PRODUCTS.coldBeverages,
        ...TWC_PRODUCTS.pastries
    ];

    return allProducts.map(p =>
        `${p.name} (${p.description})`
    ).join("; ");
}

// Get products by category
export function getTWCProductsByCategory(category: string) {
    switch (category.toLowerCase()) {
        case 'hot':
        case 'hot beverage':
            return TWC_PRODUCTS.hotBeverages;
        case 'cold':
        case 'cold beverage':
            return TWC_PRODUCTS.coldBeverages;
        case 'pastry':
        case 'food':
            return TWC_PRODUCTS.pastries;
        default:
            return [
                ...TWC_PRODUCTS.hotBeverages,
                ...TWC_PRODUCTS.coldBeverages,
                ...TWC_PRODUCTS.pastries
            ];
    }
}
