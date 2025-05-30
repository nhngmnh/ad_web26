import React, { useEffect, useState, useContext } from 'react'
import axios from 'axios'
import moment from 'moment'
import { AdminContext } from '../context/AdminContext'
import { toast } from 'react-toastify'

const Notifications = () => {
  const { aToken, backendurl } = useContext(AdminContext)
  const [notifications, setNotifications] = useState([])
  const [selectedNotification, setSelectedNotification] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  useEffect(() => {
    const fetchAllNotifications = async () => {
      try {
        const res = await axios.get(`${backendurl}/api/admin/get-all-notifications`, {
          headers: { aToken }
        })
        setNotifications(res.data.data)
      } catch (error) {
        console.error(error)
        toast.error(error.message)
      }
    }

    fetchAllNotifications()
  }, [aToken, backendurl])

  const deleteNotification = async () => {
    if (!confirmDelete) return

    try {
      await axios.post(`${backendurl}/api/admin/delete-notification`, {
        notificationId: confirmDelete._id
      }, {
        headers: { aToken }
      })
      setNotifications(prev => prev.filter(n => n._id !== confirmDelete._id))
      toast.success("Delete successfully")
      setConfirmDelete(null)
    } catch (error) {
      console.error(error)
      toast.error(error.message)
    }
  }

  return (
    <div className='p-4 sm:p-6 mx-auto w-full max-w-3xl'>
      <h2 className='text-xl sm:text-2xl font-semibold mb-4'>Admin: All User Notifications</h2>

      {
        notifications.length === 0 ? (
          <p className="text-gray-600">No notifications available.</p>
        ) : (
          notifications.map((n, index) => (
            <div key={n._id} className='p-4 mb-3 border rounded bg-white shadow-sm'>
              <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2'>
                <div className="flex-1">
                  <p className='font-medium text-gray-800 break-words'>
                    #{index + 1} | <span className='text-blue-600'>User:</span> {n.userId} — {n.text}
                  </p>
                  <p className='text-xs text-gray-500'>{moment(n.createdAt).fromNow()}</p>
                </div>
                <div className='flex gap-3 text-sm'>
                  <button
                    onClick={() => setSelectedNotification(n)}
                    className='text-blue-600 font-semibold underline px-2 py-1 hover:bg-blue-100 rounded'
                  >
                    Detail
                  </button>
                  <button
                    onClick={() => setConfirmDelete(n)}
                    className='text-red-600 font-semibold underline px-2 py-1 hover:bg-red-100 rounded'
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )
      }

      {/* Detail Modal */}
      {
        selectedNotification && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-4 sm:p-6 rounded-lg w-[90%] max-w-md shadow-lg">
              <h3 className="text-lg sm:text-xl font-semibold mb-4">Notification Detail</h3>
              <div className="text-sm text-gray-800 space-y-2 break-words">
                <p><strong>_id:</strong> {selectedNotification._id}</p>
                <p><strong>userId:</strong> {selectedNotification.userId}</p>
                <p><strong>text:</strong> {selectedNotification.text}</p>
                <p><strong>createdAt:</strong> {moment(selectedNotification.createdAt).format('LLL')}</p>
                <p><strong>isRead:</strong> {selectedNotification.isRead ? 'true' : 'false'}</p>
              </div>
              <div className="mt-5 text-right">
                <button
                  onClick={() => setSelectedNotification(null)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* Confirm Delete Modal */}
      {
        confirmDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-4 sm:p-6 rounded-lg w-[90%] max-w-md shadow-lg">
              <h3 className="text-lg sm:text-xl font-semibold mb-4">Confirm Delete</h3>
              <p className="text-sm text-gray-800 mb-4">
                Are you sure you want to delete notification #{notifications.findIndex(n => n._id === confirmDelete._id) + 1}?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={deleteNotification}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )
      }
    </div>
  )
}

export default Notifications