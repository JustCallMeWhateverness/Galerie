import type Product from '../interfaces/Product';

export interface SortOption {
  description: string;
  key: keyof Product,
  order: number;
}

export function getHelpers(productsJson: any) {

  const products = productsJson as Product[];

  const categories = [
    'All (' + products.length + ')',
    ...products
      // map to category arrays from each product
      .map(x => x.categories)
      // flatten to one array
      .flat()
      // add count of products in to each category
      .map((x, _i, a) => x + ' ('
        + a.filter(y => x === y).length + ')')
      // remove duplicates
      .filter((x, i, a) => a.indexOf(x) === i)
      // sort (by name)
      .sort()
  ];

  const sortOptions: SortOption[] = [
    { description: 'Price (low to high)', key: 'price$', order: 1 },
    { description: 'Price (high to low)', key: 'price$', order: -1 },
    { description: 'Product name (a-z)', key: 'name', order: 1 },
    { description: 'Product name (z-a)', key: 'name', order: -1 }
  ];

  const sortDescriptions = sortOptions
    .map(x => x.description);

  return {
    products,
    categories,
    sortOptions,
    sortDescriptions
  };
}