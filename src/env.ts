import { createEnv } from '@t3-oss/env-core';

import { z } from 'zod';

export const env = createEnv({
  clientPrefix: 'VITE_',

  client: {
    VITE_FRAMEWORK_NAME: z
      .enum(['react', 'vue', 'svelte', 'angular'])
      .default('react'),
    VITE_API_URL: z
      .string()
      .url()
      .default('https://candidates-api-luigibasantes.fly.dev'),
  },
  runtimeEnv: import.meta.env,
});
