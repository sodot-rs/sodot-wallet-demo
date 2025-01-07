/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ActionIcon,
  Button,
  Center,
  Container,
  Drawer,
  Modal,
  ScrollArea,
  Table,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconTrash } from '@tabler/icons-react';
import { ReactNode, useEffect, useState } from 'react';
import { JSONTree } from 'react-json-tree';

interface Network {
  type: 'request' | 'response';
  url: string;
  method: string;
  body: any;
  credentials: string | null;
  status: number | null;
}
export default function NetworkTable(): ReactNode {
  const [drawerOpened, { open: drawerOpen, close: drawerClose }] = useDisclosure(false);

  const [network, setNetwork] = useState<Network[]>([]);
  const [bodyModalopened, { open: bodyModalopen, close: bodyModalclose }] = useDisclosure(false); //modal

  const [credModalopened, { open: credModalopen, close: credModalclose }] = useDisclosure(false); //modal

  const [creds, setCreds] = useState<string>('');
  const [bodyData, setBodyData] = useState<Record<string, any> | string>('');

  useEffect(() => {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const reqUrl = args[0];
      const req = args[1];
      const reqCredentials =
        req?.headers instanceof Headers ? req.headers.get('Authorization') || '' : '';
      const requestMethod = req?.method ?? '';
      const requestBody = req?.body;

      let requestBodyJson = null;

      try {
        requestBodyJson = JSON.parse(requestBody as string);
      } catch {
        // Do nothing
      }
      const reqNetowk: Network = {
        type: 'request',
        url: reqUrl as string,
        method: requestMethod,
        body: requestBodyJson ? requestBodyJson : requestBody,
        credentials: reqCredentials,
        status: null,
      };
      const res = await originalFetch(...args);
      const clonedResponse = res.clone();
      const resStatus = clonedResponse.status;
      const resUrl = clonedResponse.url;
      const resContentType = clonedResponse.headers.get('Content-Type');
      let resBody;
      if (resContentType && resContentType.includes('application/json')) {
        // If the response is JSON, parse it as JSON
        resBody = await clonedResponse.json();
      } else {
        // Otherwise, treat it as plain text
        resBody = await clonedResponse.text();
      } // const resBodyJson = JSON.parse(resBodyText);
      const resNetwork: Network = {
        url: resUrl,
        method: requestMethod,
        status: resStatus,
        body: resBody,
        credentials: null,
        type: 'response',
      };
      if (
        typeof reqUrl === 'string' &&
        (reqUrl.includes('api') || reqUrl.includes('google') || reqUrl.includes('sepolia'))
      ) {
        setNetwork((prev) => [...prev, reqNetowk, resNetwork]);
      }
      return res;
    };
  }, []);

  const customTheme = {
    scheme: 'default',
    base00: 'transparent', // Set transparent background
  };
  const rows = network.map((element, i) => (
    <Table.Tr key={i}>
      <Table.Td style={{ color: element.type === 'request' ? 'green' : 'orange' }}>
        {element.type}
      </Table.Td>
      <Table.Td>{element.url}</Table.Td>
      <Table.Td>{element.method}</Table.Td>
      <Table.Td>{element.status}</Table.Td>
      <Table.Td>
        <Button
          disabled={!element.credentials}
          variant='default'
          onClick={() => {
            setCreds(element.credentials || 'no credentials');
            credModalopen();
          }}
        >
          Show
        </Button>
      </Table.Td>
      <Table.Td>
        <Button
          variant='default'
          disabled={!element.body}
          onClick={() => {
            setBodyData(element.body || 'no body');
            bodyModalopen();
          }}
        >
          Show
        </Button>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <div>
      <Center>
        <Button variant='default' onClick={drawerOpen}>
          Show Network
        </Button>
      </Center>
      <Drawer
        opened={drawerOpened}
        onClose={drawerClose}
        withCloseButton
        position='bottom'
        size='md'
      >
        <Modal opened={bodyModalopened} onClose={bodyModalclose} withCloseButton={false}>
          {typeof bodyData === 'string' ? (
            bodyData
          ) : (
            <JSONTree data={bodyData} theme={customTheme} shouldExpandNodeInitially={() => false} />
          )}
        </Modal>
        <Modal opened={credModalopened} onClose={credModalclose} withCloseButton={false}>
          {creds}
        </Modal>
        <Container size='responsive'>
          <Center>
            <ActionIcon radius='lg' variant='default'>
              <IconTrash
                onClick={() => {
                  setNetwork([]);
                }}
              />
            </ActionIcon>
          </Center>
          <Center>
            <ScrollArea style={{ width: '100%', height: '30vh' }}>
              <Table
                stickyHeader
                color='blue'
                striped
                stripedColor='#f5ffff'
                highlightOnHover
                highlightOnHoverColor='#c7fffe'
                style={{ backgroundColor: '#edffff' }}
              >
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Type</Table.Th>
                    <Table.Th>Url</Table.Th>
                    <Table.Th>Method</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th>Credentials</Table.Th>
                    <Table.Th>Body</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>{rows}</Table.Tbody>
              </Table>
            </ScrollArea>
          </Center>
        </Container>
      </Drawer>
    </div>
  );
}
