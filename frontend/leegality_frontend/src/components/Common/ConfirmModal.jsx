import { Modal, Button } from "react-bootstrap";

export default function ConfirmModal({
    show,
    title,
    message,
    confirmText = "Confirm",
    confirmVariant = "primary",
    onConfirm,
    onClose,
}) {
    return (
        <Modal
            show={show}
            onHide={onClose}
            centered
        >
            <Modal.Header closeButton>

                <Modal.Title>

                    {title}

                </Modal.Title>

            </Modal.Header>

            <Modal.Body>

                {message}

            </Modal.Body>

            <Modal.Footer>

                <Button
                    variant="secondary"
                    onClick={onClose}
                >
                    Cancel
                </Button>

                <Button
                    variant={confirmVariant}
                    onClick={onConfirm}
                >
                    {confirmText}
                </Button>

            </Modal.Footer>

        </Modal>
    );
}