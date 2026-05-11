import { FormCandidateSchema, type FormCandidateType } from '#/types/candidate';
import {
  Checkbox,
  Container,
  Divider,
  Fieldset,
  NumberInput,
  Select,
  TextInput,
  Title,
} from '@mantine/core';
import { createFileRoute } from '@tanstack/react-router';
import React from 'react';
import {
  useSaveCandidateMutation,
  useUpdateCandidateMutation,
} from '#/hooks/mutation/candidate';
import { isLoadingMutation } from '#/utils/queyr';
import { useCandidateByIdQuery } from '#/hooks/query/candidate';
import { useAppForm } from '#/hooks/form/app.form';

export const Route = createFileRoute('/(private)/form/$candidateId')({
  component: RouteComponent,
});

const defaultValues: FormCandidateType = {
  name: '',
  lastname: '',
  email: '',
  position: '',
  linkedIn: '',
  age: 18,
  experience: 1,
  skills: [],
  status: 'Pending',
  working: false,
  deleted: false,
};

function RouteComponent() {
  const { candidateId } = Route.useParams();

  const mode = candidateId === 'new' ? 'Creating' : 'Editing';

  const candidateByIdQuery = useCandidateByIdQuery(candidateId);

  const saveCandidateMutation = useSaveCandidateMutation();

  const updateCandidateMutation = useUpdateCandidateMutation();

  const form = useAppForm({
    defaultValues,
    validators: {
      onSubmit: FormCandidateSchema,
    },
    onSubmit: (param) => {
      if (mode === 'Creating') {
        saveCandidateMutation.mutate(param.value);
      } else {
        updateCandidateMutation.mutate({
          ...param.value,
          id: candidateId,
        });
      }
    },
    onSubmitInvalid: (param) => {
      console.log('Errores', param.formApi.getAllErrors(), param.value);
    },
  });

  const isLoading = isLoadingMutation(
    saveCandidateMutation,
    updateCandidateMutation,
  );

  React.useEffect(() => {
    if (candidateByIdQuery.isSuccess && candidateByIdQuery.data) {
      form.reset(candidateByIdQuery.data);
    }
  }, [candidateByIdQuery.isSuccess, candidateByIdQuery.data]);

  return (
    <Container pt="md" pb="xl">
      <Title order={4}>{mode} candidate</Title>

      <Divider my="md" />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <Fieldset legend="Personal Information">
          <form.AppField
            name="name"
            children={(field) => (
              <field.TextInput
                label="Name"
                error={field.state.meta.errors[0]?.message}
                placeholder="Type the name"
                value={field.state.value}
                onChange={(e) => {
                  field.handleChange(e.currentTarget.value);
                }}
              />
            )}
          />

          <form.AppField
            name="lastname"
            children={(field) => (
              <TextInput
                label="Last name"
                placeholder="Type the last name"
                error={field.state.meta.errors[0]?.message}
                value={field.state.value ?? ''}
                onChange={(e) => {
                  field.handleChange(e.currentTarget.value);
                }}
              />
            )}
          />

          <form.AppField
            name="email"
            children={(field) => (
              <TextInput
                label="Email"
                type="email"
                placeholder="name@example.com"
                error={field.state.meta.errors[0]?.message}
                value={field.state.value ?? ''}
                onChange={(e) => {
                  field.handleChange(e.currentTarget.value);
                }}
              />
            )}
          />

          <form.AppField
            name="age"
            children={(field) => (
              <NumberInput
                label="Age"
                placeholder="Type the age"
                error={field.state.meta.errors[0]?.message}
                min={18}
                value={field.state.value ?? undefined}
                onChange={(value) => {
                  field.handleChange(Number(value));
                }}
              />
            )}
          />
        </Fieldset>

        <Fieldset legend="Professional Information" mt="md">
          <form.AppField
            name="position"
            children={(field) => (
              <TextInput
                label="Position"
                placeholder="e.g. Frontend Developer"
                error={field.state.meta.errors[0]?.message}
                value={field.state.value ?? ''}
                onChange={(e) => {
                  field.handleChange(e.currentTarget.value);
                }}
              />
            )}
          />

          <form.AppField
            name="linkedIn"
            children={(field) => (
              <TextInput
                label="LinkedIn URL"
                placeholder="https://www.linkedin.com/in/..."
                error={field.state.meta.errors[0]?.message}
                value={field.state.value ?? ''}
                onChange={(e) => {
                  field.handleChange(e.currentTarget.value);
                }}
              />
            )}
          />

          <form.AppField
            name="experience"
            children={(field) => (
              <NumberInput
                label="Experience (years)"
                placeholder="Type the years of experience"
                error={field.state.meta.errors[0]?.message}
                min={0}
                value={field.state.value ?? undefined}
                onChange={(value) => {
                  field.handleChange(Number(value));
                }}
              />
            )}
          />

          <form.AppField
            name="status"
            children={(field) => (
              <Select
                label="Status"
                placeholder="Select the status"
                clearable={false}
                error={field.state.meta.errors[0]?.message}
                allowDeselect={false}
                data={['Pending', 'Reviewing', 'Interviewing', 'Hired']}
                onChange={(value) => {
                  if (!value) return;

                  field.handleChange(value as FormCandidateType['status']);
                }}
              />
            )}
          />

          <form.AppField
            name="skills"
            children={(field) => (
              <TextInput
                label="Skills"
                placeholder="Type the skills separated by commas"
                error={field.state.meta.errors[0]?.message}
                value={field.state.value.join(', ')}
                onChange={(e) => {
                  const skills = e.currentTarget.value
                    .split(',')
                    .map((s) => s.trim());

                  field.handleChange(skills);
                }}
              />
            )}
          />

          <form.AppField
            name="working"
            children={(field) => (
              <Checkbox
                mt="md"
                error={field.state.meta.errors[0]?.message}
                label="Currently Working"
                checked={field.state.value || false}
                onChange={(e) => {
                  field.handleChange(e.currentTarget.checked);
                }}
              />
            )}
          />
        </Fieldset>

        <form.SubmitButton loading={isLoading}>
          {mode === 'Creating' ? 'Crear candidato' : 'Actualizar candidato'}
        </form.SubmitButton>
      </form>
    </Container>
  );
}
