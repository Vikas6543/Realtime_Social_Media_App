import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useSelector } from 'react-redux';

const RootLayout = () => {
  const user = useSelector((state) => state?.auth?.userDetails);

  return (
    <>
      {user ? (
        <div>
          {/* navbar */}
          <Navbar />

          <section className='flex'>
            <div className='w-3/12'>
              <Sidebar />
            </div>

            <main className='w-9/12 mt-28 ml-28'>
              <Outlet />
            </main>
          </section>
        </div>
      ) : (
        <Navigate to="/login" />
      )}
    </>
  );
};

export default RootLayout;
