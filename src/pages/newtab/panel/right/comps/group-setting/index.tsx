import {
  Button,
  FormControl,
  FormLabel,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { StoreHooks } from '@pages/newtab/store/hooks';
import { useForm } from 'react-hook-form';
import React, { useEffect } from 'react';
import { commonLocalStorage } from '@src/shared/storages/commonStorage';
import { produce } from 'immer';
import { Icon } from '@iconify-icon/react';
import { useStore } from '@pages/newtab/store/store';
import { dialog } from '@pages/newtab/comps/global-dialog';
import { Actions } from '@pages/newtab/store/actions/normal';

export function GroupSetting() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const currentGroup = StoreHooks.useCurrentGroup();
  const toast = useToast();

  const { register, handleSubmit, watch, setValue } = useForm<{
    name: string;
  }>({
    defaultValues: {
      name: currentGroup?.name || '',
    },
  });

  useEffect(() => {
    const selectedGroupData = currentGroup;
    setValue('name', currentGroup?.name);

    if (selectedGroupData) {
      if (
        selectedGroupData.name === 'Untitled Group' &&
        selectedGroupData.subSpacesIds.length === 0 &&
        !commonLocalStorage.getSnapshot().alreadyAutoOpenSettingModalGroupIdMap[selectedGroupData.id]
      ) {
        onOpen();
        commonLocalStorage.set(old => {
          return produce(old, draft => {
            draft.alreadyAutoOpenSettingModalGroupIdMap[selectedGroupData.id] = true;
          });
        });
      }
    }
  }, [currentGroup?.id]);

  return (
    <>
      <IconButton
        size={'xs'}
        className={'ml-2'}
        aria-label="Group Setting"
        onClick={onOpen}
        icon={<Icon icon="lets-icons:setting-line-duotone" width="16" height="16" />}
      />

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Group Setting</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl>
              <FormLabel>Group Name</FormLabel>
              <Input {...register('name')} />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="red"
              mr={3}
              onClick={() => {
                if (useStore.getState().groups.length === 1) {
                  toast({
                    title: 'Must have at least one group.',
                    status: 'error',
                    isClosable: true,
                  });

                  return;
                }

                dialog.confirm({
                  title: 'Delete Group',
                  content: 'Are you sure to delete this group?',
                  onOk: () => {
                    onClose();
                    Actions.removeGroup(currentGroup.id);
                  },
                });
              }}>
              DELETE
            </Button>

            <Button
              colorScheme="blue"
              mr={3}
              onClick={() => {
                useStore.setState(old => {
                  return produce(old, draft => {
                    draft.groupsMap[currentGroup.id].name = watch('name');
                  });
                });
                onClose();
              }}>
              Save
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
