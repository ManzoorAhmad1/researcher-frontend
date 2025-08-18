import {
  configureStore,
  ThunkAction,
  Action,
  combineReducers,
} from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";

import { userReducer } from "./auth/authSlice";
import { adminUserReducer } from "./admin-reducer/auth/authSlice";
import { userNotesBookmarks } from "./notes-bookmarks/notesBookmarksSlice";
import { userApi } from "./services/authApi";
import { favoritesApi } from "./services/favoritesApi";
import { fileApi } from "./services/fileApi";
import { folderApi } from "./services/folderApi";
import folderReducer from "./services/folderSlice";
import papersReducer from "./services/papersSlice";
import { tagsApi } from "./services/tagsApi";
import { uploadReducer } from "./services/upload";
import { workspaceReducer } from "./services/workspaceSlice";
import { projectReducer } from "./services/projectSlice";
import { subscriptionReducer } from "./services/subscriptionApi";
import { userUtilsReducer } from "./services/userApi";
import { filterExporerTableReducer } from "./services/explorerTableSlice";
import { rolesGoalsReducer } from "./roles_goals/rolesGoals";
import { creativeThinking } from "./creative-thinking/creativeThinkingSlice";
import { useNoteBookmarksTabelColumn } from "./notes-bookmarks/noteBookmarksTabelColumn";
import { useCollectiveMind } from "./collective-mide/collectiveMindSlice";
import { useWebSearch } from "./web-search/webSearchSlice";
import { useTopicExplore } from "./topic-explorer/topicExplorerSlice";
import researchKeywordsReducer from "./global-search/globalSearchSlice"
import useFeatureSlice  from "./feature/featureSlice";

const rootReducer = combineReducers({
  upload: uploadReducer,
  user: userReducer,
  notesbookmarks: userNotesBookmarks,
  notesbookmarksColumn: useNoteBookmarksTabelColumn,
  creativeThinking: creativeThinking,
  [userApi.reducerPath]: userApi.reducer,
  [fileApi.reducerPath]: fileApi.reducer,
  [folderApi.reducerPath]: folderApi.reducer,
  [favoritesApi.reducerPath]: favoritesApi.reducer,
  [tagsApi.reducerPath]: tagsApi.reducer,
  folder: folderReducer,
  papers: papersReducer,
  workspace: workspaceReducer,
  project: projectReducer,
  userUtils: userUtilsReducer,
  subscription: subscriptionReducer,
  ExporerOptionalFilterData: filterExporerTableReducer,
  rolesGoalsData: rolesGoalsReducer,
  adminUser: adminUserReducer,
  collectiveMind: useCollectiveMind,
  webSearch: useWebSearch,
  topicExplore: useTopicExplore,
  feature: useFeatureSlice,
  researchKeywords: researchKeywordsReducer,
});

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["user", "ExporerOptionalFilterData", "rolesGoalsData", "notesbookmarksColumn", "webSearch"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const makeStore: any = () => {
  const store: any = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }).concat(
        userApi.middleware,
        fileApi.middleware,
        folderApi.middleware,
        favoritesApi.middleware,
        tagsApi.middleware
      ),
  });
  const persistor = persistStore(store);
  return { store, persistor };
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["store"]["getState"]>;
export type AppDispatch = AppStore["store"]["dispatch"];

export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
