export default async function productsLoader({ params }: any) {
  let url = '/api/products';
  if (params.slug) { url += '?slug=' + params.slug; }
  return {
    products:
      await (await fetch(url)).json()
  };
};