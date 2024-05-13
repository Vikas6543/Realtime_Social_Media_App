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
            <div className='w-3/12 hidden lg:block'>
              <Sidebar />
            </div>

            <main className='lg:w-9/12 mt-28 lg:ml-28 mx-auto w-12/12'>
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
