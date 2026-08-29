import re

with open('components/admin/BlogEditor.tsx', 'r') as f:
    content = f.read()

# Replace Imports
content = content.replace('import { BlogPost, blogCategories } from "@/lib/blog-data";', 'import { CalendarPost } from "@/lib/calendar-data";')
content = content.replace('import {\n  createPost,\n  updatePost,\n  uploadBlogImage,\n} from "@/lib/blog-service";', 'import {\n  createCalendarPost as createPost,\n  updateCalendarPost as updatePost,\n} from "@/lib/calendar-service";\nimport { uploadBlogImage } from "@/lib/blog-service";')

# Component Name and Props
content = content.replace('BlogEditorProps', 'CalendarEditorProps')
content = content.replace('function BlogEditor', 'function CalendarEditor')
content = content.replace('BlogPost', 'CalendarPost')

# Default categories
content = content.replace('initialPost?.category || "Strategy"', 'initialPost?.category || "Monthly Calendar"')
content = content.replace('initialPost?.author || "Samarpan Rao"', 'initialPost?.author || "Finsaar Team"')
content = content.replace('initialPost?.authorRole || "Founder & Managing Director"', 'initialPost?.authorRole || "Compliance Team"')
content = content.replace('initialPost?.tags || ["Startup Finance", "CFO"]', 'initialPost?.tags || []')

# Remove readTime state
content = re.sub(r'const \[readTime, setReadTime\] = useState[^;]+;', '', content)
content = re.sub(r'// Auto calculate read time from markdown content.*?\}, \[content\]\);', '', content, flags=re.DOTALL)

# Remove featured state
content = re.sub(r'const \[featured, setFeatured\] = useState[^;]+;', '', content)

# Remove read_time and featured from postData
content = content.replace('read_time: readTime,', '')
content = content.replace('featured,', '')
content = content.replace('author_role: authorRole.trim(),', 'authorRole: authorRole.trim(),')
content = content.replace('tags,', 'tags: tags.length > 0 ? tags : ["Compliance"],')

# Change "Blog post" to "Calendar post"
content = content.replace('Blog post updated', 'Calendar post updated')
content = content.replace('Blog post published', 'Calendar post published')

# Fix router push
content = content.replace('router.push("/admin/blog")', 'router.push("/admin/compliance")')

# Remove Featured Toggle UI
content = re.sub(r'\{/\* Featured Toggle \*/\}.*?</div>\s*</div>\s*</div>\s*</div>', '</div>\n            </div>\n          </div>\n        </div>', content, flags=re.DOTALL)
# wait, the regex for removing featured toggle UI might be tricky, I'll do it cautiously.

with open('components/admin/CalendarEditor.tsx', 'w') as f:
    f.write(content)
