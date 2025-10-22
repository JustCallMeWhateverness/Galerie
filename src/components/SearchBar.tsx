import { useState } from "react";
import { Form, InputGroup, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

type SearchBarProps = {
  initialQuery?: string;
  placeholder?: string;
};

export default function SearchBar({
  initialQuery = "",
  placeholder = "Search..."
}: SearchBarProps) {
  const [q, setQ] = useState<string>(initialQuery);
  const navigate = useNavigate();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const query = q.trim();
    if (!query) return;
    navigate(`/search?q=${encodeURIComponent(query)}`);
  }

  return (
    <Form onSubmit={onSubmit} role="search" aria-label="Site search">
      <InputGroup>
        <Form.Control
          type="search"
          value={q}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setQ(e.target.value)
          }
          placeholder={placeholder}
          aria-label="Search input"
        />
        <Button variant="primary" type="submit" aria-label="Submit search">
          <i className="bi bi-search"></i>
        </Button>
      </InputGroup>
    </Form>
  );
}
