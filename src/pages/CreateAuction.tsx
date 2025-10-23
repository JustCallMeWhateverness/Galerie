import { useState } from "react";
import { Button, Dropdown, Form } from "react-bootstrap";
import DatePickerInput from "../parts/DatePickerInput";
import { addDays } from "date-fns";
// import DatePicker from "react-datepicker";
// import StartTimePicker from "../parts/StartTimePicker";
CreateAuction.route = {
  path: '/create',
  menuLabel: 'Create Auction',
  index: 7
};

const categories = [{ cId: 1, name: 'Ceramics' }, { cId: 2, name: 'Textiles' }, { cId: 3, name: 'Smithing' }]


export default function CreateAuction() {

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
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(null);

  function setProperty(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    let { name, value } = event.target
    let processedValue: string | number | null | string[] = value

    setAuction({ ...auction, [name]: processedValue })
  }


  return <>
    <h2>Create an Auction</h2>
    <Form>
      <Form.Group className='mb-4'>
        <Form.Label>Header
        </Form.Label>
        <Form.Control
          name='header'
          type="text"
          required
          placeholder='Header'
          onChange={setProperty}
          autoComplete='off' />
      </Form.Group>
      <Form.Group className='mb-4'>
        <Form.Label>Description
        </Form.Label>
        <Form.Control
          name='textBody'
          as="textarea"
          rows={5}
          required
          placeholder='Description'
          onChange={setProperty}
          autoComplete='off' />
      </Form.Group>

      <Form.Group>
        <Form.Label> Categories
        </Form.Label>
        <Dropdown>
          <Dropdown.Toggle variant="success" id="categories">
            Categories
          </Dropdown.Toggle>
          <Dropdown.Menu>
            {categories.map((category) => (
              <Dropdown.Item key={category.cId}>
                {category.name}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
      </Form.Group>

      <Form.Group>
        <Form.Label>
          Pickup Location
        </Form.Label>
        <Form.Control>
        </Form.Control>
      </Form.Group>

      <Form.Group>
        <Form.Label>
          Freight cost
        </Form.Label>
        <Form.Control type="number">
        </Form.Control>
      </Form.Group>


      <Form.Group>
        <Form.Label>
          Starting Bid
        </Form.Label>
        <Form.Control type="number"></Form.Control>
      </Form.Group>
      <Form.Group>
        <Form.Label>
          Add image
        </Form.Label>
        <Form.Control type="file"></Form.Control>
      </Form.Group>

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

      <Form.Group>
        <Form.Label>
          End time
        </Form.Label>
        <DatePickerInput
          value={endDate}
          onChange={setEndDate}
          minimumDate={startDate || undefined}
          placeholder={startDate ? addDays(startDate, 3) : "Select"}
        />

      </Form.Group>
      <Button type='submit' className='mt-4 float-end'>Create Post</Button>

    </Form>




  </>
}