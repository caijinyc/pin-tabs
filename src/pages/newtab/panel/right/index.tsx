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
import { useStore } from '@pages/newtab/store/store';
import styles from '@pages/newtab/style.module.scss';
import { GroupContent } from '@pages/newtab/panel/right/comps/group-content';
import { produce } from 'immer';
import { uuid } from '@src/shared/kits';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Icon } from '@iconify-icon/react';
import { dialog } from '@pages/newtab/comps/global-dialog';
import { commonLocalStorage } from '@src/shared/storages/commonStorage';

function GroupSetting() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const selectedIndex = useStore(state => state.selectedIndex);
  const toast = useToast();

  const { register, handleSubmit, watch, setValue } = useForm<{
    name: string;
  }>({
    defaultValues: {
      name: useStore.getState().groups[selectedIndex]?.name || '',
    },
  });

  useEffect(() => {
    const selectedGroupData = useStore.getState().groups[selectedIndex];
    setValue('name', useStore.getState().groups[selectedIndex]?.name);

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
  }, [selectedIndex]);

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
                    useStore.setState(old => {
                      return produce(old, draft => {
                        const idList = draft.groups[selectedIndex].subSpacesIds;
                        idList.forEach(id => {
                          delete draft.allSpacesMap[id];
                        });
                        draft.groups.splice(selectedIndex, 1);
                        draft.selectedIndex = selectedIndex === 0 ? 0 : selectedIndex - 1;
                      });
                    });
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
                    draft.groups[selectedIndex].name = watch('name');
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

export const RightContentPanel = () => {
  const selectedIndex = useStore(state => state.selectedIndex);

  return (
    <div className={styles.rightPanel}>
      <GroupContent />

      <div>
        <Button
          size={'xs'}
          onClick={() => {
            useStore.setState(old => {
              return produce(old, draft => {
                const id = uuid();
                draft.groups[selectedIndex].subSpacesIds.push(id);
                draft.allSpacesMap[id] = {
                  name: 'Untitled Sub Space',
                  tabs: [],
                  uuid: id,
                };
              });
            });
          }}>
          Add Sub Space
        </Button>

        {<GroupSetting />}
      </div>
    </div>
  );
};
