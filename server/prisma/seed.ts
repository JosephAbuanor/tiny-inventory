/// <reference path="../node_modules/.prisma/client/index.d.ts" />
import { PrismaClient } from "../node_modules/.prisma/client/index.js";

const prisma = new PrismaClient();

async function main() {
  await prisma.product.deleteMany();
  await prisma.store.deleteMany();

  const store1 = await prisma.store.create({
    data: { name: "Downtown Grocers" },
  });
  const store2 = await prisma.store.create({
    data: { name: "Tech Haven" },
  });
  const store3 = await prisma.store.create({
    data: { name: "Green Market" },
  });

  const stores = [store1, store2, store3];
  const categories = ["electronics", "produce", "dairy", "beverages", "snacks"];
  const names = [
    "Organic Milk",
    "Wireless Mouse",
    "Tomatoes",
    "Sparkling Water",
    "Chips",
    "Keyboard",
    "Apples",
    "Yogurt",
    "Headphones",
    "Bananas",
    "Soda",
    "USB Cable",
    "Lettuce",
    "Cheese",
  ];

  let i = 0;
  for (const store of stores) {
    for (let j = 0; j < 5; j++) {
      const name = names[i % names.length];
      const category = categories[j % categories.length];
      await prisma.product.create({
        data: {
          storeId: store.id,
          name: `${name} (${store.name})`,
          category,
          price: Math.round((5 + Math.random() * 95) * 100) / 100,
          quantityInStock: Math.floor(Math.random() * 50) + 1,
        },
      });
      i++;
    }
  }

  console.log("Seed complete: 3 stores, 15 products.");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
