import { useAppForm } from '#/hooks/form/app.form';
import { useRegisterMutation } from '#/hooks/mutation/auth';
import {
  EmailAndPasswordRegisterFormSchema,
  type EmailAndPasswordRegisterFormType,
} from '#/types/auth';
import { Button, Container, Divider, Paper, TextInput } from '@mantine/core';
import { createFileRoute, Link } from '@tanstack/react-router';

export const Route = createFileRoute('/(public)/register')({
  component: RouteComponent,
});

const initial: EmailAndPasswordRegisterFormType = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
};

function RouteComponent() {
  const registerMutation = useRegisterMutation();

  const form = useAppForm({
    defaultValues: initial,
    validators: {
      onSubmit: EmailAndPasswordRegisterFormSchema,
    },
    onSubmit: (params) => {
      console.log('Submit', params.value);
      registerMutation.mutate(params.value);
    },
    onSubmitInvalid: (form) => {
      console.log('Invalid form', form.formApi.getAllErrors());
    },
  });

  return (
    <Container>
      <Paper shadow="md" p="md" withBorder mt="xl">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit(e);
          }}
        >
          <form.AppField
            name="name"
            children={(field) => (
              <TextInput
                label="Name"
                value={field.state.value}
                error={field.state.meta.errors.at(0)?.message}
                onChange={(e) => field.handleChange(e.currentTarget.value)}
              />
            )}
          />
          <form.AppField
            name="email"
            children={(field) => (
              <TextInput
                label="Email"
                type="email"
                value={field.state.value}
                error={field.state.meta.errors.at(0)?.message}
                onChange={(e) => field.handleChange(e.currentTarget.value)}
              />
            )}
          />
          <form.AppField
            name="password"
            children={(field) => (
              <TextInput
                label="Password"
                type="password"
                value={field.state.value}
                error={field.state.meta.errors.at(0)?.message}
                onChange={(e) => field.handleChange(e.currentTarget.value)}
              />
            )}
          />
          <form.AppField
            name="confirmPassword"
            children={(field) => (
              <TextInput
                label="Confirm Password"
                type="password"
                value={field.state.value}
                error={field.state.meta.errors.at(0)?.message}
                onChange={(e) => field.handleChange(e.currentTarget.value)}
              />
            )}
          />

          <form.SubmitButton
            loading={registerMutation.isPending}
            mt="xl"
            fullWidth
          >
            Register
          </form.SubmitButton>
        </form>
        <Divider my="md" />

        <Link to="/login">
          <Button variant="light" fullWidth>
            Sign in
          </Button>
        </Link>
      </Paper>
    </Container>
  );
}
