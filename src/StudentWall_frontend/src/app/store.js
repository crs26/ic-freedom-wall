import { configureStore } from '@reduxjs/toolkit'
import identityReducer from './identitySlice'
import commentSliceReducer from './commentSlice'
import postSliceReducer from './postSlice'

export default configureStore({
  reducer: {
    identity: identityReducer,
    post: postSliceReducer,
    comment: commentSliceReducer
  }
})
