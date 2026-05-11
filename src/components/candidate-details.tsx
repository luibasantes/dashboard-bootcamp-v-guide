import DataRepo from '#/api/datasource';
import { useDeleteCandidateMutation } from '#/hooks/mutation/candidate';
import type { CandidateType } from '#/types/candidate';
import {
  Badge,
  Box,
  Button,
  Fieldset,
  Flex,
  List,
  Switch,
  Text,
  Title,
} from '@mantine/core';
import { Link } from '@tanstack/react-router';
import React from 'react';

type CandidateProps = {
  data: CandidateType;
};

const CandidateDetails = (props: CandidateProps) => {
  const { data } = props;

  const deleteCandidate = useDeleteCandidateMutation();

  const [optimisticWorkingState, updateOptimisticWorkingState] =
    React.useOptimistic(data.working, (newValue) => !newValue);

  const handleSwitch = (
    e: React.ChangeEvent<HTMLInputElement, HTMLInputElement>,
  ) => {
    React.startTransition(async () => {
      const newState = e.currentTarget.checked;

      updateOptimisticWorkingState(newState);

      await DataRepo.toggleWorking(data.id, newState);
    });
  };
  console.log('Opti value', optimisticWorkingState);

  return (
    <Box>
      {/* SECCIÓN DE DATOS PERSONALES */}
      <Fieldset legend="Personal Info" mb="md">
        <Flex justify="space-between">
          <Flex direction="column">
            <Flex align="center" justify="space-between">
              <Title order={3}>
                {data.name}
                {data.lastname ? ` ${data.lastname}` : ''}
              </Title>
            </Flex>
            <Text>Email: {data.email ?? 'N/A'}</Text>
            <Text>Age: {data.age ?? 'N/A'}</Text>
          </Flex>

          <Badge color={statusColor(data.status)} mt={8} size="lg">
            {data.status}
          </Badge>
        </Flex>
      </Fieldset>

      {/* SECCIÓN DE DATOS PROFESIONALES */}
      <Fieldset legend="Professional Info">
        <Text>Position: {data.position ?? 'N/A'}</Text>
        <Text>
          LinkedIn:{' '}
          {data.linkedIn ? (
            <a href={data.linkedIn} target="_blank" rel="noreferrer">
              {data.linkedIn}
            </a>
          ) : (
            'N/A'
          )}
        </Text>

        <Switch
          mt={12}
          label={
            optimisticWorkingState == null
              ? 'Working: N/A'
              : optimisticWorkingState
                ? 'Currently Working'
                : 'Not Working'
          }
          mb={12}
          checked={optimisticWorkingState || false}
          onChange={(e) => {
            handleSwitch(e);
          }}
        />

        <Text>
          Experience:{' '}
          {data.experience != null ? `${data.experience} years` : 'N/A'}
        </Text>

        <Text mt={12} mb={6}>
          Skills:
        </Text>

        {/* USAMOS UN COMPONENTE DE LISTA PARA MOSTRAR LAS HABILIDADES DE MEJOR FORMA */}
        <List mt={12} size="sm" spacing="xs" type="unordered">
          {data.skills.map((skill, index) => (
            <List.Item key={index}>{skill}</List.Item>
          ))}
        </List>
      </Fieldset>

      <Button fullWidth mt={12} onClick={() => copyInfo(data)}>
        Copy Info
      </Button>

      <Link to="/form/$candidateId" params={{ candidateId: data.id }}>
        <Button color="violet" fullWidth mt={12}>
          Edit
        </Button>
      </Link>

      <Button
        color="red"
        fullWidth
        loading={deleteCandidate.isPending}
        mt={12}
        onClick={() => deleteCandidate.mutate(data.id)}
      >
        Delete
      </Button>
    </Box>
  );

  // RETORNA UN COLOR DE BADGE SEGÚN EL STATUS DEL CANDIDATO
  // SE PUEDE CENTRALIZAR EN UN ARCHIVO DE UTILS SI SE USA EN VARIOS LUGARES
  function statusColor(status: CandidateType['status']) {
    if (status === 'Pending') return 'yellow';
    if (status === 'Reviewing') return 'blue';
    if (status === 'Interviewing') return 'orange';
    if (status === 'Hired') return 'green';
    return 'gray';
  }

  // FUNCION PARA COPIAR LA INFO DEL CANDIDATO EN FORMATO DE TEXTO PLANO
  function copyInfo(info: CandidateType) {
    const fullName = info.lastname ? `${info.name} ${info.lastname}` : info.name;
    const infoString = [
      `Name: ${fullName}`,
      `Email: ${info.email ?? 'N/A'}`,
      `Position: ${info.position ?? 'N/A'}`,
      `LinkedIn: ${info.linkedIn ?? 'N/A'}`,
      `Age: ${info.age ?? 'N/A'}`,
      `Experience: ${info.experience != null ? `${info.experience} years` : 'N/A'}`,
      `Status: ${info.status}`,
      `Skills: ${info.skills.join(', ')}`,
      `Currently Working: ${info.working == null ? 'N/A' : info.working ? 'Yes' : 'No'}`,
    ].join('\n');
    navigator.clipboard.writeText(infoString);
  }
};

export default CandidateDetails;
