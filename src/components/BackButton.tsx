import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

interface BackButtonProps {
  fallbackTo?: string;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark' | 'outline-primary' | 'outline-secondary' | 'outline-success' | 'outline-danger' | 'outline-warning' | 'outline-info' | 'outline-light' | 'outline-dark' | 'link';
  size?: 'sm' | 'lg';
  className?: string;
  children?: React.ReactNode;
  onClick?: () => void;
}

export default function BackButton({
  fallbackTo = '/',
  variant = 'outline-secondary',
  size,
  className = '',
  children,
  onClick,
}: BackButtonProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    }

    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(fallbackTo);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      className={className}
    >
      {children || (
        <>
          <i className="bi bi-arrow-left me-2"></i>
          Back
        </>
      )}
    </Button>
  );
}

