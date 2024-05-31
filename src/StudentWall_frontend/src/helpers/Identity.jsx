import React from 'react'
import { useAuth } from './use-auth-client'
import { ImInfinite } from 'react-icons/im'
import { CgLogOut } from 'react-icons/cg'
import { Link } from '../../../../node_modules/react-router-dom/dist/index'

function LoggedIn ({ cusClass }) {
  const { logout, login, isAuthenticated, user } = useAuth()

  return (
    <div className={`col d-flex justify-content-end my-auto identity-btn ${cusClass}`}>
      {!isAuthenticated
        ? (
          <button onClick={login} className='primary-btn d-flex mx-auto'>
            <ImInfinite className='bg-transparent my-auto' />
            <span className='my-auto ms-2'>
              Login with Internet Identity
            </span>
          </button>
          )
        : (
          <div>
            {user.principal
              ? <button onClick={logout} className='d-flex mx-auto primary-btn'><CgLogOut className='my-auto' /> <span className='my-auto ms-2'>Logout</span></button>
              : <Link to='/login' className='primary-btn py-2'>Register</Link>}
          </div>
          )}
    </div>
  )
}

export default LoggedIn
