import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';

// Import slices
import authSlice from './slices/authSlice';
import testSlice from './slices/testSlice';
import resultsSlice from './slices/resultsSlice';
import uiSlice from './slices/uiSlice';

// Import types
import type { RootState } from '@/types';

// Configure store
export const store = configureStore({
  reducer: {
    auth: authSlice,
    test: testSlice,
    results: resultsSlice,
    ui: uiSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'persist/PAUSE',
          'persist/PURGE',
          'persist/REGISTER',
        ],
        // Ignore these field paths in all actions
        ignoredActionsPaths: ['meta.arg', 'payload.timestamp'],
        // Ignore these paths in the state
        ignoredPaths: ['items.dates'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

// Export types
export type AppDispatch = typeof store.dispatch;
export type { RootState };

// Export typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Export store
export default store;
