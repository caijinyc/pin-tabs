import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogCloseButton,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  useDisclosure,
} from '@chakra-ui/react';
import React, { useEffect } from 'react';
import { create } from 'zustand';

type ConfirmParams = { title: React.ReactNode; content: React.ReactNode; onOk?: () => void; onCancel?: () => void };
let count = 0;
export const useDialogStore = create<
  ConfirmParams & {
    count: number;
  }
>(() => ({
  title: '',
  content: '',
  count: 0,
}));

export const dialog = {
  confirm: (props: ConfirmParams) => {
    useDialogStore.setState({
      ...props,
      count: count++,
    });
  },
};

export function TransitionExample() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef();
  const { title, content, onOk, onCancel } = useDialogStore();

  useEffect(() => {
    if (count > 0) {
      onOpen();
    }
  }, [count]);

  return (
    <>
      <AlertDialog
        motionPreset="slideInBottom"
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        isOpen={isOpen}
        isCentered>
        <AlertDialogOverlay />

        <AlertDialogContent>
          <AlertDialogHeader>{title}</AlertDialogHeader>
          <AlertDialogCloseButton />
          <AlertDialogBody>{content}</AlertDialogBody>
          <AlertDialogFooter>
            <Button
              ref={cancelRef}
              onClick={() => {
                onClose();
                onCancel && onCancel();
              }}>
              No
            </Button>
            <Button
              colorScheme="red"
              ml={3}
              onClick={() => {
                onClose();
                onOk && onOk();
              }}>
              Yes
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
