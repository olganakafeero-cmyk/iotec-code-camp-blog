import { useNavigate } from '../../navigation/RouterContext'
import { PATHS } from '../../navigation/paths'
import { CreateBlogForm } from '../../components/CreateBlogForm'
import '../../components/create-blog.css'

export function CreateBlogPage() {
  const navigate = useNavigate()

  return <CreateBlogForm onSaved={() => navigate(PATHS.ADMIN_BLOGS)} />
}