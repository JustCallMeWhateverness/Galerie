import { useState } from "react";
import { Button, Col, Container, Form, InputGroup, Row } from "react-bootstrap";
import { useAuth } from "../hooks/useAuth";
import DatePickerInput from "../parts/DatePickerInput";
import { addDays } from "date-fns";
import AuthModal from "../modals/AuthModal";


CreateAuction.route = {
  path: '/create',
  menuLabel: 'Create Auction',
  index: 7
};


// sample data for rendering, will be replaced with database 
const categories = [{ cId: 1, name: 'Ceramics' }, { cId: 2, name: 'Textiles' }, { cId: 3, name: 'Smithing' }]
const minimumAuctionLengthDays = 3;
const currency = "SEK"

export default function CreateAuction() {

  const { user, loading } = useAuth();
  const [auction, setAuction] = useState({
    title: '',
    description: '',
    category: '',
    pickupLocation: '',
    freight: '',
    startingBid: 0,
    image: '',
    startTime: '',
    endTime: ''
  })
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  function setProperty(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    let { name, value } = event.target
    let processedValue: string | number | null | string[] = value

    setAuction({ ...auction, [name]: processedValue })
  }

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!user) {
    return (
      <AuthModal
        customTitle="Log in to create an auction"
      />
    );
  }
  return <>
    <Container>
      <Row>
        <Col>
          <h2>Create an Auction</h2>

          <Form>
            <Form.Group className='mb-4'>
              <Form.Label>Title
              </Form.Label>
              <Form.Control
                name='title'
                type="text"
                required
                placeholder='Title for your auction'
                onChange={setProperty}
                autoComplete='off' />
            </Form.Group>
            <Form.Group className='mb-4'>
              <Form.Label>Description
              </Form.Label>
              <Form.Control
                name='description'
                as="textarea"
                rows={5}
                required
                placeholder='Description'
                onChange={setProperty}
                autoComplete='off' />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label> Categories
              </Form.Label>
              <Form.Select name="category">
                <option selected disabled >
                  Pick a category
                </option>
                {categories.map((category) => (
                  <option key={category.cId}>
                    {category.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Row className="mb-4">
              <Col>
                <Form.Group>
                  <Form.Label>
                    Pickup Location
                  </Form.Label>
                  <Form.Control
                    name="pickupLocation"
                    type="text"
                    placeholder="Zip/Postal code"
                    onChange={setProperty}
                    autoComplete="off"
                  >

                  </Form.Control>
                </Form.Group>
              </Col>
              <Col>
                <Form.Group>
                  <Form.Label>
                    Freight location
                  </Form.Label>
                  <Form.Control
                    name="freight"
                    type="text"
                    placeholder="Zip/Postal code"
                    onChange={setProperty}
                    autoComplete="off"
                  >
                  </Form.Control>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-4">
              <Form.Label>
                Starting Bid
              </Form.Label>
              <InputGroup>
                <Form.Control
                  type="number"
                  name="startingBid"
                  onChange={setProperty}
                  autoComplete="off"
                ></Form.Control>
                <InputGroup.Text>{currency}</InputGroup.Text>
              </InputGroup>

            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label>
                Add image
              </Form.Label>
              <Form.Control
                type="file"
                name="image"
                onChange={setProperty}
                autoComplete="off"
              ></Form.Control>
            </Form.Group>
            <Row className="mb-4">
              <Col xs={6}>
                <Form.Group>
                  <Form.Label>
                    Start time
                  </Form.Label>

                  <DatePickerInput
                    value={startDate}
                    onChange={setStartDate}
                    minimumDate={new Date()}
                    placeholder="Select start date"
                  />

                </Form.Group>
              </Col>
              <Col xs={6}>
                <Form.Group>
                  <Form.Label>
                    End time
                  </Form.Label>
                  <DatePickerInput
                    value={endDate}
                    onChange={setEndDate}
                    minimumDate={startDate || undefined}
                    placeholder={startDate ? addDays(startDate, minimumAuctionLengthDays) : "Select end date"}
                  />

                </Form.Group>
              </Col>
            </Row>
            <Button type='submit' className='mt-4 w-full'>Create Auction</Button>
          </Form>
        </Col>
      </Row>
    </Container>
  </>
}