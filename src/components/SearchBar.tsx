import { useState } from "react";
import { Form, InputGroup, Button } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";

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
  const location = useLocation();

  function buildUrl(nextQ: string) {
    const params = new URLSearchParams(location.search);
    if (nextQ) params.set("q", nextQ);
    else params.delete("q");
    return `${location.pathname}${params.toString() ? `?${params}` : ""}`;
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    navigate(buildUrl(q.trim()));
  }

  return (
    <Form onSubmit={onSubmit} role="search" aria-label="Site search">
      <InputGroup>
        <Form.Control
          type="search"
          value={q}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQ(e.target.value)}
          onInput={(e: React.FormEvent<HTMLInputElement>) => {
            const value = (e.target as HTMLInputElement).value;
            if (value === "") {
              setQ("");
              navigate(buildUrl(""));
            }
          }}
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
