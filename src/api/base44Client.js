// Base44 SDK has been fully disabled for this project.
// This stub exists only so that legacy files which still import `base44`
// (src/lib/PageNotFound.jsx, src/components/dialogs/ReviewDialog.jsx)
// do not crash at import time. Those files are not wired into active routes
// in a way that depends on Base44 working — TODO: remove these references
// and delete this file.
export const base44 = {
  auth: {
    me: async () => {
      throw new Error('Base44 is disabled. Use Supabase auth instead.');
    },
    logout: () => {},
    redirectToLogin: () => {},
  },
  entities: {},
  integrations: {
    Core: {
      UploadFile: async () => {
        throw new Error('Base44 is disabled. Use Supabase Storage instead.');
      },
    },
  },
};
