import { Toast, ToastContainer } from "react-bootstrap";

interface ErrorToastProps {

  show: boolean,
  onClose: () => void,
  title?: string,
  message?: string,
  delay?: number,
  autohide?: boolean
}

export default function ErrorToast({
  show,
  onClose,
  title = "Alert",
  message,
  delay = 3000,
  autohide = true
}: ErrorToastProps) {

  return <ToastContainer
    position="top-end" className="position-absolute" >
    <Toast
      onClose={onClose}
      show={show}
      autohide={autohide}
      delay={delay}
      animation={true}
      className="z-3"
    >
      <Toast.Header className="me-auto" >{title}</Toast.Header>
      <Toast.Body>
        {message}
      </Toast.Body>
    </Toast>
  </ToastContainer>
}