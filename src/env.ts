import { createEnv } from '@t3-oss/env-core';

import { z } from 'zod';

export const env = createEnv({
  clientPrefix: 'VITE_',

  client: {
    VITE_FRAMEWORK_NAME: z
      .enum(['react', 'vue', 'svelte', 'angular'])
      .default('react'),
  },
  runtimeEnv: import.meta.env,
});
