import type { SortOption } from '../utils/productPageHelpers';
import { useLoaderData } from 'react-router-dom';
import { Row, Col, Form, Button } from 'react-bootstrap';
import { useStateContext } from '../utils/useStateObject';
import Select from '../parts/Select';
import ProductCard from '../parts/ProductCard';
import productsLoader from '../utils/productsLoader';
import { getHelpers } from '../utils/productPageHelpers';
import { useNavigate } from "react-router-dom";
import AuctionCard from '../parts/AuctionCard';

ProductsPage.route = {
  path: '/',
  menuLabel: 'Products',
  index: 1,
  parent: '/',
  loader: productsLoader
};

export default function ProductsPage() {

  let {
    products,
    categories,
    sortOptions,
    sortDescriptions
  } = getHelpers(useLoaderData().products);

  // get state object and setter from the outlet context
  const [
    { categoryChoice, sortChoice, bwImages },
    setState
  ] = useStateContext();

  // get the chosen category without the product count part
  const category = categoryChoice.split(' (')[0];
  // get the key and order to from the chosen sort option
  const { key: sortKey, order: sortOrder } =
    sortOptions.find(x => x.description === sortChoice) as SortOption;

  const navigate = useNavigate();

  async function handleLogout() {
    const response = await fetch("/api/login", { method: "DELETE", credentials: "include" });
    if (response.ok) { navigate("/account"); }
    else { alert("Logout failed."); }
  }

  // sample data for auctionCard
  const sampleTime = new Date("2025-10-21T11:49:00")

  const sampleAuctionCard = { id: 1, title: "Scarf", currentBid: 33, endTime: sampleTime, favorited: false }

  return <>
    <Row>
      <AuctionCard {...sampleAuctionCard} />
    </Row>

    <Row>
      <Button variant="danger" type="button" onClick={handleLogout}>
        Logout
      </Button>
      <Col>
        <h2 className="text-primary">Our products</h2>
        <p>
          Our products are fantastic, organic and fresh.
          They are also very reasonably priced, considering
          they are all harvested with the greatest care.
        </p>
      </Col>
    </Row>
    <Row>
      <Col className="px-4 pt-1 pb-4">
        <Row className="bg-primary-subtle pt-3 rounded">
          <Col md="4">
            <label className="d-block">
              <div className="d-none d-md-block">
                Color images:
              </div>
              <div
                className={'form-switch-text position-absolute' +
                  ' d-md-none px-5' + (bwImages ? '' : ' text-white')}
              >
                B/W Images
                <span className="float-end">Color Images</span>
              </div>
              <Form.Switch
                className="mt-2 mb-4 mb-md-2"
                defaultChecked={!bwImages}
                onChange={e => setState('bwImages', !e.target.checked)}
              />
            </label>
          </Col>
          <Col md="4">
            <Select
              label="Category"
              value={categoryChoice}
              changeHandler={(x: string) => setState('categoryChoice', x)}
              options={categories}
            />
          </Col>
          <Col md="4">
            <Select
              label="Sort by"
              value={sortChoice}
              changeHandler={(x: string) => setState('sortChoice', x)}
              options={sortDescriptions}
            />
          </Col>
        </Row>
      </Col >
    </Row >
    <Row className="mt-1 mb-n3">
      {products
        // filter by the chosen category
        .filter(x => category === 'All' || x.categories.includes(category))
        // sort by the chosen choice for sorting
        .sort((a, b) => (a[sortKey] > b[sortKey] ? 1 : -1) * sortOrder)
        // map to product cards
        .map(product => <Col xs={12} lg={6} key={product.id}>
          <ProductCard {...product} />
        </Col>)
      }
    </Row>
  </>;
};