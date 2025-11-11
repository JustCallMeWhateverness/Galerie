import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import { useAuth } from "../hooks/useAuth";
import { useArtistInfo } from "../hooks/useArtistInfo"
import { addDays } from "date-fns";
import { useCurrency } from "../context/CurrencyContext";
import FileUpload from "../components/FileUpload";
import AuthModal from "../modals/AuthModal";
import MustBeSellerModal from "../modals/MustBeSellerModal";
import DatePickerInput from "../parts/DatePickerInput";

CreateAuction.route = {
  path: '/create',
  menuLabel: 'Create Auction',
  index: 7
};

const colorOptions = [
  { value: "black", label: "Black" },
  { value: "white", label: "White" },
  { value: "gold", label: "Gold" },
  { value: "silver", label: "Silver" },
  { value: "gray", label: "Gray" },
  { value: "beige", label: "Beige" },
  { value: "brown", label: "Brown" },
  { value: "blue", label: "Blue" },
  { value: "green", label: "Green" },
  { value: "red", label: "Red" },
  { value: "orange", label: "Orange" },
  { value: "yellow", label: "Yellow" },
  { value: "pink", label: "Pink" },
  { value: "purple", label: "Purple" },
];


const minimumAuctionLengthDays = 3;

export default function CreateAuction() {

  const { user } = useAuth();
  const { data: artistInfo } = useArtistInfo();
  const [imagePaths, setImagePaths] = useState<string[]>([]);
  const [categories, setCategories] = useState<{ id: string, title: string; }[]>([]);
  const [auction, setAuction] = useState({
    title: '',
    description: '',
    Seller: user?.id || '',
    AuctionCategory: '',
    Color: '',
    PickupEnabled: false,
    FreightEnabled: false,
    StartBid: 0,
    StartTime: '',
    EndTime: ''
  });
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const { convertToSEK } = useCurrency();
  const navigate = useNavigate();

  const handleImageUploaded = (res: { url: string; fileName: string; path: string; }) => {
    if (!res.path) {
      setImagePaths([]);
      setSelectedFile(null);
    } else {
      setImagePaths([res.path]);
    }
    setImageError(null);
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
    let processedValue: string | boolean | number = value;
    if (type === "checkbox") {
      processedValue = (event.target as HTMLInputElement).checked;
    }
    else if (type === "number") {
      processedValue = value === "" ? "" : Number(value);
    }
    setAuction({ ...auction, [name]: processedValue });
  }



  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (selectedFile && imagePaths.length === 0) {
      setImageError("Please click 'Upload image' after selecting an image.");
      return;
    }
    if (!user?.id) {
      alert("User ID is missing. Please log in again.");
      return;
    }
    const startBidNumber = Number(auction.StartBid);
    if (isNaN(startBidNumber) || startBidNumber <= 0) {
      alert("Please enter a valid starting bid.");
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
      color: auction.Color,
      pickupEnabled: auction.PickupEnabled,
      freightEnabled: auction.FreightEnabled,
      startBid: convertToSEK(startBidNumber),
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

  if (!user) {
    return (
      <AuthModal
        customTitle="Log in to create an auction"
      />
    );
  }

  if (
    !user.roles ||
    (
      !user.roles.includes('Administrator') &&
      !artistInfo
    )
  ) {
    return (
      <>
        <MustBeSellerModal
          show={true}
          onHide={() => navigate('/')}
          onUpgrade={() => {
            navigate('/user?createArtist=1');
          }}
        />
      </>
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
              <Form.Label>Color</Form.Label>
              <Form.Select
                name="Color"
                required
                value={auction.Color}
                onChange={setProperty}
              >
                <option value="" disabled>
                  Pick a color
                </option>
                {colorOptions.map((color) => (
                  <option key={color.value} value={color.value}>
                    {color.label}
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
            <Form.Group className='mb-4'>
              <Form.Label>Starting Bid</Form.Label>
              <Form.Control
                name='StartBid'
                type="number"
                required
                placeholder='Starting Bid'
                onChange={setProperty}
                min={0}
                autoComplete='off'
                value={auction.StartBid}
              />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label>Image</Form.Label>
              <FileUpload onUploaded={handleImageUploaded}
                onFileSelected={file => {
                  setSelectedFile(file);
                  setImageError(null);
                }}
              />
              {imageError && <div className="text-danger">{imageError}</div>}
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