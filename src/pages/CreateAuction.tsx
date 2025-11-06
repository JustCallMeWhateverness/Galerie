import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import { useAuth } from "../hooks/useAuth";
import { addDays } from "date-fns";
import FileUpload from "../components/FileUpload";
import AuthModal from "../modals/AuthModal";
import MustBeSellerModal from "../modals/MustBeSellerModal";
import DatePickerInput from "../parts/DatePickerInput";

CreateAuction.route = {
  path: '/create',
  menuLabel: 'Create Auction',
  index: 7
};

const minimumAuctionLengthDays = 3;
const currency = "SEK";

export default function CreateAuction() {
  const [showSellerModal, setShowSellerModal] = useState(true);
  const { user, loading } = useAuth();
  const [imagePaths, setImagePaths] = useState<string[]>([]);
  const [categories, setCategories] = useState<{ id: string, title: string; }[]>([]);
  const [auction, setAuction] = useState({
    title: '',
    description: '',
    Seller: user?.id || '',
    AuctionCategory: '',
    PickupEnabled: false,
    FreightEnabled: false,
    StartTime: '',
    EndTime: ''
  });
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const navigate = useNavigate();

  const handleImageUploaded = (res: { url: string; fileName: string; path: string; }) => {
    setImagePaths([res.path]);
  };


  useEffect(() => {
    async function fetchCategories() {
      const response = await fetch('/api/Category', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        console.log("Fetched categories:", data);
        setCategories(data);
      }
    }
    fetchCategories();
  }, []);


  useEffect(() => {
    if (user) {
      setAuction(a => ({ ...a, Seller: user.id }));
    }
  }, [user]);

  function setProperty(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = event.target;
    let processedValue: string | boolean = value;
    if (type === "checkbox") {
      processedValue = (event.target as HTMLInputElement).checked;
    }
    setAuction({ ...auction, [name]: processedValue });
  }



  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user?.id) {
      alert("User ID is missing. Please log in again.");
      return;
    }

    const newAuction = {
      title: auction.title,
      description: auction.description,
      seller: [
        {
          id: user.id,
          username: user.username
        }
      ],
      auctionCategoryId: auction.AuctionCategory,
      pickupEnabled: auction.PickupEnabled,
      freightEnabled: auction.FreightEnabled,
      imageUpload: imagePaths.length
        ? { paths: imagePaths, mediaTexts: [''] }
        : null,
      startTime: startDate?.toISOString(),
      endTime: endDate?.toISOString(),
    };
    console.log("Auction POST body:", newAuction);
    try {
      const response = await fetch('/api/Auction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAuction),
        credentials: 'include',
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Auction created:", result);
        navigate(`/auction/${result.id}`);
      } else {
        let errorText = await response.text();
        let errorMessage = errorText;
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error || errorJson.message || errorText;
        } catch { }
        console.error("Failed to create auction:", errorMessage);
      }
    } catch (error) {
      console.error("Error creating auction:", error);
    }
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

  if (!user.roles || (!user.roles.includes('seller') && !user.roles.includes('Administrator'))) {
    return (
      <MustBeSellerModal
        show={showSellerModal}
        onHide={() => {
          setShowSellerModal(false);
          navigate('/');
        }}
        onUpgrade={() => { }}
      />
    );
  }

  return (
    <Container>
      <Row>
        <Col>
          <h2>Create an Auction</h2>
          <Form onSubmit={handleSubmit}>
            <Form.Group className='mb-4'>
              <Form.Label>Title</Form.Label>
              <Form.Control
                name='title'
                type="text"
                required
                placeholder='Title for your auction'
                onChange={setProperty}
                autoComplete='off'
                value={auction.title}
              />
            </Form.Group>
            <Form.Group className='mb-4'>
              <Form.Label>Description</Form.Label>
              <Form.Control
                name='description'
                as="textarea"
                rows={5}
                required
                placeholder='Description'
                onChange={setProperty}
                autoComplete='off'
                value={auction.description}
              />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label>Category</Form.Label>
              <Form.Select
                name="AuctionCategory"
                required
                value={auction.AuctionCategory}
                onChange={setProperty}
              >
                <option value="" disabled>
                  Pick a category
                </option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.title}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Check
                type="checkbox"
                name="PickupEnabled"
                label="Pickup enabled"
                checked={auction.PickupEnabled}
                onChange={setProperty}
              />
              <Form.Check
                type="checkbox"
                name="FreightEnabled"
                label="Freight enabled"
                checked={auction.FreightEnabled}
                onChange={setProperty}
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Image</Form.Label>
              <FileUpload onUploaded={handleImageUploaded} />

            </Form.Group>

            <Row className="mb-4">
              <Col xs={6}>
                <Form.Group>
                  <Form.Label>Start time</Form.Label>
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
                  <Form.Label>End time</Form.Label>
                  <DatePickerInput
                    value={endDate}
                    onChange={setEndDate}
                    minimumDate={startDate ? addDays(startDate, minimumAuctionLengthDays) : undefined}
                    placeholder="Select end date"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Button type='submit' className='mt-4 w-full'>Create Auction</Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}