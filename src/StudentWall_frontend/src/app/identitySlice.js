import { createSlice } from '@reduxjs/toolkit'

export const identitySlice = createSlice({
  name: 'identity',
  initialState: {
    name: '',
    principal: '',
    authenticated: false
  },
  reducers: {
    setName: (state, action) => {
      state.name = action
    },
    setPrincipal: (state, action) => {
      state.principal = action
    },
    setAuthenticated: (state, action) => {
      state.authenticated = action
    }
  }
})

// Action creators are generated for each case reducer function
export const { setName, setPrincipal, setAuthenticated } = identitySlice.actions

export default identitySlice.reducer
