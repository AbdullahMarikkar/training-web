import {
  combineReducers,
  configureStore,
  getDefaultMiddleware,
} from "@reduxjs/toolkit";
import cardReducer from "../components/DiaryComponents/cardSlice";
import signInReducer from "../Containers/SignInFiles/signInSlice";
import createSagaMiddleware from "redux-saga";
import rootSaga from "../sagas";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

// Create the Redux Saga middleware
const sagaMiddleware = createSagaMiddleware();

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["createUser"], // Only persist the "createUser" state
};

const rootReducer = combineReducers({
  card: cardReducer,
  createUser: signInReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: [...getDefaultMiddleware({ thunk: false }), sagaMiddleware],
});

// Run the root saga
sagaMiddleware.run(rootSaga);

export const persistor = persistStore(store);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof rootReducer>;

export type AppDispatch = typeof store.dispatch;
