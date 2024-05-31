import { createSlice } from '@reduxjs/toolkit'

export const commentSlice = createSlice({
  name: 'comment',
  initialState: {
    value: []
  },
  reducers: {
    setComment: (state, action) => {
      state.value = action
    }
  }
})

// Action creators are generated for each case reducer function
export const { setPosts } = commentSlice.actions

export default commentSlice.reducer
