import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { deleteHomepageVideo, getHomepageVideos, type HomepageVideo, createHomepageVideo, updateHomepageVideo, reorderHomepageVideos } from '@/api/homepageVideosApi'
import { Table } from '@/components/ui/Table'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import EmptyState from '@/components/ui/EmptyState'
import { useAuth } from '@/context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core'
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'

const MAX_FILE_SIZE = 500 * 1024 * 1024 // 500MB

function VideoForm({
  onSubmit,
  submitting,
  initial,
}: {
  onSubmit: (formData: FormData) => void
  submitting?: boolean
  initial?: HomepageVideo
}) {
  const [values, setValues] = useState({
    title: initial?.title || '',
    video: undefined as File | undefined,
    active: initial?.active ?? true,
  })

    const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate video is selected for new uploads
    if (!values.video && !initial) {
      toast.error('Please select a video')
      return
    }

    // Validate file size if uploading
    if (values.video && values.video.size > MAX_FILE_SIZE) {
      toast.error('Video file is too large. Maximum size is 500MB')
      return
    }

    // Validate file type
    if (values.video && !values.video.type.startsWith('video/')) {
      toast.error('Only video files are allowed')
      return
    }

    const formData = new FormData()
    if (values.title) formData.append('title', values.title)
    if (values.video) formData.append('video', values.video)
    formData.append('active', String(values.active))
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm mb-1">Title (optional)</label>
        <input
          type="text"
          className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-600"
          value={values.title}
          onChange={(e) => setValues({ ...values, title: e.target.value })}
          placeholder="Welcome Video"
        />
      </div>

      <div>
        <label className="block text-sm mb-1">
          Video File {!initial && <span className="text-red-500">*</span>}
          <span className="text-gray-500 text-xs ml-2">(Max 500MB)</span>
        </label>
        <input
          type="file"
          accept="video/*"
          className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-600"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) {
              if (file.size > MAX_FILE_SIZE) {
                toast.error('Video file is too large. Maximum size is 500MB')
                e.target.value = ''
                return
              }
              if (!file.type.startsWith('video/')) {
                toast.error('Only video files are allowed')
                e.target.value = ''
                return
              }
              setValues({ ...values, video: file })
            }
          }}
        />
        {values.video && (
          <div className="mt-2 text-sm text-gray-500">
            Selected: {values.video.name} ({Math.round(values.video.size / (1024 * 1024))}MB)
          </div>
        )}
      </div>

      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={values.active}
            onChange={(e) => setValues({ ...values, active: e.target.checked })}
          />
          Active
        </label>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="submit" loading={submitting}>
          {initial ? 'Update' : 'Upload'} Video
        </Button>
      </div>
    </form>
  )
}

function SortableVideo({ video, onView, onEdit, onDelete }: { video: HomepageVideo; onView: () => void; onEdit: () => void; onDelete: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: video._id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <tr ref={setNodeRef} style={style}>
      <td className="p-4">
        <button type="button" className="cursor-grab active:cursor-grabbing p-1" {...attributes} {...listeners}>
          <GripVertical size={16} />
        </button>
      </td>
      <td className="p-4">{video.title || 'Untitled'}</td>
      <td className="p-4">
        <div className={`inline-flex items-center px-2 py-1 rounded text-sm ${video.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
          {video.active ? 'Active' : 'Inactive'}
        </div>
      </td>
      <td className="p-4">{new Date(video.updatedAt).toLocaleString()}</td>
      <td className="p-4 space-x-2">
        <Button variant="ghost" onClick={onView}>View</Button>
        <Button variant="ghost" onClick={onEdit}>Edit</Button>
        <Button variant="ghost" className="text-red-600" onClick={onDelete}>Delete</Button>
      </td>
    </tr>
  )
}

export default function HomepageVideos() {
  const [videos, setVideos] = useState<HomepageVideo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>()
  const [submitting, setSubmitting] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [editVideo, setEditVideo] = useState<HomepageVideo>()
  const [viewVideo, setViewVideo] = useState<HomepageVideo>()

  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const loadVideos = async () => {
    try {
      setLoading(true)
      const { data } = await getHomepageVideos()
      setVideos(data)
      setError(undefined)
    } catch (err: any) {
      console.error('Failed to load homepage videos:', err)
      if (err?.response?.status === 401) {
        navigate('/login')
        return
      }
      setError('Failed to load videos')
    } finally {
      setLoading(false)
    }
  }

  const onCreate = async (formData: FormData) => {
    try {
      setSubmitting(true)
      await createHomepageVideo({
        title: formData.get('title') as string || undefined,
        video: formData.get('video') as File,
        active: formData.get('active') === 'true',
      })
      toast.success('Video uploaded successfully')
      setShowUploadModal(false)
      loadVideos()
    } catch (err: any) {
      console.error('Failed to upload video:', err)
      if (err?.response?.status === 401) {
        navigate('/login')
        return
      }
      toast.error('Failed to upload video')
    } finally {
      setSubmitting(false)
    }
  }

  const onUpdate = async (formData: FormData) => {
    if (!editVideo) return
    try {
      setSubmitting(true)
      await updateHomepageVideo(editVideo._id, {
        title: formData.get('title') as string || undefined,
        active: formData.get('active') === 'true',
      })
      toast.success('Video updated successfully')
      setEditVideo(undefined)
      loadVideos()
    } catch (err: any) {
      console.error('Failed to update video:', err)
      if (err?.response?.status === 401) {
        navigate('/login')
        return
      }
      toast.error('Failed to update video')
    } finally {
      setSubmitting(false)
    }
  }

  const onDelete = async (video: HomepageVideo) => {
    if (!window.confirm('Are you sure you want to delete this video?')) return
    try {
      await deleteHomepageVideo(video._id)
      toast.success('Video deleted successfully')
      loadVideos()
    } catch (err: any) {
      console.error('Failed to delete video:', err)
      if (err?.response?.status === 401) {
        navigate('/login')
        return
      }
      toast.error('Failed to delete video')
    }
  }

  const onDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = videos.findIndex((v) => v._id === active.id)
    const newIndex = videos.findIndex((v) => v._id === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    const newOrder = arrayMove(videos, oldIndex, newIndex)
    setVideos(newOrder)

    try {
      await reorderHomepageVideos(newOrder.map((v) => v._id))
      toast.success('Videos reordered successfully')
    } catch (err: any) {
      console.error('Failed to reorder videos:', err)
      if (err?.response?.status === 401) {
        navigate('/login')
        return
      }
      toast.error('Failed to reorder videos')
      loadVideos() // Reload original order
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      loadVideos()
    } else {
      navigate('/login')
    }
  }, [isAuthenticated, navigate])

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Homepage Videos</h1>
        <Button onClick={() => setShowUploadModal(true)}>Upload Video</Button>
      </div>

      {error ? (
        <div className="p-8 text-red-500 text-center rounded border border-red-200 bg-red-50">
          {error}
        </div>
      ) : loading ? (
        <div className="p-8 text-center">
          <div className="animate-pulse inline-block w-8 h-8 rounded-full bg-gray-200"></div>
          <div className="mt-2 text-gray-500">Loading videos...</div>
        </div>
      ) : videos.length === 0 ? (
        <EmptyState
          title="No Videos Uploaded Yet"
          message="Get started by uploading your first homepage video. Videos help showcase your services and attract customers."
          action={
            <Button onClick={() => setShowUploadModal(true)}>
              Upload Your First Video
            </Button>
          }
        />
      ) : (
        <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <Table>
            <thead>
              <tr>
                <th></th>
                <th className="p-4 text-left font-semibold">Title</th>
                <th className="p-4 text-left font-semibold">Status</th>
                <th className="p-4 text-left font-semibold">Last Updated</th>
                <th className="p-4 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              <SortableContext items={videos.map(v => ({ id: v._id }))} strategy={verticalListSortingStrategy}>
                {videos.map((video) => (
                  <SortableVideo
                    key={video._id}
                    video={video}
                    onView={() => setViewVideo(video)}
                    onEdit={() => setEditVideo(video)}
                    onDelete={() => onDelete(video)}
                  />
                ))}
              </SortableContext>
            </tbody>
          </Table>
        </DndContext>
      )}

      <Modal 
        open={!!viewVideo} 
        onClose={() => setViewVideo(undefined)} 
        title={viewVideo?.title || 'Untitled Video'}
        size="2xl"
      >
        {viewVideo && (
          <div>
            <div className="aspect-video bg-black rounded overflow-hidden">
              <video
                src={viewVideo.videoUrl}
                controls
                controlsList="nodownload"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="mt-4 text-sm text-gray-500 flex flex-col gap-2">
              <div>
                <span className="font-medium">Status:</span>{' '}
                <span className={viewVideo.active ? 'text-green-600' : 'text-gray-600'}>
                  {viewVideo.active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div>
                <span className="font-medium">Added:</span>{' '}
                {new Date(viewVideo.createdAt).toLocaleString()}
              </div>
              <div>
                <span className="font-medium">Last Updated:</span>{' '}
                {new Date(viewVideo.updatedAt).toLocaleString()}
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Upload New Video"
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-gray-500 text-sm">
            Upload a video to be shown on the homepage. Videos should be high quality and showcase your best products or services.
          </p>
          <VideoForm onSubmit={onCreate} submitting={submitting} />
        </div>
      </Modal>

      <Modal
        open={!!editVideo}
        onClose={() => setEditVideo(undefined)}
        title={`Edit Video: ${editVideo?.title || 'Untitled'}`}
        size="lg"
      >
        {editVideo && (
          <VideoForm onSubmit={onUpdate} submitting={submitting} initial={editVideo} />
        )}
      </Modal>
    </div>
  )
}