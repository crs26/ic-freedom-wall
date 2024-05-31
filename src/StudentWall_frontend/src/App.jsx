import React from 'react'
// import { Home } from './pages/Home/index';
import { Post } from './pages/Post/index'
import { Message } from './pages/Message/index'
import { Comment } from './pages/Comment/index'
import { Route, Routes } from '../../../node_modules/react-router-dom/dist/index'
import { Navbar } from './components/Navbar'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { LoginPage } from './pages/Login/index'
import { UserMessages } from './pages/User/Messages'

export const App = () => {
  return (
    <>
      <Navbar />
      <ToastContainer theme='dark' position='bottom-right' />
      <Routes>
        <Route path='/' element={<Post />} />
        <Route path='/post' element={<Post />} />
        <Route path='/message' element={<Message />} />
        <Route path='/user/messages/:p' element={<UserMessages />} />
        <Route path='/comment/:messageId' element={<Comment />} />
        <Route path='/login' element={<LoginPage />} />
        <Route path='*' element={<div className='text-light'>404</div>} />
      </Routes>
    </>
  )
}
