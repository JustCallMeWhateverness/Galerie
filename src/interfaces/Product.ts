export default interface Product {
  id: number;
  name: string;
  quantity: string;
  price$: number;
  slug: string;
  description: string;
  categories: string[];
}