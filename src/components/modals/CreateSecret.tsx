/* eslint-disable no-unused-vars */
import { FC } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody } from "@heroui/react";
import { CreateSecretForm } from "@/components/molecules";

interface Props {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const CreateSecretModal: FC<Props> = ({ isOpen, onOpenChange }) => {
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} hideCloseButton>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="text-foreground">
              Let&apos;s add a secret
            </ModalHeader>
            <ModalBody>
              <CreateSecretForm afterSubmit={onClose} />
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default CreateSecretModal;
